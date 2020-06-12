// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")


// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)


// ----------------------------------------------------
// Note(lewagon): ABOVE IS RAILS DEFAULT CONFIGURATION
// WRITE YOUR OWN JS STARTING FROM HERE 👇
// ----------------------------------------------------

// External imports
import "bootstrap";

// Internal imports, e.g:
// import { initSelect2 } from '../components/init_select2';

// if ('paintWorklet' in CSS) {
//   CSS.paintWorklet.addModule('packs/highlighter.js');
//   }



document.addEventListener('turbolinks:load', () => {
  // Call your functions here, e.g:
  // initSelect2();
});

let burger = document.getElementById('burger'),
    nav    = document.getElementById('main-nav'),
    slowmo = document.getElementById('slowmo');

burger.addEventListener('click', function(e){
  this.classList.toggle('is-open');
  nav.classList.toggle('is-open');
});


/* Onload demo - dirty timeout */
let clickEvent = new Event('click');

window.addEventListener('load', function(e) {
  slowmo.dispatchEvent(clickEvent);
  burger.dispatchEvent(clickEvent);

  setTimeout(function(){
    burger.dispatchEvent(clickEvent);

    setTimeout(function(){
      slowmo.dispatchEvent(clickEvent);
    }, 3500);
  }, 5500);
});




