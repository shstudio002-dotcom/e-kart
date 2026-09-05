// backend/config/adminConfig.js
require('dotenv').config();

module.exports = {
  name: process.env.ADMIN_NAME || 'Hub Admin',
  mobile: process.env.ADMIN_MOBILE || '9999999999',
  password: process.env.ADMIN_PLAIN_PASSWORD || 'adminpassword123',
  role: 'admin'
};