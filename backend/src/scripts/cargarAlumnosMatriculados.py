import pandas as pd
import unicodedata
import sys
import os
from db_utils import obtener_conexion, ejecutar_consulta_unica, insertar_datos, cerrar_conexion

sys.stdout.reconfigure(line_buffering=True)

if len(sys.argv) < 2:
    print("Error: No se especificó el directorio temporal.")
    sys.exit(1)

temp_dir = sys.argv[1]
matching_files = [f for f in os.listdir(temp_dir) if "Alumnos matriculados" in f]

if len(matching_files) == 0:
    print(f"Error: No se encontró ningún archivo que coincida con 'Alumnos matriculados' en {temp_dir}")
    sys.exit(1)

for file_name in matching_files:
    file_path = os.path.join(temp_dir, file_name)

    try:
        df = pd.read_excel(file_path, header=4)
    except Exception as e:
        print(f"Error leyendo el archivo Excel: {e}")
        sys.exit(1)

    required_columns = ['Rut Alumno', 'Nombre', 'Año ingreso']
    for col in required_columns:
        if col not in df.columns:
            print(f"Error: Falta la columna requerida '{col}' en el archivo Excel.")
            sys.exit(1)

    try:
        df_info = pd.read_excel(file_path, header=None, nrows=4, usecols="D")
        if df_info.shape[0] < 4:
            raise ValueError("Formato inesperado en la sección de información del plan de estudios.")

        plan_estudios_info = df_info.iloc[2, 0].split(" - ", 1)
        codigo_sies = plan_estudios_info[0].strip()
        plan_estudios_glosa = unicodedata.normalize('NFD', plan_estudios_info[1]).encode('ascii', 'ignore').decode('utf-8').strip()

        periodo_raw = df_info.iloc[3, 0]
        partes = periodo_raw.split()
        semestre = partes[0]
        anio_matricula = partes[-1]

    except Exception as e:
        print(f"Error procesando la información del plan de estudios: {e}")
        sys.exit(1)

    try:
        connection = obtener_conexion()
        cursor = connection.cursor()
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        sys.exit(1)

    consulta_plan_estudios = """
    SELECT codigo FROM planestudios WHERE codigoSIES = %s AND glosa = %s
    """
    try:
        resultado = ejecutar_consulta_unica(cursor, consulta_plan_estudios, (codigo_sies, plan_estudios_glosa))
        plan_codigo = resultado[0] if resultado else None

        if not plan_codigo:
            print(f"No se encontró el plan de estudios para {codigo_sies} y {plan_estudios_glosa}")
            cerrar_conexion(connection, cursor)
            sys.exit(1)

        delete_query = """
        DELETE FROM matriculado
        WHERE anioMatricula = %s AND semestre = %s AND PlanEstudios_codigo = %s
        """
        try:
            cursor.execute(delete_query, (anio_matricula, semestre, plan_codigo))
            print(f"Se eliminaron los registros anteriores para año matricula {anio_matricula}, semestre {semestre}, decreto {plan_codigo}")
        except Exception as e:
            print(f"Error al eliminar registros antiguos: {e}")
            cerrar_conexion(connection, cursor)
            sys.exit(1)

    except Exception as e:
        print(f"Error ejecutando la consulta del plan de estudios: {e}")
        cerrar_conexion(connection, cursor)
        sys.exit(1)

    insert_query = """
    INSERT INTO matriculado (rut, dv, nombreCompleto, anioIngreso, semestre, PlanEstudios_codigo, anioMatricula)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    def procesar_fila(row):
        try:
            rut_alumno = row['Rut Alumno'].replace(" ", "").split('-')
            rut = rut_alumno[0]
            dv = rut_alumno[1]
            nombre_completo = row['Nombre']
            anio_ingreso = row['Año ingreso']

            parametros = (rut, dv, nombre_completo, anio_ingreso, semestre, plan_codigo, anio_matricula)
            insertar_datos(cursor, insert_query, parametros)
        except Exception as e:
            print(f"Error insertando datos del alumno {row['Nombre']}: {e}")

    try:
        df.apply(procesar_fila, axis=1)
        connection.commit()
        print("Datos insertados exitosamente en la tabla matriculado.")
    except Exception as e:
        print(f"Error insertando datos en la base de datos: {e}")
        connection.rollback()
    finally:
        cerrar_conexion(connection, cursor)