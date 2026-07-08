// Architect: SP
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP');
  }
};

const sendOrderConfirmationEmail = async (toEmail, order, payment) => {
  // Format items into HTML table rows
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: `Order Confirmation - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Thank You for Your Order!</h2>
        <p>Hi,</p>
        <p>Your payment was successful and your order has been placed. Here are your transaction details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Order ID:</strong></td>
            <td>${order._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
            <td>${order.orderNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
            <td>${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Razorpay Order ID:</strong></td>
            <td>${order.razorpay_order_id || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Razorpay Payment ID:</strong></td>
            <td>${payment ? payment.transactionId : 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Order Date:</strong></td>
            <td>${order.orderedDate ? new Date(order.orderedDate).toLocaleDateString() : new Date().toLocaleDateString()}</td>
          </tr>
        </table>

        <h3>Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Grand Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">₹${order.totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-bottom: 20px; font-size: 14px;">
          <div style="margin-bottom: 10px;">
            <strong>Shipping Address:</strong><br/>
            ${order.shippingAddress.name}<br/>
            ${order.shippingAddress.address}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
            ${order.shippingAddress.country}<br/>
            ${order.shippingAddress.phone ? 'Phone: ' + order.shippingAddress.phone : ''}
          </div>
          <div>
            <strong>Billing Address:</strong><br/>
            ${order.billingAddress.name}<br/>
            ${order.billingAddress.address}<br/>
            ${order.billingAddress.city}, ${order.billingAddress.postalCode}<br/>
            ${order.billingAddress.country}<br/>
            ${order.billingAddress.phone ? 'Phone: ' + order.billingAddress.phone : ''}
          </div>
        </div>

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          This is an automated email receipt. If you have any questions, please contact our customer support.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

module.exports = { sendOtpEmail, sendOrderConfirmationEmail };
