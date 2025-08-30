// ======================= DROPDOWN CATEGORIAS (DESKTOP) =======================
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');
const itensMenu = document.querySelectorAll('.dropdown-menu a');
const textoCategoria = document.getElementById('texto-categoria');
const iconCategoria = document.getElementById('icon-categoria');

if (dropdownBtn && dropdownMenu) {
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
      const categoriaURL = categoria.toLowerCase().replace(/\s+/g, '');
      window.location.href = `catalogo.html?categoria=${encodeURIComponent(categoriaURL)}`;
    });
  });
}

// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = () => window.innerWidth <= 786;

  // ======================= FUNÇÕES UTILS =======================
  function sanitizeText(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  // ======================= BUSCA (DESKTOP) =======================
  const searchInput = document.getElementById('search');
  const searchForm  = document.getElementById('barra-pesquisa');

  let resultsContainer = null;
  if (searchInput && searchForm) {
    resultsContainer = document.createElement('div');
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
  }

  let jogosCache = [];
  fetch('jogos.json')
    .then(res => { if (!res.ok) throw new Error('Falha ao carregar jogos.json'); return res.json(); })
    .then(data => { if (Array.isArray(data)) jogosCache = data; })
    .catch(err => console.error('Erro ao carregar jogos para busca:', err));

  function montarItensResultado(container, lista) {
    container.innerHTML = '';
    if (!lista || !lista.length) { container.style.display = 'none'; return; }

    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(3, 1fr)';
    container.style.gap = '8px';

    lista.forEach(jogo => {
      if (!jogo.id || !jogo.nome || !jogo.imagem) return;
      const a = document.createElement('a');
      a.href = `player.html?jogo=${encodeURIComponent(jogo.id)}`;
      a.title = jogo.nome;
      a.style.display = 'block';
      a.style.borderRadius = '8px';
      a.style.overflow = 'hidden';
      a.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

      const img = document.createElement('img');
      img.src = jogo.imagem;
      img.alt = jogo.nome;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.aspectRatio = '16/9';
      img.style.objectFit = 'cover';

      a.appendChild(img);
      container.appendChild(a);
    });
  }

  function filtrarJogos(texto) {
    const t = (texto || '').trim().toLowerCase();
    if (!t) return [];
    return jogosCache.filter(j => typeof j.nome === 'string' && j.nome.toLowerCase().startsWith(t)).slice(0, 12);
  }

  if (searchInput && searchForm && resultsContainer) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });

    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const texto = searchInput.value.trim().toLowerCase();
      if (!texto) return;
      window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
    });

    searchInput.addEventListener('input', () => {
      const lista = filtrarJogos(searchInput.value);
      montarItensResultado(resultsContainer, lista);
    });

    document.addEventListener('click', e => {
      if (!searchForm.contains(e.target)) {
        resultsContainer.style.display = 'none';
      }
    });
  }

  // ======================= DRAWER MOBILE =======================
  const toggleBtn = document.querySelector(".menu-toggle");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");
  const drawerSearchInput = drawer?.querySelector("input[type='text']");
  const drawerCategorias = drawer?.querySelector(".drawer-categorias");

  const drawerResults = document.createElement('div');
  Object.assign(drawerResults.style, {
    display: 'none',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  });
  drawer?.querySelector('form')?.appendChild(drawerResults);

  toggleBtn?.addEventListener("click", () => {
    drawer?.classList.toggle("active");
    overlay?.classList.toggle("active");
    const icon = toggleBtn.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  overlay?.addEventListener("click", () => {
    drawer?.classList.remove("active");
    overlay?.classList.remove("active");
    toggleBtn.querySelector("i").classList.remove("fa-times");
    toggleBtn.querySelector("i").classList.add("fa-bars");
  });

  drawerCategorias?.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const categoria = item.getAttribute('data-categoria');
      if (!categoria) return;
      drawer?.classList.remove("active");
      overlay?.classList.remove("active");
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
        drawer?.classList.remove("active");
        overlay?.classList.remove("active");
        toggleBtn.querySelector("i").classList.remove("fa-times");
        toggleBtn.querySelector("i").classList.add("fa-bars");
      });
      drawerResults.appendChild(a);
    });
    drawerResults.style.display = resultados.length ? 'flex' : 'none';
  });

  drawer?.querySelector('form')?.addEventListener('submit', e => {
    e.preventDefault();
    const texto = drawerSearchInput.value.trim().toLowerCase();
    if (!texto) return;
    window.location.href = `jogos.html?search=${encodeURIComponent(texto)}`;
  });

  document.addEventListener('click', e => {
    if (!drawer?.contains(e.target)) drawerResults.style.display = 'none';
  });

  // ======================= CARREGAR JOGO + RELACIONADOS =======================
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
    .then(response => { if (!response.ok) throw new Error('Falha ao carregar jogos.json'); return response.json(); })
    .then(jogos => {
      if (!Array.isArray(jogos)) throw new Error('Formato de JSON inválido.');

      const jogo = jogos.find(j => typeof j.id === 'string' && j.id.toLowerCase() === gameId);
      if (!jogo) { alert("Jogo não encontrado."); return; }

      const iframe = document.getElementById('game-frame');
      if (iframe) iframe.src = jogo.linkIframe || jogo.link || '';

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

      const relatedGamesDiv = document.getElementById('related-games');
      if (relatedGamesDiv) {
        relatedGamesDiv.innerHTML = '';
        const jogosFiltrados = jogos.filter(j => typeof j.id === 'string' && j.id.toLowerCase() !== gameId);
        const jogosAleatorios = [];
        const copy = [...jogosFiltrados];
        for (let i = 0; i < Math.min(24, copy.length); i++) {
          const idx = Math.floor(Math.random() * copy.length);
          jogosAleatorios.push(copy[idx]);
          copy.splice(idx, 1);
        }

        jogosAleatorios.forEach(rj => {
          if (!rj.id || !rj.nome || !rj.imagem) return;
          const card = document.createElement('a');
          card.href = `player.html?jogo=${encodeURIComponent(rj.id)}`;
          card.className = 'game-1';
          card.title = sanitizeText(rj.nome);
          card.innerHTML = `<img src="${rj.imagem}" alt="${sanitizeText(rj.nome)}">`;
          relatedGamesDiv.appendChild(card);
        });
      }

      aplicarLayoutResponsivo();
    })
    .catch(err => {
      console.error('Erro ao carregar jogos:', err);
      alert('Erro ao carregar dados do jogo.');
    });

  // ======================= FULLSCREEN =======================
  const btnFull = document.getElementById('btn-full');
  if (btnFull) {
    btnFull.addEventListener('click', () => {
      const iframe = document.getElementById('game-frame');
      if (!iframe) return;
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
      else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    });
  }

  const iframeClick = document.getElementById('game-frame');
  if (iframeClick) {
    iframeClick.addEventListener('click', () => {
      if (iframeClick.requestFullscreen) iframeClick.requestFullscreen();
      else if (iframeClick.webkitRequestFullscreen) iframeClick.webkitRequestFullscreen();
      else if (iframeClick.msRequestFullscreen) iframeClick.msRequestFullscreen();
    });
  }

  // ======================= LAYOUT RESPONSIVO =======================
  function aplicarLayoutResponsivo() {
    const gameScreen     = document.querySelector('.game-screen');
    const gameContainer  = document.querySelector('.game-container');
    const playerWrap     = document.querySelector('.player');
    const controls       = document.querySelector('.game-controls');
    const iframe         = document.getElementById('game-frame');
    const related        = document.getElementById('related-games');
    const adsLeft        = document.querySelector('.ads-left');
    const adsRight       = document.querySelector('.ads-right');

    if (isMobile()) {
      if (gameScreen) { gameScreen.style.flexDirection='column'; gameScreen.style.alignItems='center'; gameScreen.style.padding='10px'; gameScreen.style.gap='10px'; }
      if (gameContainer) { gameContainer.style.width='100%'; gameContainer.style.boxShadow='none'; gameContainer.style.paddingBottom='20px'; }
      if (playerWrap) { playerWrap.style.width='100%'; playerWrap.style.borderRadius='10px'; playerWrap.style.background='#0d0874'; }
      if (controls) { controls.style.width='100%'; controls.style.borderRadius='0 0 10px 10px'; }
      if (iframe) { iframe.style.width='100%'; iframe.style.height='40vh'; }
      if (adsLeft) adsLeft.style.display='none';
      if (adsRight) adsRight.style.display='none';
      if (related) {
        related.style.display='grid';
        related.style.gridTemplateColumns='repeat(3, 1fr)';
        related.style.gap='10px';
        related.querySelectorAll('a.game-1').forEach(a => {
          a.style.width='100%'; a.style.height='auto';
          const img = a.querySelector('img'); if(img){img.style.width='100%'; img.style.height='auto'; img.style.aspectRatio='16/9'; img.style.objectFit='cover';}
        });
      }
    } else {
      if (gameScreen) { gameScreen.style.flexDirection=''; gameScreen.style.alignItems='flex-start'; gameScreen.style.padding='20px'; gameScreen.style.gap='20px'; }
      if (gameContainer) { gameContainer.style.width='900px'; gameContainer.style.boxShadow=''; gameContainer.style.paddingBottom='40px'; }
      if (playerWrap) { playerWrap.style.width='900px'; }
      if (controls) { controls.style.width='900px'; }
      if (iframe) { iframe.style.width='100%'; iframe.style.height='600px'; }
      if (adsLeft) adsLeft.style.display='flex';
      if (adsRight) adsRight.style.display='flex';
      if (related) {
        related.style.display='flex'; related.style.flexWrap='wrap'; related.style.gap='20px'; related.style.gridTemplateColumns='';
        related.querySelectorAll('a.game-1').forEach(a => {
          a.style.width=''; a.style.height='';
          const img = a.querySelector('img'); if(img){img.style.width=''; img.style.height=''; img.style.aspectRatio=''; img.style.objectFit='';}
        });
      }
    }
  }

  window.addEventListener('resize', () => {
    if (resultsContainer) resultsContainer.style.width = isMobile() ? '90vw' : '400px';
    aplicarLayoutResponsivo();
  });

  aplicarLayoutResponsivo();
});
