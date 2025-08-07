document.addEventListener("DOMContentLoaded", () => {
    // Elementos dropdown
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const itensMenu = dropdownMenu ? dropdownMenu.querySelectorAll('a') : [];
    const textoCategoria = document.getElementById('texto-categoria');
    const iconCategoria = document.getElementById('icon-categoria');

    // Função segura para atualizar dropdown e navegar
    function atualizarCategoria(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const categoriaRaw = item.getAttribute('data-categoria') || '';
        const categoria = categoriaRaw.trim();
        if (!categoria) return;

        // Clona ícone para atualizar
        const icone = item.querySelector('i')?.cloneNode(true) || null;
        if (textoCategoria) textoCategoria.textContent = categoria;
        if (iconCategoria) {
            iconCategoria.innerHTML = '';
            if (icone) iconCategoria.appendChild(icone);
        }
        if (dropdownMenu) dropdownMenu.classList.remove('show');

        // URL encode com regex para remover espaços internos
        const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
        window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
    }

    // Adiciona listeners aos itens do menu dropdown
    itensMenu.forEach(item => item.addEventListener('click', atualizarCategoria));

    // Toggle dropdown
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', e => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener('click', e => {
            if (!dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- Busca ---
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('barra-pesquisa');
    if (!searchInput || !searchForm) return;

    // Container resultados busca (dropdown)
    const resultsContainer = document.createElement('div');
    Object.assign(resultsContainer.style, {
        position: 'absolute',
        backgroundColor: '#06016c',
        color: 'white',
        width: '400px',
        maxHeight: '500px',
        overflowY: 'auto',
        borderRadius: '8px',
        top: (searchInput.offsetTop + searchInput.offsetHeight) + 'px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000',
        display: 'none',
        padding: '8px 10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        flexWrap: 'wrap',
        gap: '8px',
    });
    searchForm.style.position = 'relative';
    searchForm.appendChild(resultsContainer);

    let jogosCache = [];

    // Carrega JSON apenas 1 vez
    fetch('jogos.json')
        .then(res => {
            if (!res.ok) throw new Error('Falha ao carregar jogos.json');
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) jogosCache = data;
            else console.error('JSON inválido: não é array');
        })
        .catch(err => console.error('Erro ao carregar jogos para busca:', err));

    // Mostra resultados de busca
    function mostrarResultados(listaJogos) {
        resultsContainer.innerHTML = '';
        if (!listaJogos || listaJogos.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        listaJogos.forEach(jogo => {
            if (!jogo.id || !jogo.nome || !jogo.imagem) return;

            const item = document.createElement('a');
            item.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
            item.title = jogo.nome;
            Object.assign(item.style, {
                display: 'inline-block',
                width: '120px',
                height: '70px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                transition: 'transform 0.25s ease',
                cursor: 'pointer'
            });

            const img = document.createElement('img');
            img.src = jogo.imagem;
            img.alt = jogo.nome;
            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
            });

            item.appendChild(img);
            item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.05)');
            item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');

            resultsContainer.appendChild(item);
        });

        resultsContainer.style.display = 'flex';
    }

    // Cancelar submit no enter do input
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') e.preventDefault();
    });

    // Evita submit padrão do form
    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const texto = searchInput.value.trim().toLowerCase();
        if (!texto) return;
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });

    // Input de busca - filtra e mostra resultados
    searchInput.addEventListener('input', () => {
        const texto = searchInput.value.trim().toLowerCase();
        if (texto.length < 1) {
            resultsContainer.style.display = 'none';
            return;
        }

        // Busca por prefixo (começa com texto)
        const resultados = jogosCache.filter(jogo =>
            typeof jogo.nome === 'string' && jogo.nome.toLowerCase().startsWith(texto)
        );

        mostrarResultados(resultados.slice(0, 10));
    });

    // Fecha resultados ao clicar fora da busca
    document.addEventListener('click', e => {
        if (!searchForm.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });


    // --- Carrossel múltiplo ---
    fetch('./jogos.json')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar jogos.json para carrossel');
            return response.json();
        })
        .then(jogos => {
            // Inicializa carrosséis
            initCarouselByCategory(jogos, 'carousel-twoplayer', 'twoplayer', 13, 7);
            initCarouselByCategory(jogos, 'carousel-acao', 'acao', 13, 7);
            initCarouselByCategory(jogos, 'carousel-racing', 'racing', 13, 7);
            initCarouselByCategory(jogos, 'carousel-multiplayer', 'multiplayer', 13, 7);
            initCarouselByCategory(jogos, 'carousel-fps', 'fps', 13, 7);
            initCarouselByCategory(jogos, 'carousel-terror', 'terror', 13, 7);
            initCarouselByCategory(jogos, 'carousel-sports', 'sports', 13, 7);
            initCarouselByCategory(jogos, 'carousel-bike', 'bike', 13, 7);
            initCarouselByCategory(jogos, 'carousel-fighting', 'fighting', 13, 7);
            initCarouselByCategory(jogos, 'carousel-speed', 'speed', 13, 7);
            initCarouselByCategory(jogos, 'carousel-player', 'player', 13, 7);
            initCarouselByCategory(jogos, 'carousel-classics', 'classics', 13, 7);

            carregarDestaques(jogos);
            document.body.classList.add('loaded');
        })
        .catch(err => console.error(err));

    // Inicializa carrossel por categoria
    function initCarouselByCategory(jogos, sectionId, categoriaFiltro, maxJogos = 13, cardsPerView = 7) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const carousel = section.querySelector(".carousel-container");
        const track = carousel?.querySelector(".carousel-track");
        const nextBtn = carousel?.querySelector(".nextBtn");
        const prevBtn = carousel?.querySelector(".prevBtn");
        if (!carousel || !track || !nextBtn || !prevBtn) return;

        // Atualizado para suportar categoria como array
        const jogosFiltrados = jogos.filter(jogo =>
            Array.isArray(jogo.categoria) &&
            jogo.categoria.some(cat => cat.toLowerCase() === categoriaFiltro.toLowerCase())
        );

        const jogosParaCarrossel = jogosFiltrados.slice(0, maxJogos);
        track.innerHTML = '';

        jogosParaCarrossel.forEach(jogo => {
            const card = document.createElement('a');
            card.className = 'card';
            card.href = `player.html?jogo=${encodeURIComponent(jogo.id || '')}`;
            card.setAttribute('data-id', jogo.id || '');
            card.innerHTML = `<img class="jogo" src="${encodeURI(jogo.imagem)}" alt="${sanitizeHTML(jogo.nome || 'Jogo')}">`;
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

    // Inicializa a interface do carrossel
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

    // Carregar destaque e linhas laterais
    function carregarDestaques(jogos) {
        if (!Array.isArray(jogos)) return;
        const destaque = jogos[0];
        const destaqueDiv = document.getElementById("destaque");
        if (destaque && destaqueDiv) {
            destaqueDiv.innerHTML = `
        <a href="player.html?jogo=${encodeURIComponent(destaque.id)}">
          <img src="${sanitizeHTML(destaque.imagem)}" alt="${sanitizeHTML(destaque.nome)}">
        </a>
      `;
        } else if (destaqueDiv) {
            destaqueDiv.innerHTML = '<p>Nenhum destaque disponível</p>';
        }

        const linha1 = document.getElementById("linha1");
        const linha2 = document.getElementById("linha2");
        if (!linha1 || !linha2) return;
        linha1.innerHTML = '';
        linha2.innerHTML = '';

        const jogosLaterais = jogos.slice(1, 11);

        jogosLaterais.forEach((jogo, index) => {
            if (!jogo.id || !jogo.imagem || !jogo.nome) return;

            const card = document.createElement("a");
            card.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
            card.className = "jogo";
            card.innerHTML = `<img src="${sanitizeHTML(jogo.imagem)}" alt="${sanitizeHTML(jogo.nome)}" title="${sanitizeHTML(jogo.nome)}">`;

            if (index < 5) linha1.appendChild(card);
            else linha2.appendChild(card);
        });

        linha1.style.display = linha1.children.length ? '' : 'none';
        linha2.style.display = linha2.children.length ? '' : 'none';
    }

    // Função para sanitizar texto básico em HTML (remove caracteres especiais)
    // Importante: Não é sanitização completa, mas reduz ataques XSS simples.
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function (match) {
            switch (match) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return match;
            }
        });
    }
});
