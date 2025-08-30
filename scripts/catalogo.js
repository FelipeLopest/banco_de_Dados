document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    let categoriaParam = urlParams.get("categoria");

    if (categoriaParam) {
        categoriaParam = categoriaParam.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    }

    const lista = document.getElementById("lista-jogos");
    const titulo = document.getElementById("titulo-categoria");
    const paginacao = document.getElementById("paginacao");

    if (!categoriaParam) {
        titulo.textContent = "Categoria não especificada.";
        return;
    }

    let jogosCache = [];

    fetch("jogos.json")
        .then(res => {
            if (!res.ok) throw new Error("Erro ao carregar JSON");
            return res.json();
        })
        .then(jogos => {
            if (!Array.isArray(jogos)) throw new Error("JSON inválido");
            jogosCache = jogos;

            // ---------------- FILTRAGEM DE JOGOS ----------------
            const jogosFiltrados = jogos.filter(j => Array.isArray(j.categoria) && 
                j.categoria.some(cat => typeof cat === "string" &&
                cat.toLowerCase().replace(/\s+/g, "") === categoriaParam.replace(/\s+/g, "")));

            titulo.textContent = capitalizeWords(decodeURIComponent(categoriaParam));

            if (jogosFiltrados.length === 0) {
                lista.innerHTML = "<p>Nenhum jogo encontrado nesta categoria.</p>";
                paginacao.innerHTML = "";
                return;
            }

            // ---------------- PAGINAÇÃO ----------------
            const jogosPorPagina = 30;
            let paginaAtual = 1;
            const totalPaginas = Math.ceil(jogosFiltrados.length / jogosPorPagina);

            function mostrarPagina(pagina) {
                paginaAtual = pagina;
                lista.innerHTML = "";
                lista.classList.add("grid-jogos");

                const inicio = (paginaAtual - 1) * jogosPorPagina;
                const fim = inicio + jogosPorPagina;
                const jogosPagina = jogosFiltrados.slice(inicio, fim);

                jogosPagina.forEach(jogo => {
                    const a = document.createElement("a");
                    a.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
                    a.className = "item-jogo";
                    a.title = jogo.nome;
                    a.innerHTML = `<img src="${sanitize(jogo.imagem)}" alt="${sanitize(jogo.nome)}">`;
                    lista.appendChild(a);
                });

                atualizarPaginacao();
                aplicarLayoutResponsivo();
            }

            function atualizarPaginacao() {
                paginacao.innerHTML = "";
                for (let i = 1; i <= totalPaginas; i++) {
                    const btn = document.createElement("button");
                    btn.textContent = i;
                    btn.className = "botao-pagina";
                    if (i === paginaAtual) btn.classList.add("active");
                    btn.addEventListener("click", () => mostrarPagina(i));
                    paginacao.appendChild(btn);
                }
            }

            mostrarPagina(1);

            // ---------------- RESPONSIVIDADE ----------------
            function aplicarLayoutResponsivo() {
                const width = window.innerWidth;
                if (width <= 786) {
                    lista.style.gridTemplateColumns = "repeat(3, 1fr)"; // 3 jogos por linha
                    lista.style.gap = "10px";
                } else {
                    lista.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
                    lista.style.gap = "15px";
                }
            }

            window.addEventListener("resize", aplicarLayoutResponsivo);
        })
        .catch(err => {
            console.error("Erro ao carregar jogos:", err);
            lista.innerHTML = "<p>Erro ao carregar os jogos.</p>";
            paginacao.innerHTML = "";
        });

    // ---------------- FUNÇÕES AUXILIARES ----------------
    function sanitize(str) {
        return String(str).replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/"/g, "&quot;");
    }

    function capitalizeWords(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    // ---------------- DROPDOWN ----------------
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const itensMenu = document.querySelectorAll('.dropdown-menu a');
    const textoCategoria = document.getElementById('texto-categoria');
    const iconCategoria = document.getElementById('icon-categoria');

    itensMenu.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const categoria = item.getAttribute('data-categoria');
            const icone = item.querySelector('i').cloneNode(true);
            textoCategoria.textContent = categoria;
            iconCategoria.innerHTML = '';
            iconCategoria.appendChild(icone);
            dropdownMenu.classList.remove('show');
            const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
            window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
        });
    });

    dropdownBtn.addEventListener('click', e => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', e => {
        if (!dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // ---------------- BUSCA ----------------
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('barra-pesquisa');

    const resultsContainer = document.createElement('div');
    Object.assign(resultsContainer.style, {
        position: 'absolute',
        backgroundColor: '#06016c',
        color: 'white',
        width: '400px',
        maxHeight: '300px',
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
        gap: '8px'
    });
    searchForm.style.position = 'relative';
    searchForm.appendChild(resultsContainer);

    searchInput.addEventListener('input', () => {
        const texto = searchInput.value.trim().toLowerCase();
        if (!texto) { resultsContainer.style.display = 'none'; return; }

        const resultados = jogosCache.filter(j => j.nome.toLowerCase().includes(texto));
        resultsContainer.innerHTML = '';
        resultados.slice(0, 10).forEach(j => {
            const a = document.createElement('a');
            a.href = `player.html?jogo=${encodeURIComponent(j.id)}`;
            a.title = j.nome;
            a.style.display = 'inline-block';
            a.style.width = '120px';
            a.style.height = '70px';
            a.style.margin = '2px';
            const img = document.createElement('img');
            img.src = j.imagem;
            img.alt = j.nome;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            a.appendChild(img);
            resultsContainer.appendChild(a);
        });
        resultsContainer.style.display = 'flex';
    });

    document.addEventListener('click', e => {
        if (!searchForm.contains(e.target)) resultsContainer.style.display = 'none';
    });

    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const texto = searchInput.value.trim().toLowerCase();
        if (!texto) return;
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });

    // ---------------- DRAWER MOBILE ----------------
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

    // Busca no drawer
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
});
