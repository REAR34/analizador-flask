# Analizador de Archivos CSV/Excel

Esta aplicación web permite a los usuarios subir archivos en formato CSV o Excel (.xlsx) para realizar un análisis estadístico utilizando la librería Pandas. 
Los resultados del resumen se muestran en una tabla HTML dinámica en el navegador.

# Librerías Utilizadas

Para ejecutar esta aplicación, necesitará instalar las siguientes librerías de Python. Se recomienda usar 'pip' con un entorno virtual:

        flask
        pandas
        sqlite3 
        sqlalchemy (Requerido por Pandas para interactuar con SQLite)
        openpyxl (Requerido por Pandas para leer archivos .xlsx)
        io 


Puede instalar las librerías principales con el siguiente comando:

            pip install flask pandas openpyxl sqlalchemy

# Cómo Ejecutar la Aplicación

1.  Asegúrese de tener los archivos:
          
             Verifique que los archivos `app.py`, `index.html`, `script.js`, y `style.css` se encuentren en la estructura de carpetas correcta (`templates` y `static`).

2.  Ejecute el servidor Flask: Desde la terminal en el directorio principal, ejecute el script principal:
            
                python app.py

3.  Acceda a la aplicación: Abra su navegador web y navegue a la dirección que le indique Flask (puede ser: http://127.0.0.1:5000/).

# Funcionalidad

* Procesamiento: La aplicación acepta archivos `.csv` y `.xlsx`.
* Limpieza de Datos: Las filas con valores faltantes son eliminadas (`df.dropna()`) antes del análisis.
* Análisis: Se calcula y muestra el resumen de estadísticas para columnas.
* Persistencia: Los datos limpios del archivo subido se guardan automáticamente en la base de datos local `data.db` en la tabla llamada `datos`.