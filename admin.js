// --- Supabase config ---
const supabaseUrl = 'https://fonymocqudgjjptrqrou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbnltb2NxdWRnampwdHJxcm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDk4MDcsImV4cCI6MjA2ODUyNTgwN30.tmIQccwabCu4s7DS3XXPrTW-6jDBwEPzhcnn-aiHO3k';

// --- Admin Login System ---
const ADMIN_USER = 'zesan007';
const ADMIN_PASS = 'zesan@00769';

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminLogin = document.getElementById('admin-login');
const adminPanel = document.getElementById('admin-panel');

if (loginForm) {
  loginForm.onsubmit = function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      adminLogin.style.display = 'none';
      adminPanel.style.display = 'flex';
      loginError.textContent = '';
    } else {
      loginError.textContent = 'Invalid username or password';
    }
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // --- Sidebar Navigation ---
  const navProducts = document.getElementById('nav-products');
  const navStats = document.getElementById('nav-stats');
  const navLogout = document.getElementById('nav-logout');
  const productsSection = document.getElementById('products-section');
  const statsSection = document.getElementById('stats-section');
  // Do NOT set adminPanel.style.display = 'flex' here!
  if (navProducts && navStats && navLogout) {
    navProducts.onclick = function () {
      navProducts.classList.add('active');
      navStats.classList.remove('active');
      productsSection.style.display = '';
      statsSection.style.display = 'none';
    };
    navStats.onclick = function () {
      navStats.classList.add('active');
      navProducts.classList.remove('active');
      productsSection.style.display = 'none';
      statsSection.style.display = '';
      updateStats();
    };
    navLogout.onclick = function () {
      location.reload();
    };
  }

  const productsList = document.getElementById('products-list');
  const addProductBtn = document.getElementById('add-product-btn');
  const productFormModal = document.getElementById('product-form-modal');
  const productForm = document.getElementById('product-form');
  const cancelProductBtn = document.getElementById('cancel-product-btn');
  let editId = null;

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  async function addProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product]);
    if (error) alert('Error adding product: ' + error.message);
    return data;
  }

  async function updateProduct(id, product) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);
    if (error) alert('Error updating product: ' + error.message);
    return data;
  }

  async function deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) alert('Error deleting product: ' + error.message);
    return data;
  }

  async function renderProducts() {
    const products = await fetchProducts();
    productsList.innerHTML = '';
    if (!products.length) {
      productsList.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">No products yet.</td></tr>';
      return;
    }
    products.forEach((p) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${p.image_url}" alt="${p.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;"></td>
        <td>${p.name}</td>
        <td>${p.tag}</td>
        <td>${p.price || ''}</td>
        <td>
          <button data-edit="${p.id}" class="admin-table-action">Edit</button>
          <button data-delete="${p.id}" class="admin-table-action admin-table-action-delete">Delete</button>
        </td>
      `;
      productsList.appendChild(row);
    });
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = async function () {
        editId = +btn.getAttribute('data-edit');
        const products = await fetchProducts();
        const product = products.find(p => p.id === editId);
        openProductForm(product, 'Edit Product');
      };
    });
    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = async function () {
        const id = +btn.getAttribute('data-delete');
        if (confirm('Delete this product?')) {
          await deleteProduct(id);
          renderProducts();
        }
      };
    });
  }

  function openProductForm(product, title) {
    productForm.reset();
    document.getElementById('product-form-title').textContent = title || 'Add Product';
    productFormModal.style.display = 'flex';
    const tagSelect = document.getElementById('product-tags');
    if (tagSelect) tagSelect.value = '';
    if (product) {
      document.getElementById('product-image').value = product.image_url;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-desc').value = product.description;
      if (product.tag && tagSelect) tagSelect.value = product.tag;
      document.getElementById('product-link').value = product.amazon_link;
      document.getElementById('product-price').value = product.price || '';
      document.getElementById('product-ratings').value = product.rating || '';
      document.getElementById('product-ships').value = product.ships_from || '';
      document.getElementById('product-soldby').value = product.sold_by || '';
      document.getElementById('product-returns').value = product.returns_policy || '';
    }
  }

  function closeProductForm() {
    productFormModal.style.display = 'none';
    editId = null;
  }

  if (addProductBtn) addProductBtn.onclick = () => { editId = null; openProductForm(null, 'Add Product'); };
  if (cancelProductBtn) cancelProductBtn.onclick = closeProductForm;

  if (productForm) {
    productForm.onsubmit = async function (e) {
      e.preventDefault();
      const tagSelect = document.getElementById('product-tags');
      const tags = tagSelect ? tagSelect.value : '';
      const product = {
        image_url: document.getElementById('product-image').value.trim(),
        name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('product-desc').value.trim(),
        tag: tags,
        amazon_link: document.getElementById('product-link').value.trim(),
        price: document.getElementById('product-price').value.trim(),
        rating: document.getElementById('product-ratings').value.trim(),
        ships_from: document.getElementById('product-ships').value.trim(),
        sold_by: document.getElementById('product-soldby').value.trim(),
        returns_policy: document.getElementById('product-returns').value.trim(),
      };
      if (editId !== null) {
        await updateProduct(editId, product);
      } else {
        await addProduct(product);
      }
      renderProducts();
      closeProductForm();
    };
  }

  function getTodayKey(base) {
    const d = new Date();
    return base + '_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate();
  }

  function getTodayCount(key) {
    return +(localStorage.getItem(getTodayKey(key)) || 0);
  }

  function setTodayCount(key, val) {
    localStorage.setItem(getTodayKey(key), val);
  }

  function updateStats() {
    document.getElementById('visitor-count').textContent = getTodayCount('visitors');
    document.getElementById('buy-count').textContent = getTodayCount('buyclicks');
  }

  function getBuyClicksLog() {
    return JSON.parse(localStorage.getItem('buyclicks_log') || '[]');
  }

  function getTopProductLast10Min() {
    const now = Date.now();
    const log = getBuyClicksLog().filter(e => now - e.timestamp <= 10 * 60 * 1000);
    if (!log.length) return null;
    const countMap = {};
    log.forEach(e => { countMap[e.product] = (countMap[e.product] || 0) + 1; });
    let top = null, max = 0;
    for (const [product, count] of Object.entries(countMap)) {
      if (count > max) { top = product; max = count; }
    }
    return { product: top, count: max };
  }

  function updateTopProductCard() {
    const top = getTopProductLast10Min();
    const el = document.getElementById('top-product-content');
    if (!el) return;
    if (!top) el.textContent = 'No data yet.';
    else el.textContent = `${top.product} (${top.count} clicks in last 10 min)`;
  }

  setInterval(updateTopProductCard, 60 * 1000);
  updateTopProductCard();

  function getVisitorLog() {
    const days = 31;
    const now = new Date();
    let total = 0, today = 0, week = 0, month = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = 'visitors_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate();
      const count = +(localStorage.getItem(key) || 0);
      total += count;
      if (i === 0) today = count;
      if (i < 7) week += count;
      if (d.getMonth() === now.getMonth()) month += count;
    }
    return { today, week, month, total };
  }

  function updateVisitorStatsCard() {
    const stats = getVisitorLog();
    const elToday = document.getElementById('visitor-today');
    const elWeek = document.getElementById('visitor-week');
    const elMonth = document.getElementById('visitor-month');
    const elTotal = document.getElementById('visitor-total');
    if (elToday) elToday.textContent = stats.today;
    if (elWeek) elWeek.textContent = stats.week;
    if (elMonth) elMonth.textContent = stats.month;
    if (elTotal) elTotal.textContent = stats.total;
  }

  updateVisitorStatsCard();
  setInterval(updateVisitorStatsCard, 60 * 1000);

  (function () {
    const key = getTodayKey('visitors');
    let count = +(localStorage.getItem(key) || 0);
    localStorage.setItem(key, count + 1);
  })();

  function getBuyClicksLogByDay() {
    const days = 31;
    const now = new Date();
    let total = 0, today = 0, week = 0, month = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = 'buyclicks_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate();
      const count = +(localStorage.getItem(key) || 0);
      total += count;
      if (i === 0) today = count;
      if (i < 7) week += count;
      if (d.getMonth() === now.getMonth()) month += count;
    }
    return { today, week, month, total };
  }

  function updateBuyClicksStatsCard() {
    const stats = getBuyClicksLogByDay();
    const elToday = document.getElementById('buy-today');
    const elWeek = document.getElementById('buy-week');
    const elMonth = document.getElementById('buy-month');
    const elTotal = document.getElementById('buy-total');
    if (elToday) elToday.textContent = stats.today;
    if (elWeek) elWeek.textContent = stats.week;
    if (elMonth) elMonth.textContent = stats.month;
    if (elTotal) elTotal.textContent = stats.total;
  }

  updateBuyClicksStatsCard();
  setInterval(updateBuyClicksStatsCard, 60 * 1000);

  renderProducts();
});
