const sampleCsv = `id,date,category,description,amount,status
1,2026-09-15,receivable,Invoice #1042,1800,pending
2,2026-09-15,payable,Supplier invoice #778,950,due
3,2026-09-16,receivable,Invoice #1045,4200,pending
4,2026-09-16,expense,Advertising campaign,1200,active
5,2026-09-17,payable,Software subscription,299,due
6,2026-09-17,receivable,Invoice #1048,750,pending`;

let currentRows = [];
let currentReport = [];

const $ = (id) => document.getElementById(id);

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('O CSV precisa ter cabeçalho e pelo menos uma linha.');
  const headers = lines[0].split(',').map(v => v.trim().toLowerCase());
  const required = ['id', 'date', 'category', 'description', 'amount', 'status'];
  const missing = required.filter(h => !headers.includes(h));
  if (missing.length) throw new Error(`Colunas ausentes: ${missing.join(', ')}.`);
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]));
  });
}

function score(row) {
  let value = 0;
  if (row.status === 'pending') value += 60;
  if (row.status === 'due') value += 70;
  if (row.status === 'active') value += 20;
  const amount = Number(row.amount) || 0;
  value += Math.min(amount / 100, 40);
  if (row.category === 'receivable') value += 15;
  if (row.category === 'payable') value += 10;
  return value;
}

function priority(row) {
  if (row.category === 'receivable' && row.status === 'pending') return 'Cobrar / acompanhar recebimento';
  if (row.category === 'payable' && row.status === 'due') return 'Revisar pagamento devido';
  if (row.category === 'expense' && row.status === 'active') return 'Revisar gasto ativo';
  return 'Revisar item operacional';
}

function generateReport(rows) {
  return rows.map(row => ({
    ...row,
    score: score(row),
    action: priority(row)
  })).sort((a, b) => b.score - a.score);
}

function render(rows) {
  currentRows = rows;
  currentReport = generateReport(rows);
  $('summary').textContent = `${rows.length} itens analisados localmente.`;
  $('actions').innerHTML = currentReport.map((r, i) => `
    <li><div><strong>${escapeHtml(r.action)}</strong><span>${escapeHtml(r.description)} · R$ ${formatAmount(r.amount)}</span></div><b>#${i + 1}</b></li>
  `).join('');
  $('reportSection').classList.remove('hidden');
  $('observationSection').classList.remove('hidden');
  $('status').textContent = 'Relatório gerado no navegador. Nenhum dado foi enviado.';
}

function formatAmount(value) { return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

function download(name, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

$('sampleBtn').onclick = () => { try { render(parseCsv(sampleCsv)); } catch (e) { $('status').textContent = e.message; } };
$('csvInput').onchange = async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try { render(parseCsv(await file.text())); } catch (e) { $('status').textContent = e.message; }
};

$('downloadReport').onclick = () => {
  const text = ['# Daily Action Report', '', ...currentReport.map((r, i) => `${i + 1}. ${r.action} — ${r.description} — R$ ${formatAmount(r.amount)}`)].join('\n');
  download('action-report.md', text, 'text/markdown');
};

$('downloadObservation').onclick = () => {
  const observation = {
    experiment_ref: 'WS-016-first-value-experiment',
    observed_at: new Date().toISOString(),
    source: 'digital-market-test',
    sample_type: currentRows.length ? 'user-provided-or-sample' : 'unknown',
    report_items: currentReport.length,
    time_saved_minutes: Number($('timeSaved').value) || 0,
    useful_action: $('usefulAction').value.trim(),
    repeat_intent: $('repeatIntent').value,
    willingness_to_pay: $('willingnessToPay').value,
    comment: $('comment').value.trim()
  };
  download('observation.json', JSON.stringify(observation, null, 2));
  $('observationStatus').textContent = 'Observação exportada. Revise e atribua ao participante antes de tratá-la como evidência.';
};
