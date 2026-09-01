const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveApiBaseUrl } = require('../../frontend/api-config.js');

test('resolveApiBaseUrl prefers localhost backend on local file or localhost', () => {
  assert.equal(resolveApiBaseUrl('file://', 'file:', ''), 'http://localhost:5000/api');
  assert.equal(resolveApiBaseUrl('http://localhost:5000', 'http:', 'localhost'), 'http://localhost:5000/api');
});

test('resolveApiBaseUrl uses deployed API outside localhost', () => {
  assert.equal(resolveApiBaseUrl('https://example.com', 'https:', 'example.com'), 'https://e-kart-y4af.onrender.com/api');
});
