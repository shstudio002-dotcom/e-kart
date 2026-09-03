// frontend/api.js
const API_BASE_URL = 'https://e-kart-y4af.onrender.com/api';

const GroceryAPI = {
  // 1. Instant Cache-First Offer
  async getOffer() {
    const cached = localStorage.getItem('mfd_live_offer');
    if (cached) {
      // Revalidate in background
      fetch(`${API_BASE_URL}/offers`)
        .then(r => r.json())
        .then(data => localStorage.setItem('mfd_live_offer', JSON.stringify(data)))
        .catch(() => {});
      return JSON.parse(cached);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/offers`);
      const data = await res.json();
      localStorage.setItem('mfd_live_offer', JSON.stringify(data));
      return data;
    } catch {
      return { tag: 'OFFER OF ANY', title: 'Flat 20% OFF Daily Groceries!', subtitle: 'Farm fresh in 30-40 mins', deliveryFee: '₹0', speed: '35m' };
    }
  },

  // 2. Instant Cache-First Products
  async getProducts() {
    const cached = localStorage.getItem('mfd_catalog');
    if (cached) {
      fetch(`${API_BASE_URL}/products`)
        .then(r => r.json())
        .then(data => localStorage.setItem('mfd_catalog', JSON.stringify(data)))
        .catch(() => {});
      return JSON.parse(cached);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      localStorage.setItem('mfd_catalog', JSON.stringify(data));
      return data;
    } catch {
      return [];
    }
  },

  // 3. Instant Order Write
  async placeOrder(orderData) {
    const fallbackOrder = {
      orderId: 'MFD-' + Math.floor(10000 + Math.random() * 90000),
      ...orderData,
      status: 'point_hub',
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage immediately (0ms)
    let localOrders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
    localOrders.unshift(fallbackOrder);
    localStorage.setItem('mfd_orders', JSON.stringify(localOrders));
    localStorage.setItem('mfd_last_order', JSON.stringify(fallbackOrder));

    // Send to backend in background WITH the exact same orderId to prevent duplication
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: fallbackOrder.orderId,
        ...orderData
      })
    })
    .then(async res => {
      if (res.ok) {
        const savedOrder = await res.json();
        // Update local storage entry with the definitive server response object if needed
        let currentOrders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
        const index = currentOrders.findIndex(o => (o.orderId || o.id) === fallbackOrder.orderId);
        if (index !== -1) {
          currentOrders[index] = savedOrder;
          localStorage.setItem('mfd_orders', JSON.stringify(currentOrders));
        }
      }
    })
    .catch(e => console.warn('Background sync queued:', e));

    return fallbackOrder;
  },

  // 4. Instant Cache-First Orders
  async getOrders() {
    const cached = localStorage.getItem('mfd_orders');
    if (cached && JSON.parse(cached).length > 0) {
      // Background silent sync
      fetch(`${API_BASE_URL}/orders`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem('mfd_orders', JSON.stringify(data));
          }
        })
        .catch(() => {});
      return JSON.parse(cached);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      localStorage.setItem('mfd_orders', JSON.stringify(data));
      return data;
    } catch {
      return JSON.parse(localStorage.getItem('mfd_orders')) || [];
    }
  },

  // 5. Authentication APIs (Login / Signup)
  async login(identifier, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned an invalid response. Check backend connection.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  async signup(name, mobile, password) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, password })
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned an invalid response. Check backend connection.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  }
};