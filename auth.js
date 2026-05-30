// auth.js — Sistema de senha compartilhado
const AppAuth = {
  KEY: 'app-senha',
  SESSION_KEY: 'auth-session',
  DEFAULT: 'joter2027',

  getSenha() {
    return localStorage.getItem(this.KEY) || this.DEFAULT;
  },

  setSenha(nova) {
    localStorage.setItem(this.KEY, nova);
    if (typeof db !== 'undefined') db.set(this.KEY, nova);
  },

  estaAutenticado() {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  marcarAutenticado() {
    sessionStorage.setItem(this.SESSION_KEY, '1');
  },

  // Modal de senha para ações pontuais (botão adicionar)
  verificar(callback) {
    if (this.estaAutenticado()) { callback(); return; }
    this._abrirModal(callback);
  },

  // Bloqueia a página inteira até senha correta
  verificarPagina() {
    if (this.estaAutenticado()) return;
    this._mostrarOverlay();
  },

  _abrirModal(callback) {
    const overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) { this._injectarModal(); }
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    document.getElementById('auth-input').value = '';
    document.getElementById('auth-erro').style.display = 'none';
    document.getElementById('auth-modal-overlay')._callback = callback;
    setTimeout(() => document.getElementById('auth-input').focus(), 50);
  },

  _confirmar() {
    const val = document.getElementById('auth-input').value;
    if (val === AppAuth.getSenha()) {
      AppAuth.marcarAutenticado();
      document.getElementById('auth-modal-overlay').style.display = 'none';
      const cb = document.getElementById('auth-modal-overlay')._callback;
      if (cb) cb();
    } else {
      document.getElementById('auth-erro').style.display = 'block';
      document.getElementById('auth-input').value = '';
      document.getElementById('auth-input').focus();
    }
  },

  _mostrarOverlay() {
    document.body.style.overflow = 'hidden';
    const div = document.createElement('div');
    div.id = 'auth-page-overlay';
    div.style.cssText = 'position:fixed;inset:0;background:var(--creme);z-index:9999;display:flex;align-items:center;justify-content:center;';
    div.innerHTML = `
      <div style="background:var(--branco);border-radius:20px;border:.5px solid #EED8C8;padding:36px;width:360px;text-align:center;box-shadow:0 20px 60px rgba(139,34,64,.15);">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:.15em;color:var(--rosa);text-transform:uppercase;margin-bottom:8px;">Área restrita</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--rosa-escuro);margin-bottom:6px;">Configurações</div>
        <div style="font-size:12px;color:var(--taupe);margin-bottom:24px;">Digite a senha para acessar esta área</div>
        <input id="auth-page-input" type="password" placeholder="Senha" style="width:100%;border:.5px solid #EED8C8;border-radius:10px;padding:11px 14px;font-size:14px;font-family:'Nunito',sans-serif;background:var(--creme);color:#3E3530;outline:none;margin-bottom:10px;text-align:center;letter-spacing:.1em;"/>
        <div id="auth-page-erro" style="display:none;font-size:11px;color:#A32D2D;margin-bottom:10px;">Senha incorreta. Tente novamente.</div>
        <button onclick="AppAuth._confirmarPagina()" style="width:100%;background:var(--rosa);color:white;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Nunito',sans-serif;">Entrar</button>
        <button onclick="history.back()" style="width:100%;background:none;border:none;padding:10px;font-size:12px;color:var(--taupe);cursor:pointer;font-family:'Nunito',sans-serif;margin-top:4px;">← Voltar</button>
      </div>`;
    document.body.appendChild(div);
    setTimeout(() => document.getElementById('auth-page-input').focus(), 50);
    document.getElementById('auth-page-input').addEventListener('keydown', e => { if (e.key === 'Enter') AppAuth._confirmarPagina(); });
  },

  _confirmarPagina() {
    const val = document.getElementById('auth-page-input').value;
    if (val === AppAuth.getSenha()) {
      AppAuth.marcarAutenticado();
      document.body.style.overflow = '';
      document.getElementById('auth-page-overlay').remove();
    } else {
      document.getElementById('auth-page-erro').style.display = 'block';
      document.getElementById('auth-page-input').value = '';
      document.getElementById('auth-page-input').focus();
    }
  },

  _injectarModal() {
    const div = document.createElement('div');
    div.id = 'auth-modal-overlay';
    div.style.cssText = 'position:fixed;inset:0;background:rgba(139,34,64,.3);backdrop-filter:blur(4px);z-index:500;display:none;align-items:center;justify-content:center;';
    div.innerHTML = `
      <div style="background:var(--branco);border-radius:20px;border:.5px solid #EED8C8;padding:28px;width:340px;text-align:center;box-shadow:0 20px 60px rgba(139,34,64,.2);">
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:.15em;color:var(--rosa);text-transform:uppercase;margin-bottom:8px;">Confirmação</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--rosa-escuro);margin-bottom:6px;">Digite a senha</div>
        <div style="font-size:12px;color:var(--taupe);margin-bottom:20px;">Esta ação é protegida por senha</div>
        <input id="auth-input" type="password" placeholder="Senha" style="width:100%;border:.5px solid #EED8C8;border-radius:10px;padding:10px 14px;font-size:14px;font-family:'Nunito',sans-serif;background:var(--creme);color:#3E3530;outline:none;margin-bottom:10px;text-align:center;letter-spacing:.1em;"/>
        <div id="auth-erro" style="display:none;font-size:11px;color:#A32D2D;margin-bottom:10px;">Senha incorreta. Tente novamente.</div>
        <div style="display:flex;gap:10px;">
          <button onclick="document.getElementById('auth-modal-overlay').style.display='none'" style="flex:1;padding:10px;background:var(--creme);color:var(--taupe);border:.5px solid #EED8C8;border-radius:10px;font-size:13px;cursor:pointer;font-family:'Nunito',sans-serif;">Cancelar</button>
          <button onclick="AppAuth._confirmar()" style="flex:1;background:var(--rosa);color:white;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Nunito',sans-serif;">Confirmar</button>
        </div>
      </div>`;
    document.body.appendChild(div);
    document.getElementById('auth-input').addEventListener('keydown', e => { if (e.key === 'Enter') AppAuth._confirmar(); });
  }
};

document.addEventListener('DOMContentLoaded', () => AppAuth._injectarModal());
