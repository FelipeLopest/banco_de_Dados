// scripts.js

// Função para detectar se estamos no player.html ou index.html
const isPlayerPage = window.location.pathname.includes('player.html');

if (!isPlayerPage) {
    // === Código para index.html ===

    // Dropdown menu (igual ao seu)
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

    // Carrossel múltiplo
    document.addEventListener("DOMContentLoaded", function () {
        fetch('./jogos.json')
            .then(response => response.json())
            .then(jogos => {
                // Inicializa carrossel para 'twoplayer'
                initCarouselByCategory(jogos, 'carousel-twoplayer', 'twoplayer', 13, 7);
                // Inicializa carrossel para 'singleplayer' (vai ficar vazio se não houver jogos nessa categoria)
                initCarouselByCategory(jogos, 'carousel-singleplayer', 'singleplayer', 13, 7);
            })
            .catch(err => console.error('Erro ao carregar JSON:', err));

        function initCarouselByCategory(jogos, sectionId, categoriaFiltro, maxJogos = 13, cardsPerView = 7) {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const carousel = section.querySelector(".carousel-container");
            const track = carousel.querySelector(".carousel-track");
            const nextBtn = carousel.querySelector(".nextBtn");
            const prevBtn = carousel.querySelector(".prevBtn");

            // Filtra jogos da categoria
            const jogosFiltrados = jogos.filter(jogo =>
                jogo.categoria && jogo.categoria.trim().toLowerCase() === categoriaFiltro.toLowerCase()
            );

            const jogosParaCarrossel = jogosFiltrados.slice(0, maxJogos);
            track.innerHTML = '';

            jogosParaCarrossel.forEach(jogo => {
                const card = document.createElement('a');
                card.className = 'card';
                card.href = `player.html?jogo=${encodeURIComponent(jogo.id || '')}`;
                card.setAttribute('data-id', jogo.id || '');
                card.innerHTML = `<img class="jogo" src="${encodeURI(jogo.imagem)}" alt="${jogo.nome || 'Jogo'}">`;
                track.appendChild(card);
            });

            // Card "Ver Mais"
            const verMais = document.createElement('a');
            verMais.className = 'card ver-mais';
            verMais.href = `todos-jogos.html?categoria=${encodeURIComponent(categoriaFiltro)}`;
            verMais.textContent = 'Ver Mais';
            track.appendChild(verMais);

            const totalCards = track.querySelectorAll('.card').length;
            initCarouselUI(carousel, track, prevBtn, nextBtn, totalCards, cardsPerView);
        }

        function initCarouselUI(carousel, track, prevBtn, nextBtn, totalCards, cardsPerView) {
            let currentIndex = 0;
            const card = track.querySelector('.card');
            if (!card) return;

            const style = getComputedStyle(card);
            const marginRight = parseInt(style.marginRight) || 0;
            const cardWidth = card.offsetWidth + marginRight;

            function updateCarousel() {
                const maxIndex = totalCards - cardsPerView;
                currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

                const scrollAmount = currentIndex * cardWidth;
                track.style.transform = `translateX(-${scrollAmount}px)`;

                prevBtn.disabled = currentIndex === 0;
                nextBtn.disabled = currentIndex >= maxIndex;
            }

            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= cardsPerView;
                    updateCarousel();
                }
            });

            nextBtn.addEventListener('click', () => {
                if (currentIndex + cardsPerView < totalCards) {
                    currentIndex += cardsPerView;
                    updateCarousel();
                }
            });

            updateCarousel();
        }
    });


    // Carregar destaque e linhas laterais
    fetch('jogos.json')
        .then(response => response.json())
        .then(jogos => {
            const destaque = jogos[0];
            const destaqueDiv = document.getElementById("destaque");
            if (destaque) {
                destaqueDiv.innerHTML = `
                    <a href="player.html?jogo=${encodeURIComponent(destaque.id)}">
                        <img src="${destaque.imagem}" alt="${destaque.nome}">
                    </a>
                `;
            } else {
                destaqueDiv.innerHTML = '<p>Nenhum destaque disponível</p>';
            }

            const linha1 = document.getElementById("linha1");
            const linha2 = document.getElementById("linha2");
            linha1.innerHTML = '';
            linha2.innerHTML = '';

            // Pega os próximos 10 jogos (5 por linha)
            const jogosLaterais = jogos.slice(1, 11);

            jogosLaterais.forEach((jogo, index) => {
                const card = document.createElement("a");
                card.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
                card.className = "jogo";
                card.innerHTML = `<img src="${jogo.imagem}" alt="${jogo.nome}" title="${jogo.nome}">`;

                if (index < 5) {
                    linha1.appendChild(card);
                } else {
                    linha2.appendChild(card);
                }
            });

            if (linha1.children.length === 0) linha1.style.display = 'none';
            if (linha2.children.length === 0) linha2.style.display = 'none';
        })
        .catch(err => console.error('Erro ao carregar JSON:', err));


} else {
    // === Código para player.html ===

    document.addEventListener("DOMContentLoaded", () => {
        function getGameId() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('jogo');
            return id ? id.toLowerCase() : null; // Normaliza para lowercase
        }

        const gameId = getGameId();
        if (!gameId) {
            alert("Nenhum jogo selecionado.");
            return;
        }

        fetch('jogos.json')
            .then(response => response.json())
            .then(jogos => {
                // Busca id do jogo também normalizado
                const jogo = jogos.find(j => j.id.toLowerCase() === gameId);
                if (!jogo) {
                    alert("Jogo não encontrado.");
                    return;
                }

                const iframe = document.getElementById('game-frame');
                iframe.src = jogo.linkIframe || jogo.link || '';

                document.getElementById('game-title').textContent = jogo.nome || 'Título não disponível';
                document.getElementById('game-thumb').src = jogo.imagem;
                document.getElementById('game-thumb').alt = `Thumbnail do jogo ${jogo.nome}`;
                document.getElementById('game-description').textContent = jogo.descricao || 'Descrição não disponível.';
                document.getElementById('game-instruction').textContent = jogo.instrucoes || 'Instruções não disponíveis.';

                // Jogos relacionados (8 primeiros que não sejam o atual)
                const relatedGamesDiv = document.getElementById('related-games');
                relatedGamesDiv.innerHTML = '';

                const relatedGames = jogos.filter(j => j.id.toLowerCase() !== gameId).slice(0, 8);
                relatedGames.forEach(rj => {
                    const card = document.createElement('a');
                    card.href = `player.html?jogo=${encodeURIComponent(rj.id)}`;
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
        if (btnFull) {
            btnFull.addEventListener('click', () => {
                const iframe = document.getElementById('game-frame');
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen();
                } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen();
                }
            });
        }
    });
}
