import pandas as pd
import sys
import os
import re
from db_utils import obtener_conexion, ejecutar_consulta_unica, insertar_datos, cerrar_conexion

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

        found = False
        for row_idx in range(df_metadata.shape[0]):
            for col_idx in range(df_metadata.shape[1]):
                cell_value = str(df_metadata.iat[row_idx, col_idx])
                if "semestre" in cell_value.lower():
                    try:
                        anio = None
                        semestre = None
                        for offset in [-1, 1, 2, 3, 4, 5, 6]:
                            col_check = col_idx + offset
                            if 0 <= col_check < df_metadata.shape[1]:
                                posible = df_metadata.iat[row_idx, col_check]
                            if pd.notna(posible) and isinstance(posible, (int, float)):
                                valor = str(int(posible)) if float(posible).is_integer() else str(posible)
                                if len(valor) == 4:
                                    anio = valor
                                elif valor in ['1', '2']:
                                    semestre = valor
                        if not anio or not semestre:
                            print(f"Error: No se pudo encontrar anio y semestre validos después de la celda 'Semestre'.")
                            sys.exit(1)
                        found = True
                        break

                    except Exception as e:
                        print(f"Error extrayendo anio y semestre: {e}")
                        sys.exit(1)
            if found:
                break
        if not found:
            print("Error: No se encontro la columna 'Semestre' en el archivo Excel.")
            sys.exit(1)

        asignatura_info = pd.read_excel(file_path, header=None, usecols="D", nrows=1, skiprows=6).iloc[0, 0]
        asignatura_codigo, asignatura_nombre = asignatura_info.split(" - ", 1)
        asignatura_nombre = re.split(r'[^\w\s]', asignatura_nombre, maxsplit=1)[0].strip()
    except Exception as e:
        print(f"Error leyendo información adicional del archivo Excel: {e}")
        sys.exit(1)

    try:
        df = pd.read_excel(file_path, header=10)
        indice_cierre = df[df['C. IDENTIDAD'].astype(str).str.contains("esta acta ha sido generada por el proceso de cierre", case=False, na=False)].index
        if not indice_cierre.empty:
            df = df.loc[:indice_cierre[0] - 1]
        required_columns = ['C. IDENTIDAD', 'NOTA FINAL']
        columnas_encontradas = {col: df.columns[df.columns.str.contains(col, case=False, na=False)].tolist() for col in required_columns}

        if not all(columnas_encontradas.values()):
            print(f"Error: No se encontraron todas las columnas requeridas en el archivo Excel. Falta alguna de {required_columns}")
            sys.exit(1)

        rut_col = columnas_encontradas["C. IDENTIDAD"][0]
        nota_final_col = columnas_encontradas["NOTA FINAL"][0]

    except Exception as e:
        print(f"Error leyendo el archivo Excel: {e}")
        sys.exit(1)

    try:
        connection = obtener_conexion()
        cursor = connection.cursor()
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        sys.exit(1)

    consulta_plan_estudios = """
    SELECT PlanEstudios_codigo FROM asignatura WHERE codAsignatura = %s
    """
    try:
        resultado = ejecutar_consulta_unica(cursor, consulta_plan_estudios, (asignatura_codigo,))
        plan_estudios_codigo = str(resultado[0]) if resultado else None

        if not plan_estudios_codigo:
            print(f"No se encontro el plan de estudios para la asignatura {asignatura_codigo}")
            cerrar_conexion(connection, cursor)
            sys.exit(1)
    except Exception as e:
        print(f"Error ejecutando la consulta del plan de estudios: {e}")
        cerrar_conexion(connection, cursor)
        sys.exit(1)

    insert_avance_curricular = """
    INSERT INTO avancecurricular (anio, semestre, asignatura_codAsignatura, asignatura_PlanEstudios_codigo,
                                  matriculado_PlanEstudios_codigo, matriculado_rut, matriculado_semestre, 
                                  matriculado_anioIngreso, matriculado_anioMatricula,PlanEstudios_codigo)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    insert_matriculado_has_asignatura = """
    INSERT INTO matriculado_has_asignatura (matriculado_rut, matriculado_anioIngreso, matriculado_semestre,
                                            matriculado_anioMatricula, matriculado_PlanEstudios_codigo, Asignatura_codAsignatura,
                                            estado)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    def procesar_fila(row):
        try:
            rut_alumno = row['C. IDENTIDAD'].replace(" ", "").split('-')
            rut = str(rut_alumno[0])

            verificar_matriculado_query = """
            SELECT anioIngreso, semestre FROM matriculado WHERE PlanEstudios_codigo = %s AND rut = %s
            """

            cursor.execute(verificar_matriculado_query, (plan_estudios_codigo, rut))
            resultado_matriculado = cursor.fetchone()
            cursor.fetchall()

            if resultado_matriculado:
                anio_matriculado, semestre_matriculado = resultado_matriculado

                parametros_avance = (
                    str(anio), str(semestre), asignatura_codigo, plan_estudios_codigo,
                    plan_estudios_codigo, rut, semestre_matriculado, anio_matriculado,
                    str(anio), plan_estudios_codigo
                )
                insertar_datos(cursor, insert_avance_curricular, parametros_avance)

                try:
                    valor_nota = row['NOTA FINAL']
                    if isinstance(valor_nota, str):
                        calificacion = float(valor_nota.strip())
                    else:
                        calificacion = float(valor_nota)

                    if calificacion >= 4.0:
                        estado = 2
                    elif calificacion < 4.0:
                        estado = 3
                    else:
                        estado = 1
                except ValueError:
                    estado = 1

                parametros_asignatura = (
                    rut, anio_matriculado, semestre_matriculado, str(anio), plan_estudios_codigo,
                    asignatura_codigo, estado
                )
                insertar_datos(cursor, insert_matriculado_has_asignatura, parametros_asignatura)
            else:
                print(f"El alumno con RUT {rut} no existe en la tabla matriculado.")
        except Exception as e:
            print(f"Error procesando datos del alumno con RUT {row['C. IDENTIDAD']}: {e}")

    try:
        df.apply(procesar_fila, axis=1)
        connection.commit()
        print("Datos insertados exitosamente en ambas tablas.")
    except Exception as e:
        print(f"Error insertando datos en la base de datos: {e}")
        connection.rollback()
    finally:
        cerrar_conexion(connection, cursor)