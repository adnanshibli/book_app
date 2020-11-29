const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const overlay = document.getElementById('optionsCont');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
   
    overlay.classList.toggle('hide');
});