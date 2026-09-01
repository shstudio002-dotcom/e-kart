function resolveApiBaseUrl(origin, protocol, hostname) {
  const normalizedHostname = (hostname || '').toLowerCase();
  const normalizedOrigin = (origin || '').toLowerCase();
  const isLocalFile = !origin || origin === 'null' || normalizedOrigin === 'file://' || protocol === 'file:' || normalizedHostname === '' || normalizedHostname === 'null';
  const isLocalhost = normalizedHostname === 'localhost' || normalizedOrigin.includes('localhost');

  return isLocalFile || isLocalhost ? 'http://localhost:5000/api' : 'https://e-kart-y4af.onrender.com/api';
}

if (typeof window !== 'undefined') {
  window.resolveApiBaseUrl = resolveApiBaseUrl;
}

if (typeof module !== 'undefined') {
  module.exports = { resolveApiBaseUrl };
}
