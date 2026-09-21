// Architect: SP
const mongoose = require('mongoose');

/**
 * Resolves the customer's registered email address for an order with full fallbacks.
 * 1. Checks order.customerEmail
 * 2. Checks order.user.email if populated
 * 3. Looks up User by order.user or order.userid
 * @param {Object} order - The Order document or plain object
 * @returns {Promise<string|null>} - Lowercase email address or null
 */
async function getOrderCustomerEmail(order) {
  if (!order) return null;

  // 1. Direct field on order
  if (order.customerEmail && typeof order.customerEmail === 'string' && order.customerEmail.includes('@')) {
    return order.customerEmail.trim().toLowerCase();
  }

  // 2. Populated user document
  if (order.user && typeof order.user === 'object' && order.user.email) {
    return order.user.email.trim().toLowerCase();
  }

  // 3. Look up by user id (checking order.user and order.userid)
  const userId = (order.user && order.user._id) 
    ? order.user._id 
    : (order.user || order.userid);

  if (userId) {
    try {
      const User = mongoose.models.User || require('../models/user/User');
      const userDoc = await User.findById(userId).select('email');
      if (userDoc && userDoc.email) {
        return userDoc.email.trim().toLowerCase();
      }
    } catch (err) {
      console.error('Error in getOrderCustomerEmail User lookup:', err.message);
    }
  }

  // 4. Fallback to shipping address email if provided
  if (order.shippingAddress && order.shippingAddress.email && order.shippingAddress.email.includes('@')) {
    return order.shippingAddress.email.trim().toLowerCase();
  }

  return null;
}

module.exports = { getOrderCustomerEmail };
