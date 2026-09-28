// Aviso de versão nova do app.
import { gravarJa } from './armazenamento.js';
import { S, VERSAO } from './estado.js';
import { I } from './icones.js';
import { confirmar, toast } from './interface.js';
import { $ } from './util.js';

export function avisoAtualizacao() {
  if ($('#aviso-versao')) return;
  const el = document.createElement('div');
  el.id = 'aviso-versao'; el.className = 'aviso-versao'; el.setAttribute('role', 'status');
  el.innerHTML = '<span>' + I.girar + 'Nova versão do app pronta.</span><button type="button" class="btn fino">Atualizar agora</button>';
  el.querySelector('button').onclick = async function () {
    if (S.editor && S.editor.sujo && !await confirmar('Atualizar agora?', 'As alterações desta tela ainda não foram salvas e seriam perdidas.', 'Atualizar mesmo assim', true)) return;
    el.querySelector('button').disabled = true;
    try { await gravarJa(); } catch (e) { /* segue */ }
    location.reload();
  };
  document.body.appendChild(el);
  document.body.classList.add('com-aviso-versao');
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_ATUALIZACAO = {
  'procurar-atualizacao': function () {
  const reg = S.swReg;
  if (!reg) { toast('Neste modo de abertura o app não se atualiza sozinho. Abra pelo endereço do site.'); return; }
  toast('Procurando atualização…');
  reg.update().then(function () {
    if (reg.installing || reg.waiting) toast('Baixando a versão nova. O aviso para atualizar aparece em instantes.');
    else toast('Você já está na versão mais recente (' + VERSAO + ').');
  }).catch(() => toast('Sem conexão para procurar atualização agora.'));
}
};
