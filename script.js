// ---------- script.js (ACTUALIZADO para usar backend) ----------

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
function renderProducts(productsToRender) {
  grid.innerHTML = '';
  if (!productsToRender || productsToRender.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--mid);">No se encontraron productos</p>';
    return;
  }

  const baseUrl = 'https://dc-phone.onrender.com';
  const placeholder = `${baseUrl}/images/placeholder.png`;

  productsToRender.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';

    // Contenedor de imagen
    const imgContainer = document.createElement('div');
    imgContainer.style.width = '100%';
    imgContainer.style.height = '200px';
    imgContainer.style.backgroundColor = '#f0f0f0';
    imgContainer.style.borderRadius = '8px';
    imgContainer.style.display = 'flex';
    imgContainer.style.alignItems = 'center';
    imgContainer.style.justifyContent = 'center';
    imgContainer.style.overflow = 'hidden';

    const img = document.createElement('img');
    img.src = `${baseUrl}/images/${product.imagen || ''}`;
    img.alt = product.name;
    img.loading = 'lazy';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';

    // Si la imagen falla, usar placeholder
    img.onerror = function() {
      img.src = placeholder;
    };

    imgContainer.appendChild(img);

    // Contenido debajo de la imagen
    const content = document.createElement('div');
    content.style.padding = '10px';
    content.style.textAlign = 'center';
    content.innerHTML = `
      <div class="name" style="min-height: 48px; font-weight:600;">${product.name}</div>
      <div class="price">${isAdminAuthenticated ? `<span>${product.price}</span>` : product.price}</div>
      <div class="availability ${product.available ? 'available' : 'not-available'}">
        ${product.available ? 'Disponible' : 'Agotado'}
      </div>
    `;

    card.appendChild(imgContainer);
    card.appendChild(content);

    // Abrir modal al hacer click
    card.addEventListener('click', () => openProductModal(product));
    grid.appendChild(card);
  });

  console.log(`Renderizados ${productsToRender.length} productos`);
}


// Agregar producto (POST a backend)
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

// Obtener promociones desde backend (si las tienes en DB)
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

// Crear promoción (POST)
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

// Login admin (verifica en tabla Usuario)
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

// ----------------- UI y render -----------------

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

// ----------------- Product modal & helpers -----------------
function openProductModal(product) {
  modalName.textContent = product.name;
  modalPrice.textContent = product.price;
  modalDescription.textContent = product.description || '';
  modalAvailability.textContent = product.available ? 'Disponible' : 'Agotado';
  modalAvailability.className = `availability ${product.available ? 'available' : 'not-available'}`;
  modalSpecs.innerHTML = '';
  (product.specs || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; modalSpecs.appendChild(li); });
  modalFeatures.innerHTML = '';
  (product.features || []).forEach(f => { const li = document.createElement('li'); li.textContent = f; modalFeatures.appendChild(li); });
  modalStock.textContent = `Stock: ${product.stock} unidades`;
  modalImage.src = product.image || 'images/placeholder.png';
  modalImage.alt = product.name;

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

function openModal(modalId) { document.getElementById(modalId).classList.add('open'); document.body.classList.add('modal-open'); }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('open'); document.body.classList.remove('modal-open'); }

// ----------------- Filtros y edición -----------------
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

function toggleProductAvailability(productId) {
  // cambiar flag de disponibilidad en servidor
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const newStatus = !product.available;
  fetch(`${API_BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: productId, esta_activo: newStatus ? 1 : 0, _action: 'toggle-active' })
  }).then(r => {
    if (r.ok) fetchProducts();
    else alert('No se pudo cambiar el estado');
  });
}

function editProduct(productId) {
  // puedes extender con modal, por ahora pedimos nuevo precio
  editProductPrice(productId);
}

function filterProducts() {
  const searchTerm = (searchInput.value || '').toLowerCase();
  const filtered = products.filter(product => {
    const matchesSearch = (
      (product.name || '').toLowerCase().includes(searchTerm) ||
      (product.description || '').toLowerCase().includes(searchTerm)
    );
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(product.category);
    const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(product.brand);
    return matchesSearch && matchesCategory && matchesBrand;
  });
  renderProducts(filtered);
}

// ----------------- Categorías (tu versión mejorada) -----------------
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

// ----------------- Agregar producto desde admin (modal ligero) -----------------
function openAddProductModal() {
  if (!isAdminAuthenticated) { alert('Inicia sesión como admin para agregar productos'); return; }
  // Pedimos con prompts para que no haga falta tocar HTML del modal (más simple)
  const nombre = prompt('Nombre del producto:');
  if (!nombre) return;
  const marca = prompt('Marca:');
  const modelo = prompt('Modelo:');
  const descripcion = prompt('Descripción:');
  const precio = prompt('Precio (solo número):');
  const stock = prompt('Stock (número):');
  const imagen = prompt('URL imagen (opcional):');

  const nuevo = {
    nombre, marca, modelo, descripcion,
    precio: precio ? Number(precio) : null,
    stock: stock ? Number(stock) : 0,
    id_categoria: 1, // puedes pedir categoría en otro prompt o mapear según marca
    imagen: imagen || null,
    esta_activo: 1
  };

  addProductToServer(nuevo);
}

// ----------------- Promociones (envío) -----------------
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

// Mostrar promociones iniciales (usa servidor si responde)
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

// ----------------- Admin login -----------------
async function handleAdminSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value;
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  const resp = await loginAdminServer({ user, email, password });
  if (resp && resp.success) {
    isAdminAuthenticated = true;
    localStorage.setItem('adminAuthenticated', 'true');
    updateAdminUI();
    alert('Acceso de administrador concedido');
    e.target.reset();
    closeModal('admin-modal');
    showAdminPanel();
  } else {
    alert('Credenciales incorrectas');
  }
}

function updateAdminUI() {
  const adminBtnEl = document.getElementById('adminBtn');
  if (isAdminAuthenticated) {
    adminBtnEl.innerHTML = '<i>👑</i> Admin (Conectado)';
    adminBtnEl.style.color = '#4CAF50';
    showAdminOptions();
  } else {
    adminBtnEl.innerHTML = '<i>⚙️</i> Admin';
    adminBtnEl.style.color = '';
    hideAdminOptions();
  }
}

function showAdminOptions() {
  let addProductBtn = document.getElementById('addProductBtn');
  if (!addProductBtn) {
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

// Check auth persisted
function checkAdminAuth() {
  const auth = localStorage.getItem('adminAuthenticated');
  if (auth === 'true') { isAdminAuthenticated = true; updateAdminUI(); }
}
checkAdminAuth();
