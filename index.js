document.addEventListener("DOMContentLoaded", () => {
    // Dropdown menu
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const itensMenu = document.querySelectorAll('.dropdown-menu a');
    const textoCategoria = document.getElementById('texto-categoria');
    const iconCategoria = document.getElementById('icon-categoria');

    // Atualizar texto e ícone do dropdown no clique, e ir para jogos.html com categoria
    itensMenu.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = item.getAttribute('data-categoria');
            const icone = item.querySelector('i').cloneNode(true);
            textoCategoria.textContent = categoria;
            iconCategoria.innerHTML = '';
            iconCategoria.appendChild(icone);
            dropdownMenu.classList.remove('show');

            const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
            window.location.href = `jogos.html?categoria=${encodeURIComponent(categoriaURL)}`;
        });
    });

    dropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function (event) {
        if (!dropdownMenu.contains(event.target) && !dropdownBtn.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // --- Barra de pesquisa ---
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('barra-pesquisa');

    // Container para resultados da pesquisa (dropdown abaixo do input)
    const resultsContainer = document.createElement('div');
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.backgroundColor = '#06016c';
    resultsContainer.style.color = 'white';
    resultsContainer.style.width = '400px'; // largura menor, ajuste o valor que quiser
    resultsContainer.style.maxHeight = '300px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.borderRadius = '8px';
    resultsContainer.style.top = (searchInput.offsetTop + searchInput.offsetHeight) + 'px';
    resultsContainer.style.left = '50%';    // posiciona no meio do form
    resultsContainer.style.transform = 'translateX(-50%)'; // ajusta para ficar centralizado
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.display = 'none';  // ESCONDIDO inicialmente
    resultsContainer.style.padding = '8px 10px';
    resultsContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
    resultsContainer.style.flexWrap = 'wrap';
    resultsContainer.style.gap = '8px';

    searchForm.style.position = 'relative'; // Para o absolute funcionar
    searchForm.appendChild(resultsContainer);

    let jogosCache = [];

    // Carrega o JSON uma vez no início e guarda em cache
    fetch('jogos.json')
        .then(res => res.json())
        .then(data => {
            jogosCache = data;
        })
        .catch(err => {
            console.error('Erro ao carregar jogos para busca:', err);
        });

    // Função que mostra resultados no dropdown com imagens lado a lado
    function mostrarResultados(listaJogos) {
        resultsContainer.innerHTML = '';
        if (listaJogos.length === 0) {
            resultsContainer.style.display = 'none';  // Esconde se não tem resultado
            return;
        }

        listaJogos.forEach(jogo => {
            const item = document.createElement('a');
            item.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
            item.title = jogo.nome;
            item.style.display = 'inline-block';
            item.style.width = '120px';
            item.style.height = '70px';
            item.style.borderRadius = '8px';
            item.style.overflow = 'hidden';
            item.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
            item.style.transition = 'transform 0.25s ease';
            item.style.cursor = 'pointer';

            const img = document.createElement('img');
            img.src = jogo.imagem;
            img.alt = jogo.nome;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';

            item.appendChild(img);

            item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.05)');
            item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');

            resultsContainer.appendChild(item);
        });

        const searchInput = document.getElementById("search");

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault(); // Impede o envio do formulário ou qualquer ação padrão
            }
        });

        const form = document.getElementById("barra-pesquisa");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
        });


        resultsContainer.style.display = 'flex';  // MOSTRA quando tem resultados
    }

    // Evento input na busca
    searchInput.addEventListener('input', () => {
        const texto = searchInput.value.trim().toLowerCase();
        if (texto.length < 1) {
            resultsContainer.style.display = 'none';  // Esconde se vazio
            return;
        }

        // Busca parcial, case insensitive no nome do jogo
        const resultados = jogosCache.filter(jogo =>
            jogo.nome.toLowerCase().includes(texto)
        );

        mostrarResultados(resultados.slice(0, 10)); // Limite 10 resultados para dropdown
    });

    // Esconde resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    // Evita o submit do form para não recarregar a página
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const texto = searchInput.value.trim().toLowerCase();
        if (texto.length === 0) return;

        // Redireciona para página de busca
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });


    // Carrossel múltiplo
    fetch('./jogos.json')
        .then(response => response.json())
        .then(jogos => {
            // Inicializa carrossel para 'twoplayer'
            initCarouselByCategory(jogos, 'carousel-twoplayer', 'twoplayer', 13, 7);
            // Inicializa carrossel para 'singleplayer'
            initCarouselByCategory(jogos, 'carousel-singleplayer', 'singleplayer', 13, 7);

            // Carregar destaque e linhas laterais depois do JSON carregado
            carregarDestaques(jogos);

            // Mostra o conteúdo da página após carregar tudo (para evitar flash)
            document.body.classList.add('loaded');
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
        verMais.href = `catalogo.html?categoria=${encodeURIComponent(categoriaFiltro)}`;
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

    function carregarDestaques(jogos) {
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
    }
});
