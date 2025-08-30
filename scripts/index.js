document.addEventListener("DOMContentLoaded", () => {
    // ------------------ DROPDOWN ------------------
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const itensMenu = dropdownMenu ? dropdownMenu.querySelectorAll('a') : [];
    const textoCategoria = document.getElementById('texto-categoria');
    const iconCategoria = document.getElementById('icon-categoria');

    function atualizarCategoria(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const categoriaRaw = item.getAttribute('data-categoria') || '';
        const categoria = categoriaRaw.trim();
        if (!categoria) return;

        const icone = item.querySelector('i')?.cloneNode(true) || null;
        if (textoCategoria) textoCategoria.textContent = categoria;
        if (iconCategoria) {
            iconCategoria.innerHTML = '';
            if (icone) iconCategoria.appendChild(icone);
        }
        if (dropdownMenu) dropdownMenu.classList.remove('show');

        const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
        window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
    }

    itensMenu.forEach(item => item.addEventListener('click', atualizarCategoria));

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', e => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', e => {
            if (!dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // ------------------ BUSCA DESKTOP ------------------
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('barra-pesquisa');

    const resultsContainer = document.createElement('div');
    Object.assign(resultsContainer.style, {
        position: 'absolute',
        backgroundColor: '#06016c',
        color: 'white',
        width: '400px',
        maxHeight: '500px',
        overflowY: 'auto',
        borderRadius: '8px',
        top: (searchInput?.offsetTop + searchInput?.offsetHeight) + 'px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000',
        display: 'none',
        padding: '8px 10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        flexWrap: 'wrap',
        gap: '8px',
    });
    if (searchForm) {
        searchForm.style.position = 'relative';
        searchForm.appendChild(resultsContainer);
    }

    let jogosCache = [];

    fetch('jogos.json')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) jogosCache = data; })
        .catch(err => console.error(err));

    function mostrarResultados(listaJogos, container) {
        container.innerHTML = '';
        if (!listaJogos || listaJogos.length === 0) {
            container.style.display = 'none';
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
            Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
            item.appendChild(img);
            item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.05)');
            item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');
            container.appendChild(item);
        });

        container.style.display = 'flex';
    }

    searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    searchForm?.addEventListener('submit', e => {
        e.preventDefault();
        const texto = searchInput.value.trim().toLowerCase();
        if (!texto) return;
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });

    searchInput?.addEventListener('input', () => {
        const texto = searchInput.value.trim().toLowerCase();
        if (!texto) return resultsContainer.style.display = 'none';
        const resultados = jogosCache.filter(jogo => jogo.nome.toLowerCase().startsWith(texto));
        mostrarResultados(resultados.slice(0, 10), resultsContainer);
    });

    document.addEventListener('click', e => {
        if (!searchForm?.contains(e.target)) resultsContainer.style.display = 'none';
    });

    // ------------------ DRAWER MOBILE ------------------
    const toggleBtn = document.querySelector(".menu-toggle");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");
    const drawerSearchInput = drawer.querySelector("input[type='text']");
    const drawerCategorias = drawer.querySelector(".drawer-categorias");

    const drawerResults = document.createElement('div');
    Object.assign(drawerResults.style, {
        display: 'none',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px'
    });
    drawer.querySelector('form')?.appendChild(drawerResults);

    toggleBtn.addEventListener("click", () => {
        drawer.classList.toggle("active");
        overlay.classList.toggle("active");
        const icon = toggleBtn.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
    });

    overlay.addEventListener("click", () => {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
        toggleBtn.querySelector("i").classList.remove("fa-times");
        toggleBtn.querySelector("i").classList.add("fa-bars");
    });

    // Abrir categoria
    drawerCategorias.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const categoria = item.getAttribute('data-categoria');
            if (!categoria) return;
            drawer.classList.remove("active");
            overlay.classList.remove("active");
            toggleBtn.querySelector("i").classList.remove("fa-times");
            toggleBtn.querySelector("i").classList.add("fa-bars");
            window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoria)}`;
        });
    });

    drawerSearchInput?.addEventListener('input', () => {
        const texto = drawerSearchInput.value.trim().toLowerCase();
        if (!texto) {
            drawerCategorias.style.display = '';
            drawerResults.style.display = 'none';
            return;
        }
        drawerCategorias.style.display = 'none';
        const resultados = jogosCache.filter(jogo => jogo.nome.toLowerCase().startsWith(texto));
        drawerResults.innerHTML = '';
        resultados.slice(0, 10).forEach(jogo => {
            const a = document.createElement('a');
            a.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
            a.title = jogo.nome;
            a.innerHTML = `<img src="${jogo.imagem}" alt="${jogo.nome}" style="width:100%;border-radius:5px;">`;
            a.addEventListener('click', () => {
                drawer.classList.remove("active");
                overlay.classList.remove("active");
                toggleBtn.querySelector("i").classList.remove("fa-times");
                toggleBtn.querySelector("i").classList.add("fa-bars");
            });
            drawerResults.appendChild(a);
        });
        drawerResults.style.display = resultados.length ? 'flex' : 'none';
    });

    drawer.querySelector('form')?.addEventListener('submit', e => {
        e.preventDefault();
        const texto = drawerSearchInput.value.trim().toLowerCase();
        if (!texto) return;
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });

    document.addEventListener('click', e => {
        if (!drawer.contains(e.target)) drawerResults.style.display = 'none';
    });

    // ------------------ CARROSSEIS E DESTAQUES ------------------
    fetch('./jogos.json')
        .then(response => response.json())
        .then(jogos => {
            const categorias = ['twoplayer','acao','racing','multiplayer','fps','terror','sports','bike','fighting','speed','player','classics'];
            categorias.forEach(cat => initCarouselByCategory(jogos, `carousel-${cat}`, cat, 13, 7));
            carregarDestaques(jogos);
            document.body.classList.add('loaded');
        })
        .catch(err => console.error(err));

    function initCarouselByCategory(jogos, sectionId, categoriaFiltro, maxJogos = 13, cardsPerView = 7) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const carousel = section.querySelector(".carousel-container");
        const track = carousel?.querySelector(".carousel-track");
        const nextBtn = carousel?.querySelector(".nextBtn");
        const prevBtn = carousel?.querySelector(".prevBtn");
        if (!carousel || !track || !nextBtn || !prevBtn) return;

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
            card.innerHTML = `<img class="jogo" src="${sanitizeHTML(jogo.imagem)}" alt="${sanitizeHTML(jogo.nome || 'Jogo')}">`;
            track.appendChild(card);
        });

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
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) currentIndex -= cardsPerView;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex + cardsPerView < totalCards) currentIndex += cardsPerView;
            updateCarousel();
        });

        updateCarousel();
    }

    function carregarDestaques(jogos) {
        const destaque = jogos[0];
        const destaqueDiv = document.getElementById("destaque");
        if (destaque && destaqueDiv) {
            destaqueDiv.innerHTML = `<a href="player.html?jogo=${encodeURIComponent(destaque.id)}">
                <img src="${sanitizeHTML(destaque.imagem)}" alt="${sanitizeHTML(destaque.nome)}">
            </a>`;
        } else if (destaqueDiv) destaqueDiv.innerHTML = '<p>Nenhum destaque disponível</p>';

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

    function sanitizeHTML(str) {
    let temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
}

// --- Carrega os jogos do JSON ---
let jogos = [];
fetch("jogos.json")
    .then(res => res.json())
    .then(data => {
        jogos = data;
        inicializarLayout();
    })
    .catch(err => console.error("Erro ao carregar jogos.json:", err));

// --- Inicializa conforme o tamanho da tela ---
function inicializarLayout() {
    if (window.innerWidth <= 768) {
        ativarModoMobile();
    } else {
        ativarModoDesktop();
    }
}

// --- Desktop: mostra carrosséis e destaques ---
function ativarModoDesktop() {
    document.getElementById("carrosseis")?.classList.remove("hidden");
    document.getElementById("destaques")?.classList.remove("hidden");
    document.getElementById("mobile-grid")?.classList.add("hidden");
}

// --- Mobile: esconde carrosséis/destaques e ativa grid ---
function ativarModoMobile() {
    document.getElementById("carrosseis")?.classList.add("hidden");
    document.getElementById("destaques")?.classList.add("hidden");
    renderizarGridMobile(jogos);
}

// --- Renderiza grid no drawer (até 30 jogos iniciais) ---
function renderizarGridMobile(lista) {
    const grid = document.getElementById("mobile-grid");
    if (!grid) return;
    grid.classList.remove("hidden");
    grid.innerHTML = "";

    lista.slice(0, 30).forEach(jogo => {
        if (!jogo.id || !jogo.imagem || !jogo.nome) return;
        const a = document.createElement("a");
        a.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
        a.title = jogo.nome;
        a.innerHTML = `<img src="${sanitizeHTML(jogo.imagem)}" alt="${sanitizeHTML(jogo.nome)}">`;
        grid.appendChild(a);
    });
}


    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
});
