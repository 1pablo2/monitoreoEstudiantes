import pandas as pd
import sys
import os
import re
from db_utils import obtener_conexion, cerrar_conexion, ejecutar_consulta_unica

if len(sys.argv) < 2:
    print("Error: No se especificó el directorio temporal.")
    sys.exit(1)

temp_dir = sys.argv[1]
matching_files = [f for f in os.listdir(temp_dir) if "acta" in f.lower() and "asignatura" in f.lower()]

if len(matching_files) == 0:
    print(f"Error: No se encontró ningún archivo que coincida con 'Acta término asignatura' en {temp_dir}")
    sys.exit(1)

for file_name in matching_files:
    file_path = os.path.join(temp_dir, file_name)
    
    try:
        df_metadata = pd.read_excel(file_path, header=None, nrows=10)

        anio = semestre = None
        for row_idx in range(df_metadata.shape[0]):
            for col_idx in range(df_metadata.shape[1]):
                if "semestre" in str(df_metadata.iat[row_idx, col_idx]).lower():
                    for offset in [-1, 1, 2, 3, 4, 5, 6]:
                        col_check = col_idx + offset
                        if 0 <= col_check < df_metadata.shape[1]:
                            posible = df_metadata.iat[row_idx, col_check]
                            if pd.notna(posible):
                                valor = str(int(posible)) if isinstance(posible, (int, float)) else str(posible)
                                if len(valor) == 4 and valor.isdigit():
                                    anio = valor
                                elif valor in ['1', '2']:
                                    semestre = valor
                    break
            if anio and semestre:
                break

        if not anio or not semestre:
            print(f"Error: No se pudo encontrar año y semestre válidos.")
            sys.exit(1)

        asignatura_info = pd.read_excel(file_path, header=None, usecols="D", nrows=1, skiprows=6).iloc[0, 0]
        asignatura_codigo, asignatura_nombre = asignatura_info.split(" - ", 1)
        asignatura_nombre = re.split(r'[^\w\s]', asignatura_nombre, maxsplit=1)[0].strip()

    except Exception as e:
        print(f"Error extrayendo información del archivo: {e}")
        sys.exit(1)

    try:
        df = pd.read_excel(file_path, header=10)
        indice_cierre = df[df['C. IDENTIDAD'].astype(str).str.contains("esta acta ha sido generada por el proceso de cierre", case=False, na=False)].index
        if not indice_cierre.empty:
            df = df.loc[:indice_cierre[0] - 1]

        required_columns = ['C. IDENTIDAD', 'NOTA FINAL']
        columnas_encontradas = {col: df.columns[df.columns.str.contains(col, case=False, na=False)].tolist() for col in required_columns}

        if not all(columnas_encontradas.values()):
            print(f"Error: No se encontraron todas las columnas requeridas: {required_columns}")
            sys.exit(1)

        rut_col = columnas_encontradas['C. IDENTIDAD'][0]
        nota_final_col = columnas_encontradas['NOTA FINAL'][0]

    except Exception as e:
        print(f"Error leyendo el archivo Excel: {e}")
        sys.exit(1)

    try:
        connection = obtener_conexion()
        cursor = connection.cursor()
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        sys.exit(1)

    try:
        consulta_plan_estudios = "SELECT PlanEstudios_codigo FROM asignatura WHERE codAsignatura = %s"
        resultado = ejecutar_consulta_unica(cursor, consulta_plan_estudios, (asignatura_codigo,))
        plan_estudios_codigo = str(resultado[0]) if resultado else None

        if not plan_estudios_codigo:
            print(f"No se encontró el plan de estudios para la asignatura {asignatura_codigo}")
            cerrar_conexion(connection, cursor)
            sys.exit(1)
    except Exception as e:
        print(f"Error obteniendo plan de estudios: {e}")
        cerrar_conexion(connection, cursor)
        sys.exit(1)

    try:
        consulta_matriculados = """
            SELECT rut, anioIngreso, semestre, anioMatricula FROM matriculado
            WHERE PlanEstudios_codigo = %s AND anioMatricula = %s
        """
        cursor.execute(consulta_matriculados, (plan_estudios_codigo, anio))
        resultado = cursor.fetchall()
        matriculados_db = {
            str(rut): (anio_ing, semestre_ing, anio_matricula) 
            for rut, anio_ing, semestre_ing, anio_matricula in resultado
            }
    except Exception as e:
        print(f"Error al obtener alumnos matriculados: {e}")
        cerrar_conexion(connection, cursor)
        sys.exit(1)

    avance_lote = []
    asignatura_lote = []
    anios_faltantes = set()
    for _, row in df.iterrows():
        try:
            rut_raw = row[rut_col]
            rut = str(rut_raw).replace(" ", "").split('-')[0]
            if rut in matriculados_db:
                anio_ingreso, semestre_ingreso, anio_matricula= matriculados_db[rut]

                avance_lote.append((
                    anio, semestre, asignatura_codigo, plan_estudios_codigo,
                    plan_estudios_codigo, rut, semestre_ingreso, anio_ingreso,
                    anio, plan_estudios_codigo
                ))

                try:
                    nota = row[nota_final_col]
                    calificacion = float(nota.strip()) if isinstance(nota, str) else float(nota)
                    estado = 2 if calificacion >= 4.0 else 3
                except:
                    estado = 1

                asignatura_lote.append((
                    rut, anio_ingreso, semestre_ingreso, anio, plan_estudios_codigo,
                    asignatura_codigo, estado
                ))
            else:
                anios_faltantes.add(anio)
        except Exception as e:
            print(f"Error procesando fila: {e}")

    try:
        insert_avance_curricular = """
        INSERT INTO avancecurricular (anio, semestre, asignatura_codAsignatura, asignatura_PlanEstudios_codigo,
                                      matriculado_PlanEstudios_codigo, matriculado_rut, matriculado_semestre, 
                                      matriculado_anioIngreso, matriculado_anioMatricula,PlanEstudios_codigo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        insert_matriculado_has_asignatura = """
        INSERT INTO matriculado_has_asignatura (matriculado_rut, matriculado_anioIngreso, matriculado_semestre,
                                                matriculado_anioMatricula, matriculado_PlanEstudios_codigo,
                                                Asignatura_codAsignatura, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        if avance_lote:
            cursor.executemany(insert_avance_curricular, avance_lote)
        if asignatura_lote:
            cursor.executemany(insert_matriculado_has_asignatura, asignatura_lote)

        connection.commit()
        print("Datos insertados exitosamente en ambas tablas.")
    except Exception as e:
        print(f"Error al insertar datos en bloque: {e}")
        connection.rollback()
    finally:
        cerrar_conexion(connection, cursor)
    
    if anios_faltantes:
        print(f"RUTS_NO_ENCONTRADOS_ANIOS:{','.join(sorted(anios_faltantes))}")