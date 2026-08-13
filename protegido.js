// ===========================================
// Sistema de proteção por senha (cards, fichas, seções)
// Requer: protegido.css linkado na página
// Uso no HTML: <div class="protegido" data-hash="HASH_AQUI"> ... </div>
//
// Para gerar o hash de uma senha, rode no console do navegador (F12):
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('SUA_SENHA')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
// ===========================================

(async () => {
  async function sha256(texto) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  document.querySelectorAll('.protegido').forEach(el => {
    const hashEsperado = el.dataset.hash;
    if (!hashEsperado) return;

    el.classList.add('bloqueado');

    const overlay = document.createElement('div');
    overlay.className = 'cadeado-overlay';
    overlay.textContent = '🔒';
    el.appendChild(overlay);

    overlay.addEventListener('click', async () => {
      const senha = prompt('Digite a senha:');
      if (!senha) return;

      const hash = await sha256(senha);
      if (hash === hashEsperado) {
        el.classList.remove('bloqueado');
        overlay.remove();
      } else {
        alert('Senha incorreta.');
      }
    });
  });
})();
