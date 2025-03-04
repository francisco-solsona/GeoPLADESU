function aplicarEstilos(doc) {
    // Configuración general
    doc.setFont("helvetica"); // Fuente
    doc.setFontSize(12); // Tamaño de fuente base
    doc.setTextColor(0, 0, 0); // Color de texto predeterminado (negro)
}

function verificarDesbordamiento(doc, y, margenInferior = 25) {
    const alturaPagina = doc.internal.pageSize.getHeight(); // Altura de la página
    if (y > alturaPagina - margenInferior) { // Si el contenido se acerca al margen inferior
        doc.addPage(); // Agregar una nueva página
        return 10; // Reiniciar la posición vertical (y) en la nueva página
    }
    return y; // Devolver la posición vertical actual
}

function agregarTitulo(doc, texto, y) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Color negro para el subtítulo
    doc.setFont("helvetica", "bold"); // Fuente en negritas
    doc.text(texto, 10, y);
}

function agregarSubtitulo(doc, texto, y) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el subtítulo
    doc.setFont("helvetica", "bold"); // Fuente en negritas
    doc.text(texto, 10, y);
    doc.setFont("helvetica", "normal"); // Restaurar la fuente a normal después del título
}

function agregarTextoConSalto(doc, texto, x, y, maxAncho, color = [0, 0, 0]) {
    doc.setFontSize(10);
    doc.setTextColor(...color); // Color personalizado

    // Dividir el texto en líneas que no excedan el ancho máximo
    const lineas = doc.splitTextToSize(texto, maxAncho);

    // Agregar cada línea al PDF
    lineas.forEach((linea, index) => {
        doc.text(linea, x, y + (index * 10)); // 10 es el espacio entre líneas
    });

    // Devolver la nueva posición vertical (y) después de agregar las líneas
    return y + (lineas.length * 10);
}

function agregarTablaCompatibilidades(doc, categorias, y) {
    const startY = y;
    const categoriaWidth = 40; // Ancho reducido para la columna de Categoría
    const subcategoriasWidth = 140; // Ancho ampliado para la columna de Subcategorías
    const rowHeight = 10; // Altura de las filas
    const margenInferior = 25; // Margen inferior para evitar desbordamiento

    // Configuración de la tabla
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");

    // Dibujar encabezados de la tabla
    doc.text("Categoría", 10, y);
    doc.text("Subcategorías", 60, y); // Ajustamos la posición horizontal de "Subcategorías"
    y += rowHeight;

    // Dibujar línea debajo del encabezado
    doc.setLineWidth(0.5);
    doc.line(10, y, 190, y);
    y += rowHeight;

    // Restaurar la fuente a normal para el contenido de la tabla
    doc.setFont("helvetica", "normal");

    // Iterar sobre las categorías y subcategorías
    for (const [categoria, subcategorias] of Object.entries(categorias)) {
        let categoriaRepetida = false; // Bandera para saber si la categoría ya se repitió en una nueva página

        // Verificar si hay espacio suficiente en la página para la categoría y al menos una línea de subcategorías
        if (y + rowHeight > doc.internal.pageSize.getHeight() - margenInferior) {
            doc.addPage(); // Agregar una nueva página
            y = 20; // Reiniciar la posición vertical en la nueva página

            // Volver a dibujar los encabezados de la tabla en la nueva página
            doc.setFont("helvetica", "bold");
            doc.text("Categoría", 10, y);
            doc.text("Subcategorías", 60, y); // Ajustamos la posición horizontal de "Subcategorías"
            y += rowHeight;
            doc.line(10, y, 190, y);
            y += rowHeight;
            doc.setFont("helvetica", "normal");

            // Repetir el nombre de la categoría en la nueva página
            doc.text(categoria, 10, y);
            categoriaRepetida = true; // Marcamos que la categoría ya se repitió
        } else {
            // Agregar la categoría en la primera columna
            doc.text(categoria, 10, y);
        }

        // Dividir las subcategorías en líneas que no excedan el ancho de la columna
        const subcategoriasTexto = subcategorias.join(", ");
        const subcategoriasLineas = doc.splitTextToSize(subcategoriasTexto, subcategoriasWidth);

        // Dibujar cada línea de subcategorías
        for (let i = 0; i < subcategoriasLineas.length; i++) {
            // Verificar si hay espacio suficiente en la página para la siguiente línea
            if (y + rowHeight > doc.internal.pageSize.getHeight() - margenInferior) {
                doc.addPage(); // Agregar una nueva página
                y = 20; // Reiniciar la posición vertical en la nueva página

                // Volver a dibujar los encabezados de la tabla en la nueva página
                doc.setFont("helvetica", "bold");
                doc.text("Categoría", 10, y);
                doc.text("Subcategorías", 60, y); // Ajustamos la posición horizontal de "Subcategorías"
                y += rowHeight;
                doc.line(10, y, 190, y);
                y += rowHeight;
                doc.setFont("helvetica", "normal");

                // Repetir el nombre de la categoría en la nueva página
                doc.text(categoria, 10, y);
                categoriaRepetida = true; // Marcamos que la categoría ya se repitió
            }

            // Agregar la línea de subcategorías
            doc.text(subcategoriasLineas[i], 60, y); // Ajustamos la posición horizontal de las subcategorías
            y += rowHeight;
        }

        // Dibujar línea debajo de cada fila
        if (y + rowHeight > doc.internal.pageSize.getHeight() - margenInferior) {
            doc.addPage(); // Agregar una nueva página
            y = 20; // Reiniciar la posición vertical en la nueva página
        } else {
            doc.line(10, y, 190, y);
            y += rowHeight;
        }
    }

    return y;
}

function generarPDF(atributosZonificacion, atributosCompatibilidades, selectedCoordinates) {
    const doc = new jspdf.jsPDF();

    // Aplicar estilos generales
    aplicarEstilos(doc);

    // Agregar la barra horizontal gris en la parte superior
    doc.setFillColor(200, 200, 200); // Color gris (RGB)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F'); // Barra gris de 22px de alto

    // Agregar el logo en la esquina izquierda de la barra gris
    const logoUrl = 'img/pladesu-logo.png'; // Ruta del logo
    doc.addImage(logoUrl, 'PNG', 10, 5, 45, 15); // (x, y, ancho, alto)

    // Agregar la leyenda en la barra gris
    doc.setFontSize(8); // Tamaño de fuente pequeño
    doc.setTextColor(0, 0, 0); // Color negro
    doc.setFont("helvetica", "bold"); // Fuente normal
    const leyenda = "*Versión de divulgación e información, no produce efectos jurídicos";
    const textWidth = doc.getStringUnitWidth(leyenda) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textX = pageWidth - textWidth - 10; // Alinear a la derecha con un margen de 10px
    doc.text(leyenda, textX, 15); // (x, y)

    let y = 35; // Posición vertical inicial después del logo

    // Agregar un título al PDF
    agregarTitulo(doc, "Resumen del Predio", y);
    y = verificarDesbordamiento(doc, y + 10); // Verificar desbordamiento después del título

    // Agregar la información de zonificación
    y = verificarDesbordamiento(doc, y); // Verificar desbordamiento
    agregarSubtitulo(doc, "Información de Zonificación:", y);
    y += 10;

    for (const [clave, valor] of Object.entries(atributosZonificacion)) {
        y = verificarDesbordamiento(doc, y); // Verificar desbordamiento

        // Agregar el nombre del atributo en negritas
        doc.setFont("helvetica", "bold"); // Fuente en negritas
        y = agregarTextoConSalto(doc, `${clave}:`, 10, y, 80); // Nombre de la columna
        doc.setFont("helvetica", "normal"); // Restaurar la fuente a normal
        // Agregar el valor del atributo
        y = agregarTextoConSalto(doc, `${valor}`, 90, y - 10, 100, [100, 100, 100]); // Valor
    }

    // Agregar una nueva página para la imagen estática y los atributos de compatibilidades
    doc.addPage();

    // Reiniciar la posición vertical en la nueva página
    y = 30;

    // Obtener el centro y el zoom del mapa actual
    const center = map.getCenter();

    console.log("Centro del mapa:", center.lng, center.lat);
    // Usar el estilo personalizado que incluye la capa de zonificación
    // Estilo con catastro y zonificación: 'cm7p5osav01e901qo3lqv4tft'
    // Estilo con imágen de satélite: 'cm69nxu0w001h01qrejoc0r8a'
    const customStyleId = 'cm69nxu0w001h01qrejoc0r8a'; // Solo el ID del estilo

    // URL de la imagen estática con un marcador en el centro de la imagen
    const staticMapUrl = `https://api.mapbox.com/styles/v1/paco-solsona/${customStyleId}/static/pin-s+ff0000(${selectedCoordinates.lng},${selectedCoordinates.lat})/${selectedCoordinates.lng},${selectedCoordinates.lat},16.5/600x400@2x?access_token=${mapboxgl.accessToken}`;

    console.log("URL de la imagen estática con marcador:", staticMapUrl);

    // Cargar la imagen estática del mapa y agregarla al PDF
    const img = new Image();
    img.src = staticMapUrl;
    img.onload = () => {
        console.log("Imagen estática cargada correctamente.");
        const imgWidth = doc.internal.pageSize.getWidth() - 20; // Ancho de la imagen (margen de 10px a cada lado)
        const imgHeight = (img.height * imgWidth) / img.width; // Mantener la proporción de la imagen
        doc.addImage(img, 'PNG', 10, y, imgWidth, imgHeight); // (x, y, ancho, alto)

        y += imgHeight + 10; // Posición vertical después de la imagen

        // Agregar la información de compatibilidades
        agregarSubtitulo(doc, "Usos Compatibles:", y);
        y += 15;

        if (atributosCompatibilidades.Compatibilidades.length > 0) {
            const categorias = {};
            atributosCompatibilidades.Compatibilidades.forEach(item => {
                if (!categorias[item.Categoría]) {
                    categorias[item.Categoría] = [];
                }
                categorias[item.Categoría].push(item.Subcategoría);
            });

            // Agregar la tabla de compatibilidades
            y = agregarTablaCompatibilidades(doc, categorias, y);
        } else {
            y = verificarDesbordamiento(doc, y); // Verificar desbordamiento
            y = agregarTextoConSalto(doc, "No se encontraron usos compatibles.", 10, y, 180, [100, 100, 100]);
            y += 5;
        }

        // Guardar el PDF y abrirlo en una nueva pestaña
        console.log("Generando PDF...");
        doc.save("resumen_predio.pdf");
        window.open(doc.output('bloburl'), '_blank');
    };
    img.onerror = (error) => {
        console.error("Error al cargar la imagen estática:", error);
        alert("No se pudo cargar la imagen del mapa. Verifica la URL y el accessToken.");
    };
}