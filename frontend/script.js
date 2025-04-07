let gallerySlider = new Swiper('.gallery-slider', {
  pagination: {
     el: '.swiper-pagination',
     type: 'bullets',
     clickable: true
  },
  navigation: {
     nextEl: '.swiper-button-next',
     prevEl: '.swiper-button-prev',
  },
  effect: 'coverflow',
  loop: true,
  centeredSlides: true,
  slidesPerView: 2.5,
  coverflowEffect: {
    rotate: 0,
    stretch: 100,
    depth: 150,
    modifier: 1.5,
    slideShadows: false,
  }
  });



// let scrollAmount = 0;
// const scrollStep = 200;
// const carousel = document.querySelector('.carousel');

// function scrollLeft() {
//   scrollAmount -= scrollStep;
//   if (scrollAmount < 0) {
//     scrollAmount = 0;
//   }
//   carousel.style.transform = `translateX(-${scrollAmount}px)`;
// }

// function scrollRight() {  
//   scrollAmount += scrollStep;
//   if (scrollAmount > carousel.scrollWidth - carousel.clientWidth) {
//     scrollAmount = 0;
//   }
//   carousel.style.transform = `translateX(-${scrollAmount}px)`;
// }


// // 3d
// let radius = 600;
// let imgWidth = 180;
// let imgHeight = 240; 
// let autoRotate = true; 
// let rotateSpeed = -60;

// let bgMusicURL = 'https://api.soundcloud.com/tracks/143041228/stream?client_id=587aa2d384f7333a886010d5f52f302a';
// let bgMusicControls = true; 


// setTimeout(init, 1000);

// let odrag = document.getElementById('drag-container');
// let ospin = document.getElementById('spin-container');
// let aImg = ospin.getElementsByTagName('img');
// let aVid = ospin.getElementsByTagName('video');
// let aEle = [...aImg, ...aVid]; 

// ospin.style.width = imgWidth + "px";
// ospin.style.height = imgHeight + "px";

// let ground = document.getElementById('ground');
// ground.style.width = radius * 3 + "px";
// ground.style.height = radius * 3 + "px";

// function init(delayTime) {
//   for (let i = 0; i < aEle.length; i++) {
//     aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)";
//     aEle[i].style.transition = "transform 1s";
//     aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
//   }
// }

// function applyTranform(obj) {
//   if(tY > 180) tY = 180;
//   if(tY < 0) tY = 0;

//   obj.style.transform = "rotateX(" + (-tY) + "deg) rotateY(" + (tX) + "deg)";
// }

// function playSpin(yes) {
//   ospin.style.animationPlayState = (yes?'running':'paused');
// }

// let sX, sY, nX, nY, desX = 0,
//     desY = 0,
//     tX = 0,
//     tY = 10;

// if (autoRotate) {
//   let animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
//   ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
// }

// if (bgMusicURL) {
//   document.getElementById('music-container').innerHTML += `
// <audio src="${bgMusicURL}" ${bgMusicControls? 'controls': ''} autoplay loop>    
// <p>If you are reading this, it is because your browser does not support the audio element.</p>
// </audio>
// `;
// }

// document.onpointerdown = function (e) {
//   clearInterval(odrag.timer);
//   e = e || window.event;
//   let sX = e.clientX,
//       sY = e.clientY;

//   this.onpointermove = function (e) {
//     e = e || window.event;
//     let nX = e.clientX,
//         nY = e.clientY;
//     desX = nX - sX;
//     desY = nY - sY;
//     tX += desX * 0.1;
//     tY += desY * 0.1;
//     applyTranform(odrag);
//     sX = nX;
//     sY = nY;
//   };

//   this.onpointerup = function (e) {
//     odrag.timer = setInterval(function () {
//       desX *= 0.95;
//       desY *= 0.95;
//       tX += desX * 0.1;
//       tY += desY * 0.1;
//       applyTranform(odrag);
//       playSpin(false);
//       if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
//         clearInterval(odrag.timer);
//         playSpin(true);
//       }
//     }, 17);
//     this.onpointermove = null;
//     this.onpointerup = null;
//   };
  
//   return false;
// };

// document.onmousewheel = function(e) {
//   e = e || window.event;
//   let d = e.wheelDelta / 20 || -e.detail;
//   radius += d;
//   init(1);
// };

// function openDetailsPage(image) {
//   localStorage.setItem('selectedImage', image);
//   window.location.href = 'details.html';  
// }


