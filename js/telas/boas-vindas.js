// Tela de boas-vindas: conectar à planilha ou testar sem planilha.
import { salvarLocal } from '../nucleo/armazenamento.js';
import { S } from '../nucleo/estado.js';
import { toast } from '../nucleo/interface.js';
import { garantirConfig } from '../nucleo/registros.js';
import { render } from '../nucleo/rotas.js';
import { ERROS, chamar, sincronizar } from '../nucleo/sincronizacao.js';
import { $ } from '../nucleo/util.js';

// ================= Boas-vindas =================
export function telaBoasVindas() {
  return '<div class="boas-vindas"><div class="bv-caixa">' +
    '<div class="bv-hero"><span class="logo-selo" role="img" aria-label="Doce Astro, doces artesanais"></span>' +
    '<p class="frase">Espaço Nave: pedidos, receitas e preços da doceria num lugar só.</p></div>' +
    '<div class="grade">' +
    '<form class="bloco" id="form-conectar"><h2>Conectar à planilha</h2><p class="explica">Os dados ficam na sua Planilha do Google e aparecem iguais no celular e no computador. O guia de instalação explica como conseguir o endereço.</p>' +
    '<label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" required></label>' +
    '<label class="campo" style="margin-top:10px"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" autocomplete="off" required minlength="6"></label>' +
    '<p class="mudo" id="msg-conectar" style="margin-top:8px;min-height:1.5em" role="status"></p>' +
    '<button class="btn" type="submit">Conectar</button></form>' +
    '<div class="bloco"><h2>Testar sem planilha</h2><p class="explica">Os dados ficam só neste aparelho. Dá para conectar depois em Ajustes, e o que você cadastrar agora vai junto para a planilha.</p>' +
    '<button class="btn sec" type="button" data-acao="modo-demo">Começar a testar</button></div>' +
    '</div></div></div>';
}
export async function conectar(url, pin, msgEl) {
  url = String(url || '').trim();
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) { msgEl.textContent = 'O endereço deve começar com https://script.google.com/ e terminar em /exec.'; return false; }
  msgEl.textContent = 'Conectando…';
  const antes = { url: S.meta.url, pin: S.meta.pin };
  S.meta.url = url; S.meta.pin = String(pin || '');
  try {
    const r = await chamar({ acao: 'ping', pin: S.meta.pin });
    if (!r.ok) { msgEl.textContent = ERROS[r.erro] || 'A planilha recusou a conexão.'; S.meta.url = antes.url; S.meta.pin = antes.pin; return false; }
  } catch (e) {
    msgEl.textContent = 'Não foi possível acessar esse endereço. Confira se a implantação está como "Qualquer pessoa".';
    S.meta.url = antes.url; S.meta.pin = antes.pin; return false;
  }
  S.meta.modo = 'planilha'; S.meta.ultimaSync = '';
  salvarLocal();
  await sincronizar();
  if (garantirConfig()) await sincronizar();
  return true;
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_BOAS_VINDAS = {
  'modo-demo': function () { S.meta.modo = 'demo'; garantirConfig(); salvarLocal(); location.hash = '#/inicio'; render(true); toast('Modo de teste: os dados ficam só neste aparelho.'); }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosBoasVindas() {
  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'form-conectar') return;
    e.preventDefault();
    const f = e.target, msg = $('#msg-conectar', f.closest('dialog') || document);
    const btn = f.querySelector('[type=submit]'); btn.disabled = true;
    const ok = await conectar(f.url.value, f.pin.value, msg);
    btn.disabled = false;
    if (ok) { const d = f.closest('dialog'); if (d) d.close(); location.hash = '#/inicio'; render(true); toast('Conectado à planilha.'); }
  });
}
