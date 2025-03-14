mapboxgl.accessToken = 'pk.eyJ1IjoicGFjby1zb2xzb25hIiwiYSI6ImNseWczNG1tbTA1eGIyanBudTZocnlncmwifQ.S2cqYETyR3u-5PBEy0-AsQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    projection: 'globe',
    zoom: 13, // Nivel de zoom inicial
    maxBounds: [
        [-100.66596, 20.37553], 
        [-100.13981, 20.86796]
    ],
    center: [-100.39279, 20.59246]
});

map.on('style.load', () => {
    map.setFog({});
});

////////////////////////////////////////////
////// ALMACENAMOS VARIABLES GLOBALES //////
////////////////////////////////////////////

// Enlaces a los que somos redirigidos
const enlaceCatastro = 'https://catastroedo.queretaro.gob.mx/Qsig/index.jsp?mun=06';
const enlacePMDUQ = 'https://drive.google.com/file/d/11zXOfgqBYSL7LXt0BnAzfvEpKLMB_we2/view?usp=drive_link'
const enlacePPDUZMBT = 'https://drive.google.com/file/d/10_YIkStrub38KsuzbMb7iZd0q-o56her/view?usp=drive_link'
// Enlaces de los documentos pdf
const enlacesDocumentos = {
    "Plan Parcial de Desarrollo Urbano Delegación Centro Histórico": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Epigmenio González": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Felipe Carrillo Puerto": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Félix Osores Sotomayor": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Josefa Vergara y Hernández": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Santa Rosa Jáuregui": enlacePMDUQ,
    "Plan Parcial de Desarrollo Urbano Delegación Villa Cayetano Rubio": enlacePMDUQ,
    "Programa Parcial de Desarrollo Urbano de la Zona de Monumentos y Barrios Tradicionales": enlacePPDUZMBT,
    // Agrega más documentos y enlaces aquí
};

// Variable para almacenar el ID del polígono seleccionado de catastro
let selectedFeatureId = null;
// Variable para almacenar las coordenadas del predio seleccionado
let selectedCoordinates = null; 

// Variable global para almacenar los atributos de zonificación
let atributosZonificacion = {};
let atributosCatastro = {};
let atributosCompatibilidades = {};

// Variable de la capa de catastro
const globalCatastroUrl = 'mapbox://paco-solsona.boay2u89';
const globalCatastroLayer = 'C22014_CATASTRO_2019-6hq1ly';
// Variable de la capa del censo
const globalCensoUrl = 'mapbox://paco-solsona.b3xxxkhe';
const globalCensoLayer = 'C22_ZMP_CENSO_INV_2020_v2-353rao';
// Variable de la capa de zonificacion
const globalZoningUrl = 'mapbox://paco-solsona.7uztrbwr';
const globalZoningLayer = 'C22014_Z02_COMPLETA-4k0xdy';

////////////////////////////////////////////
/////// CARGAMOS LAS CAPAS A UTILIZAR //////
////////////////////////////////////////////

// Función para volver a cargar la capa personalizada
function addCustomLayers() {
    // Primero vamos a llamar todos los sources
    if (!map.getSource('catastro')) {
        map.addSource('catastro', {
            type: 'vector',
            url: globalCatastroUrl // URL del vector layer 'C22_QRO_Z02_2022-dqkkpw'
        });
    }
    if (!map.getLayer('catastro-line-layer')) {
        map.addLayer({
            'id': 'catastro-line-layer',
            'type': 'line',  // Cambiado de 'circle' a 'fill' para trabajar con polígonos
            'source': 'catastro',  // Asegúrate de que el nombre de la fuente coincida
            'source-layer': globalCatastroLayer, // Asegúrate de que el nombre de la capa coincida
            'slot': 'top',
            'minzoom': 15,
            'maxzoom': 22,
            'paint': {
                'line-color': '#000000',  // Bordes en color negro
                'line-width': 0.7,  // Grosor de la línea
                'line-opacity': 0.7  // Opcional, para controlar la opacidad del relleno
            }
        });
    }
    if (!map.getLayer('catastro-fill-layer')) {
        map.addLayer({
            'id': 'catastro-fill-layer',
            'type': 'fill',  // Cambiado de 'circle' a 'fill' para trabajar con polígonos
            'source': 'catastro',  // Asegúrate de que el nombre de la fuente coincida
            'source-layer': globalCatastroLayer, // Asegúrate de que el nombre de la capa coincida
            'slot': 'top',
            'minzoom': 15,
            'maxzoom': 22,
            'paint': {
                'fill-color': '#000000',  // Bordes en color negro
                'fill-opacity': 0  // Opcional, para controlar la opacidad del relleno
            }
        });
    }
    // Agregar la nueva capa 'C22_QRO_Z02_2022-dqkkpw'
    if (!map.getSource('zonificacion')) {
        map.addSource('zonificacion', {
            type: 'vector',
            url:  globalZoningUrl // URL del vector layer 'C22_QRO_Z02_2022-dqkkpw'
        });
    }
    if (!map.getLayer('zoning-fill-layer')) {
        map.addLayer({
            'id': 'zoning-fill-layer',
            'type': 'fill',  // Cambiado de 'circle' a 'fill' para trabajar con polígonos
            'source': 'zonificacion',  // Asegúrate de que el nombre de la fuente coincida
            'source-layer': globalZoningLayer, // Asegúrate de que el nombre de la capa coincida
            'slot': 'bottom',
            'minzoom': 0,
            'maxzoom': 22,
            'paint': {
                'fill-color': ['get', 'Color_HEX'],
                'fill-opacity': 0.7 // Opcional, para controlar la opacidad del relleno
            }
        });
    }
    // Agregar la nueva capa 'C22_QRO_Z02_2022-dqkkpw'
    if (!map.getSource('censo')) {
        map.addSource('censo', {
            type: 'vector',
            url:  globalCensoUrl // URL del vector layer 'C22_QRO_Z02_2022-dqkkpw'
        });
    }
    if (!map.getLayer('censo-fill-layer')) {
        map.addLayer({
            'id': 'censo-fill-layer',
            'type': 'fill',  // Cambiado de 'circle' a 'fill' para trabajar con polígonos
            'source': 'censo',  // Asegúrate de que el nombre de la fuente coincida
            'source-layer': globalCensoLayer, // Asegúrate de que el nombre de la capa coincida
            'slot': 'bottom',
            'minzoom': 0,
            'maxzoom': 22,
            'paint': {
                'fill-opacity': 0  // Opcional, para controlar la opacidad del relleno
            }
        });
    }

    // Configurar eventos para resaltar el polígono seleccionado
    map.on('mouseenter', 'catastro-fill-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'catastro-fill-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    // Agregar la capa de extrusión para resaltar el polígono seleccionado
    if (!map.getLayer('catastro-extrusion')) {
        map.addLayer({
            'id': 'catastro-extrusion',
            'type': 'fill-extrusion',
            'source': 'catastro',
            'source-layer': globalCatastroLayer,
            'layout': {},
            'paint': {
                'fill-extrusion-color': '#ff0000',
                'fill-extrusion-height': [
                    'case',
                    ['==', ['get', 'ID'], selectedFeatureId], 1000,
                    0
                ],
                'fill-extrusion-opacity': 0.8
            },
            'filter': ['==', 'ID', '']
        });
    }

    // Agregar la capa de línea para resaltar el borde del polígono seleccionado
    if (!map.getLayer('catastro-highlight')) {
        map.addLayer({
            'id': 'catastro-highlight',
            'type': 'line',
            'source': 'catastro',
            'source-layer': globalCatastroLayer,
            'layout': {},
            'paint': {
                'line-color': '#000000',
                'line-width': 5
            },
            'filter': ['==', 'ID', '']
        });
    }

}

// Escuchar cuando el estilo del mapa cambia y volver a añadir las capas
map.on('styledata', () => {
    addCustomLayers();
});

////////////////////////////////////////////
///////// INTERACCIÓN CON CATASTRO /////////
////////////////////////////////////////////

// Llamar a la función al cargar el mapa
map.on('load', () => {
    addCustomLayers();
    
    // Evento de clic en la capa catastro-fill-layer
    map.on('click', 'catastro-fill-layer', async (e) => {
        
        if (e.features.length > 0) {
            const feature = e.features[0];
            
            selectedFeatureId = feature.properties.ID; // Guarda el ID del polígono seleccionado

            // Asignar las coordenadas del punto seleccionado
            selectedCoordinates = e.lngLat;
            console.log("Centro del predio:", selectedCoordinates.lng, selectedCoordinates.lat);

            atributosCatastro = {
                'Clave Catastral': feature.properties.DGR_CVECAT,
                'Superficie': parseFloat(feature.properties.Superficie).toFixed(1) + " m²",
                'Identificador': feature.properties.ID
            };

            document.getElementById('info-catastral').innerHTML = `La superficie del predio es de <strong>~${atributosCatastro.Superficie}</strong> y su Clave Catastral es <strong>${atributosCatastro['Clave Catastral']}</strong>. Puedes consultar más información sobre el predio haciendo <a href="${enlaceCatastro}" target="_blank"><strong><span class="underline">click aquí</span></strong></a>.`;

            // Actualiza la capa de extrusión y borde para resaltar el polígono clickeado
            map.setFilter('catastro-extrusion', ['==', 'ID', selectedFeatureId]);
            map.setFilter('catastro-highlight', ['==', 'ID', selectedFeatureId]);

            
            // Consultar la capa de zonificación para obtener los atributos del polígono de zonificación
            const zonificacionFeatures = map.queryRenderedFeatures(e.point, { layers: ['zoning-fill-layer'] });
            
            if (zonificacionFeatures.length > 0) {
                const zonificacionFeature = zonificacionFeatures[0];

                atributosZonificacion = {
                    'Clave Catastral': feature.properties.DGR_CVECAT,
                    'Superficie del predio': parseFloat(feature.properties.Superficie).toFixed(1) + " m²",
                    'Uso del suelo': zonificacionFeature.properties.Uso,
                    'Clave de uso general': zonificacionFeature.properties.CVE_1,
                    'Nomenclatura': zonificacionFeature.properties.CVE_2,
                    'Coeficiente de Ocupación del Suelo': zonificacionFeature.properties.COS__decim,
                    'Coeficiente de Utilización del Suelo': zonificacionFeature.properties.CUS__decim,
                    'Área libre': (parseFloat(zonificacionFeature.properties.Área_libr) * 100).toFixed(1) + "%", // Convertir a porcentaje
                    'Sup. máxima de desplante': 'N/A',
                    'Sup. máxima de construcción': 'N/A',
                    'Superficie mínima de área libre': 'N/A',
                    'Niveles': zonificacionFeature.properties.NIVELES,
                    'Altura máxima': (zonificacionFeature.properties.Altura_Max) + " m",
                    'Viviendas permitidas por hectárea': zonificacionFeature.properties.Factor__Vi,
                    'Viviendas permitidas en el predio': 'N/A',
                    'Frente mínimo': zonificacionFeature.properties.Frente_mí  + " m",
                    'Sup. mínima del lote': zonificacionFeature.properties.Sup__Míni  + " m²",
                    'Programa rector': zonificacionFeature.properties.Documento,
                };

                try {
                    const areaLibre = parseFloat(zonificacionFeature.properties.Área_libr);
                    const superficie = parseFloat(feature.properties.Superficie);
                    const coefOc = parseFloat(zonificacionFeature.properties.COS__decim);
                    const niveles = parseInt(zonificacionFeature.properties.NIVELES, 10);
                    const viviendasPorHectarea = parseFloat(zonificacionFeature.properties.Factor__Vi);

                    if (!isNaN(superficie) && !isNaN(coefOc) && !isNaN(niveles)) {
                        const supMaxDesplante = superficie * coefOc;
                        const supMaxConstruccion = supMaxDesplante * niveles;
                        atributosZonificacion['Sup. máxima de desplante'] = supMaxDesplante.toFixed(1) + " m²";
                        atributosZonificacion['Sup. máxima de construcción'] = supMaxConstruccion.toFixed(1) + " m²";
                    }

                    if (!isNaN(superficie) && !isNaN(viviendasPorHectarea)) {
                        let viviendasPermitidas = Math.floor((superficie * viviendasPorHectarea) / 10000);
                        viviendasPermitidas = viviendasPermitidas === 0 ? 1 : viviendasPermitidas;
                        atributosZonificacion['Viviendas permitidas en el predio'] = viviendasPermitidas;
                    }

                    if (!isNaN(superficie) && !isNaN(areaLibre)) {
                        const superficieMinimaAreaLibre = superficie * areaLibre;
                        atributosZonificacion['Superficie mínima de área libre'] = superficieMinimaAreaLibre.toFixed(1) + " m²";
                    }
                } catch (error) {
                    console.error("Error en los cálculos de superficie:", error);
                }

                const { Documento: documento } = zonificacionFeature.properties;
                const enlaceDocumento = enlacesDocumentos[documento] || "#";

                document.getElementById('informacion-zonificacion').innerHTML = 
                `El predio pertenece a la delegación 
                <strong>${zonificacionFeature.properties.DELEGACION}</strong>, consulta el 
                <a href="${enlaceDocumento}" target="_blank"><strong>${documento}</strong></a> <br><br>
                Para conocer más información del predio y sus usos puedes usar el <strong>menú lateral</strong> y 
                <strong>hacer click</strong> en el menú 'Zonificación' con este ícono 
                <i class="icon-building" id="menu-icon-paragraph"></i>.`;

                console.log("Atributos de zonificación almacenados:", atributosZonificacion);
                console.log("Atributos de catastro almacenados:", atributosCatastro);
            }

            ////////////////////////////////////////////////////
            //////// INTEGRAMOS USOS Y COMPATIBILIDADES ////////
            ////////////////////////////////////////////////////
            
            try {
                // Realizar la solicitud fetch para obtener el JSON
                const response = await fetch('datos/PMDUQ-normatividad.json'); // Reemplaza con la ruta real
                const data = await response.json();
            
                
                console.log("JSON cargado:", data); // Debug: Verificar el JSON cargado
            
                // Verificar si el JSON tiene la propiedad 'cg-pb-activas'
                if (!data['cg-pb-activas']) {
                    console.error("El JSON no tiene la propiedad 'cg-pb-activas'");
                } else {
                    // Obtener las normas de plantas bajas activas
                    const normasPBActivas = data['cg-pb-activas'];

                    // Buscar coincidencia entre la Nomenclatura del predio y el JSON
                    const normaEncontrada = normasPBActivas.find(norma => norma.CVE_2 === atributosZonificacion.Nomenclatura);

                    if (normaEncontrada) {
                        // Mostrar el mensaje en el bloque de normas generales
                        // Mostrar el subtítulo y el mensaje en el bloque de normas generales
                        const mensaje = `
                        <h2>Compatibilidad de Giros: Plantas Bajas Activas</h2>
                        <p>Los predios clasificados con uso <strong>${atributosZonificacion['Uso del suelo']}</strong> pueden solicitar autorización para desarrollar plantas bajas activas con hasta dos locales comerciales compatibles con el uso de suelo <strong>Habitacional Mixto (HM)</strong>, cuya superficie máxima conjunta será de <strong>${normaEncontrada.SUP_MAX} m²</strong> de construcción, siempre y cuando estén acompañados de vivienda en los niveles subsecuentes.</p>
                        `;

                        document.getElementById('info-norm-general-block').innerHTML = `<p>${mensaje}</p>`;
                    } else {
                        // No se encontró coincidencia
                        document.getElementById('info-norm-general-block').innerHTML = '<p>Predio no compatible con la norma "Compatibilidad de Giros: Plantas Bajas Activas."</p>';
                    }
                }
                // Verificar si el JSON tiene la propiedad 'dda-restr-usos'
                if (!data['dda-restr-usos']) {
                    console.error("El JSON no tiene la propiedad 'dda-restr-usos'");
                } else {
                    // Obtener las restricciones de usos adicionales
                    const restriccionesUsos = data['dda-restr-usos'];

                    // Buscar coincidencia entre la Nomenclatura del predio y el JSON
                    const restriccionEncontrada = restriccionesUsos.find(restriccion => restriccion.CVE_2 === atributosZonificacion.Nomenclatura);

                    if (!restriccionEncontrada) {
                        // Mostrar el subtítulo y el mensaje en el bloque de normas generales
                        const mensajeDDA = `
                            <h2>Derechos de Desarrollo Adicionales</h2>
                            <p>Los derechos de desarrollo adicionales permiten a los propietarios de predios con uso <strong>${atributosZonificacion['Uso del suelo']}</strong> obtener beneficios urbanos por encima de los derechos de desarrollo base, por ejemplo el aumento en las alturas y niveles de construcción. Para obtener estos derechos, se requiere un Dictamen de Uso de Suelo y el pago correspondiente según la Ley de Ingresos vigente.</p>
                        `;

                        // Agregar el mensaje al bloque de normas generales
                        document.getElementById('info-norm-general-block').innerHTML += mensajeDDA;

                        // Verificar si el JSON tiene la propiedad 'dda-restr-colonias'
                        if (!data['dda-restr-colonias']) {
                            console.error("El JSON no tiene la propiedad 'dda-restr-colonias'");
                        } else {
                            // Obtener la lista de colonias restringidas
                            const coloniasRestringidas = data['dda-restr-colonias'];

                            // Verificar si hay colonias restringidas
                            if (coloniasRestringidas.length > 0) {
                                // Crear un texto separado por comas con las colonias restringidas
                                const textoColonias = coloniasRestringidas.map(colonia => colonia.Colonias).join(', ');

                                // Mostrar el mensaje adicional con el texto de colonias
                                const mensajeColonias = `
                                    <p>Los Derechos de Desarrollo Adicionales <strong>no aplican</strong> en las colonias: <strong>${textoColonias}</strong>.</p>
                                `;

                                // Agregar el mensaje al bloque de normas generales
                                document.getElementById('info-norm-general-block').innerHTML += mensajeColonias;
                            } else {
                                console.log("No hay colonias restringidas en el JSON.");
                            }
                        }
                    } else {
                        // No se encontró coincidencia
                        document.getElementById('info-norm-general-block').innerHTML = '<p>Predio no compatible con la norma "Derechos de Desarrollo Adicionales"</p>';
                    }
                }


                // Extraer la información basada en el uso del suelo del predio
                const usoSuelo = atributosZonificacion['Clave de uso general'];
                console.log("Clave de uso general:", usoSuelo); // Debug: Verificar la clave de uso general
            
                // Inicializar un arreglo para almacenar las compatibilidades
                const compatibilidades = [];
            
                // Verificar si el JSON tiene la propiedad 'compatibilidades'
                if (!data.compatibilidades) {
                    console.error("El JSON no tiene la propiedad 'compatibilidades'");
                } else {
                    // Recorrer todas las categorías y subcategorías en el JSON
                    for (const categoria in data.compatibilidades) {
                        for (const subcategoria in data.compatibilidades[categoria]) {
                            // Verificar si el uso del suelo (usoSuelo) es compatible (tiene true)
                            const esCompatible = data.compatibilidades[categoria][subcategoria][usoSuelo];
                            console.log("Compatibilidad para", usoSuelo, "en", categoria, "-", subcategoria, ":", esCompatible); // Debug: Verificar compatibilidad
            
                            if (esCompatible === true) {
                                compatibilidades.push({
                                    'Categoría': categoria,
                                    'Subcategoría': subcategoria
                                });
                            }
                        }
                    }
                }
            
                // Almacenar en una variable global
                atributosCompatibilidades = {
                    'Clave de uso general': usoSuelo,
                    'Compatibilidades': compatibilidades
                };
            
                console.log("Compatibilidades almacenadas:", atributosCompatibilidades); // Debug: Verificar compatibilidades encontradas
            
                // **ACTUALIZACIÓN AUTOMÁTICA DEL BLOQUE DE COMPATIBILIDADES**
                if (atributosCompatibilidades && atributosCompatibilidades.Compatibilidades.length > 0) {
                    let compatibilidadInfo = '<h2>Usos Compatibles</h2>';
            
                    // Agrupar las subcategorías por categoría
                    const categorias = {};
                    atributosCompatibilidades.Compatibilidades.forEach(item => {
                        if (!categorias[item.Categoría]) {
                            categorias[item.Categoría] = [];
                        }
                        categorias[item.Categoría].push(item.Subcategoría);
                    });
            
                    // Generar el HTML para cada categoría y sus subcategorías
                    for (const [categoria, subcategorias] of Object.entries(categorias)) {
                        compatibilidadInfo += `
                            <div class="categoria">
                                <div class="categoria-header">
                                    <span class="categoria-texto">${categoria}</span>
                                    <span class="toggle-arrow">▼</span>
                                </div>
                                <ul class="subcategoria-list" style="display: none;">
                                    ${subcategorias.map(sub => `<li>${sub}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }
            
                    // Insertar el HTML en el bloque de compatibilidades
                    document.getElementById('info-compatible-block').innerHTML = compatibilidadInfo;
            
                    // Agregar eventos para mostrar/ocultar subcategorías
                    document.querySelectorAll('.categoria-header').forEach(header => {
                        header.addEventListener('click', () => {
                            const subcategoriaList = header.nextElementSibling;
                            const toggleArrow = header.querySelector('.toggle-arrow');
                            if (subcategoriaList.style.display === 'none' || subcategoriaList.style.display === '') {
                                subcategoriaList.style.display = 'block'; // Mostrar subcategorías
                                toggleArrow.textContent = '▲'; // Cambiar el ícono a una flecha hacia arriba
                            } else {
                                subcategoriaList.style.display = 'none'; // Ocultar subcategorías
                                toggleArrow.textContent = '▼'; // Cambiar el ícono a una flecha hacia abajo
                            }
                        });
                    });
                } else {
                    document.getElementById('info-compatible-block').innerHTML = '<p>No se encontraron usos compatibles para este predio.</p>';
                }
            
            } catch (error) {
                console.error("Error al obtener compatibilidades:", error);
            }
            


            ////////////////////////////////////////////////////
            ////// ACTUALIZACION DINAMICA DE ZONIFICACION //////
            ////////////////////////////////////////////////////
            if (atributosZonificacion && Object.keys(atributosZonificacion).length > 0) {
                let zonificacionInfo = '<h2>Información de Zonificación</h2>';
                for (const [clave, valor] of Object.entries(atributosZonificacion)) {
                    zonificacionInfo += `<p><strong>${clave}:</strong> ${valor}</p>`;
                }
                document.getElementById('info-zoning-block').innerHTML = zonificacionInfo;
            } else {
                document.getElementById('info-zoning-block').innerHTML = '<p>No se encontró información de zonificación para este predio.</p>';
            }

            ////////////////////////////////////////////////////
            ////// FUNCION PARA GENERAR EL RESUMEN PDF //////
            ////////////////////////////////////////////////////
            // script.js
            document.getElementById('point-info-option-a').addEventListener('click', () => {
                if (!atributosZonificacion || !atributosCompatibilidades || !selectedCoordinates) {
                    alert("No hay información disponible para generar el PDF.");
                    return;
                }
            
                // Llamar a la función global generarPDF
                generarPDF(atributosZonificacion, atributosCompatibilidades, selectedCoordinates);
            });
        }
    });

    ////////////////////////////////////////////
    ///// CONTROLAMOS MENU DE ZONIFICACION /////
    ////////////////////////////////////////////

    // Restablecer la selección al hacer clic en otra parte del mapa
    map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['catastro-fill-layer'] });
        if (features.length === 0) {
            selectedFeatureId = null;
            map.setFilter('catastro-extrusion', ['==', 'ID', '']); // Ocultar la extrusión
            map.setFilter('catastro-highlight', ['==', 'ID', '']); // Ocultar el borde
        }
    });
});


// Agregar evento al botón 'predio-option-d'
document.getElementById('predio-option-d').addEventListener('click', async () => {
    try {
        // Mostrar el bloque antes de cargar el contenido
        handleButtonClick('info-norm-especifica-block');

        // Limpiar el bloque de información
        document.getElementById('info-norm-especifica-block').innerHTML = '';

        // Realizar la solicitud fetch para obtener el JSON
        const response = await fetch('datos/PMDUQ-normatividad.json'); // Reemplaza con la ruta real
        const data = await response.json();

        // Verificar si el JSON tiene la propiedad 'norm-especificas'
        if (!data['norm-especificas']) {
            console.error("El JSON no tiene la propiedad 'norm-especificas'");
            return;
        }

        // Obtener las normas específicas
        const normasEspecificas = data['norm-especificas'];

        // Crear el HTML para mostrar las normas específicas
        let normasHTML = '<h2>Normas Específicas</h2>';

        normasEspecificas.forEach(norma => {
            normasHTML += `
                <div class="norma">
                    <div class="norma-header">
                        <span class="norma-titulo">${norma.Título}</span>
                        <span class="toggle-arrow">▼</span>
                    </div>
                    <div class="norma-descripcion" style="display: none;">
                        <p>${norma.Descripción}</p>
                    </div>
                </div>
            `;
        });

        // Insertar el HTML en el bloque de normas específicas
        document.getElementById('info-norm-especifica-block').innerHTML = normasHTML;

        // Agregar eventos para mostrar/ocultar la descripción al hacer clic en el título
        document.querySelectorAll('.norma-header').forEach(header => {
            header.addEventListener('click', () => {
                const descripcion = header.nextElementSibling;
                const toggleArrow = header.querySelector('.toggle-arrow');
                if (descripcion.style.display === 'none' || descripcion.style.display === '') {
                    descripcion.style.display = 'block'; // Mostrar descripción
                    toggleArrow.textContent = '▲'; // Cambiar el ícono a una flecha hacia arriba
                } else {
                    descripcion.style.display = 'none'; // Ocultar descripción
                    toggleArrow.textContent = '▼'; // Cambiar el ícono a una flecha hacia abajo
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar las normas específicas:", error);
    }
});

////////////////////////////////////////////
// Función para manejar el clic de los botones
////////////////////////////////////////////
function handleButtonClick(blockId) {
    // Cerrar cualquier otro bloque activo
    const infoBlocks = document.querySelectorAll('.info-block');
    infoBlocks.forEach(block => {
        block.style.display = 'none';  // Ocultar todos los bloques
    });

    // Mostrar el bloque de información correspondiente
    const targetBlock = document.getElementById(blockId);
    if (targetBlock) {
        targetBlock.style.display = 'block'; // Mostrar el bloque específico
    }
}

// Asignar la función a los botones
document.getElementById('predio-option-a').addEventListener('click', () => {
    handleButtonClick('info-zoning-block'); // Bloque para predio-option-a
});

document.getElementById('predio-option-b').addEventListener('click', () => {
    handleButtonClick('info-compatible-block'); // Bloque para predio-option-b (cambia el ID según corresponda)
});

document.getElementById('predio-option-c').addEventListener('click', () => {
    handleButtonClick('info-norm-general-block'); // Bloque para predio-option-c (Normas Generales)
});

document.getElementById('predio-option-d').addEventListener('click', () => {
    handleButtonClick('info-norm-especifica-block'); // Bloque para predio-option-d (Normas Específicas)
});

////////////////////////////////////////////
////////////////////////////////////////////
// Evento para mostrar el bloque de "¿Cómo usar?" cuando se haga clic en el botón correspondiente
document.getElementById('tab-how-to').addEventListener('click', () => {
    // Ocultar cualquier otro bloque activo (por ejemplo, la información de zonificación)
    document.getElementById('info-zoning-block').style.display = 'none';
    document.getElementById('info-catastral-block').style.display = 'none'; 

    // Mostrar el bloque "¿Cómo usar?"
    const resumenBlock = document.getElementById('resumen');
    if (resumenBlock.style.display === 'none' || resumenBlock.style.display === '') {
        resumenBlock.style.display = 'block'; // Mostrar el bloque
    } else {
        resumenBlock.style.display = 'none'; // Ocultar el bloque si ya está visible
    }
});

////////////////////////////////////////////
// FUNCION PARA ESCONDER/DESPLEGAR RESUMEN //
////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const resumen = document.getElementById("resumen");
    const resumenH2 = resumen.querySelector("h2");
    const resumenTexto = resumen.querySelector("p");
    const infoCatastralBlock = document.getElementById("info-catastral-block");
    const toggleArrow = document.getElementById("toggle-arrow");

    function checkInfoBlock() {
        if (infoCatastralBlock.innerHTML.trim() !== "") {
            resumenTexto.style.display = "none";
            toggleArrow.style.transform = "rotate(-90deg)"; // Flecha a la izquierda
        } else {
            resumenTexto.style.display = "block";
            toggleArrow.style.transform = "rotate(-90deg)"; // Flecha abajo
        }
    }

    checkInfoBlock();

    resumenH2.addEventListener("click", function () {
        if (resumenTexto.style.display === "none") {
            resumenTexto.style.display = "block";
            toggleArrow.style.transform = "rotate(0deg)"; // Flecha abajo
        } else {
            resumenTexto.style.display = "none";
            toggleArrow.style.transform = "rotate(-90deg)"; // Flecha a la izquierda
        }
    });

    const observer = new MutationObserver(checkInfoBlock);
    observer.observe(infoCatastralBlock, { childList: true, subtree: true });
});

// FUNCION PARA ENCENDER/APAGAR LAS CAPAS //
////////////////////////////////////////////

// Identificar el botón y añadir el evento de clic
document.getElementById('layer-control').addEventListener('click', function () {
    // Verificar la visibilidad actual de la capa
    const visibility = map.getLayoutProperty('zoning-fill-layer', 'visibility');
    if (visibility === 'none') {
        // Hacer visible la capa si está oculta
        map.setLayoutProperty('zoning-fill-layer', 'visibility', 'visible');
    } else {
        // Ocultar la capa si está visible
        map.setLayoutProperty('zoning-fill-layer', 'visibility', 'none');
    }
});

////////////////////////////////////////////
////// FUNCION PARA CAMBIAR MAPA BASE //////
////////////////////////////////////////////
const mapStyles = [
    'mapbox://styles/mapbox/standard', // Estilo inicial
    'mapbox://styles/mapbox/dark-v11', // Estilo oscuro
    'mapbox://styles/mapbox/satellite-v9' // Estilo satélite
];

let currentStyleIndex = 0; // Índice para el estilo actual

document.getElementById('base-map-toggle').addEventListener('click', () => {
    currentStyleIndex = (currentStyleIndex + 1) % mapStyles.length; // Alterna entre estilos
    map.setStyle(mapStyles[currentStyleIndex]); // Cambia el estilo del mapa

    // Escuchar el evento 'styledata' para volver a agregar las capas personalizadas
    map.once('styledata', () => {
        addCustomLayers();
    });
});

//////////////////////////////////////
/////// FUNCION PARA LOS TABS ////////
//////////////////////////////////////

// Variable para rastrear el botón y la pestaña activa
let activeButton = null;
let activeTab = null; 

function showTab(tabId) {
    // Ocultar todas las pestañas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    // Mostrar la pestaña seleccionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        // Verifica si la pestaña seleccionada ya estaba activa
        if (activeTab === tabId) {
            // Si está activa, oculta la pestaña y reinicia activeTab
            selectedTab.style.display = 'none';
            activeTab = null;
        } else {
            // Si no está activa, muestra la pestaña y actualiza activeTab
            infoContainer.style.display = 'block'; // Asegurar que el contenedor principal esté visible
            selectedTab.style.display = 'block';
            activeTab = tabId;
        }
    }
}

var buttons = document.querySelectorAll('.tab-button');
buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        // Eliminar la clase 'active' de todos los botones
        buttons.forEach(btn => btn.classList.remove('active'));
        // Agregar la clase 'active' al botón clicado
        this.classList.add('active');
    });
});

//////////////////////////////////////
///// FUNCION PARA LOS SUBMENUS //////
//////////////////////////////////////

var menuToggle = document.getElementById('menu-toggle');

// Inicializa el estado de visibilidad
resumen.style.display = 'block'; 
// Función para desplegar/ocultar los botones
menuToggle.addEventListener('click', function () {
    var buttons = document.querySelectorAll('.side-tabs .tab-button:not(#menu-toggle)');
    buttons.forEach(function (button) {
        button.style.display = button.style.display === 'none' || button.style.display === '' ? 'block' : 'none'; // Alternar visibilidad
    });
});



//////////////////////////////////////////////////
/////// RESPUESTA AL CLICK DE LOS TABS ///////////
document.querySelector('#tab-how-to').addEventListener('click', () => {
    toggleSubmenu('#tab-how-to');
});
document.querySelector('#tab-predio').addEventListener('click', () => {
    toggleSubmenu('#tab-predio');
});
document.querySelector('#tab-point-info').addEventListener('click', () => {
    toggleSubmenu('#tab-point-info');
});
document.querySelector('#tab-share').addEventListener('click', () => {
    toggleSubmenu('#tab-share');
});
document.querySelector('#tab-download').addEventListener('click', () => {
    toggleSubmenu('#tab-download');
});

// Mantenemos la funcionalidad de toggleSubmenu para los clicks en los tabs
function toggleSubmenu(tabId) {
    const tabContainer = document.querySelector(`${tabId}`).closest('.tab-button-container');
    const submenu = tabContainer.querySelector('.submenu');
    // Alternar visibilidad del submenu
    if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
        submenu.style.opacity = '1'; // Aseguramos que el submenú sea visible con opacidad
    } else {
        submenu.style.display = 'none';
        submenu.style.opacity = '0'; // Ocultamos el submenú con opacidad 0
    }
    // Ocultar otros submenus
    document.querySelectorAll('.submenu').forEach((menu) => {
        if (menu !== submenu) {
            menu.style.display = 'none';
            menu.style.opacity = '0'; // Ocultamos con opacidad para la transición
        }
    });
}

/////////////////////////////////////////////////////////////////////
/////////// FUNCIONES PARA CREAR LA ESCALA GRAFICA ////////////
/////////////////////////////////////////////////////////////////////
// Función para actualizar la escala gráfica
function updateScale() {
    // Obtener las dimensiones del contenedor de la escala
    const scaleContainer = document.getElementById('scale');
    const scaleLine = document.getElementById('scale-line');
    const scaleLabel = document.getElementById('scale-label');

    // Definir la longitud deseada de la escala en píxeles (por ejemplo, 100px)
    const scaleLengthPx = 100;

    // Calcular la distancia en metros que corresponde a la longitud en píxeles
    const center = map.getCenter(); // Centro del mapa
    const bounds = map.getBounds(); // Límites del mapa
    const left = bounds.getWest(); // Longitud del borde izquierdo
    const right = bounds.getEast(); // Longitud del borde derecho

    // Calcular la distancia horizontal en metros
    const distance = turf.distance(
        [left, center.lat], // Punto izquierdo
        [right, center.lat], // Punto derecho
        { units: 'meters' } // Unidad de medida
    );

    // Calcular la resolución del mapa (metros por píxel)
    const mapWidthPx = map.getCanvas().width; // Ancho del mapa en píxeles
    const resolution = distance / mapWidthPx; // Metros por píxel

    // Calcular la distancia correspondiente a la escala en píxeles
    const scaleDistance = resolution * scaleLengthPx;

    // Redondear la distancia a un valor "amigable" (por ejemplo, 100, 500, 1000)
    const roundedDistance = Math.round(scaleDistance / 50) * 50;

    // Actualizar la línea y la etiqueta de la escala
    scaleLine.style.width = `${(roundedDistance / resolution)}px`;
    scaleLabel.textContent = `${roundedDistance} metros`;
}

// Actualizar la escala cuando el mapa se mueva o cambie el zoom
map.on('move', updateScale);
map.on('zoom', updateScale);

// Llamar a la función inicialmente para mostrar la escala
updateScale();


///////////////////////////////////////////////////////
// FUNCION PARA HERRAMIENTA DE MEDICION //
///////////////////////////////////////////////////////
// Agregar el Geocoder de Mapbox
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Usa el mismo token de acceso que el mapa
    mapboxgl: mapboxgl, // Referencia a la librería de Mapbox GL JS
    marker: true, // No mostrar un marcador en la ubicación encontrada
    placeholder: 'Buscar un lugar', // Texto de placeholder en el buscador
    bbox: [-100.66596, 20.37553, -100.13981, 20.86796], // Límites geográficos para la búsqueda (opcional)
    proximity: {
        longitude: -100.39279,
        latitude: 20.59246
    } // Priorizar resultados cerca del centro del mapa
});

// Agregar el Geocoder al mapa
map.addControl(geocoder);

///////////////////////////////////////////////////////
// FUNCION PARA COMPARTIR A TRAVES DE REDES SOCIALES //
///////////////////////////////////////////////////////

// URL a compartir (puedes personalizarla según la página que desees compartir)
const shareUrl = encodeURIComponent("https://francisco-solsona.github.io/GeoPLADESU/");
const shareText = encodeURIComponent("¡Mira este increíble contenido!");

// Compartir en LinkedIn
function shareToLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    window.open(linkedInUrl, "_blank");
}

// Compartir en Facebook
function shareToFacebook() {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
    window.open(facebookUrl, "_blank");
}


