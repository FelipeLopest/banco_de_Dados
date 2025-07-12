// Dropdown Menu
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');
const itensMenu = document.querySelectorAll('.dropdown-menu a');
const textoCategoria = document.getElementById('texto-categoria');
const iconCategoria = document.getElementById('icon-categoria');

dropdownBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', function (event) {
    if (!dropdownMenu.contains(event.target) && !dropdownBtn.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});

itensMenu.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const categoria = item.getAttribute('data-categoria');
        const icone = item.querySelector('i').cloneNode(true);
        textoCategoria.textContent = categoria;
        iconCategoria.innerHTML = '';
        iconCategoria.appendChild(icone);
        dropdownMenu.classList.remove('show');
    });
});

// ============ Carrossel Múltiplo ============ //



document.addEventListener("DOMContentLoaded", function () {
    const carousels = document.querySelectorAll(".carousel-container");

    carousels.forEach(carousel => {
        const track = carousel.querySelector(".carousel-track");
        const nextBtn = carousel.querySelector(".nextBtn");
        const prevBtn = carousel.querySelector(".prevBtn");

        const card = track.querySelector(".card");
        const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginRight);
        const visibleWidth = carousel.offsetWidth;

        const cardsPerView = Math.floor(visibleWidth / cardWidth);
        let currentIndex = 0;

        const totalCards = track.querySelectorAll(".card").length;

        function updateCarousel() {
            const maxIndex = totalCards - cardsPerView;
            currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
            const scrollAmount = currentIndex * cardWidth;
            track.style.transform = `translateX(-${scrollAmount}px)`;

            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }

        nextBtn.addEventListener("click", () => {
            currentIndex += cardsPerView;
            updateCarousel();
        });

        prevBtn.addEventListener("click", () => {
            currentIndex -= cardsPerView;
            updateCarousel();
        });

        updateCarousel();
    });
});
