let scrollAmount = 0;
const scrollStep = 200;
const carousel = document.querySelector('.carousel');

function scrollLeft() {
  scrollAmount -= scrollStep;
  if (scrollAmount < 0) {
    scrollAmount = 0;
  }
  carousel.style.transform = `translateX(-${scrollAmount}px)`;
}

function scrollRight() {  
  scrollAmount += scrollStep;
  if (scrollAmount > carousel.scrollWidth - carousel.clientWidth) {
    scrollAmount = 0;
  }
  carousel.style.transform = `translateX(-${scrollAmount}px)`;
}

