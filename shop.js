// Supabase initialization
const supabaseUrl = 'https://fonymocqudgjjptrqrou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbnltb2NxdWRnampwdHJxcm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDk4MDcsImV4cCI6MjA2ODUyNTgwN30.tmIQccwabCu4s7DS3XXPrTW-6jDBwEPzhcnn-aiHO3k';

// Use window.supabase to avoid "before initialization" error
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalLink = document.getElementById('modal-link');

  let productsCache = [];

  function openModal(product) {
    modalImg.src = product.image_url;
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.description;
    modalLink.href = product.amazon_link;
    document.querySelector('.modal-price').textContent = 'Price: ' + (product.price || '');
    document.querySelector('.modal-rating').textContent = 'Ratings: ' + (product.rating || '');
    document.querySelector('.modal-info').innerHTML =
      'Ships from: ' + (product.ships_from || '') + '<br>' +
      'Sold by: <span class="seller-link">' + (product.sold_by || '') + '</span><br>' +
      'Returns: ' + (product.returns_policy || '');
    modal.style.display = 'flex';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  function setupCategoryFiltering() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.onclick = function() {
        const tag = btn.getAttribute('data-tag');
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
          if (tag === 'All' || card.getAttribute('data-tags').includes(tag)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      };
    });
    const allBtn = document.querySelector('.category-btn[data-tag="All"]');
    if (allBtn) allBtn.classList.add('active');
  }

  async function renderShopProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    let products = [];
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      products = data || [];
    } catch (e) {
      grid.innerHTML = '<div style="text-align:center;color:#888;width:100%;">Failed to load products.</div>';
      return;
    }
    productsCache = products;
    if (!products.length) {
      grid.innerHTML = '<div style="text-align:center;color:#888;width:100%;">No products available.</div>';
      return;
    }
    grid.innerHTML = '';
    products.forEach((product, idx) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('data-tags', product.tag);
      card.setAttribute('data-idx', idx);
      card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <a href="${product.amazon_link}" target="_blank" class="buy-btn">Buy on Amazon</a>
      `;
      card.onclick = function(e) {
        if (!e.target.classList.contains('buy-btn')) {
          openModal(product);
        }
      };
      grid.appendChild(card);
    });
    setupCategoryFiltering();
  }

  renderShopProducts();

  document.getElementById('product-grid').addEventListener('click', function(e) {
    const btn = e.target.closest('.buy-btn');
    if (btn) {
      const d = new Date();
      const key = 'buyclicks_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
      let count = +(localStorage.getItem(key) || 0);
      localStorage.setItem(key, count+1);

      const card = btn.closest('.product-card');
      const idx = card ? card.getAttribute('data-idx') : null;
      const name = (idx !== null && productsCache[idx]) ? productsCache[idx].name : (card ? card.querySelector('h3').textContent : '');
      let log = JSON.parse(localStorage.getItem('buyclicks_log') || '[]');
      log.push({product: name, timestamp: Date.now()});
      localStorage.setItem('buyclicks_log', JSON.stringify(log));
    }
  });
});
