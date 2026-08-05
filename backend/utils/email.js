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

const sendRefundEmail = async (toEmail, order, payment) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: `Refund Confirmation - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f44336; text-align: center;">Order Cancelled & Refund Processed</h2>
        <p>Hi,</p>
        <p>Your Order <strong>#${order.orderNumber || order._id}</strong> has been cancelled. We have successfully processed your refund of <strong>₹${order.totalPrice.toFixed(2)}</strong>. Here are the refund details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Order ID:</strong></td>
            <td>${order._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Amount:</strong></td>
            <td style="color: #f44336; font-weight: bold;">₹${order.totalPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Method:</strong></td>
            <td>${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Original Transaction ID:</strong></td>
            <td>${payment ? payment.transactionId : 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Cancellation Reason:</strong></td>
            <td>${order.cancelReason || 'N/A'}</td>
          </tr>
        </table>

        <p>Depending on your bank, the refunded amount will reflect in your account within 5-7 business days.</p>
        
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          If you did not request this cancellation or have any concerns, please contact our support team immediately.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Refund email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending refund email:', error);
  }
};

const sendReturnApprovalEmail = async (toEmail, order, product, refundAmount) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: `Return Request Approved & Refund Processed - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Return Approved & Refund Initiated</h2>
        <p>Hi,</p>
        <p>Your return request for product <strong>${product.name}</strong> from Order <strong>#${order.orderNumber || order._id}</strong> has been approved.</p>
        
        <p>We have successfully processed a refund of <strong>₹${refundAmount.toFixed(2)}</strong> to your original payment method. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Order ID:</strong></td>
            <td>${order._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Returned Product:</strong></td>
            <td>${product.name}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Amount:</strong></td>
            <td style="color: #4CAF50; font-weight: bold;">₹${refundAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Method:</strong></td>
            <td>${order.paymentMethod}</td>
          </tr>
        </table>

        <p>The refunded amount should reflect in your account within 5-7 business days.</p>
        
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          Thank you for shopping with us! If you have any questions, please contact our support team.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Return approval email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending return approval email:', error);
  }
};

module.exports = { sendOtpEmail, sendOrderConfirmationEmail, sendRefundEmail, sendReturnApprovalEmail };
