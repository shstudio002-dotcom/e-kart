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

  async deleteProduct(productId) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, { method: 'DELETE' });
    let prods = JSON.parse(localStorage.getItem('mfd_catalog')) || [];
    prods = prods.filter(item => (item._id || item.id) !== productId);
    localStorage.setItem('mfd_catalog', JSON.stringify(prods));
    return await res.json();
  }
};