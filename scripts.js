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
    // Elementos do carrossel
    const carousel = document.querySelector(".carousel-container");
    const track = carousel.querySelector(".carousel-track");
    const nextBtn = carousel.querySelector(".nextBtn");
    const prevBtn = carousel.querySelector(".prevBtn");

    let currentIndex = 0;
    let cardsPerView = 0;
    let cardWidth = 0;
    let totalCards = 0;

    // Função para carregar os jogos no carrossel via JSON
    fetch('./jogos.json')
        .then(response => response.json())
        .then(jogos => {
            // Limpa track antes de preencher
            track.innerHTML = '';

            // Para cada jogo cria um card (link com img)
            jogos.forEach(jogo => {
                const card = document.createElement('a');
                card.className = 'card';
                card.href = `player.html?jogo=${jogo.id}`;
                card.setAttribute('data-id', jogo.id || '');

                // Imagem do jogo
                card.innerHTML = `<img class="jogo" src="${jogo.imagem}" alt="${jogo.nome}">`;

                track.appendChild(card);
            });

            // Após inserir cards, inicializa variáveis e botão
            initCarousel();
        })
        .catch(err => console.error('Erro ao carregar JSON:', err));

    function initCarousel() {
        const card = track.querySelector('.card');
        if (!card) return;

        cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginRight);
        const visibleWidth = carousel.offsetWidth;
        totalCards = track.querySelectorAll('.card').length;
        cardsPerView = Math.floor(visibleWidth / cardWidth);
        currentIndex = 0;

        updateCarousel();

        // Event listeners dos botões
        nextBtn.addEventListener('click', () => {
            currentIndex += cardsPerView;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex -= cardsPerView;
            updateCarousel();
        });

        // Atualiza estado dos botões e posição do track
        function updateCarousel() {
            const maxIndex = totalCards - cardsPerView;
            currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
            const scrollAmount = currentIndex * cardWidth;
            track.style.transform = `translateX(-${scrollAmount}px)`;

            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }
    }
});



const cards = document.querySelectorAll('.card');
const mainContent = document.getElementById('main-content');
const gameScreen = document.getElementById('game-screen');
const gameIframe = document.getElementById('game-iframe');
const closeGameBtn = document.getElementById('close-game');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        if (url) {
            // Esconde o conteúdo principal
            mainContent.style.display = 'none';

            // Mostra a tela do jogo
            gameScreen.style.display = 'flex';

            // Define o iframe do jogo
            gameIframe.src = url;
        }
    });
});

closeGameBtn.addEventListener('click', () => {
    // Limpa iframe e esconde tela do jogo
    gameIframe.src = '';
    gameScreen.style.display = 'none';

    // Mostra o conteúdo principal de novo
    mainContent.style.display = 'block';
});

fetch('jogos.json')
    .then(response => response.json())
    .then(jogos => {
        // Pegar o primeiro jogo como destaque
        const destaque = jogos[0];
        const destaqueDiv = document.getElementById("destaque");
        destaqueDiv.innerHTML = `
      <a href="${destaque.link}">
        <img src="${destaque.imagem}" alt="${destaque.nome}">
      </a>
    `;

        // Preencher as linhas com os demais jogos (em grupos de 5)
        const linha1 = document.getElementById("linha1");
        const linha2 = document.getElementById("linha2");

        const jogosLaterais = jogos.slice(1); // ignora o primeiro (destaque)

        jogosLaterais.forEach((jogo, index) => {
            const card = document.createElement("a");
            card.href = `player.html?jogo=${jogo.id}`;
            card.className = "jogo";
            card.innerHTML = `<img src="${jogo.imagem}" alt="${jogo.nome}" title="${jogo.nome}">`;

            if (index < 5) {
                linha1.appendChild(card);
            } else {
                linha2.appendChild(card);
            }
        });
    });

document.addEventListener("DOMContentLoaded", () => {

    function getGameId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('jogo'); // parâmetro da URL é 'jogo'
    }

    const gameId = getGameId();
    if (!gameId) {
        console.log("Nenhum jogo selecionado via URL.");
        // Aqui você pode mostrar uma mensagem na página ou ocultar o player, se quiser.
        return;
    }

    fetch('jogos.json')
        .then(response => response.json())
        .then(jogos => {
            const jogo = jogos.find(j => j.id === gameId);
            if (!jogo) {
                alert("Jogo não encontrado.");
                return;
            }

            // Preencher iframe
            const iframe = document.getElementById('game-frame');
            iframe.src = jogo.link !== "" ? jogo.link : ""; // Ajuste aqui para colocar o link do jogo real (exemplo: URL do jogo em iframe)

            // Preencher título, thumb, descrição, instruções
            document.getElementById('game-title').textContent = jogo.nome;
            document.getElementById('game-thumb').src = jogo.imagem;
            document.getElementById('game-thumb').alt = `Thumbnail do jogo ${jogo.nome}`;
            document.getElementById('game-description').textContent = jogo.descricao || 'Descrição não disponível.';
            document.getElementById('game-instruction').textContent = jogo.instrucoes || 'Instruções não disponíveis.';

            // Preencher jogos relacionados
            const relatedGamesDiv = document.getElementById('related-games');
            relatedGamesDiv.innerHTML = ''; // limpa

            const relatedGames = jogos.filter(j => j.id !== gameId).slice(0, 8); // pega até 8 relacionados

            relatedGames.forEach(rj => {
                const card = document.createElement('a');
                card.href = `player.html?jogo=${rj.id}`;
                card.className = 'game-1';
                card.title = rj.nome;
                card.innerHTML = `<img src="${rj.imagem}" alt="${rj.nome}">`;
                relatedGamesDiv.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Erro ao carregar jogos:', err);
            alert('Erro ao carregar dados do jogo.');
        });

    // Botão fullscreen
    const btnFull = document.getElementById('btn-full');
    btnFull.addEventListener('click', () => {
        const iframe = document.getElementById('game-frame');
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { /* Safari */
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { /* IE11 */
            iframe.msRequestFullscreen();
        }
    });
});
