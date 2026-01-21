// script.js

// 2. INICIALIZACIÓN DE SUPABASE
const { createClient } = supabase;
let _supabase = null;
const ENVS = {};

// 1. VERIFICACIÓN DE SEGURIDAD Y CARGA
if (typeof supabase === 'undefined') {
    console.error("CRÍTICO: La librería de Supabase no ha cargado. Revisa el CDN en index.html");
}

if (typeof ENVS === 'undefined') {
    console.error("CRÍTICO: El archivo env no se ha generado o cargado.");
    alert("Error de configuración: Faltan las claves de acceso.");
}

// 3. VARIABLES GLOBALES
let globalLinks = [];
let currentFilter = 'Todos';
let searchText = '';

// 4. GESTIÓN DE TEMAS
const themes = ['dark', 'light', 'afternoon'];
const themeIcons = { 'dark': 'moon', 'light': 'sun', 'afternoon': 'sun-moon' };

let currentTheme = localStorage.getItem('classhub_theme') || 'dark';

// Aplicamos el tema inicial y configuración
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(currentTheme);
    document.getElementById('fecha').textContent = new Date().getFullYear();
    
    // Cargar variables de entorno simuladas (env)
    const envs = await fetch('env', {
        method: 'GET'
    }).then(response => response.text());

    let item, key, value;
    for (const env of envs.split('\n')) {
        item = env.replace('\r', '').split('=');
        if (item[0]) { // Verificación simple para evitar líneas vacías
            key = item[0];
            value = item[1];
            ENVS[key] = value;
        }
    }
    
    // Inicializar cliente Supabase
    _supabase = createClient(ENVS.SUPABASE_URL, ENVS.SUPABASE_KEY);
    
    // 1. Carga inicial
    await fetchLinks();

    // 2. IMPLEMENTACIÓN DE ACTUALIZACIÓN AUTOMÁTICA
    // Se ejecuta cada 5000 milisegundos (5 segundos)
    setInterval(() => {
        // Llamamos a fetchLinks en "segundo plano"
        // Nota: Mantenemos los filtros actuales del usuario al recargar
        fetchLinks(true); 
    }, 5000);
});

function toggleTheme() {
    let currentIndex = themes.indexOf(currentTheme);
    let nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    applyTheme(currentTheme);
}

function applyTheme(themeName) {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    
    if (themeName === 'dark') {
        body.removeAttribute('data-theme');
        body.classList.add('dark');
    } else {
        body.setAttribute('data-theme', themeName);
        body.classList.remove('dark');
    }
    
    if(btn) btn.innerHTML = `<img src="svg/${themeIcons[themeName]}.svg" alt="${themeName}">`;
    localStorage.setItem('classhub_theme', themeName);
}

// 5. CARGAR DATOS
// Añadí el parámetro isBackground para saber si es una recarga automática
async function fetchLinks(isBackground = false) {
    const loadingElement = document.getElementById('loading');
    
    // Verificamos conexión antes de llamar
    if (!_supabase) return;

    // Solo mostramos "Cargando..." si NO es una actualización automática de fondo
    // para evitar parpadeos molestos al usuario cada 5 segundos.
    if (!isBackground && loadingElement) {
        loadingElement.style.display = 'block'; 
    }

    const { data, error } = await _supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error Supabase:", error);
        if (!isBackground) loadingElement.innerText = "Error cargando datos. Revisa la consola.";
        return;
    }

    if (loadingElement) loadingElement.style.display = 'none';
    
    // Actualizamos la lista global
    globalLinks = data || []; 
    
    // Renderizamos de nuevo para reflejar cambios (respetando filtros activos)
    renderList();
}

// 6. RENDERIZAR LISTA
function renderList() {
    const listElement = document.getElementById('link-list');
    
    // Guardamos la posición del scroll si quisieras mantenerla estrictamente, 
    // aunque al reemplazar innerHTML suele saltar un poco. 
    // Para esta implementación simple, reemplazamos todo.
    listElement.innerHTML = '';

    const filteredLinks = globalLinks.filter(link => {
        const matchCategory = (currentFilter === 'Todos') || (link.category === currentFilter);
        // Comprobación de seguridad por si link.title es nulo
        const title = link.title ? link.title.toLowerCase() : '';
        const matchSearch = title.includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (filteredLinks.length === 0) {
        listElement.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No se encontraron recursos.</p>';
        return;
    }

    filteredLinks.forEach((link, index) => {
        const li = document.createElement('li');
        li.className = 'link-item';
        
        let tagClass = 'tag-otros';
        if(link.category) tagClass = `tag-${link.category.toLowerCase()}`;
        
        let domain = '';
        try { domain = new URL(link.url).hostname; } catch(e){}
        const timeAgo = getTimeAgo(link.created_at);

        li.innerHTML = `
            <div class="link-content">
                <span style="color:var(--text-muted)">#${index + 1}</span>
                <div class="link-info">
                    <div>
                        <a href="${link.url}" target="_blank" class="link-title">${link.title}</a>
                        <span class="link-meta">(${domain})</span>
                    </div>
                    <small style="color:var(--text-muted); font-size:0.75em; margin-top:4px;">🕒 ${timeAgo}</small>
                </div>
            </div>
            <div class="link-content-buttons" style="display:flex; align-items:center;">
                    <span class="tag ${tagClass}">${link.category}</span>
                    <button class="action-btn copy-btn" onclick="copyToClipboard('${link.url}')" title="Copiar enlace"><img src="svg/clipboard.svg" alt="Copiar enlace"></button>
                    <button class="action-btn delete-btn" onclick="deleteLink(${link.id})" title="Borrar"><img src="svg/trash.svg" alt="Borrar"></button>
            </div>
        `;
        listElement.appendChild(li);
    });
}

// 7. FUNCIONES DE FILTRO
function filterBy(category) {
    currentFilter = category;
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText === category) btn.classList.add('active');
    });
    renderList();
}

function filterSearch() {
    const input = document.getElementById('searchInput');
    searchText = input.value;
    renderList();
}

// 8. AÑADIR LINK
async function addLink() {
    const title = document.getElementById('titleInput').value;
    const url = document.getElementById('urlInput').value;
    const category = document.getElementById('categoryInput').value;
    const btn = document.getElementById('publishBtn');

    if (!title || !url) return alert("Rellena todos los campos");

    btn.innerText = "Guardando...";
    btn.disabled = true;

    const { error } = await _supabase
        .from('links')
        .insert([{ title, url, category }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        document.getElementById('titleInput').value = '';
        document.getElementById('urlInput').value = '';
        // Opcional: Si quieres que al publicar vuelva a "Todos", descomenta la línea siguiente
        // currentFilter = 'Todos'; filterBy('Todos');
        
        // Forzamos actualización inmediata
        fetchLinks();
    }

    btn.innerText = "[ + PUBLICAR ]";
    btn.disabled = false;
}

// 9. BORRAR LINK
async function deleteLink(idToDelete) {
    const password = prompt("🔒 Zona Admin: Contraseña para borrar:");
    if (password !== "admin123") return alert("Contraseña incorrecta.");

    if(!confirm("¿Seguro que quieres borrarlo?")) return;

    const { error } = await _supabase.from('links').delete().eq('id', idToDelete);
    
    if (error) alert("Error al borrar: " + error.message);
    else fetchLinks();
}

// 10. UTILIDADES
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return "Hace " + Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return "Hace " + Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return "Hace " + Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return "Hace " + Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return "Hace " + Math.floor(interval) + " min";
    
    if(seconds < 10) return "Justo ahora";
    
    return "Hace un momento";
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Podríamos usar un toast en lugar de alert para no interrumpir
        alert("¡Enlace copiado al portapapeles! 📋");
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}