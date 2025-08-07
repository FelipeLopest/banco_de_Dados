document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    let categoriaParam = urlParams.get("categoria");

    // Camada de segurança: limpar caracteres suspeitos
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

    fetch("jogos.json")
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar JSON");
            return response.json();
        })
        .then(jogos => {
            // Camada de segurança: verificar estrutura
            if (!Array.isArray(jogos)) throw new Error("JSON inválido");

            const jogosFiltrados = jogos.filter(j => {
                if (!Array.isArray(j.categoria)) return false;
                return j.categoria.some(cat => {
                    if (typeof cat !== "string") return false;
                    return cat.toLowerCase().replace(/\s+/g, "") === categoriaParam.replace(/\s+/g, "");
                });
            });

            // Aqui aplicamos a capitalização em todas as palavras
            titulo.textContent = capitalizeWords(decodeURIComponent(categoriaParam));

            if (jogosFiltrados.length === 0) {
                lista.innerHTML = "<p>Nenhum jogo encontrado nesta categoria.</p>";
                paginacao.innerHTML = "";
                return;
            }

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
        })
        .catch(err => {
            console.error("Erro ao carregar jogos:", err);
            lista.innerHTML = "<p>Erro ao carregar os jogos.</p>";
            paginacao.innerHTML = "";
        });

    // Sanitização contra XSS
    function sanitize(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Função para capitalizar todas as palavras
    function capitalizeWords(str) {
        if (typeof str !== 'string' || str.length === 0) return '';
        return str.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    // Dropdown menu
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const itensMenu = document.querySelectorAll('.dropdown-menu a');
    const textoCategoria = document.getElementById('texto-categoria');
    const iconCategoria = document.getElementById('icon-categoria');

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
            window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
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

    // Barra de pesquisa
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

    let jogosCache = [];

    fetch('jogos.json')
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar jogos');
            return res.json();
        })
        .then(data => {
            jogosCache = data;
        })
        .catch(err => {
            console.error('Erro ao carregar jogos para busca:', err);
        });

    function mostrarResultados(listaJogos) {
        resultsContainer.innerHTML = '';
        if (listaJogos.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        listaJogos.forEach(jogo => {
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

    searchInput.addEventListener('input', () => {
        const texto = searchInput.value.trim().toLowerCase();
        if (texto.length < 1) {
            resultsContainer.style.display = 'none';
            return;
        }

        const resultados = jogosCache.filter(jogo =>
            jogo.nome.toLowerCase().includes(texto)
        );

        mostrarResultados(resultados.slice(0, 10));
    });

    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const texto = searchInput.value.trim().toLowerCase();
        if (texto.length === 0) return;
        window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });
});
