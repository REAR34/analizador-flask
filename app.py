from flask import Flask, render_template, request, jsonify, make_response
import pandas as pd
import sqlite3
import os
import io

# Se crea un directorio para almacenar los archivos subidos
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
# Si ya existe el archivo, no creara otro
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    # Usamos .get('file') para una revisar si hay un archivo.
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'error': 'No se subió ningún archivo o el nombre del archivo está vacío.'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    # Guardamos el archivo subido a la carpeta correspondiente
    file.save(filepath)

    try:
        # 1. Procesar archivo con pandas
        # Verificamos que el formato sea el correcto para transformarlo en un dataframe
        filename_lower = file.filename.lower()
        if filename_lower.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename_lower.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(filepath)
        else:
            os.remove(filepath)
            return jsonify({'error': 'Formato no valido, utilice CSV o EXCEL'}), 400

        # Comprobar si el archivo estaba vacío
        if df.empty:
            os.remove(filepath)
            return jsonify({'error': 'El archivo está vacío o no se pudo leer.'}), 400

        # 2. Limpieza básica
        df = df.dropna()

        # 3. Estadísticas simples(count, mean, min, max)
        estadisticas_deseadas = ['count', 'mean', 'min', 'max']
        # Creamos un resumen que utilizara unicamente las estadisticas deseadas para convertirars en un diccionario
        resumen = df.describe().loc[estadisticas_deseadas].to_dict()

        # 4. Guardar en SQLite

        # Conectamos con la base de datos
        connectar = sqlite3.connect('data.db')
        # Si el archivo ya existe, se sustituye
        df.to_sql('datos', connectar, if_exists='replace', index=False)
        connectar.close()

        # 5. Limpiamos el archivo subido después de procesarlo
        os.remove(filepath)
        # Convertimos el resumen en un formato json
        return jsonify({'resumen': resumen})

    except Exception as e:
        # Manejo de errores de procesamiento
        error_message = f"Error interno al procesar el archivo: {str(e)}"

        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({'error': error_message, 'detalle': 'Asegúrate de que el archivo no esté corrupto y tenga el formato correcto.'}), 500


@app.route('/download_cleaned_data')
def download_cleaned_data():
    """Ruta para descargar los datos limpios guardados en data.db como un archivo CSV."""
    try:
        # 1. Conectar y leer los datos de la última carga
        conn = sqlite3.connect('data.db')
        df = pd.read_sql_query("SELECT * FROM datos", conn)
        conn.close()

        # 2. Crear un buffer de bytes en memoria (evita guardar un archivo temporal)
        output = io.BytesIO()

        # 3. Escribir el DataFrame limpio en formato CSV en el buffer
        # (Puede cambiar a df.to_excel(output, index=False) si prefiere XLSX)
        df.to_csv(output, index=False, encoding='utf-8')
        output.seek(0)

        # 4. Crear la respuesta Flask para el archivo
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=datos_limpios.csv"
        response.headers["Content-type"] = "text/csv"

        return response

    except Exception as e:
        return jsonify({'error': f'Error al descargar los datos: {str(e)}', 'detalle': 'Asegúrese de haber cargado un archivo primero.'}), 500


if __name__ == '__main__':
    app.run(debug=True)
