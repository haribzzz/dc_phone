// ---------- script.js (SISTEMA DC PHONE - CORREGIDO) ----------

// Configuración
const API_BASE = window.location.origin;
console.log('🌐 Conectando a:', API_BASE);

// Estado global
let products = [];
let isAdminAuthenticated = false;

// Elementos DOM
const grid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-button');
const categoryToggle = document.getElementById('category-toggle');
const categoryPanel = document.getElementById('category-panel');

// Modal elements
const modal = document.getElementById('product-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalAvailability = document.getElementById('modal-availability');
const modalDescription = document.getElementById('modal-description');
const modalStock = document.getElementById('modal-stock');
const modalClose = document.getElementById('modal-close');

// Sidebar
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const catalogBtn = document.getElementById('catalogBtn');
const promotionsBtn = document.getElementById('promotionsBtn');
const adminBtn = document.getElementById('adminBtn');

// ----------------- INICIALIZACIÓN -----------------
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando DC Phone...');
    
    try {
        await fetchProducts();
        populateCategoryPanel();
        setupEventListeners();
        checkAdminAuth();
        
        console.log('✅ Aplicación lista');
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        showError('Error al cargar la aplicación');
    }
});

// ----------------- GESTIÓN DE PRODUCTOS -----------------
async function fetchProducts() {
    try {
        showLoading('Cargando productos...');
        
        const res = await fetch(`${API_BASE}/productos`);
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: No se pudieron cargar los productos`);
        }
        
        const data = await res.json();
        console.log('✅ Productos recibidos:', data.length);

        products = data.map(row => {
            let imageUrl;
            if (row.imagen) {
                if (row.imagen.startsWith('http')) {
                    imageUrl = row.imagen;
                } else if (row.imagen.includes('/')) {
                    imageUrl = `${API_BASE}${row.imagen.startsWith('/') ? '' : '/'}${row.imagen}`;
                } else {
                    imageUrl = `${API_BASE}/images/${row.imagen}`;
                }
            } else {
                imageUrl = 'https://via.placeholder.com/300x300/cccccc/969696?text=Imagen+No+Disponible';
            }

            return {
                id: String(row.id_producto),
                name: row.nombre || 'Sin nombre',
                brand: row.marca || 'Sin marca',
                category: row.categoria || 'General',
                price: row.precio ? `$${parseFloat(row.precio).toLocaleString()}` : 'Consultar',
                image: imageUrl,
                description: row.descripcion || 'Descripción no disponible',
                stock: Number(row.stock) || 0,
                available: Boolean(row.esta_activo),
                rawData: row
            };
        });

        renderProducts(products);
        
    } catch (err) {
        console.error('❌ Error cargando productos:', err);
        showError(err.message);
    }
}

function renderProducts(productsToRender) {
    if (!grid) return;

    grid.innerHTML = '';

    if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div style="width: 100%; height: 200px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 10px;">
                <img src="${product.image}" alt="${product.name}" 
                     style="width: auto; height: auto; max-width: 100%; max-height: 100%; object-fit: contain;"
                     onerror="this.src='https://via.placeholder.com/300x300/cccccc/969696?text=Imagen+No+Disponible'">
            </div>
            <div style="padding: 15px 10px; text-align: center; width: 100%;">
                <div style="font-weight: 600; font-size: 14px; line-height: 1.3; min-height: 48px; display: flex; align-items: center; justify-content: center;">
                    ${product.name}
                </div>
                <div style="font-size: 12px; color: #666; margin: 8px 0;">
                    ${product.description}
                </div>
                <div style="font-size: 16px; font-weight: 700; color: #2c5530; margin: 8px 0;">
                    ${product.price}
                </div>
                <div style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; 
                     ${product.available ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">
                    ${product.available ? '✅ Disponible' : '❌ Agotado'}
                </div>
            </div>
        `;

        card.addEventListener('click', () => openProductModal(product));
        grid.appendChild(card);
    });

    console.log(`✅ Renderizados ${productsToRender.length} productos`);
}

// ----------------- GESTIÓN DE CATEGORÍAS -----------------
function populateCategoryPanel() {
    if (!categoryPanel) return;

    const categories = {
        'Celulares': ['Samsung', 'Xiaomi', 'Apple'],
        'Tablets': ['Samsung', 'Apple'],
        'Accesorios': ['Audífonos', 'Cargadores']
    };

    let html = `
        <div style="padding:15px; border-bottom:1px solid #eee; font-weight:700;">
            🏷️ Filtrar por Categoría
        </div>
    `;
    
    for (const [category, brands] of Object.entries(categories)) {
        html += `
            <div style="padding: 10px 15px;">
                <div style="font-weight: 600; margin-bottom: 8px;">${category}</div>
                <div style="margin-left: 10px;">
                    ${brands.map(brand => `
                        <label style="display: block; margin: 4px 0; font-size: 14px;">
                            <input type="checkbox" value="${brand}" style="margin-right: 6px;">
                            ${brand}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `
        <div style="padding:15px;">
            <button onclick="applyFilters()" style="width:100%; padding:12px; background:#667eea; color:white; border:none; border-radius:8px; cursor:pointer;">
                ✅ Aplicar Filtros
            </button>
        </div>
    `;

    categoryPanel.innerHTML = html;
}

function applyFilters() {
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const selectedBrands = new Set();
    
    categoryPanel.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        selectedBrands.add(checkbox.value);
    });
    
    const filtered = products.filter(product => {
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
        
        const matchesBrand = selectedBrands.size === 0 || 
            selectedBrands.has(product.brand);
        
        return matchesSearch && matchesBrand;
    });
    
    renderProducts(filtered);
    categoryPanel.classList.add('hidden');
}

// ----------------- INTERFAZ DE USUARIO -----------------
function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('open');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
}

function showCatalog() {
    document.getElementById('promotionsContainer')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.add('hidden');
    if (grid) grid.style.display = 'grid';
}

function toggleCategoryPanel() { 
    if (categoryPanel) categoryPanel.classList.toggle('hidden'); 
}

function openProductModal(product) {
    if (modalName) modalName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = product.price;
    if (modalDescription) modalDescription.textContent = product.description;
    if (modalAvailability) modalAvailability.textContent = product.available ? 'Disponible' : 'Agotado';
    if (modalStock) modalStock.textContent = `Stock: ${product.stock} unidades`;
    
    if (modalImage) {
        modalImage.src = product.image;
        modalImage.alt = product.name;
    }
    
    if (modal) modal.classList.add('open');
    document.body.classList.add('modal-open');
}

function closeModal(modalId = null) { 
    if (modalId) {
        const specificModal = document.getElementById(modalId);
        if (specificModal) specificModal.classList.remove('open');
    } else {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('open');
        });
    }
    document.body.classList.remove('modal-open');
}

// ----------------- ADMINISTRACIÓN -----------------
function checkAdminAuth() {
    const auth = localStorage.getItem('adminAuthenticated');
    if (auth === 'true') { 
        isAdminAuthenticated = true; 
        updateAdminUI(); 
    }
}

function updateAdminUI() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        if (isAdminAuthenticated) {
            adminBtn.innerHTML = '👑 Admin';
            adminBtn.style.color = '#4CAF50';
        } else {
            adminBtn.innerHTML = '⚙️ Admin';
            adminBtn.style.color = '';
        }
    }
}

async function handleAdminSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('adminUser').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!username || !email || !password) {
        alert('❌ Por favor completa todos los campos');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Verificando...';
    submitBtn.disabled = true;

    try {
        console.log('🔐 Intentando login con:', { username, email });
        
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                nombre_usuario: username,
                email: email,
                password: password 
            })
        });

        console.log('📡 Status:', response.status, response.statusText);

        const contentType = response.headers.get('content-type');
        console.log('📋 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ No es JSON:', text.substring(0, 200));
            
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                throw new Error('Servidor no configurado. La ruta /login no existe en el servidor.');
            }
            throw new Error('Error del servidor: ' + response.status);
        }

        const result = await response.json();
        console.log('📊 Resultado:', result);

        if (result.success) {
            isAdminAuthenticated = true;
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminUser', username);
            updateAdminUI();
            
            alert('✅ ' + result.message);
            e.target.reset();
            
            closeModal('admin-modal');
            showAdminPanel();
        } else {
            throw new Error(result.message || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        
        if (error.message.includes('no configurado')) {
            alert('❌ El sistema de login no está disponible.\n\n' +
                  'Para probar localmente:\n' +
                  '1. Ejecuta: node server.js\n' + 
                  '2. Ve a: http://localhost:3000\n\n' +
                  'Credenciales:\n' +
                  'Usuario: admin\n' +
                  'Email: admin@dcphone.com\n' +
                  'Contraseña: CieloAzul2025');
        } else {
            alert('❌ ' + error.message);
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showAdminPanel() {
    if (grid) grid.style.display = 'none';
    document.getElementById('promotionsContainer')?.classList.add('hidden');
    
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.classList.remove('hidden');
        adminPanel.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2 style="color: #2c5530; margin-bottom: 20px;">👑 Panel de Administración</h2>
                <p>Bienvenido, administrador!</p>
                <p>Productos en sistema: ${products.length}</p>
                <div style="margin-top: 20px;">
                    <button onclick="showCatalog()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        Volver al Catálogo
                    </button>
                    <button onclick="logoutAdmin()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
    }
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
    updateAdminUI();
    showCatalog();
    alert('👋 Sesión cerrada correctamente');
}

// ----------------- PROMOCIONES -----------------
function showPromotionsSection() {
    if (grid) grid.style.display = 'none';
    document.getElementById('admin-panel')?.classList.add('hidden');
    
    const container = document.getElementById('promotionsContainer');
    if (container) {
        container.classList.remove('hidden');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>🎯 Promociones</h2>
                <p>Próximamente tendremos increíbles promociones</p>
                ${isAdminAuthenticated ? `
                    <button onclick="openPromotionsModal()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Crear Promoción
                    </button>
                ` : ''}
            </div>
        `;
    }
}

function openPromotionsModal() {
    alert('Modal de promociones - En desarrollo');
}

// ----------------- UTILIDADES -----------------
function showLoading(message = 'Cargando...') {
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px;">
                <p>${message}</p>
            </div>
        `;
    }
}

function showError(message) {
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px; color:#dc3545;">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="fetchProducts()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// ----------------- EVENT LISTENERS -----------------
function setupEventListeners() {
    // Sidebar
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // Navegación
    if (catalogBtn) catalogBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleSidebar(); 
        showCatalog(); 
    });
    
    if (promotionsBtn) promotionsBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleSidebar(); 
        showPromotionsSection(); 
    });
    
    if (adminBtn) adminBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleSidebar(); 
        if (isAdminAuthenticated) {
            showAdminPanel();
        } else {
            const adminModal = document.getElementById('admin-modal');
            if (adminModal) adminModal.classList.add('open');
        }
    });

    // Búsqueda
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('keyup', (e) => { 
        if (e.key === 'Enter') applyFilters(); 
    });

    // Categorías
    if (categoryToggle) categoryToggle.addEventListener('click', toggleCategoryPanel);

    // Modal producto
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
    });

    // Formulario admin
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminSubmit);
        
        // Agregar valores por defecto para testing
        setTimeout(() => {
            const adminUser = document.getElementById('adminUser');
            const adminEmail = document.getElementById('adminEmail');
            const adminPassword = document.getElementById('adminPassword');
            
            if (adminUser && !adminUser.value) adminUser.value = 'admin';
            if (adminEmail && !adminEmail.value) adminEmail.value = 'admin@dcphone.com';
            if (adminPassword && !adminPassword.value) adminPassword.value = 'CieloAzul2025';
        }, 1000);
    }
}

// ----------------- FUNCIONES GLOBALES -----------------
window.applyFilters = applyFilters;
window.toggleCategoryPanel = toggleCategoryPanel;
window.openPromotionsModal = openPromotionsModal;
window.showPromotionsSection = showPromotionsSection;
window.fetchProducts = fetchProducts;
window.closeModal = closeModal;
window.handleAdminSubmit = handleAdminSubmit;
window.showAdminPanel = showAdminPanel;
window.logoutAdmin = logoutAdmin;
window.showCatalog = showCatalog;

console.log('✅ script.js cargado correctamente');