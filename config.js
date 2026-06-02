// config.js — Configuração global compartilhada entre todas as abas
// João & Ester · casamento-joao-ester.vercel.app

const AppConfig = {
  // Valores padrão
  defaults: {
    nomes: 'João & Ester',
    data: '2027-06-13',
    hora: '16:00',
    cidade: 'Brasília, DF',
  },

  // Carrega o estado mais recente do Supabase ou localStorage
  async carregar() {
    let state = null;
    if (typeof db !== 'undefined') {
      state = await db.get('dash-state');
    }
    if (!state) {
      const local = localStorage.getItem('dash-state');
      if (local) state = JSON.parse(local);
    }
    return state && state.evento ? state.evento : this.defaults;
  },

  // Formata a data para exibição
  formatarData(dataStr, formato = 'longo') {
    if (!dataStr) return '';
    const [y, m, d] = dataStr.split('-');
    const mesesLongo = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const mesesCurto = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    if (formato === 'longo') return `${d} de ${mesesLongo[parseInt(m)-1]} de ${y}`;
    if (formato === 'curto') return `${d} de ${mesesCurto[parseInt(m)-1]} de ${y}`;
    if (formato === 'numerico') return `${d}/${m}/${y}`;
    return `${d}/${m}/${y}`;
  },

  // Formata hora
  formatarHora(horaStr) {
    if (!horaStr) return '16h00';
    return horaStr.replace(':', 'h');
  },

  // Lê localStorage de forma síncrona (sem piscar)
  carregarSync() {
    try {
      const local = localStorage.getItem('dash-state');
      if (local) {
        const state = JSON.parse(local);
        if (state && state.evento) return state.evento;
      }
    } catch(e) {}
    return this.defaults;
  },

  // Atualiza a sidebar em qualquer página
  async atualizarSidebar() {
    // 1. Aplica imediatamente do localStorage (síncrono) — sem piscar
    const evSync = this.carregarSync();
    const elNomes = document.getElementById('sidebar-names');
    const elData = document.getElementById('sidebar-date');
    if (elNomes) elNomes.textContent = evSync.nomes || this.defaults.nomes;
    if (elData) elData.textContent = this.formatarData(evSync.data, 'curto');

    // 2. Se Supabase tiver dado mais recente, atualiza silenciosamente
    if (typeof db !== 'undefined') {
      const state = await db.get('dash-state');
      if (state && state.evento) {
        if (elNomes) elNomes.textContent = state.evento.nomes || this.defaults.nomes;
        if (elData) elData.textContent = this.formatarData(state.evento.data, 'curto');
      }
    }
  },

  // Atualiza o banner (só no dashboard)
  async atualizarBanner() {
    const ev = await this.carregar();
    const elNomes = document.getElementById('banner-names');
    const elSubtitle = document.getElementById('banner-subtitle');
    if (elNomes) elNomes.textContent = ev.nomes || this.defaults.nomes;
    if (elSubtitle) {
      const dataFmt = this.formatarData(ev.data, 'longo');
      const horaFmt = this.formatarHora(ev.hora);
      elSubtitle.textContent = `${dataFmt} · ${horaFmt} · ${ev.cidade || this.defaults.cidade}`;
    }
  },

  // Retorna target date para o countdown
  async getTargetDate() {
    const ev = await this.carregar();
    return new Date(`${ev.data}T${ev.hora}:00-03:00`);
  }
};

// Auto-atualizar sidebar ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
  AppConfig.atualizarSidebar();
});
