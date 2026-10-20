// Firebase Realtime Database — João & Ester
const FIREBASE_URL = 'https://casamento-joao-ester-default-rtdb.firebaseio.com';

const db = {
  async get(key, fallback = null) {
    try {
      const res = await fetch(`${FIREBASE_URL}/${key}.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data !== null) {
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }
      return fallback;
    } catch (e) {
      console.warn('Firebase GET falhou, usando localStorage:', key);
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }
  },

  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    try {
      const res = await fetch(`${FIREBASE_URL}/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // salva timestamp separado para o polling detectar mudanças
      await fetch(`${FIREBASE_URL}/${key}_updated_at.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(new Date().toISOString())
      });
      return true;
    } catch (e) {
      console.warn('Firebase SET falhou:', e.message);
      return false;
    }
  },

  async getUpdatedAt(key) {
    try {
      const res = await fetch(`${FIREBASE_URL}/${key}_updated_at.json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data || null;
    } catch (e) { return null; }
  },

  async getMany(keys) {
    const result = {};
    await Promise.all(keys.map(async k => {
      result[k] = await this.get(k, null);
    }));
    return result;
  }
};
