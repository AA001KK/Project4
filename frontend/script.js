// Carousel harakatini dinamik qilish uchun
const carousel = document.querySelector('.carousel');
const texts = document.querySelectorAll('.carousel p');
const leftArrow = document.querySelector('.left');
const rightArrow = document.querySelector('.right');

let index = 0;

// Matnlarni o‘ngga va chapga o'tkazish
function updateCarousel() {
  const offset = -index * texts[0].offsetWidth;
  carousel.style.transform = `translateX(${offset}px)`;
}

// O‘ng strelka bosilganda
rightArrow.addEventListener('click', () => {
  if (index < texts.length - 1) {
    index++;
  } else {
    index = 0;
  }
  updateCarousel();
});

// Chap strelka bosilganda
leftArrow.addEventListener('click', () => {
  if (index > 0) {
    index--;
  } else {
    index = texts.length - 1;
  }
  updateCarousel();
});

// Avtomatik slayder funksiyasi
setInterval(() => {
  if (index < texts.length - 1) {
    index++;
  } else {
    index = 0;
  }
  updateCarousel();
}, 5000);

