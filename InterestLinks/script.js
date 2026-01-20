// script.js

// 1. VERIFICACIÓN DE SEGURIDAD Y CARGA
// Si esto falla, revisa el orden en index.html
if (typeof supabase === 'undefined') {
    console.error("CRÍTICO: La librería de Supabase no ha cargado. Revisa el CDN en index.html");
}

if (typeof CONFIG === 'undefined') {
    console.error("CRÍTICO: El archivo config.js no se ha generado o cargado.");
    alert("Error de configuración: Faltan las claves de acceso.");
}

// 2. INICIALIZACIÓN DE SUPABASE
// Usamos el objeto CONFIG que viene de config.js (local o Netlify)
const { createClient } = supabase;
const _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// 3. VARIABLES GLOBALES
let globalLinks = [];
let currentFilter = 'Todos';
let searchText = '';

// 4. GESTIÓN DE TEMAS
const themes = ['dark', 'light', 'afternoon'];
const themeIcons = { 'dark': '🌙', 'light': '☀️', 'afternoon': '🌅' };

let currentTheme = localStorage.getItem('classhub_theme') || 'dark';
// Aplicamos el tema inicial con seguridad
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
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
    
    if (themeName === 'dark') body.removeAttribute('data-theme');
    else body.setAttribute('data-theme', themeName);
    
    if(btn) btn.innerText = themeIcons[themeName];
    localStorage.setItem('classhub_theme', themeName);
}

// 5. CARGAR DATOS
async function fetchLinks() {
    const loadingElement = document.getElementById('loading');
    
    // Verificamos conexión antes de llamar
    if (!_supabase) return;

    const { data, error } = await _supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error Supabase:", error);
        loadingElement.innerText = "Error cargando datos. Revisa la consola.";
        return;
    }

    loadingElement.style.display = 'none';
    globalLinks = data || []; // Aseguramos que sea array
    renderList();
}

// 6. RENDERIZAR LISTA
function renderList() {
    const listElement = document.getElementById('link-list');
    listElement.innerHTML = '';

    const filteredLinks = globalLinks.filter(link => {
        const matchCategory = (currentFilter === 'Todos') || (link.category === currentFilter);
        const matchSearch = link.title.toLowerCase().includes(searchText.toLowerCase());
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
            <div style="display:flex; align-items:center;">
                    <span class="tag ${tagClass}" style="margin-right:10px;">${link.category}</span>
                    <button class="action-btn copy-btn" onclick="copyToClipboard('${link.url}')" title="Copiar enlace">📋</button>
                    <button class="action-btn delete-btn" onclick="deleteLink(${link.id})" title="Borrar">🗑️</button>
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
        currentFilter = 'Todos'; 
        filterBy('Todos');
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
    // ... simplificado para brevedad, funciona igual que el tuyo
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
    return "Hace un momento";
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("¡Enlace copiado al portapapeles! 📋");
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// Arrancar
fetchLinks();