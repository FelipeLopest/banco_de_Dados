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
        const categoria = item.getAttribute('data-categoria');
        const icone = item.querySelector('i').cloneNode(true);
        textoCategoria.textContent = categoria;
        iconCategoria.innerHTML = '';
        iconCategoria.appendChild(icone);
        dropdownMenu.classList.remove('show');
    });
});

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
