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
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Unity Threads Support" <${process.env.EMAIL_ADDRESS}>`,
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
  const orderItems = order.items && order.items.length > 0
    ? order.items
    : (order.products || []).map(item => ({
        productName: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price
      }));

  const itemRows = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const grandTotal = order.totalPrice !== undefined ? order.totalPrice : (order.totalAmount || 0);
  const paymentMethod = order.paymentMethod || 'COD';

  const getAddressHtml = (addr) => {
    if (!addr) return 'N/A';
    const name = addr.name || addr.fullName || 'Customer';
    const addressLine = addr.address || '';
    const city = addr.city || '';
    const postalCode = addr.postalCode || addr.pincode || '';
    const country = addr.country || 'India';
    const phone = addr.phone ? `Phone: ${addr.phone}` : '';
    return `${name}<br/>${addressLine}<br/>${city}, ${postalCode}<br/>${country}<br/>${phone}`;
  };

  const mailOptions = {
    from: `"Unity Threads" <${process.env.EMAIL_ADDRESS}>`,
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
            <td>${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Razorpay Order ID:</strong></td>
            <td>${order.razorpay_order_id || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Transaction ID:</strong></td>
            <td>${payment ? (payment.transactionId || payment._id) : 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Order Date:</strong></td>
            <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString()}</td>
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
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">₹${grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-bottom: 20px; font-size: 14px;">
          <div style="margin-bottom: 10px;">
            <strong>Shipping Address:</strong><br/>
            ${getAddressHtml(order.shippingAddress)}
          </div>
          <div>
            <strong>Billing Address:</strong><br/>
            ${getAddressHtml(order.billingAddress)}
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

const sendOrderCancellationEmail = async (toEmail, order, reason) => {
  const orderItems = order.items && order.items.length > 0
    ? order.items
    : (order.products || []).map(item => ({
        productName: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price
      }));

  const itemRows = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const grandTotal = order.totalPrice !== undefined ? order.totalPrice : (order.totalAmount || 0);

  const mailOptions = {
    from: `"Unity Threads" <${process.env.EMAIL_ADDRESS}>`,
    to: toEmail,
    subject: `Order Cancelled - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #D32F2F; text-align: center;">Order Cancellation Confirmation</h2>
        <p>Hi,</p>
        <p>Your order has been successfully cancelled. Here are the cancellation details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
            <td>${order.orderNumber || order._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Cancellation Reason:</strong></td>
            <td>${reason || 'Incorrect item/size selected'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Status:</strong></td>
            <td>${order.paymentStatus === 'Refunded' ? 'Refund Processed' : 'N/A (Unpaid/COD)'}</td>
          </tr>
        </table>

        <h3>Items Cancelled</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Cancelled Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #D32F2F;">₹${grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="font-size: 14px; color: #555;">
          If a payment was processed for this order, a refund has been initiated and should reflect in your account within 5-7 business days.
        </p>
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order cancellation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
  }
};

const sendReturnRequestEmail = async (toEmail, returnRequest, order) => {
  const mailOptions = {
    from: `"Unity Threads" <${process.env.EMAIL_ADDRESS}>`,
    to: toEmail,
    subject: `Return Request Received - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1A365D; text-align: center;">Return Request Received</h2>
        <p>Hi,</p>
        <p>We have received your return request for Order #${order.orderNumber || order._id}. Our team is reviewing the request and will update you shortly.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Return Request ID:</strong></td>
            <td>${returnRequest._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Reason:</strong></td>
            <td>${returnRequest.reason}</td>
          </tr>
          ${returnRequest.details ? `<tr><td style="padding: 5px 0;"><strong>Details:</strong></td><td>${returnRequest.details}</td></tr>` : ''}
          <tr>
            <td style="padding: 5px 0;"><strong>Status:</strong></td>
            <td><strong style="color: #dd6b20;">Pending Review</strong></td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #555;">
          Return requests are typically reviewed within 24 to 48 hours. Once approved, we will send you shipping details and schedule a pickup.
        </p>
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Return request email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending return request email:', error);
  }
};

const sendReturnStatusUpdateEmail = async (toEmail, returnRequest, productDetail, order) => {
  const isApproved = returnRequest.status === 'Approved';
  const statusColor = isApproved ? '#2E7D32' : '#D32F2F';
  
  const mailOptions = {
    from: `"Unity Threads" <${process.env.EMAIL_ADDRESS}>`,
    to: toEmail,
    subject: `Return Request ${returnRequest.status} - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${statusColor}; text-align: center;">Return Request ${returnRequest.status}</h2>
        <p>Hi,</p>
        <p>Your return request for product <strong>${productDetail?.name || 'Item'}</strong> in Order #${order.orderNumber || order._id} has been <strong>${returnRequest.status.toLowerCase()}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Return ID:</strong></td>
            <td>${returnRequest._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Status:</strong></td>
            <td><strong style="color: ${statusColor};">${returnRequest.status}</strong></td>
          </tr>
        </table>

        ${isApproved ? `
          <div style="background-color: #ebf8ff; border-left: 5px solid #3182ce; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: #2b6cb0;">Next Steps for Return & Refund:</h4>
            <p style="margin: 0; font-size: 14px; color: #2d3748;">
              1. Our courier partner will contact you to pick up the item within 2-3 business days.<br/>
              2. Please ensure the item is in its original packaging with tags intact.<br/>
              3. Once the item is received and inspected, your refund will be processed to your original payment method (usually within 5-7 business days).
            </p>
          </div>
        ` : `
          <div style="background-color: #fff5f5; border-left: 5px solid #e53e3e; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: #9b2c2c;">Reason for Decline:</h4>
            <p style="margin: 0; font-size: 14px; color: #2d3748;">
              Return requests are subject to inspection and must meet our returns criteria (items must be returned within 72 hours of delivery and in original/unworn condition). If you feel this is an error, please reach out to our support desk.
            </p>
          </div>
        `}

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          This is an automated system email. Thank you for shopping with Unity Threads.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Return status update email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending return status update email:', error);
  }
};

const sendRefundEmail = async (toEmail, order, refundAmount, transactionId) => {
  const mailOptions = {
    from: `"Unity Threads" <${process.env.EMAIL_ADDRESS}>`,
    to: toEmail,
    subject: `Refund Confirmation - Order #${order.orderNumber || order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2E7D32; text-align: center;">Refund Confirmation</h2>
        <p>Hi,</p>
        <p>A refund has been successfully processed for your order. Here are the refund transaction details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
            <td>${order.orderNumber || order._id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Amount:</strong></td>
            <td><strong style="color: #2E7D32;">₹${refundAmount.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Transaction ID:</strong></td>
            <td>${transactionId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Refund Date:</strong></td>
            <td>${new Date().toLocaleDateString()}</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #555;">
          The refunded amount has been sent to your original payment method. Depending on your financial institution, it may take 5 to 7 business days to reflect in your account.
        </p>
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
          Thank you for shopping with Unity Threads. If you have any questions, please contact our support team.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Refund confirmation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending refund confirmation email:', error);
  }
};

module.exports = {
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
  sendReturnRequestEmail,
  sendReturnStatusUpdateEmail,
  sendRefundEmail
};
