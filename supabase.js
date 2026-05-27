// Supabase — João & Ester
const SUPABASE_URL = 'https://vnbkjumpibcirrayfswo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYmtqdW1waWJjaXJyYXlmc3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mzg0OTQsImV4cCI6MjA5NTQxNDQ5NH0._RvaITN--mXRSxWErPKWkQoWrikGZxrm6IBF-QRWKjU';

const db = {
  _headers() {
    return {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
  },

  async get(key, fallback = null) {
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/site_data?key=eq.' + encodeURIComponent(key) + '&select=value',
        { headers: this._headers() }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(key, JSON.stringify(data[0].value));
        return data[0].value;
      }
      return fallback;
    } catch (e) {
      console.warn('Supabase GET offline, usando localStorage:', key);
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }
  },

  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/site_data', {
        method: 'POST',
        headers: Object.assign({}, this._headers(), { 'Prefer': 'resolution=merge-duplicates' }),
        body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return true;
    } catch (e) {
      console.warn('Supabase SET offline, salvo apenas localmente:', key);
      return false;
    }
  },

  async getMany(keys) {
    try {
      const param = keys.map(k => '"' + k + '"').join(',');
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/site_data?key=in.(' + param + ')&select=key,value',
        { headers: this._headers() }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const result = {};
      if (Array.isArray(data)) {
        data.forEach(r => {
          result[r.key] = r.value;
          localStorage.setItem(r.key, JSON.stringify(r.value));
        });
      }
      keys.forEach(k => {
        if (!(k in result)) {
          const v = localStorage.getItem(k);
          result[k] = v ? JSON.parse(v) : null;
        }
      });
      return result;
    } catch (e) {
      console.warn('Supabase GETMANY offline, usando localStorage');
      const result = {};
      keys.forEach(k => {
        const v = localStorage.getItem(k);
        result[k] = v ? JSON.parse(v) : null;
      });
      return result;
    }
  }
};
