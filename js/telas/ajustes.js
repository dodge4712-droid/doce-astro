// Tela Ajustes: sincronização, PIN, custos fixos, mão de obra, taxas, estoque, aparência e backup.
import * as C from '../motor/index.js';
import { gravarJa, lsGravar, salvarLocal } from '../nucleo/armazenamento.js';
import { NOMES_TABELAS, S, TABELAS_LOCAIS, VERSAO, cfg, dadosVazios, mediaContas } from '../nucleo/estado.js';
import { I } from '../nucleo/icones.js';
import { abrirFolha, aplicarTema, confirmar, toast } from '../nucleo/interface.js';
import { excluirRegistro, gravarRegistro } from '../nucleo/registros.js';
import { ir, render } from '../nucleo/rotas.js';
import { ERROS, chamar, sincronizar, textoSync } from '../nucleo/sincronizacao.js';
import { $, agoraISO, clone, dataHoraBR, esc, inNum } from '../nucleo/util.js';
import { gravarCaminho } from './receitas.js';

// ================= Ajustes =================
export function telaAjustes() {
  const cf = cfg();
  const modo = S.meta.modo;
  const s = textoSync();
  let h = '<div class="cab-pagina"><div class="titulos"><h1>Ajustes</h1><p class="sub">Valores usados no cálculo dos preços, aparência e sincronização.</p></div></div>';

  // Sincronização
  h += '<section class="bloco" id="sync"><h2>Sincronização</h2>';
  if (modo === 'planilha') {
    h += '<p class="explica">Conectado à planilha. Última sincronização: ' + (S.meta.ultimaSync ? dataHoraBR(S.meta.ultimaSync) : 'ainda não') + '.</p>' +
      '<div class="aviso ' + (s.e === 'ok' ? 'pos' : s.e === 'erro' || s.e === 'pin' ? 'neg' : '') + '" style="margin-bottom:12px">' + s.i + '<div class="txt"><b>' + esc(s.t) + '</b>' + (S.sync.msg ? '<br>' + esc(S.sync.msg) : '') + '</div></div>' +
      '<div class="acoes"><button type="button" class="btn" data-acao="sync-agora">' + I.girar + 'Sincronizar agora</button><button type="button" class="btn sec" data-acao="trocar-pin">Trocar PIN</button><button type="button" class="btn sec" data-acao="editar-conexao">Mudar endereço ou PIN deste aparelho</button><button type="button" class="btn perigo" data-acao="esquecer">Esquecer este aparelho</button></div>';
  } else {
    h += '<p class="explica">Os dados estão só neste aparelho. Ao conectar, tudo o que você já cadastrou é enviado para a planilha.</p>' +
      '<form id="form-conectar"><div class="grade"><label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" required></label>' +
      '<label class="campo"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" autocomplete="off" required minlength="6"></label></div>' +
      '<p class="mudo" id="msg-conectar" style="margin:8px 0;min-height:1.5em" role="status"></p><div class="acoes"><button class="btn" type="submit">Conectar à planilha</button><button type="button" class="btn perigo" data-acao="apagar-teste">Apagar dados deste aparelho</button></div></form>';
  }
  if (S.meta.conflitos.length) {
    h += '<hr class="separa"><h3 id="conflitos">Versões que ficaram de fora</h3><p class="explica" style="margin-top:6px">Estes registros foram alterados em dois aparelhos ao mesmo tempo. Ficou a alteração mais recente; aqui está a outra, caso precise dela.</p><div class="lista">' +
      S.meta.conflitos.map(c => '<div class="item"><div class="principal"><div class="nome">' + esc((c.perdida && c.perdida.nome) || c.regId) + '</div><div class="det">' + esc(c.tabela) + ', ' + dataHoraBR(c.em) + '</div></div><div class="acoes"><button type="button" class="btn sec fino" data-acao="ver-conflito" data-id="' + c.id + '">Ver versão</button><button type="button" class="btn fino" data-acao="restaurar-conflito" data-id="' + c.id + '">Restaurar esta versão</button><button type="button" class="btn perigo fino" data-acao="dispensar-conflito" data-id="' + c.id + '">Dispensar</button></div></div>').join('') + '</div>';
  }
  h += '</section>';

  // Custos fixos
  h += '<h2 class="titulo-grupo">Ajustes da doceria</h2><p class="mudo" style="margin:-4px 0 10px">Estes ajustes valem para todos os aparelhos. Custos fixos, mão de obra, preços e taxas e dados da doceria aparecem por extenso na aba Ajustes da planilha.</p>' +
    '<div id="estado-ajustes" class="aviso" role="status" style="margin-bottom:16px"></div>';
  h += '<section class="bloco" id="fixos"><h2>Custos fixos do mês</h2><p class="explica">Contas que chegam todo mês, vendendo ou não. O total é dividido pelas horas de produção e entra no custo de cada receita conforme o tempo dela.</p>' + (function () {
      const mc = mediaContas(), manual = (cf.custosFixos || []).reduce((s, c) => s + (C.numOk(c.valor) ? c.valor : 0), 0), fonte = cf.custosFixosFonte === 'contas' ? 'contas' : 'manual';
      return '<div class="fontes-fixos" role="group" aria-label="Qual valor usar no preço">' +
        '<button type="button" class="opcao-fixos" data-acao="fonte-fixos" data-v="manual" aria-pressed="' + (fonte === 'manual') + '"><span class="r">Preenchido à mão</span><span class="v">' + C.brl(manual) + '</span><small>a lista abaixo</small></button>' +
        '<button type="button" class="opcao-fixos" data-acao="fonte-fixos" data-v="contas" aria-pressed="' + (fonte === 'contas') + '"><span class="r">Pelas contas pagas</span><span class="v">' + (C.numOk(mc.media) ? C.brl(mc.media) : '—') + '</span><small>' + (mc.considerados ? 'média de ' + (mc.considerados === 1 ? '1 mês' : mc.considerados + ' meses') + ' (' + mc.meses.filter(m => m.total > 0).map(m => C.nomeMes(m.mes, true)).join(', ') + ')' : 'sem "Contas fixas" pagas nos últimos 3 meses') + '</small></button></div>' +
        '<p class="mudo" style="margin:8px 0 14px">Toque para escolher qual entra no preço das receitas. Em uso: <b>' + (fonte === 'contas' ? (C.numOk(mc.media) ? 'contas pagas' : 'à mão (ainda não há contas pagas para a média)') : 'à mão') + '</b>.</p>' +
        (mc.itens.length ? '<details class="ajuda" style="margin-bottom:14px"><summary>Ver a média por conta</summary><div><ul class="historico">' + mc.itens.map(i => '<li><span>' + esc(i.descricao) + '</span><span>' + C.brl(i.media) + '</span></li>').join('') + '</ul><p class="mudo" style="margin-top:8px">Vem das saídas da categoria "Contas fixas" nos 3 meses completos anteriores.</p></div></details>' : '');
    })() + '<div class="linhas-edit"><div class="linhas-edit">' +
    cf.custosFixos.map((c, i) => '<div class="linha-edit" style="grid-template-columns:1fr 150px auto"><input class="entrada" data-cfg="custosFixos.' + i + '.nome" value="' + esc(c.nome) + '" aria-label="Nome do custo"><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="custosFixos.' + i + '.valor" data-n inputmode="decimal" value="' + inNum(c.valor) + '" aria-label="Valor de ' + esc(c.nome) + '"></span><button type="button" class="btn-icone" data-acao="rem-fixo" data-i="' + i + '" aria-label="Remover ' + esc(c.nome) + '">' + I.lixo + '</button></div>').join('') +
    '</div><button type="button" class="btn sec" style="margin-top:12px" data-acao="add-fixo">' + I.mais + 'Adicionar custo fixo</button>' +
    '<div class="grade" style="margin-top:16px"><label class="campo"><span>Horas de produção por mês</span><span class="com-prefixo"><input class="entrada num" data-cfg="horasMes" data-n inputmode="decimal" value="' + inNum(cf.horasMes) + '"><i class="dir">h</i></span><small>Ex.: 5 dias por semana, 6 horas por dia: cerca de 120 h.</small></label>' +
    '<div class="campo"><span>Resultado usado no preço</span><p style="font-weight:700;padding-top:10px">' + C.brl(C.totalFixos(cf)) + ' por mês, ' + (C.numOk(C.fixosPorHora(cf)) ? C.brl(C.fixosPorHora(cf)) + ' por hora' : 'defina as horas') + '</p></div></div></section>';

  // Mão de obra
  const mo = cf.maoObra;
  h += '<section class="bloco"><h2>Mão de obra</h2><p class="explica">Seu trabalho também é custo. Sem ele, o preço parece bom, mas você trabalha de graça.</p>' +
    '<div class="seg" role="group" aria-label="Como definir a mão de obra"><button type="button" data-acao="modo-mo" data-v="hora" aria-pressed="' + (mo.modo !== 'salario') + '">Valor da hora</button><button type="button" data-acao="modo-mo" data-v="salario" aria-pressed="' + (mo.modo === 'salario') + '">Salário desejado</button></div>' +
    '<div class="grade" style="margin-top:14px">' +
    (mo.modo === 'salario'
      ? '<label class="campo"><span>Quanto quer tirar por mês</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="maoObra.salario" data-n inputmode="decimal" value="' + inNum(mo.salario) + '"></span></label><label class="campo"><span>Horas trabalhadas por mês</span><span class="com-prefixo"><input class="entrada num" data-cfg="maoObra.horasTrabalhadas" data-n inputmode="decimal" value="' + inNum(mo.horasTrabalhadas) + '"><i class="dir">h</i></span></label>'
      : '<label class="campo"><span>Valor da sua hora</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="maoObra.valorHora" data-n inputmode="decimal" value="' + inNum(mo.valorHora) + '"></span></label>') +
    '<div class="campo"><span>Resultado</span><p style="font-weight:700;padding-top:10px">' + (C.numOk(C.valorHora(cf)) ? C.brl(C.valorHora(cf)) + ' por hora' : 'preencha os campos') + '</p></div></div></section>';

  // Preços e taxas
  const t = cf.taxas;
  h += '<section class="bloco"><h2>Preços e taxas</h2><div class="grade">' +
    campoPct('Margem padrão das receitas novas', 'margemPadrao', cf.margemPadrao) +
    campoPct('Avisar quando a margem ficar abaixo de', 'margemAlerta', cf.margemAlerta) +
    campoPct('Sinal padrão dos pedidos', 'sinalPadraoPct', cf.sinalPadraoPct) +
    campoPct('Cartão de débito', 'taxas.debito', t.debito) +
    campoPct('Crédito à vista', 'taxas.credito', t.credito) +
    campoPct('Crédito parcelado', 'taxas.parcelado', t.parcelado) +
    campoPct('Aplicativo de entrega', 'taxas.app', t.app) +
    '<label class="campo"><span>Taxa de entrega padrão</span><span class="com-prefixo"><i>R$</i><input class="entrada num" data-cfg="taxas.entrega" data-n inputmode="decimal" value="' + inNum(t.entrega) + '"></span></label>' +
    '</div></section>';

  // Doceria
  const dc = cf.doceria;
  const me = cf.estoqueModo || 'manual';
  h += '<section class="bloco" id="estoque"><h2>Estoque</h2><div class="seg" role="group" aria-label="Modo do estoque">' +
    [['completo', 'Completo'], ['manual', 'Só manual'], ['desligado', 'Desligado']].map(o => '<button type="button" data-acao="modo-estoque" data-v="' + o[0] + '" aria-pressed="' + (me === o[0]) + '">' + o[1] + '</button>').join('') + '</div>' +
    '<p class="explica" style="margin:10px 0 0">' + (me === 'completo' ? 'Compras lançadas no Caixa somam ao estoque, pedidos que entram em produção descontam os ingredientes e a vitrine desconta o que for feito para ela. Você ainda pode contar e corrigir quando quiser.' : me === 'manual' ? 'Você registra entradas, perdas e contagens na aba Estoque. O app avisa o que está abaixo do mínimo ou perto de vencer, e a lista de compras desconta o que você tem.' : 'A aba Estoque fica desativada e a lista de compras não desconta nada.') + '</p>' +
    (me !== 'desligado' ? '<div class="grade" style="margin-top:14px"><label class="campo"><span>Avisar sobre validade com antecedência de</span><span class="com-prefixo"><input class="entrada num" data-cfg="diasAlertaValidade" data-n inputmode="numeric" value="' + inNum(cf.diasAlertaValidade) + '"><i class="dir">dias</i></span></label></div>' : '') + '</section>';
  h += '<section class="bloco"><h2>Dados da doceria</h2><p class="explica">Aparecem nos orçamentos e comprovantes para WhatsApp (próxima etapa).</p><div class="grade">' +
    ['nome:Nome', 'instagram:Instagram', 'telefone:Telefone', 'email:E-mail'].map(x => { const [k, r] = x.split(':'); return '<label class="campo"><span>' + r + '</span><input class="entrada" data-cfg="doceria.' + k + '" value="' + esc(dc[k]) + '"></label>'; }).join('') + '</div></section>';

  // Aparência
  h += '<h2 class="titulo-grupo">Só neste aparelho</h2><section class="bloco"><h2>Aparência</h2><div class="campo"><span>Tema</span><div class="seg" role="group" aria-label="Tema">' +
    [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(o => '<button type="button" data-acao="tema" data-v="' + o[0] + '" aria-pressed="' + ((S.meta.tema || 'auto') === o[0]) + '">' + o[1] + '</button>').join('') + '</div></div>' +
    '<label class="campo" style="margin-top:14px"><span>Tamanho do texto: ' + Math.round((S.meta.fonte || 1) * 100) + '%</span><input type="range" min="0.85" max="1.3" step="0.05" value="' + (S.meta.fonte || 1) + '" id="fonte"></label></section>';

  // Backup
  h += '<section class="bloco"><h2>Backup</h2><p class="explica">A planilha já guarda tudo. O backup em arquivo é uma segurança extra, e também serve para levar os dados do modo de teste para outro lugar.</p><div class="acoes"><button type="button" class="btn sec" data-acao="exportar">' + I.baixar + 'Exportar backup (.json)</button><label class="btn sec" style="cursor:pointer">' + I.enviar + 'Importar backup<input type="file" accept="application/json,.json" id="importar" hidden></label></div></section>';

  h += '<p class="mudo" style="text-align:center;margin-top:8px">Espaço Nave ' + VERSAO + '<br><button type="button" class="link-btn" data-acao="procurar-atualizacao">Procurar atualização</button></p>';
  return h;
}
export function campoPct(rot, cam, v) {
  return '<label class="campo"><span>' + rot + '</span><span class="com-prefixo"><input class="entrada num" data-cfg="' + cam + '" data-n inputmode="decimal" value="' + inNum(v) + '"><i class="dir">%</i></span></label>';
}
// Cada ajuste entra na fila de envio (e no diário de segurança) no mesmo instante,
// para não se perder se o app fechar e não ser sobrescrito por uma sincronização.
export function editarConfig(el) {
  const c = clone(cfg());
  gravarCaminho(c, el.dataset.cfg, el.hasAttribute('data-n') ? C.lerNum(el.value) : el.value);
  gravarRegistro('config', c);
}
export function textoEstadoAjustes() {
  if (S.meta.modo !== 'planilha') return { cls: '', t: 'Modo de teste: estes ajustes ficam só neste aparelho até você conectar a planilha.' };
  const pend = S.fila.some(m => m.tabela === 'config');
  if (pend && S.sync.estado === 'offline') return { cls: '', t: 'Sem internet: as alterações serão enviadas para a planilha quando a conexão voltar.' };
  if (pend) return { cls: '', t: 'Enviando alterações para a planilha…' };
  if (S.sync.estado === 'erro' || S.sync.estado === 'pin') return { cls: 'neg', t: 'Não foi possível falar com a planilha. Veja a sincronização acima.' };
  const em = S.dados.config.geral && S.dados.config.geral.atualizadoEm;
  return { cls: 'pos', t: 'Salvo na planilha' + (em ? ' (última alteração em ' + dataHoraBR(em) + ')' : '') + '. Vale para todos os aparelhos.' };
}
export function atualizarEstadoAjustes() {
  const el = $('#estado-ajustes'); if (!el) return;
  const e = textoEstadoAjustes();
  el.className = 'aviso ' + e.cls; el.innerHTML = (e.cls === 'pos' ? I.ok : I.nuvem) + '<div class="txt">' + esc(e.t) + '</div>';
}
// ================= Backup =================
export function exportar() {
  const blob = new Blob([JSON.stringify({ app: 'espaco-nave', versao: 1, exportadoEm: agoraISO(), dados: S.dados }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'espaco-nave-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Backup exportado.');
}
export async function importar(arq) {
  let j;
  try { j = JSON.parse(await arq.text()); } catch (e) { toast('Arquivo inválido: não é um backup do Espaço Nave.'); return; }
  if (!j || j.app !== 'espaco-nave' || !j.dados) { toast('Arquivo inválido: não é um backup do Espaço Nave.'); return; }
  const tabs = TABELAS_LOCAIS.filter(t => j.dados[t] && typeof j.dados[t] === 'object');
  const nomes = NOMES_TABELAS;
  const partes = tabs.map(t => t === 'config' ? 'as configurações' : Object.values(j.dados[t]).filter(r => r && !r.excluidoEm).length + ' ' + nomes[t]);
  const ok = await confirmar('Substituir os dados?', 'O arquivo traz ' + partes.join(', ') + '. Isso vai substituir ' + tabs.map(t => nomes[t]).join(' e ') + ' que estão no app' + (S.meta.modo === 'planilha' ? ' e na planilha' : '') + '; o que não estiver no arquivo será excluído.', 'Substituir dados', true);
  if (!ok) return;
  tabs.forEach(function (t) {
    const novo = j.dados[t];
    Object.values(novo).forEach(r => { if (r && r.id) gravarRegistro(t, clone(r)); });
    Object.keys(S.dados[t]).forEach(id => { if (!novo[id] && !S.dados[t][id].excluidoEm) excluirRegistro(t, id); });
  });
  toast('Backup importado.'); render(false);
}
export function resumoDiferencas(a, b) {
  a = a || {}; b = b || {};
  const ks = Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).filter(k => !/Em$|^id$|^historico$/.test(k));
  const dif = ks.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  if (!dif.length) return '<p>As duas versões têm o mesmo conteúdo.</p>';
  const f = v => typeof v === 'object' ? JSON.stringify(v, null, 1) : String(v === null || v === undefined ? '—' : v);
  return dif.map(k => '<div><h3>' + esc(k) + '</h3><p class="mudo">Ficou de fora:</p><pre class="versao">' + esc(f(a[k])) + '</pre><p class="mudo">Valendo:</p><pre class="versao">' + esc(f(b[k])) + '</pre></div>').join('');
}

// Ações dos botões desta parte (data-acao="...")
export const ACOES_AJUSTES = {
  'modo-estoque': function (el) { const c = clone(cfg()); c.estoqueModo = el.dataset.v; gravarRegistro('config', c); render(false); },
  'fonte-fixos': function (el) { const c = clone(cfg()); c.custosFixosFonte = el.dataset.v; gravarRegistro('config', c); render(false); },
  pilula: function () { if (S.meta.modo === 'planilha') sincronizar(); ir('#/ajustes'); },
  'sync-agora': function () { sincronizar().then(() => render(false)); },
  'add-fixo': function () { const c = cfg(); c.custosFixos.push({ nome: 'Novo custo', valor: null }); gravarRegistro('config', c); render(false); },
  'rem-fixo': function (el) { const c = cfg(); c.custosFixos.splice(+el.dataset.i, 1); gravarRegistro('config', c); render(false); },
  'modo-mo': function (el) { const c = cfg(); c.maoObra.modo = el.dataset.v; gravarRegistro('config', c); render(false); },
  tema: function (el) { S.meta.tema = el.dataset.v; aplicarTema(); salvarLocal(); render(false); },
  exportar: exportar,
  'trocar-pin': function () {
    abrirFolha('Trocar PIN da doceria', '<p class="mudo">O PIN novo vale para todos os aparelhos. Nos outros, será preciso digitá-lo de novo em Ajustes.</p><form id="f-pin" style="display:flex;flex-direction:column;gap:12px"><label class="campo"><span>PIN novo</span><input class="entrada" name="p1" type="password" minlength="6" required autocomplete="new-password"></label><label class="campo"><span>Repita o PIN novo</span><input class="entrada" name="p2" type="password" minlength="6" required autocomplete="new-password"></label><p class="mudo" id="msg-pin" role="status"></p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Trocar PIN</button></div></form>', function (d) {
      $('#f-pin', d).addEventListener('submit', async function (e) {
        e.preventDefault(); const f = e.target;
        if (f.p1.value !== f.p2.value) { $('#msg-pin', d).textContent = 'Os dois campos estão diferentes.'; return; }
        try {
          const r = await chamar({ acao: 'trocarPin', pin: S.meta.pin, novoPin: f.p1.value });
          if (!r.ok) { $('#msg-pin', d).textContent = r.erro === 'pin_curto' ? 'Use pelo menos 6 caracteres.' : (ERROS[r.erro] || 'Não foi possível trocar.'); return; }
          S.meta.pin = f.p1.value; salvarLocal(); d.close(); toast('PIN trocado.');
        } catch (err) { $('#msg-pin', d).textContent = 'Sem conexão com a planilha. Tente com internet.'; }
      });
    });
  },
  'editar-conexao': function () {
    abrirFolha('Conexão deste aparelho', '<form id="form-conectar" style="display:flex;flex-direction:column;gap:12px"><label class="campo"><span>Endereço do app da planilha</span><input class="entrada" name="url" value="' + esc(S.meta.url) + '" required></label><label class="campo"><span>PIN da doceria</span><input class="entrada" name="pin" type="password" required minlength="6"></label><p class="mudo" id="msg-conectar" role="status"></p><div class="rodape-folha"><button type="button" class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit">Conectar</button></div></form>');
  },
  esquecer: async function () {
    const pend = S.fila.length;
    const txt = 'O app volta para a tela inicial e apaga a cópia local. Os dados continuam na planilha.' + (pend ? ' <b>Atenção: ' + pend + ' alterações ainda não foram enviadas e serão perdidas.</b>' : '');
    if (!await confirmar('Esquecer este aparelho?', txt, 'Esquecer aparelho', true)) return;
    S.dados = dadosVazios(); S.fila = []; lsGravar('diario', []);
    S.meta = { modo: null, url: '', pin: '', ultimaSync: '', conflitos: [], tema: S.meta.tema, fonte: S.meta.fonte };
    salvarLocal(); await gravarJa(); location.hash = '#/inicio'; render(true);
  },
  'apagar-teste': async function () {
    if (!await confirmar('Apagar dados deste aparelho?', 'Apaga tudo o que foi cadastrado no modo de teste. Não dá para desfazer.', 'Apagar dados', true)) return;
    S.dados = dadosVazios(); S.fila = []; lsGravar('diario', []);
    S.meta.modo = null; salvarLocal(); await gravarJa(); location.hash = '#/inicio'; render(true);
  },
  'ver-conflito': function (el) {
    const c = S.meta.conflitos.find(x => x.id === el.dataset.id); if (!c) return;
    abrirFolha('Versão que ficou de fora', '<p class="mudo">Alterada em ' + dataHoraBR(c.perdida && c.perdida.atualizadoEm) + '. A versão que ficou valendo é de ' + dataHoraBR(c.vencedora && c.vencedora.atualizadoEm) + '.</p>' + resumoDiferencas(c.perdida, c.vencedora));
  },
  'restaurar-conflito': async function (el) {
    const c = S.meta.conflitos.find(x => x.id === el.dataset.id); if (!c) return;
    if (!await confirmar('Restaurar esta versão?', 'A versão que ficou de fora volta a valer em todos os aparelhos.', 'Restaurar')) return;
    const r = clone(c.perdida); delete r.excluidoEm;
    gravarRegistro(c.tabela, r);
    S.meta.conflitos = S.meta.conflitos.filter(x => x.id !== c.id); salvarLocal(); toast('Versão restaurada.'); render(false);
  },
  'dispensar-conflito': function (el) { S.meta.conflitos = S.meta.conflitos.filter(x => x.id !== el.dataset.id); salvarLocal(); render(false); }
};

// Eventos globais desta parte (registrados uma vez, no arranque)
export function eventosAjustes() {
  document.addEventListener('input', function (e) {
    if (e.target.dataset && e.target.dataset.cfg) editarConfig(e.target);
    if (e.target.id === 'fonte') { S.meta.fonte = Number(e.target.value); aplicarTema(); salvarLocal(); e.target.previousElementSibling.textContent = 'Tamanho do texto: ' + Math.round(S.meta.fonte * 100) + '%'; }
  });
  document.addEventListener('change', function (e) {
    if (e.target.dataset && e.target.dataset.cfg) { editarConfig(e.target); setTimeout(() => { if (!document.activeElement || !document.activeElement.dataset.cfg) render(false); }, 700); }
    if (e.target.id === 'importar' && e.target.files[0]) importar(e.target.files[0]);
  });
}
