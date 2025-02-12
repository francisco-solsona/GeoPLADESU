mapboxgl.accessToken = 'pk.eyJ1IjoicGFjby1zb2xzb25hIiwiYSI6ImNseXJlcjN6bDA2M2kyaXB5d2NtYWJ3N2UifQ.s0HyJk7NLcV5ToGO-rLOew';
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
                'fill-opacity': 0.7  // Opcional, para controlar la opacidad del relleno
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

    // Cambiar el cursor al interactuar con la capa
    map.on('mouseenter', 'catastro-fill-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'catastro-fill-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    // Agregar una nueva capa de extrusión para resaltar el polígono seleccionado
    map.addLayer({
        'id': 'catastro-extrusion',
        'type': 'fill-extrusion',
        'source': 'catastro',
        'source-layer': globalCatastroLayer,
        'layout': {},
        'paint': {
            'fill-extrusion-color': '#ff0000', // Color de resaltado
            'fill-extrusion-height': [
                'case',
                ['==', ['get', 'ID'], selectedFeatureId], 1000, // Si es el seleccionado, elevarlo
                0 // De lo contrario, mantenerlo plano
            ],
            'fill-extrusion-opacity': 0.8
        },
        'filter': ['==', 'ID', ''] // Inicialmente, no muestra nada
    });

    // Agregar una capa de línea para resaltar el borde del polígono seleccionado
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
        'filter': ['==', 'ID', ''] // Inicialmente no muestra nada
    });

    // Evento de clic en la capa catastro-fill-layer
    map.on('click', 'catastro-fill-layer', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            selectedFeatureId = feature.properties.ID; // Guarda el ID del polígono seleccionado

            // Obtiene la clave catastral
            const claveCatastral = feature.properties.DGR_CVECAT;
            // Obtiene la superficie del predio
            const superficiePredio = parseFloat(feature.properties.Superficie).toFixed(1) + " m²";

            // Muestra la clave catastral en el HTML
            document.getElementById('info-catastral').innerHTML = `La superficie del predio es de <strong>~${superficiePredio}</strong> y su Clave Catastral es <strong>${claveCatastral}</strong>. Puedes consultar más información sobre el predio haciendo <a href="${enlaceCatastro}" target="_blank"><strong><span class="underline">click aquí</span></strong></a>.`;

            // Actualiza la capa de extrusión y borde para resaltar el polígono clickeado
            map.setFilter('catastro-extrusion', ['==', 'ID', selectedFeatureId]);
            map.setFilter('catastro-highlight', ['==', 'ID', selectedFeatureId]);

            // Consultar la capa de zonificación para obtener los atributos del polígono de zonificación
            const zonificacionFeatures = map.queryRenderedFeatures(e.point, { layers: ['zoning-fill-layer'] });
            
            if (zonificacionFeatures.length > 0) {
                const zonificacionFeature = zonificacionFeatures[0]; // Primer polígono de zonificación en la intersección
                
                // Aquí puedes acceder a los atributos de la capa de zonificación
                const delegacion = zonificacionFeature.properties.DELEGACION; // Cambia esto según los atributos de tu capa de zonificación
                
                const documento = zonificacionFeature.properties.Documento; // Cambia esto según los atributos de tu capa de zonificación
                const enlaceDocumento = enlacesDocumentos[documento] || "#"; // Si no hay enlace, mantiene el link vacío

                // Muestra los atributos de la zona en el HTML (puedes agregar más atributos si lo deseas)
                document.getElementById('informacion-zonificacion').innerHTML = 
                `Delegación: <strong>${delegacion}</strong> <br>
                Documento: <a href="${enlaceDocumento}" target="_blank"><strong>${documento}</strong></a>`;
            }
        }
    });

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

////////////////////////////////////////////
// FUNCION PARA ENCENDER/APAGAR LAS CAPAS //
////////////////////////////////////////////

// Identificar el botón y añadir el evento de clic
document.getElementById('layer-control').addEventListener('click', function () {
    // Verificar la visibilidad actual de la capa
    const visibility = map.getLayoutProperty('point-layer', 'visibility');
    if (visibility === 'none') {
        // Hacer visible la capa si está oculta
        map.setLayoutProperty('point-layer', 'visibility', 'visible');
    } else {
        // Ocultar la capa si está visible
        map.setLayoutProperty('point-layer', 'visibility', 'none');
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

// Función para manejar el clic en los `submenu-item` específicos
var submenuItems = document.querySelectorAll('.submenu-item');
submenuItems.forEach(function (item) {
    item.addEventListener('click', function () {
        // Obtener el texto del botón clicado
        var selectedTitle = this.textContent;
        // Mostrar el info-container
        infoContainer.style.display = 'block';
        // Asignar el texto al infoContainer
        infoContainer.innerHTML = `<h3>${selectedTitle}</h3>`;
    });
});

// AQUI CONTROLAMOS LA RESPUESTA AL CLICK DE CADA UNO DE LOS TABS
document.querySelector('#tab-how-to').addEventListener('click', () => {
    toggleSubmenu('#tab-how-to');
});
document.querySelector('#tab-description').addEventListener('click', () => {
    toggleSubmenu('#tab-description');
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

// FUNCION PARA MOSTRAR/OCULTAR SUBMENUS
function toggleSubmenu(tabId) {
    const tabContainer = document.querySelector(`${tabId}`).closest('.tab-button-container');
    const submenu = tabContainer.querySelector('.submenu');
    // Alternar visibilidad del submenu
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    // Ocultar otros submenus
    document.querySelectorAll('.submenu').forEach((menu) => {
        if (menu !== submenu) {
            menu.style.display = 'none';
        }
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// FUNCIONES PARA TODOS LOS BOTONES DEL SUBMENÚ ////////////////////////////

///////////////////////////////////////////////////////
// FUNCION PARA COMPARTIR A TRAVES DE REDES SOCIALES //
///////////////////////////////////////////////////////

// URL a compartir (puedes personalizarla según la página que desees compartir)
const shareUrl = encodeURIComponent("https://www.tupagina.com");
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


