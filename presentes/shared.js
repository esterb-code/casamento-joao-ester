// shared.js — dados e utilidades da lista de presentes (usa ../supabase.js → Firebase)
const CHAVE = 'presentes';

const Presentes = {
  async listar() {
    const v = await db.get(CHAVE, []);
    const arr = Array.isArray(v) ? v : Object.values(v || {});
    return arr.filter(Boolean);
  },
  async salvar(lista) {
    return db.set(CHAVE, lista);
  },
  // Presentes já dados ficam em um nó separado (um registro por id), para o convidado
  // marcar sem sobrescrever a lista inteira que a administradora edita.
  // Configurações do site (padrão: ordem automática, do mais caro ao mais barato)
  async config() {
    try {
      const r = await fetch(`${FIREBASE_URL}/presentes_config.json`, { cache: 'no-store' });
      const v = r.ok ? await r.json() : null;
      return { ordemAuto: !(v && v.ordemAuto === false) };
    } catch (e) { return { ordemAuto: true }; }
  },
  async salvarConfig(cfg) {
    try {
      const r = await fetch(`${FIREBASE_URL}/presentes_config.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg)
      });
      return r.ok;
    } catch (e) { return false; }
  },
  async comprados() {
    try {
      const r = await fetch(`${FIREBASE_URL}/presentes_comprados.json`, { cache: 'no-store' });
      if (!r.ok) throw new Error();
      return (await r.json()) || {};
    } catch (e) { return null; }   // null = não consegui consultar
  },
  async marcar(id, nome) {
    try {
      const r = await fetch(`${FIREBASE_URL}/presentes_comprados/${encodeURIComponent(id)}.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: (nome || '').trim().slice(0, 60), em: new Date().toISOString() })
      });
      return r.ok;
    } catch (e) { return false; }
  },
  async liberar(id) {
    try {
      const r = await fetch(`${FIREBASE_URL}/presentes_comprados/${encodeURIComponent(id)}.json`, { method: 'DELETE' });
      return r.ok;
    } catch (e) { return false; }
  }
};

const brl = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function normalizaLink(u) {
  u = (u || '').trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function toast(msg, erro) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.toggle('erro', !!erro);
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 2600);
}

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) {}
    ta.remove();
    return ok;
  }
}

// Aplica nomes e data do casamento (usa o mesmo estado do painel de organização)
async function carregarEvento() {
  const padrao = { nomes: 'João & Ester', data: '2027-06-27' };
  try {
    const st = await db.get('dash-state');
    if (st && st.evento) return { nomes: st.evento.nomes || padrao.nomes, data: st.evento.data || padrao.data };
  } catch (e) {}
  return padrao;
}

function dataExtenso(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${d} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
}

// Do mais caro para o mais barato (empate mantém a ordem cadastrada)
const porPreco = lista => lista.map((p, i) => [p, i]).sort((a, b) => (Number(b[0].preco) || 0) - (Number(a[0].preco) || 0) || a[1] - b[1]).map(x => x[0]);
