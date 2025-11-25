// ---------- script.js (SISTEMA COMPLETO CON ADMIN) ----------

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

    console.log('Datos recibidos del servidor:', data); // Para debug

    products = data.map(row => {
      // Construir la URL de la imagen correctamente
      let imageUrl;
      if (row.imagen) {
        // Si la imagen ya es una URL completa
        if (row.imagen.startsWith('http')) {
          imageUrl = row.imagen;
        } 
        // Si es solo un nombre de archivo, construir la URL completa
        else if (row.imagen.includes('/')) {
          imageUrl = `${API_BASE}${row.imagen.startsWith('/') ? '' : '/'}${row.imagen}`;
        }
        else {
          imageUrl = `${API_BASE}/images/${row.imagen}`;
        }
      } else {
        imageUrl = `${API_BASE}/images/placeholder.png`;
      }

      return {
        id: String(row.id_producto),
        name: row.nombre || '',
        brand: row.marca || '',
        category: row.categoria || '',
        price: row.precio ? `$${row.precio}` : '—',
        image: imageUrl,
        description: row.descripcion || '',
        specs: row.especificaciones ? JSON.parse(row.especificaciones) : [],
        features: row.caracteristicas ? JSON.parse(row.caracteristicas) : [],
        stock: Number(row.stock) || 0,
        available: (String(row.esta_activo).toLowerCase() === 'true' || row.esta_activo === 1),
        rawData: row // Guardamos datos originales para edición
      };
    });

    console.log('Productos procesados:', products); // Para debug
    renderProducts(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--mid);">Error al obtener productos del servidor</p>';
  }
}
function renderProducts(productsToRender) {
  grid.innerHTML = '';
  if (!productsToRender || productsToRender.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--mid);">No se encontraron productos</p>';
    return;
  }

  productsToRender.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'flex-start';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.2s ease';
    card.style.position = 'relative';

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    // -------------------- Imagen --------------------
    const imgContainer = document.createElement('div');
    imgContainer.style.width = '100%';
    imgContainer.style.height = '200px';
    imgContainer.style.backgroundColor = '#f8f9fa';
    imgContainer.style.borderRadius = '8px';
    imgContainer.style.display = 'flex';
    imgContainer.style.alignItems = 'center';
    imgContainer.style.justifyContent = 'center';
    imgContainer.style.overflow = 'hidden';
    imgContainer.style.padding = '10px';
    imgContainer.style.boxSizing = 'border-box';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.transition = 'transform 0.3s ease';

    img.onerror = function() {
      this.src = `${API_BASE}/images/placeholder.png`;
      this.onerror = null;
    };

    imgContainer.appendChild(img);

    // -------------------- Información --------------------
    const content = document.createElement('div');
    content.style.padding = '15px 10px';
    content.style.textAlign = 'center';
    content.style.width = '100%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    content.style.gap = '8px';

    // Nombre
    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.style.minHeight = '48px';
    nameDiv.style.fontWeight = '600';
    nameDiv.style.display = 'flex';
    nameDiv.style.alignItems = 'center';
    nameDiv.style.justifyContent = 'center';
    nameDiv.style.fontSize = '14px';
    nameDiv.style.lineHeight = '1.3';
    nameDiv.textContent = product.name;

    // ✅ DESCRIPCIÓN (NUEVO) - Agrega esto
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'description';
    descriptionDiv.style.fontSize = '12px';
    descriptionDiv.style.color = '#666';
    descriptionDiv.style.lineHeight = '1.4';
    descriptionDiv.style.maxHeight = '40px';
    descriptionDiv.style.overflow = 'hidden';
    descriptionDiv.style.textOverflow = 'ellipsis';
    descriptionDiv.style.display = '-webkit-box';
    descriptionDiv.style.webkitLineClamp = '2';
    descriptionDiv.style.webkitBoxOrient = 'vertical';
    descriptionDiv.textContent = product.description || 'Sin descripción';

    // Precio
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price';
    priceDiv.style.fontSize = '16px';
    priceDiv.style.fontWeight = '700';
    priceDiv.style.color = '#2c5530';
    priceDiv.textContent = product.price;

    // Disponibilidad
    const availabilityDiv = document.createElement('div');
    availabilityDiv.className = `availability ${product.available ? 'available' : 'not-available'}`;
    availabilityDiv.style.padding = '4px 8px';
    availabilityDiv.style.borderRadius = '12px';
    availabilityDiv.style.fontSize = '12px';
    availabilityDiv.style.fontWeight = '600';
    
    if (product.available) {
      availabilityDiv.style.backgroundColor = '#d4edda';
      availabilityDiv.style.color = '#155724';
    } else {
      availabilityDiv.style.backgroundColor = '#f8d7da';
      availabilityDiv.style.color = '#721c24';
    }
    
    availabilityDiv.textContent = product.available ? 'Disponible' : 'Agotado';

    // Agregar elementos al contenido (EN ESTE ORDEN)
    content.appendChild(nameDiv);
    content.appendChild(descriptionDiv); // ✅ DESCRIPCIÓN agregada
    content.appendChild(priceDiv);
    content.appendChild(availabilityDiv);

    // -------------------- Botones de Admin --------------------
    if (isAdminAuthenticated) {
      const adminButtons = document.createElement('div');
      adminButtons.style.display = 'flex';
      adminButtons.style.gap = '5px';
      adminButtons.style.marginTop = '10px';
      adminButtons.style.width = '100%';
      adminButtons.style.justifyContent = 'center';

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️ Editar';
      editBtn.style.padding = '6px 12px';
      editBtn.style.background = '#ffc107';
      editBtn.style.color = 'black';
      editBtn.style.border = 'none';
      editBtn.style.borderRadius = '5px';
      editBtn.style.cursor = 'pointer';
      editBtn.style.fontSize = '12px';
      editBtn.onclick = (e) => {
        e.stopPropagation();
        editProductModal(product.id);
      };

      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = product.available ? '❌ Desactivar' : '✅ Activar';
      toggleBtn.style.padding = '6px 12px';
      toggleBtn.style.background = product.available ? '#dc3545' : '#28a745';
      toggleBtn.style.color = 'white';
      toggleBtn.style.border = 'none';
      toggleBtn.style.borderRadius = '5px';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.fontSize = '12px';
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        toggleProductAvailability(product.id);
      };

      adminButtons.appendChild(editBtn);
      adminButtons.appendChild(toggleBtn);
      content.appendChild(adminButtons);
    }

    card.appendChild(imgContainer);
    card.appendChild(content);

    card.addEventListener('click', () => openProductModal(product));

    grid.appendChild(card);
  });

  console.log(`Renderizados ${productsToRender.length} productos`);
}

// ----------------- Admin Login Mejorado -----------------
async function handleAdminSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('adminUser').value;
  const password = document.getElementById('adminPassword').value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombre_usuario: username, 
        password: password 
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        isAdminAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', username);
        updateAdminUI();
        alert('✅ Acceso de administrador concedido');
        e.target.reset();
        closeModal('admin-modal');
        showAdminPanel();
      } else {
        alert('❌ Credenciales incorrectas');
      }
    } else {
      alert('❌ Error en el servidor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}

// ----------------- Panel de Administración Completo -----------------
function showAdminPanel() {
  document.getElementById('products-grid').style.display = 'none';
  document.getElementById('promotionsContainer').classList.add('hidden');
  const adminPanel = document.getElementById('admin-panel');
  adminPanel.classList.remove('hidden');
  
  adminPanel.innerHTML = `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
      <h2 style="color: #2c5530; margin-bottom: 30px;">👑 Panel de Administración - DC Phone</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <!-- Estadísticas -->
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="margin-bottom: 15px;">📊 Resumen</h3>
          <div id="admin-stats">
            <p>🔄 Cargando estadísticas...</p>
          </div>
        </div>
        
        <!-- Acciones Rápidas -->
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="margin-bottom: 15px;">⚡ Acciones Rápidas</h3>
          <button onclick="openAddProductModal()" style="width: 100%; padding: 12px; margin: 5px 0; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            + Agregar Producto
          </button>
          <button onclick="openModal('promotions-modal')" style="width: 100%; padding: 12px; margin: 5px 0; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🎯 Crear Promoción
          </button>
          <button onclick="refreshAllData()" style="width: 100%; padding: 12px; margin: 5px 0; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🔄 Actualizar Datos
          </button>
          <button onclick="logoutAdmin()" style="width: 100%; padding: 12px; margin: 5px 0; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Gestión de Productos -->
      <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0;">📦 Gestión de Productos (${products.length})</h3>
          <button onclick="fetchProducts()" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Actualizar Lista
          </button>
        </div>
        <div id="admin-products-list" style="min-height: 200px;">
          <p>🔄 Cargando productos...</p>
        </div>
      </div>

      <!-- Gestión de Promociones -->
      <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0;">🎯 Gestión de Promociones</h3>
          <button onclick="loadPromotionsManagement()" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Actualizar Lista
          </button>
        </div>
        <div id="admin-promotions-list" style="min-height: 100px;">
          <p>🔄 Cargando promociones...</p>
        </div>
      </div>
    </div>
  `;

  loadAdminStats();
  loadProductsManagement();
  loadPromotionsManagement();
}

// ----------------- Funciones de Estadísticas -----------------
async function loadAdminStats() {
  try {
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.available).length;
    const outOfStockProducts = products.filter(p => !p.available).length;
    
    const promos = await fetchPromotionsFromServer();
    const activePromotions = promos.filter(p => 
      new Date(p.fecha_fin) >= new Date() && p.esta_activa
    ).length;

    document.getElementById('admin-stats').innerHTML = `
      <p>📦 <strong>Productos totales:</strong> ${totalProducts}</p>
      <p>🎯 <strong>Promociones activas:</strong> ${activePromotions}</p>
      <p>✅ <strong>Productos disponibles:</strong> ${availableProducts}</p>
      <p>❌ <strong>Productos agotados:</strong> ${outOfStockProducts}</p>
    `;
  } catch (error) {
    document.getElementById('admin-stats').innerHTML = '<p>❌ Error cargando estadísticas</p>';
  }
}

// ----------------- Gestión de Productos en Panel Admin -----------------
async function loadProductsManagement() {
  const container = document.getElementById('admin-products-list');
  
  try {
    if (products.length === 0) {
      container.innerHTML = '<p>No hay productos registrados</p>';
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 10px; max-height: 400px; overflow-y: auto;">
        ${products.map(product => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa;">
            <div style="flex: 1;">
              <strong>${product.name}</strong>
              <div style="font-size: 14px; color: #666;">
                ${product.brand} • ${product.price} • Stock: ${product.stock}
              </div>
              <div style="font-size: 12px; color: #999;">
                ${product.description ? product.description.substring(0, 100) + '...' : 'Sin descripción'}
              </div>
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              <button onclick="editProductModal('${product.id}')" style="padding: 6px 12px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                ✏️ Editar
              </button>
              <button onclick="toggleProductAvailability('${product.id}')" style="padding: 6px 12px; background: ${product.available ? '#dc3545' : '#28a745'}; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                ${product.available ? '❌ Desactivar' : '✅ Activar'}
              </button>
              <button onclick="deleteProduct('${product.id}')" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p>❌ Error cargando productos</p>';
  }
}

// ----------------- CRUD Productos Mejorado -----------------
async function deleteProduct(productId) {
  if (!confirm('¿Estás seguro de que quieres ELIMINAR este producto? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/productos/${productId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('✅ Producto eliminado correctamente');
      await fetchProducts(); // Recargar productos
      if (document.getElementById('admin-products-list')) {
        loadProductsManagement(); // Actualizar panel admin si está abierto
      }
    } else {
      alert('❌ Error al eliminar el producto');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}

async function toggleProductAvailability(productId) {
  try {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = !product.available;
    
    const response = await fetch(`${API_BASE}/productos/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        esta_activo: newStatus 
      })
    });

    if (response.ok) {
      alert(`✅ Producto ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      await fetchProducts();
      if (document.getElementById('admin-products-list')) {
        loadProductsManagement();
      }
    } else {
      alert('❌ Error al cambiar el estado');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}

// ----------------- Modal de Edición de Producto -----------------
function editProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Crear modal de edición
  const modalHtml = `
    <div id="edit-product-modal" class="modal" style="display: flex;">
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="closeModal('edit-product-modal')">&times;</span>
        <h2>✏️ Editar Producto</h2>
        <form id="editProductForm" onsubmit="updateProduct(event, '${productId}')">
          <div style="display: grid; gap: 15px;">
            <input type="text" id="edit-name" value="${product.name}" placeholder="Nombre" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="text" id="edit-brand" value="${product.brand}" placeholder="Marca" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="number" id="edit-price" value="${product.rawData.precio || product.price.replace('$', '')}" placeholder="Precio" step="0.01" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="number" id="edit-stock" value="${product.stock}" placeholder="Stock" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <textarea id="edit-description" placeholder="Descripción" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; height: 100px;">${product.description}</textarea>
            <input type="text" id="edit-image" value="${product.rawData.imagen || ''}" placeholder="URL de imagen" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <div style="display: flex; gap: 10px;">
              <button type="submit" style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                💾 Guardar Cambios
              </button>
              <button type="button" onclick="closeModal('edit-product-modal')" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  // Agregar modal al body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  openModal('edit-product-modal');
}

async function updateProduct(e, productId) {
  e.preventDefault();
  
  const updatedProduct = {
    nombre: document.getElementById('edit-name').value,
    marca: document.getElementById('edit-brand').value,
    precio: parseFloat(document.getElementById('edit-price').value),
    stock: parseInt(document.getElementById('edit-stock').value),
    descripcion: document.getElementById('edit-description').value,
    imagen: document.getElementById('edit-image').value
  };

  try {
    const response = await fetch(`${API_BASE}/productos/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    });

    if (response.ok) {
      alert('✅ Producto actualizado correctamente');
      closeModal('edit-product-modal');
      await fetchProducts();
      if (document.getElementById('admin-products-list')) {
        loadProductsManagement();
      }
    } else {
      alert('❌ Error al actualizar el producto');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}

// ----------------- Agregar Producto Mejorado -----------------
function openAddProductModal() {
  if (!isAdminAuthenticated) { 
    alert('Inicia sesión como admin para agregar productos'); 
    return; 
  }

  const modalHtml = `
    <div id="add-product-modal" class="modal" style="display: flex;">
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="closeModal('add-product-modal')">&times;</span>
        <h2>➕ Agregar Nuevo Producto</h2>
        <form id="addProductForm" onsubmit="addNewProduct(event)">
          <div style="display: grid; gap: 15px;">
            <input type="text" id="new-name" placeholder="Nombre del producto" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="text" id="new-brand" placeholder="Marca" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="text" id="new-model" placeholder="Modelo" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="number" id="new-price" placeholder="Precio" step="0.01" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <input type="number" id="new-stock" placeholder="Stock" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <textarea id="new-description" placeholder="Descripción" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; height: 100px;"></textarea>
            <input type="text" id="new-image" placeholder="URL de imagen" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <select id="new-category" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              <option value="1">Celulares</option>
              <option value="2">Tablets</option>
              <option value="3">Consolas</option>
            </select>
            <div style="display: flex; gap: 10px;">
              <button type="submit" style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                ➕ Agregar Producto
              </button>
              <button type="button" onclick="closeModal('add-product-modal')" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  openModal('add-product-modal');
}

async function addNewProduct(e) {
  e.preventDefault();
  
  const newProduct = {
    nombre: document.getElementById('new-name').value,
    marca: document.getElementById('new-brand').value,
    modelo: document.getElementById('new-model').value,
    precio: parseFloat(document.getElementById('new-price').value),
    stock: parseInt(document.getElementById('new-stock').value),
    descripcion: document.getElementById('new-description').value,
    imagen: document.getElementById('new-image').value,
    id_categoria: parseInt(document.getElementById('new-category').value),
    esta_activo: 1
  };

  try {
    const response = await fetch(`${API_BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    if (response.ok) {
      alert('✅ Producto agregado correctamente');
      closeModal('add-product-modal');
      await fetchProducts();
      if (document.getElementById('admin-products-list')) {
        loadProductsManagement();
      }
    } else {
      alert('❌ Error al agregar el producto');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}

// ----------------- Gestión de Promociones -----------------
async function loadPromotionsManagement() {
  const container = document.getElementById('admin-promotions-list');
  
  try {
    const promos = await fetchPromotionsFromServer();
    
    if (promos.length === 0) {
      container.innerHTML = '<p>No hay promociones registradas</p>';
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
        ${promos.map(promo => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff3cd;">
            <div style="flex: 1;">
              <strong>${promo.nombre || promo.titulo}</strong>
              <div style="font-size: 14px; color: #666;">
                Descuento: ${promo.descuento}% • 
                ${new Date(promo.fecha_fin).toLocaleDateString()}
              </div>
              <div style="font-size: 12px; color: #999;">
                ${promo.descripcion ? promo.descripcion.substring(0, 100) + '...' : 'Sin descripción'}
              </div>
            </div>
            <div style="display: flex; gap: 5px;">
              <button onclick="editPromotionModal(${promo.id_promocion})" style="padding: 6px 12px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;">
                ✏️ Editar
              </button>
              <button onclick="deletePromotion(${promo.id_promocion})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p>❌ Error cargando promociones</p>';
  }
}

// ----------------- Funciones Auxiliares Admin -----------------
function logoutAdmin() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    isAdminAuthenticated = false;
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
    updateAdminUI();
    showCatalog();
    alert('✅ Sesión cerrada correctamente');
  }
}

function refreshAllData() {
  fetchProducts();
  loadPromotionsManagement();
  loadAdminStats();
  alert('✅ Datos actualizados');
}

// ----------------- UI Updates Mejorado -----------------
function updateAdminUI() {
  const adminBtn = document.getElementById('adminBtn');
  const addProductBtn = document.getElementById('addProductBtn');
  
  if (isAdminAuthenticated) {
    adminBtn.innerHTML = '<i>👑</i> Admin (Conectado)';
    adminBtn.style.color = '#4CAF50';
    adminBtn.style.fontWeight = 'bold';
    
    // Botón agregar producto en header
    if (!addProductBtn && searchContainer) {
      const newBtn = document.createElement('button');
      newBtn.id = 'addProductBtn';
      newBtn.innerHTML = '➕ Agregar Producto';
      newBtn.style.cssText = `
        padding: 10px 15px; 
        background: var(--accent); 
        color: white; 
        border: none; 
        border-radius: 10px; 
        cursor: pointer; 
        font-weight: 700; 
        margin-left: 10px;
        font-size: 14px;
      `;
      newBtn.onclick = openAddProductModal;
      searchContainer.appendChild(newBtn);
    }
  } else {
    adminBtn.innerHTML = '<i>⚙️</i> Admin';
    adminBtn.style.color = '';
    adminBtn.style.fontWeight = '';
    
    if (addProductBtn) {
      addProductBtn.remove();
    }
  }
}

function showAdminOptions() {
  let addProductBtn = document.getElementById('addProductBtn');
  if (!addProductBtn && searchContainer) {
    addProductBtn = document.createElement('button');
    addProductBtn.id = 'addProductBtn';
    addProductBtn.textContent = '+ Agregar Producto';
    addProductBtn.style.cssText = `padding: 10px 15px; background: var(--accent); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; margin-left: 10px;`;
    addProductBtn.onclick = () => openAddProductModal();
    searchContainer.appendChild(addProductBtn);
  }
}

function hideAdminOptions() {
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) addProductBtn.remove();
}

// ----------------- Check Auth -----------------
function checkAdminAuth() {
  const auth = localStorage.getItem('adminAuthenticated');
  if (auth === 'true') { 
    isAdminAuthenticated = true; 
    updateAdminUI(); 
  }
}

// ==================== MANTENER TUS FUNCIONES EXISTENTES ====================

// Agregar producto (POST a backend) - Mantener tu versión
async function addProductToServer(prod) {
  try {
    const res = await fetch(`${API_BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod)
    });
    if (!res.ok) throw new Error('Error al crear producto');
    await fetchProducts();
    alert('Producto agregado correctamente');
  } catch (err) {
    console.error(err);
    alert('No se pudo agregar el producto');
  }
}

// Obtener promociones desde backend (si las tienes en DB) - Mantener tu versión
async function fetchPromotionsFromServer() {
  try {
    const res = await fetch(`${API_BASE}/promociones`);
    if (!res.ok) return [];
    const promos = await res.json();
    return promos;
  } catch (err) {
    console.warn('No se pudo obtener promociones del servidor, usando localStorage si hay.');
    return [];
  }
}

// Crear promoción (POST) - Mantener tu versión
async function postPromotionToServer(promo) {
  try {
    const res = await fetch(`${API_BASE}/promociones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo)
    });
    if (!res.ok) throw new Error('Error al crear promoción');
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// Login admin (verifica en tabla Usuario) - Mantener tu versión pero mejorada arriba
async function loginAdminServer(credentials) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ----------------- UI y render - Mantener tus funciones -----------------
function toggleSidebar() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
  document.body.classList.toggle('sidebar-open');
}

function showCatalog() {
  document.getElementById('promotionsContainer').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('products-grid').style.display = 'grid';
  if (searchContainer) searchContainer.style.display = 'flex';
  renderProducts(products);
}

function showPromotionsSection() {
  document.getElementById('products-grid').style.display = 'none';
  document.getElementById('admin-panel').classList.add('hidden');
  if (searchContainer) searchContainer.style.display = 'none';

  const container = document.getElementById('promotionsContainer');
  container.classList.remove('hidden');

  // intentamos cargar promos del servidor; si no, usamos localStorage
  fetchPromotionsFromServer().then(serverPromos => {
    const activePromotions = serverPromos.length ? serverPromos : promotions.filter(p => {
      const now = new Date();
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now <= end && p.active;
    });

    if (activePromotions.length === 0) {
      container.innerHTML = `
        <div class="promo-banner" style="background: linear-gradient(135deg, #667eea, #764ba2); text-align: center; max-width: 800px; margin: 20px auto;">
          <h3>📢 Aún no hay promociones disponibles</h3>
          <p>Vuelve pronto para descubrir nuestras ofertas especiales</p>
          <p style="font-style: italic; margin-top: 10px;">El equipo de DC Phone está preparando las mejores promociones para ti</p>
          ${isAdminAuthenticated ? `<div style="margin-top:15px;"><button onclick="openModal('promotions-modal')" style="padding:10px 20px; background:var(--accent); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">+ Crear Promoción</button></div>` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    activePromotions.forEach(promo => {
      const banner = document.createElement('div');
      banner.className = 'promo-banner';
      banner.innerHTML = `
        <h3>${promo.title || promo.titulo || ''}</h3>
        <p>${promo.description || promo.descripcion || ''}</p>
        <div class="discount">${promo.discount || promo.descuento || ''}% OFF</div>
        <p>Válido hasta: ${new Date(promo.endDate || promo.fecha_fin).toLocaleDateString()}</p>
      `;
      if (promo.image || promo.imagen) {
        banner.style.backgroundImage = `url('${promo.image || promo.imagen}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
      }
      container.appendChild(banner);
    });
  });
}

// ----------------- Product modal & helpers - Mantener tus funciones -----------------
function openProductModal(product) {
  modalName.textContent = product.name;
  modalPrice.textContent = product.price;
  modalDescription.textContent = product.description || '';
  modalAvailability.textContent = product.available ? 'Disponible' : 'Agotado';
  modalAvailability.className = `availability ${product.available ? 'available' : 'not-available'}`;
  
  // Especificaciones
  modalSpecs.innerHTML = '';
  if (product.specs && product.specs.length > 0) {
    product.specs.forEach(s => { 
      const li = document.createElement('li'); 
      li.textContent = s; 
      modalSpecs.appendChild(li); 
    });
  } else {
    modalSpecs.innerHTML = '<li>No hay especificaciones disponibles</li>';
  }
  
  // Características
  modalFeatures.innerHTML = '';
  if (product.features && product.features.length > 0) {
    product.features.forEach(f => { 
      const li = document.createElement('li'); 
      li.textContent = f; 
      modalFeatures.appendChild(li); 
    });
  } else {
    modalFeatures.innerHTML = '<li>No hay características disponibles</li>';
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

function toggleZoom() {
  isZoomed = !isZoomed;
  if (isZoomed) {
    modalImageWrap.classList.add('zoomed');
    modalImage.style.transform = 'scale(1.8)';
    zoomIcon.textContent = '🔍';
  } else {
    modalImageWrap.classList.remove('zoomed');
    modalImage.style.transform = 'scale(1)';
    zoomIcon.textContent = '🔍';
  }
}

function openModal(modalId) { 
  document.getElementById(modalId).classList.add('open'); 
  document.body.classList.add('modal-open'); 
}

function closeModal(modalId) { 
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    // Si es un modal dinámico, removerlo del DOM
    if (modalId.includes('add-product-modal') || modalId.includes('edit-product-modal')) {
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    }
  }
}

// ----------------- Filtros y edición - Mantener tus funciones -----------------
function editProductPrice(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const newPrice = prompt('Nuevo precio (solo número):', product.price ? product.price.replace(/[^0-9.]/g,'') : '');
  if (newPrice !== null && newPrice.trim() !== '') {
    // enviar al servidor una actualización simple (aquí hacemos POST a /productos con id para simplificar)
    fetch(`${API_BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: productId, precio: Number(newPrice), _action: 'update-price' })
    }).then(r => { if (r.ok) { fetchProducts(); alert('Precio actualizado'); } else alert('Error al actualizar'); });
  }
}

// ----------------- Categorías (tu versión mejorada) - Mantener tu función -----------------
function populateCategoryPanel() {
  const categoryStructure = {
    'Celulares': ['Samsung', 'Xiaomi', 'Poco', 'Realme', 'Blu', 'Honor', 'Infinix', 'Tecno', 'Itel', 'iPhone'],
    'Consolas': ['Sony', 'Nintendo'],
    'Tablets': ['Apple', 'Samsung', 'Xiaomi']
  };

  let html = `<div style="padding:10px; border-bottom:1px solid rgba(0,0,0,0.08); font-weight:700;">Categorías</div>`;
  for (const [category, brands] of Object.entries(categoryStructure)) {
    html += `
      <div class="cat-group">
        <div class="cat-row" style="font-weight:600; margin-top:8px;" data-category="${category}">
          <input type="checkbox" id="cat-${category}">
          <label for="cat-${category}">${category}</label>
        </div>
        <div style="margin-left:18px; margin-top:4px;">
          ${brands.map(brand => `
            <div class="cat-row" data-brand="${brand}">
              <input type="checkbox" id="brand-${brand}">
              <label for="brand-${brand}">${brand}</label>
            </div>
          `).join('')}
        </div>
      </div>`;
  }
  html += `<div style="padding:10px; margin-top:10px;"><button id="apply-filters" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:8px; cursor:pointer;">Aplicar Filtros</button></div>`;

  categoryPanel.innerHTML = html;

  categoryPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.id.startsWith('cat-')) {
        const category = this.id.replace('cat-', '');
        if (this.checked) selectedCategories.add(category); else selectedCategories.delete(category);
      } else if (this.id.startsWith('brand-')) {
        const brand = this.id.replace('brand-', '');
        if (this.checked) selectedBrands.add(brand); else selectedBrands.delete(brand);
      }
    });
  });

  document.getElementById('apply-filters').addEventListener('click', () => {
    filterProducts();
    categoryPanel.classList.add('hidden');
  });
}

function toggleCategoryPanel() { categoryPanel.classList.toggle('hidden'); }

// ----------------- Promociones (envío) - Mantener tu función -----------------
async function handlePromotionSubmit(e) {
  e.preventDefault();
  if (!isAdminAuthenticated) { alert('Debe iniciar sesión como administrador para crear promociones'); return; }

  const promotion = {
    title: document.getElementById('promoTitle').value,
    description: document.getElementById('promoDescription').value,
    discount: Number(document.getElementById('promoDiscount').value),
    image: document.getElementById('promoImage').value,
    startDate: document.getElementById('promoStartDate').value,
    endDate: document.getElementById('promoEndDate').value,
    active: true,
    createdAt: new Date().toISOString()
  };

  // intentamos guardar en servidor
  const ok = await postPromotionToServer({
    titulo: promotion.title,
    descripcion: promotion.description,
    descuento: promotion.discount,
    imagen: promotion.image,
    fecha_inicio: promotion.startDate,
    fecha_fin: promotion.endDate,
    activo: 1
  });

  if (ok) {
    alert('Promoción creada en servidor correctamente');
    e.target.reset();
    closeModal('promotions-modal');
    showPromotionsSection();
  } else {
    // fallback a localStorage
    promotions.push(promotion);
    localStorage.setItem('promotions', JSON.stringify(promotions));
    alert('Promoción guardada localmente (no se pudo guardar en servidor)');
    e.target.reset();
    closeModal('promotions-modal');
    showPromotionsSection();
  }
}

// Mostrar promociones iniciales (usa servidor si responde) - Mantener tu función
async function showPromotionsFromServer() {
  const container = document.getElementById('promotionsContainer');
  const serverPromos = await fetchPromotionsFromServer();
  if (serverPromos.length === 0) {
    // no hacemos nada (las promociones locales se mostrarán cuando se abra la sección)
    container.classList.add('hidden');
  } else {
    // se mostrarán con showPromotionsSection()
    container.classList.remove('hidden');
  }
}

function filterProducts() {
  const searchTerm = (searchInput.value || '').toLowerCase();
  const filtered = products.filter(product => {
    const matchesSearch = (
      (product.name || '').toLowerCase().includes(searchTerm) ||
      (product.description || '').toLowerCase().includes(searchTerm) ||
      (product.brand || '').toLowerCase().includes(searchTerm)
    );
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(product.category);
    const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(product.brand);
    return matchesSearch && matchesCategory && matchesBrand;
  });
  renderProducts(filtered);
}