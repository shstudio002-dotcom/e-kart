// admin/admin-api.js
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://e-kart-y4af.onrender.com/api';

const AdminAPI = {
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) throw new Error('Orders fetch failed');
      const data = await res.json();
      localStorage.setItem('mfd_orders', JSON.stringify(data));
      return data;
    } catch (e) {
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
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE'
    });
    let orders = JSON.parse(localStorage.getItem('mfd_orders')) || [];
    orders = orders.filter(o => (o.orderId || o.id || o._id) !== orderId);
    localStorage.setItem('mfd_orders', JSON.stringify(orders));
    if (!res.ok) throw new Error('Order deletion failed');
    return await res.json();
  },

  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Products fetch failed');
      const data = await res.json();
      localStorage.setItem('mfd_catalog', JSON.stringify(data));
      return data;
    } catch (e) {
      return JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    }
  },

  async addProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    const text = await res.text();
    let payload = {};
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { error: text };
      }
    }

    if (!res.ok) {
      throw new Error(payload.error || payload.details || 'Product add failed');
    }

    let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    prods.push(payload);
    localStorage.setItem('mfd_catalog', JSON.stringify(prods));
    return payload;
  },

  async updateProductPrice(productId, newPrice) {
    let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    const item = prods.find(p => String(p._id || p.id) === String(productId));
    if (item) {
      item.basePriceKg = Number(newPrice);
      localStorage.setItem('mfd_catalog', JSON.stringify(prods));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePriceKg: Number(newPrice) })
      });
      
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (err) {}

      if (!res.ok) {
        throw new Error(data.error || 'Server update failed');
      }
      return data;
    } catch (e) {
      console.warn('Backend price sync warning:', e);
      return { success: true, basePriceKg: Number(newPrice) };
    }
  },

  async deleteProduct(productId) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, { method: 'DELETE' });
    let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    prods = prods.filter(item => (item._id || item.id) !== productId);
    localStorage.setItem('mfd_catalog', JSON.stringify(prods));
    return await res.json();
  },

  async getOffer() {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`);
      if (!res.ok) throw new Error('Offer fetch failed');
      const data = await res.json();
      localStorage.setItem('mfd_active_offer', JSON.stringify(data));
      return data;
    } catch (e) {
      return JSON.parse(localStorage.getItem('mfd_active_offer')) || {
        tag: 'OFFER OF ANY',
        title: 'Flat 20% OFF Daily Groceries!',
        subtitle: 'Fresh farm staples delivered in 30-40 mins.',
        deliveryFee: '₹0',
        speed: '35m'
      };
    }
  },

  async saveOffer(offerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
      if (!res.ok) throw new Error('Offer save failed');
      const data = await res.json();
      localStorage.setItem('mfd_active_offer', JSON.stringify(offerData));
      return data;
    } catch (e) {
      localStorage.setItem('mfd_active_offer', JSON.stringify(offerData));
      return { success: true, offer: offerData };
    }
  }
};