// Motor: Texto: acentos e células de CSV seguras.
// Funções puras: não tocam na tela, na rede nem no armazenamento.

export function semAcento(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
export function celulaCSV(v) {
  let s = String(v === null || v === undefined ? '' : v);
  // Prefixa com ' o que pode virar fórmula, EXCETO números negativos puros (ex.: -1200,00)
  if (/^[\s\u0000-\u001F]*[=+\-@]/.test(s) && !/^-?\d+(?:[.,]\d+)?$/.test(s)) s = "'" + s;
  return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
