// frontend/admin-api.js
const API_BASE_URL = resolveApiBaseUrl(
  window.location.origin,
  window.location.protocol,
  window.location.hostname
);

const AdminAPI = {
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) throw new Error('Orders fetch failed');
      const data = await res.json();
      localStorage.setItem('mfd_orders', JSON.stringify(data));
      return data;
    } catch (e) {
      console.warn('AdminAPI fallback (orders):', e);
      return JSON.parse(localStorage.getItem('mfd_orders')) || [];
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      let orders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
      const ord = orders.find(o => (o.orderId || o.id) === orderId);
      if (ord) ord.status = status;
      localStorage.setItem('mfd_orders', JSON.stringify(orders));
      
      return data;
    } catch (e) {
      let orders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
      const ord = orders.find(o => (o.orderId || o.id) === orderId);
      if (ord) ord.status = status;
      localStorage.setItem('mfd_orders', JSON.stringify(orders));
      return { success: true, status };
    }
  },

  async deleteOrder(orderId) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE'
      });
      let orders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
      orders = orders.filter(o => (o.orderId || o.id) !== orderId);
      localStorage.setItem('mfd_orders', JSON.stringify(orders));
      return await res.json();
    } catch (e) {
      let orders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
      orders = orders.filter(o => (o.orderId || o.id) !== orderId);
      localStorage.setItem('mfd_orders', JSON.stringify(orders));
      return { success: true };
    }
  },

  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Products fetch failed');
      const data = await res.json();
      localStorage.setItem('mfd_catalog', JSON.stringify(data));
      return data;
    } catch (e) {
      console.warn('AdminAPI fallback (products):', e);
      return JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    }
  },

  async addProduct(formData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        // DO NOT add headers: { 'Content-Type': 'application/json' } here. 
        // Leaving headers empty lets the browser handle the multipart FormData boundary automatically.
        body: formData
      });
      if (!res.ok) throw new Error('Product add failed');
      const saved = await res.json();
      let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
      prods.push(saved);
      localStorage.setItem('mfd_catalog', JSON.stringify(prods));
      return saved;
    } catch (e) {
      console.error('Add product network/server error:', e);
      throw e;
    }
  },

  async updateProductPrice(productId, basePriceKg) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePriceKg: Number(basePriceKg) })
      });
      return await res.json();
    } catch (e) {
      let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
      const p = prods.find(item => (item._id || item.id) === productId);
      if (p) p.basePriceKg = Number(basePriceKg);
      localStorage.setItem('mfd_catalog', JSON.stringify(prods));
      return { success: true };
    }
  },

  async deleteProduct(productId) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
      prods = prods.filter(item => (item._id || item.id) !== productId);
      localStorage.setItem('mfd_catalog', JSON.stringify(prods));
      return await res.json();
    } catch (e) {
      let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
      prods = prods.filter(item => (item._id || item.id) !== productId);
      localStorage.setItem('mfd_catalog', JSON.stringify(prods));
      return { success: true };
    }
  },

  async getOffer() {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`);
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('mfd_live_offer')) || {};
    }
  },

  async saveOffer(offerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
      return await res.json();
    } catch (e) {
      localStorage.setItem('mfd_live_offer', JSON.stringify(offerData));
      return { success: true };
    }
  },

  async login(identifier, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  async signup(name, mobile, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }
};