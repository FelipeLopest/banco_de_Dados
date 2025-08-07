// player.js

// Dropdown menu
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
        const categoriaRaw = item.getAttribute('data-categoria') || '';
        const categoria = categoriaRaw.trim();
        if (!categoria) return;

        const icone = item.querySelector('i')?.cloneNode(true) || null;
        if (textoCategoria) textoCategoria.textContent = categoria;
        if (iconCategoria) {
            iconCategoria.innerHTML = '';
            if (icone) iconCategoria.appendChild(icone);
        }

        dropdownMenu.classList.remove('show');

        // Redireciona para a página de catálogo com a categoria
        const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
        window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Função para sanitizar texto básico (para evitar XSS simples)
    function sanitizeText(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function (m) {
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return m;
            }
        });
    }

    // --- INÍCIO DA BARRA DE PESQUISA ---

    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('barra-pesquisa');

    if (searchInput && searchForm) {
        // Container para os resultados da busca (dropdown)
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
    }
    // --- FIM DA BARRA DE PESQUISA ---


    // Obtém o ID do jogo da URL, normalizado
    function getGameId() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('jogo');
        return id ? id.toLowerCase() : null;
    }

    const gameId = getGameId();
    if (!gameId) {
        alert("Nenhum jogo selecionado.");
        return;
    }

    fetch('jogos.json')
        .then(response => {
            if (!response.ok) throw new Error('Falha ao carregar jogos.json');
            return response.json();
        })
        .then(jogos => {
            if (!Array.isArray(jogos)) throw new Error('Formato de JSON inválido.');

            // Busca o jogo atual pelo id
            const jogo = jogos.find(j => typeof j.id === 'string' && j.id.toLowerCase() === gameId);
            if (!jogo) {
                alert("Jogo não encontrado.");
                return;
            }

            // Atualiza iframe do jogo
            const iframe = document.getElementById('game-frame');
            if (iframe) {
                // Sanitiza URL (básico)
                const src = jogo.linkIframe || jogo.link || '';
                iframe.src = src;
            }

            // Atualiza informações visuais do jogo
            const gameTitle = document.getElementById('game-title');
            if (gameTitle) gameTitle.textContent = sanitizeText(jogo.nome) || 'Título não disponível';

            const gameThumb = document.getElementById('game-thumb');
            if (gameThumb) {
                gameThumb.src = jogo.imagem || '';
                gameThumb.alt = `Thumbnail do jogo ${sanitizeText(jogo.nome)}`;
            }

            const gameDescription = document.getElementById('game-description');
            if (gameDescription) gameDescription.textContent = sanitizeText(jogo.descricao) || 'Descrição não disponível.';

            const gameInstruction = document.getElementById('game-instruction');
            if (gameInstruction) gameInstruction.textContent = sanitizeText(jogo.instrucoes) || 'Instruções não disponíveis.';

            // Carrega jogos relacionados aleatórios (24 diferentes do atual)
            const relatedGamesDiv = document.getElementById('related-games');
            if (!relatedGamesDiv) return;
            relatedGamesDiv.innerHTML = '';

            // Filtra jogos diferentes do atual
            const jogosFiltrados = jogos.filter(j => typeof j.id === 'string' && j.id.toLowerCase() !== gameId);

            // Função para pegar N jogos aleatórios sem repetição
            function pegarAleatorios(arr, n) {
                const resultado = [];
                const copy = [...arr];
                const max = Math.min(n, copy.length);
                for (let i = 0; i < max; i++) {
                    const idx = Math.floor(Math.random() * copy.length);
                    resultado.push(copy[idx]);
                    copy.splice(idx, 1);
                }
                return resultado;
            }

            const jogosAleatorios = pegarAleatorios(jogosFiltrados, 24);

            jogosAleatorios.forEach(rj => {
                if (!rj.id || !rj.nome || !rj.imagem) return; // validação básica

                const card = document.createElement('a');
                card.href = `player.html?jogo=${encodeURIComponent(rj.id)}`;
                card.className = 'game-1';
                card.title = sanitizeText(rj.nome);
                card.innerHTML = `<img src="${rj.imagem}" alt="${sanitizeText(rj.nome)}">`;
                relatedGamesDiv.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Erro ao carregar jogos:', err);
            alert('Erro ao carregar dados do jogo.');
        });

    // Botão fullscreen para o iframe
    const btnFull = document.getElementById('btn-full');
    if (btnFull) {
        btnFull.addEventListener('click', () => {
            const iframe = document.getElementById('game-frame');
            if (!iframe) return;

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
