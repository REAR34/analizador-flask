/**
 * Convierte el objeto resumen de Pandas en una tabla HTML.
 * @param {Object} summaryData - El objeto resumen devuelto por df.describe(include='all').
 * @returns {string} El HTML de la tabla.
 */
// ... (La función createSummaryTableHTML permanece igual)
function createSummaryTableHTML(summaryData) {
    if (!summaryData || Object.keys(summaryData).length === 0) {
        return "<h2>No se encontraron datos válidos para el resumen.</h2>";
    }

    const columnNames = Object.keys(summaryData); 

    // Obtener todas las métricas únicas (count, mean, top, 25%, etc.)
    const allMetrics = new Set();
    columnNames.forEach(col => {
        Object.keys(summaryData[col]).forEach(metric => allMetrics.add(metric));
    });
    // Ordenar las métricas para que la tabla sea consistente (opcional)
    const sortedMetrics = Array.from(allMetrics).sort();

    let html = '<h2>Resultados del Análisis Descriptivo</h2>';
    html += '<table id="summary-table">';
    
    // Encabezado de la tabla (Columna de métricas + Nombres de las columnas de datos)
    html += '<thead><tr>';
    html += '<th>Estadística</th>';
    columnNames.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';

    // Cuerpo de la tabla
    html += '<tbody>';
    sortedMetrics.forEach(metric => {
        html += '<tr>';
        // Primera celda: Nombre de la métrica
        html += `<td>${metric}</td>`;
        
        // Celdas de datos para cada columna
        columnNames.forEach(col => {
            let value = summaryData[col][metric];
            
            // Limpieza y formateo de valores
            if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
                value = '—'; // Mostrar guion para NaN
            } else if (typeof value === 'number' && !Number.isInteger(value)) {
                value = value.toFixed(4); // Redondear decimales largos
            }
            
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';

    return html;
}


document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultadoDiv = document.getElementById('resultado'); 
    const downloadButton = document.getElementById('download-button'); // Nuevo
    const fileInput = document.getElementById('file');
    
    // Ocultar el botón de descarga al inicio de un nuevo intento
    downloadButton.style.display = 'none';

    resultadoDiv.innerHTML = "<h2>Cargando y analizando archivo...</h2>";
    
    if (fileInput.files.length === 0) {
        resultadoDiv.innerHTML = "<h2>Error</h2>" + '<pre>' + JSON.stringify({ error: "Por favor, selecciona un archivo." }, null, 2) + '</pre>';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            // Éxito: Muestra la tabla y el botón
            resultadoDiv.innerHTML = createSummaryTableHTML(data.resumen);
            
            // CLAVE: Muestra y configura el botón de descarga
            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                window.location.href = '/download_cleaned_data';
            };
            
        } else {
            // Error: Mostrar el JSON de error
            resultadoDiv.innerHTML = "<h2>Error en el Análisis</h2>" + '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
    } catch (error) {
        // Manejo de errores de red o parseo de JSON
        resultadoDiv.innerHTML = "<h2>Error Crítico</h2>" + '<pre>' + JSON.stringify({ error: "Error de conexión o respuesta no válida." }, null, 2) + '</pre>';
        console.error("Fetch o JSON Error:", error);
    }
});