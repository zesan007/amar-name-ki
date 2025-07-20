// Smooth scroll for nav links
const navLinks = document.querySelectorAll('.nav-links a, .cta-btn');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Product card hover effect (pulse)
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 12px 36px rgba(76, 70, 255, 0.18)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});

// Product slider functionality
const sliderTrack = document.querySelector('.slider-track');
const sliderItems = document.querySelectorAll('.slider-item');
const leftArrow = document.querySelector('.slider-arrow-left');
const rightArrow = document.querySelector('.slider-arrow-right');
let sliderIndex = 0;

function updateSlider() {
  sliderTrack.style.transform = `translateX(-${sliderIndex * 100}%)`;
}

leftArrow.addEventListener('click', () => {
  sliderIndex = (sliderIndex - 1 + sliderItems.length) % sliderItems.length;
  updateSlider();
});
rightArrow.addEventListener('click', () => {
  sliderIndex = (sliderIndex + 1) % sliderItems.length;
  updateSlider();
});

// Automatic slider change every 10 seconds
setInterval(() => {
  sliderIndex = (sliderIndex + 1) % sliderItems.length;
  updateSlider();
}, 10000);

// Optional: swipe support for mobile
let startX = 0;
sliderTrack.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});
sliderTrack.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) {
    leftArrow.click();
  } else if (startX - endX > 50) {
    rightArrow.click();
  }
});

// Product carousel functionality
const carouselTrack = document.querySelector('.product-carousel-track');
const carouselCards = document.querySelectorAll('.product-carousel-track .product-card');
const carouselLeft = document.querySelector('.product-carousel-arrow-left');
const carouselRight = document.querySelector('.product-carousel-arrow-right');
let carouselIndex = 0;

function getVisibleCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function updateCarousel() {
  const visibleCount = getVisibleCount();
  const cardWidth = carouselCards[0].offsetWidth + 32; // 32px gap (2rem)
  // Clamp index to valid range
  if (carouselIndex > carouselCards.length - visibleCount) {
    carouselIndex = 0;
  }
  if (carouselIndex < 0) {
    carouselIndex = carouselCards.length - visibleCount;
  }
  carouselTrack.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
}

carouselLeft.addEventListener('click', () => {
  const visibleCount = getVisibleCount();
  carouselIndex -= visibleCount;
  if (carouselIndex < 0) {
    carouselIndex = carouselCards.length - visibleCount;
  }
  updateCarousel();
});
carouselRight.addEventListener('click', () => {
  const visibleCount = getVisibleCount();
  carouselIndex += visibleCount;
  if (carouselIndex > carouselCards.length - visibleCount) {
    carouselIndex = 0;
  }
  updateCarousel();
});

window.addEventListener('resize', updateCarousel);
updateCarousel();

// Global Buy on Amazon click tracker (works on all pages)
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.buy-btn');
    if (btn) {
      // Increment buyclicks counter for today
      const d = new Date();
      const key = 'buyclicks_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
      let count = +(localStorage.getItem(key) || 0);
      localStorage.setItem(key, count+1);
      // Log click with timestamp and product name (if available)
      let name = '';
      const card = btn.closest('.product-card');
      if (card) {
        const h3 = card.querySelector('h3');
        if (h3) name = h3.textContent;
      }
      let log = JSON.parse(localStorage.getItem('buyclicks_log') || '[]');
      log.push({product: name, timestamp: Date.now()});
      localStorage.setItem('buyclicks_log', JSON.stringify(log));
    }
  });
});
