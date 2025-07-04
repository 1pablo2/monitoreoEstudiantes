import mysql.connector

def obtener_conexion():
    return mysql.connector.connect(
        host='db',
        user='root',
        password='1234',
        database='monitoreoestudiantesbd'
    )

def ejecutar_consulta_unica(cursor, query, parametros=()):
    cursor.execute(query, parametros)
    return cursor.fetchone()

def insertar_datos(cursor, query, parametros=()):
    cursor.execute(query, parametros)

def cerrar_conexion(connection, cursor):
    cursor.close()
    connection.close()