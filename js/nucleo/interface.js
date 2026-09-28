// Peças de interface: tema, avisos, janelas, abas, cabeçalhos.
import { S } from './estado.js';
import { I } from './icones.js';
import { $, esc } from './util.js';

// ================= Tema =================
export function aplicarTema() {
  document.documentElement.dataset.theme = S.meta.tema || 'auto';
  document.documentElement.style.setProperty('--fs', String(S.meta.fonte || 1));
  const escuro = S.meta.tema === 'dark' || (S.meta.tema !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]'); if (m) m.content = escuro ? '#1A0A02' : '#401900';
}
// ================= Toast =================
export function toast(msg, rotuloAcao, fn, ms) {
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstElementChild.remove(); // no máximo 3 avisos na tela
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = '<span class="txt">' + esc(msg) + '</span>' + (rotuloAcao ? '<button type="button">' + esc(rotuloAcao) + '</button>' : '');
  if (rotuloAcao) el.querySelector('button').onclick = function () { el.remove(); fn && fn(); };
  box.appendChild(el);
  setTimeout(() => el.remove(), ms || (rotuloAcao ? 8000 : 4000));
}
// ================= Folha (modal) =================
export function abrirFolha(titulo, corpoHTML, aoMontar) {
  const d = document.createElement('dialog'); d.className = 'folha';
  d.innerHTML = '<div class="cab-folha"><h2>' + esc(titulo) + '</h2><button type="button" class="btn-icone" data-fechar aria-label="Fechar">' + I.fechar + '</button></div><div class="corpo-folha">' + corpoHTML + '</div>';
  document.body.appendChild(d);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-fechar]')) d.close(); });
  d.showModal();
  if (aoMontar) aoMontar(d);
  return d;
}
export function confirmar(titulo, texto, rotuloOk, perigo) {
  return new Promise(function (res) {
    let r = false;
    const d = abrirFolha(titulo, '<p>' + texto + '</p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button type="button" class="btn' + (perigo ? ' perigo' : '') + '" data-ok>' + esc(rotuloOk) + '</button></div>');
    d.querySelector('[data-ok]').onclick = () => { r = true; d.close(); };
    d.addEventListener('close', () => res(r));
  });
}
export function abas(lst, ativo) { return '<nav class="abas" aria-label="Partes desta seção">' + lst.map(a => '<a href="' + a[0] + '"' + (a[0] === ativo ? ' aria-current="page"' : '') + '>' + a[1] + '</a>').join('') + '</nav>'; }
export function cab(titulo, sub, acoes) {
  return '<div class="cab-pagina"><div class="titulos"><h1>' + titulo + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' + (acoes ? '<div class="acoes">' + acoes + '</div>' : '') + '</div>';
}
export async function copiarTexto(txt) {
  try { await navigator.clipboard.writeText(txt); toast('Texto copiado.'); return; } catch (e) { /* tenta o jeito antigo */ }
  const t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); toast('Texto copiado.'); } catch (e) { toast('Não foi possível copiar. Selecione o texto e copie à mão.'); }
  t.remove();
}
