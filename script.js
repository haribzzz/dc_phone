// ---------- script.js (SISTEMA COMPLETO CON ADMIN Y PROMOCIONES MEJORADO) ----------

// API base (ajusta si tu server corre en otra ruta/puerto)
const API_BASE = window.location.origin; // usa mismo host (http://localhost:3000)

// Variables globales (sin productos por defecto)
const promotions = JSON.parse(localStorage.getItem('promotions')) || []; // promotions se seguirán guardando local por ahora
let products = []; // se cargan desde backend

// Estado de autenticación
let isAdminAuthenticated = false;

// Elementos del DOM (mantener nombres iguales a tu HTML)
const grid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-button');
const categoryToggle = document.getElementById('category-toggle');
const categoryPanel = document.getElementById('category-panel');
const searchContainer = document.querySelector('.search-container');

// Modal elements
const modal = document.getElementById('product-modal');
const modalImage = document.getElementById('modal-image');
const modalImageWrap = document.getElementById('modal-image-wrap');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalAvailability = document.getElementById('modal-availability');
const modalDescription = document.getElementById('modal-description');
const modalSpecs = document.getElementById('modal-specs');
const modalFeatures = document.getElementById('modal-features');
const modalStock = document.getElementById('modal-stock');
const modalClose = document.getElementById('modal-close');
const zoomIcon = document.getElementById('zoom-icon');

// Sidebar / UI
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const catalogBtn = document.getElementById('catalogBtn');
const promotionsBtn = document.getElementById('promotionsBtn');
const adminBtn = document.getElementById('adminBtn');

const selectedCategories = new Set();
const selectedBrands = new Set();

let isZoomed = false;

// ----------------- Inicialización -----------------
document.addEventListener('DOMContentLoaded', async function() {
  // mover título si existe
  const headerLeft = document.querySelector('.header-left');
  if (headerLeft) headerLeft.style.marginLeft = '40px';

  // llenar panel categorías y cargar productos desde backend
  populateCategoryPanel();
  await fetchProducts();
  showPromotionsFromServer(); // cargar promociones locales/servidor (ver función)
  updateAdminUI();
  setupEventListeners();
  checkAdminAuth(); // Verificar si ya está autenticado
});

// ----------------- Event Listeners -----------------
function setupEventListeners() {
  menuToggle.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', toggleSidebar);

  catalogBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); showCatalog(); });
  promotionsBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); showPromotionsSection(); });
  adminBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); if (isAdminAuthenticated) showAdminPanel(); else openModal('admin-modal'); });

  if (searchBtn) searchBtn.addEventListener('click', filterProducts);
  if (searchInput) searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') filterProducts(); });

  categoryToggle.addEventListener('click', toggleCategoryPanel);

  document.addEventListener('click', (e) => {
    if (categoryPanel && !categoryPanel.contains(e.target) && e.target !== categoryToggle) {
      categoryPanel.classList.add('hidden');
    }
  });

  modalClose.addEventListener('click', () => closeModal('product-modal'));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal('product-modal'); });

  zoomIcon.addEventListener('click', toggleZoom);
  modalImageWrap.addEventListener('click', (e) => { if (isZoomed && e.target === modalImageWrap) toggleZoom(); });

  const promotionForm = document.getElementById('promotionForm');
  if (promotionForm) promotionForm.addEventListener('submit', handlePromotionSubmit);

  const adminForm = document.getElementById('adminForm');
  if (adminForm) adminForm.addEventListener('submit', handleAdminSubmit);
}

// ----------------- Backend calls -----------------
// ----------------- fetchProducts -----------------
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos del servidor');
    const data = await res.json();

    console.log('Datos recibidos del servidor:', data);

    products = data.map(row => {
      // Construir la URL de la imagen correctamente
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
        name: row.nombre || '',
        brand: row.marca || '',
        category: row.categoria || '',
        price: row.precio ? `$${row.precio}` : '—',
        image: imageUrl,
        description: row.descripcion || '',
        // ↓↓↓ ELIMINADO: specs y features ↓↓↓
        stock: Number(row.stock) || 0,
        available: (String(row.esta_activo).toLowerCase() === 'true' || row.esta_activo === 1),
        rawData: row
      };
    });

    console.log('Productos procesados:', products);
    renderProducts(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--mid);">Error al obtener productos del servidor</p>';
  }
}

// Cargar productos en el select de promociones
function loadProductsForPromotions() {
    const select = document.getElementById('promoProduct');
    if (!select) return;

    select.innerHTML = '<option value="">-- Promoción general --</option>';
    
    products.filter(p => p.available).forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${product.brand}`;
        select.appendChild(option);
    });
}

// Crear nueva promoción
// Función mejorada para manejar el envío de promociones
// Función CORREGIDA para manejar el envío de promociones
async function handlePromotionSubmit(e) {
    e.preventDefault();
    
    if (!isAdminAuthenticated) {
        alert('Debes iniciar sesión como administrador');
        return;
    }

    const formData = {
        nombre: document.getElementById('promoTitle').value.trim(),
        descripcion: document.getElementById('promoDescription').value.trim(),
        descuento: parseFloat(document.getElementById('promoDiscount').value),
        fecha_inicio: document.getElementById('promoStartDate').value,
        fecha_fin: document.getElementById('promoEndDate').value,
        id_producto: document.getElementById('promoProduct').value || null
    };

    console.log('📤 Enviando datos al servidor:', formData);

    // Validaciones
    if (!formData.nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    if (formData.descuento < 1 || formData.descuento > 100) {
        alert('El descuento debe ser entre 1% y 100%');
        return;
    }

    const start = new Date(formData.fecha_inicio);
    const end = new Date(formData.fecha_fin);
    
    if (end <= start) {
        alert('La fecha fin debe ser posterior a la fecha inicio');
        return;
    }

    try {
        console.log('🔄 Enviando promoción al servidor...');
        
        const response = await fetch(`${API_BASE}/promociones`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('📨 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Promoción creada en servidor:', result);

        alert('✅ Promoción creada exitosamente en el servidor');
        e.target.reset();
        closeModal('promotions-modal');
        await refreshPromotionsData();
        
    } catch (error) {
        console.error('💥 Error completo al crear promoción:', error);
        
        // MOSTRAR ERROR ESPECÍFICO Y NO GUARDAR EN LOCALSTORAGE
        if (error.message.includes('Failed to fetch')) {
            alert('❌ Error de conexión: No se pudo contactar al servidor. Verifica que el servidor esté ejecutándose.');
        } else if (error.message.includes('404')) {
            alert('❌ Error 404: La ruta /promociones no existe en el servidor.');
        } else if (error.message.includes('500')) {
            alert('❌ Error 500: Error interno del servidor. Revisa la consola del servidor.');
        } else {
            alert(`❌ Error: ${error.message}`);
        }
        
        // NO guardar en localStorage - solo servidor
        console.log('🚫 No se guardará en localStorage - solo servidor permitido');
    }
}
// Mostrar sección de promociones
async function showPromotionsSection() {
    // Ocultar otras secciones
    document.getElementById('products-grid').style.display = 'none';
    document.getElementById('admin-panel').classList.add('hidden');
    if (searchContainer) searchContainer.style.display = 'none';

    const container = document.getElementById('promotionsContainer');
    container.classList.remove('hidden');
    container.innerHTML = '<p>Cargando promociones...</p>';

    try {
        const promociones = await fetchPromotionsFromServer();
        const ahora = new Date();

        const promosActivas = promociones.filter(promo => {
            const inicio = new Date(promo.fecha_inicio);
            const fin = new Date(promo.fecha_fin);
            return ahora >= inicio && ahora <= fin && promo.esta_activa;
        });

        if (promosActivas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>No hay promociones activas</h3>
                    <p>Vuelve pronto para ver nuestras ofertas</p>
                    ${isAdminAuthenticated ? `
                        <button onclick="openPromotionsModal()" style="margin-top: 15px; padding: 10px 20px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Crear Promoción
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h2 style="text-align: center; color: #2c5530;">Promociones Activas</h2>
                ${isAdminAuthenticated ? `
                    <div style="text-align: center;">
                        <button onclick="openPromotionsModal()" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer;">
                            + Nueva Promoción
                        </button>
                    </div>
                ` : ''}
            </div>
            <div style="display: grid; gap: 15px; max-width: 800px; margin: 0 auto;">
                ${promosActivas.map(crearTarjetaPromocion).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Error cargando promociones</p>';
    }
}

// Crear tarjeta de promoción para mostrar
function crearTarjetaPromocion(promo) {
    const inicio = new Date(promo.fecha_inicio);
    const fin = new Date(promo.fecha_fin);
    const diasRestantes = Math.ceil((fin - new Date()) / (1000 * 60 * 60 * 24));

    let infoProducto = '';
    if (promo.id_producto) {
        const producto = products.find(p => p.id == promo.id_producto);
        if (producto) {
            infoProducto = `<p style="margin: 10px 0;"><strong>Producto:</strong> ${producto.name}</p>`;
        }
    }

    return `
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h3 style="margin: 0; flex: 1;">${promo.nombre}</h3>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                    ${diasRestantes}d restantes
                </span>
            </div>
            
            ${promo.descripcion ? `<p style="margin: 10px 0;">${promo.descripcion}</p>` : ''}
            
            ${infoProducto}
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <div style="font-size: 24px; font-weight: bold;">
                    ${promo.descuento}% OFF
                </div>
                <div style="text-align: right; font-size: 14px;">
                    <div>Válido hasta: ${fin.toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    `;
}

// Abrir modal de promociones
function openPromotionsModal() {
    openModal('promotions-modal');
    loadProductsForPromotions();
    
    // Fechas por defecto
    const ahora = new Date();
    const fin = new Date(ahora);
    fin.setDate(fin.getDate() + 7);
    
    document.getElementById('promoStartDate').value = ahora.toISOString().slice(0, 16);
    document.getElementById('promoEndDate').value = fin.toISOString().slice(0, 16);
}

// Cargar gestión de promociones en panel admin
async function loadPromotionsManagement() {
    const container = document.getElementById('admin-promotions-list');
    if (!container) return;

    try {
        const promociones = await fetchPromotionsFromServer();

        if (promociones.length === 0) {
            container.innerHTML = '<p>No hay promociones registradas</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: grid; gap: 10px;">
                ${promociones.map(promo => crearItemGestionPromocion(promo)).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Error cargando promociones</p>';
    }
}

// Crear item para gestión de promociones
function crearItemGestionPromocion(promo) {
    const ahora = new Date();
    const inicio = new Date(promo.fecha_inicio);
    const fin = new Date(promo.fecha_fin);
    const estaActiva = ahora >= inicio && ahora <= fin && promo.esta_activa;

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            <div style="flex: 1;">
                <strong>${promo.nombre}</strong>
                <div style="font-size: 14px; color: #666;">
                    ${promo.descuento}% • ${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()}
                </div>
                <div style="font-size: 12px; color: #999;">
                    ${promo.descripcion ? promo.descripcion.substring(0, 80) + '...' : 'Sin descripción'}
                </div>
                <span style="font-size: 11px; padding: 2px 6px; background: ${estaActiva ? '#28a745' : '#6c757d'}; color: white; border-radius: 4px;">
                    ${estaActiva ? 'ACTIVA' : 'INACTIVA'}
                </span>
            </div>
            <div style="display: flex; gap: 5px;">
                <button onclick="editPromotionModal(${promo.id_promocion})" style="padding: 6px 12px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">
                    Editar
                </button>
                <button onclick="deletePromotion(${promo.id_promocion})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Eliminar
                </button>
            </div>
        </div>
    `;
}

// Editar promoción
async function editPromotionModal(promotionId) {
    try {
        const response = await fetch(`${API_BASE}/promociones/${promotionId}`);
        const promo = await response.json();

        if (!response.ok) {
            throw new Error(promo.message);
        }

        const modalHtml = `
            <div id="edit-promotion-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <span class="close" onclick="closeModal('edit-promotion-modal')">&times;</span>
                    <h3>Editar Promoción</h3>
                    <form onsubmit="updatePromotion(event, ${promotionId})">
                        <div style="display: grid; gap: 10px;">
                            <input type="text" value="${promo.nombre}" placeholder="Nombre" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <textarea placeholder="Descripción" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 60px;">${promo.descripcion || ''}</textarea>
                            <input type="number" value="${promo.descuento}" placeholder="Descuento %" min="1" max="100" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <input type="datetime-local" value="${promo.fecha_inicio.slice(0, 16)}" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <input type="datetime-local" value="${promo.fecha_fin.slice(0, 16)}" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <div style="display: flex; gap: 10px;">
                                <button type="submit" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Guardar
                                </button>
                                <button type="button" onclick="closeModal('edit-promotion-modal')" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        openModal('edit-promotion-modal');
    } catch (error) {
        alert('Error cargando promoción: ' + error.message);
    }
}

// Actualizar promoción
async function updatePromotion(e, promotionId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nombre: form.querySelector('input[type="text"]').value.trim(),
        descripcion: form.querySelector('textarea').value.trim(),
        descuento: parseFloat(form.querySelector('input[type="number"]').value),
        fecha_inicio: form.querySelector('input[type="datetime-local"]').value,
        fecha_fin: form.querySelectorAll('input[type="datetime-local"]')[1].value,
        esta_activa: true
    };

    try {
        const response = await fetch(`${API_BASE}/promociones/${promotionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Promoción actualizada');
            closeModal('edit-promotion-modal');
            await refreshPromotionsData();
        } else {
            alert(result.message || 'Error actualizando');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Eliminar promoción
async function deletePromotion(promotionId) {
    if (!confirm('¿Eliminar esta promoción?')) return;

    try {
        const response = await fetch(`${API_BASE}/promociones/${promotionId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            alert('Promoción eliminada');
            await refreshPromotionsData();
        } else {
            alert(result.message || 'Error eliminando');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Actualizar datos de promociones
async function refreshPromotionsData() {
    // Recargar en panel admin
    if (document.getElementById('admin-promotions-list')) {
        await loadPromotionsManagement();
    }
    
    // Recargar en sección promociones
    if (!document.getElementById('products-grid').style.display !== 'none') {
        await showPromotionsSection();
    }
    
    // Actualizar estadísticas
    if (document.getElementById('admin-stats')) {
        await loadAdminStats();
    }
}

// ==================== FUNCIONES ORIGINALES DEL SCRIPT ====================

// [MANTENER TODAS TUS FUNCIONES ORIGINALES AQUÍ...]
// renderProducts, handleAdminSubmit, showAdminPanel, loadAdminStats, 
// loadProductsManagement, deleteProduct, toggleProductAvailability, 
// editProductModal, updateProduct, openAddProductModal, addNewProduct,
// logoutAdmin, refreshAllData, updateAdminUI, checkAdminAuth, etc...

// Solo asegúrate de que en la función openProductModal esté corregido:
function openProductModal(product) {
  modalName.textContent = product.name;
  modalPrice.textContent = product.price;
  modalDescription.textContent = product.description || '';
  modalAvailability.textContent = product.available ? 'Disponible' : 'Agotado';
  modalAvailability.className = `availability ${product.available ? 'available' : 'not-available'}`;
  
  // ↓↓↓ ELIMINADO: Especificaciones y características ↓↓↓
  // Solo mostrar descripción
  if (product.description) {
    modalDescription.textContent = product.description;
  } else {
    modalDescription.textContent = 'No hay descripción disponible';
  }
  
  modalStock.textContent = `Stock: ${product.stock} unidades`;
  
  // Imagen del modal con manejo de errores
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalImage.onerror = function() {
    this.src = `${API_BASE}/images/placeholder.png`;
  };

  isZoomed = false;
  modalImageWrap.classList.remove('zoomed');
  modalImage.style.transform = 'scale(1)';
  openModal('product-modal');
}

// Actualizar la inicialización para cargar productos para promociones
document.addEventListener('DOMContentLoaded', async function() {
  // mover título si existe
  const headerLeft = document.querySelector('.header-left');
  if (headerLeft) headerLeft.style.marginLeft = '40px';

  // llenar panel categorías y cargar productos desde backend
  populateCategoryPanel();
  await fetchProducts();
  
  // CARGAR PRODUCTOS PARA PROMOCIONES DESPUÉS DE OBTENER PRODUCTOS
  loadProductsForPromotions();
  
  showPromotionsFromServer();
  updateAdminUI();
  setupEventListeners();
  checkAdminAuth();
});