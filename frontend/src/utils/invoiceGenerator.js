export const downloadInvoice = (order, userEmail = null) => {
    // Determine the print window details
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
        alert('Please allow popups to download/print the invoice');
        return;
    }

    const orderNumber = order.orderNumber || order._id;
    const orderDate = new Date(order.orderDate || order.orderedDate || order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Address extraction
    const shipping = order.shippingAddress || {};
    
    // Format recipient name
    const customerName = shipping.fullName || shipping.name || order.customerName || 'Valued Customer';

    // Product rows formatting
    const products = order.products || order.items || [];
    const itemRows = products.map((item) => {
        const prod = item.product || {};
        const name = prod.name || item.productName || 'Product';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const total = price * qty;
        
        // Find seller details if populated
        const storeObj = prod.store || order.store;
        const sellerName = (storeObj && typeof storeObj === 'object') ? storeObj.name : (order.storeName || 'Unity Threads Central');
        const sellerLocation = (storeObj && typeof storeObj === 'object') ? storeObj.location : 'Unity Threads Hub';

        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eef2f5; text-align: left; vertical-align: middle;">
                    <div style="font-weight: 700; color: #2c3e50; font-size: 13px;">${name}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 2px;">Seller: ${sellerName} (${sellerLocation})</div>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eef2f5; text-align: center; color: #2c3e50; vertical-align: middle;">${qty}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eef2f5; text-align: right; color: #2c3e50; vertical-align: middle;">₹${price.toFixed(2)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eef2f5; text-align: right; font-weight: 700; color: #2c3e50; vertical-align: middle;">₹${total.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    // Compute totals
    const subtotal = products.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    // Mimic the order summary shipping logic
    const shippingFee = subtotal > 1000 ? 0 : 50;
    const grandTotal = subtotal + shippingFee;

    // Build invoice HTML
    const htmlContent = `
        <html>
            <head>
                <title>Invoice - #${orderNumber}</title>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #4a5568;
                        margin: 0;
                        padding: 40px;
                        background-color: #fff;
                    }
                    .invoice-box {
                        max-width: 800px;
                        margin: auto;
                        padding: 30px;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    table {
                        width: 100%;
                        line-height: inherit;
                        text-align: left;
                        border-collapse: collapse;
                    }
                    .header-table td {
                        padding-bottom: 30px;
                        vertical-align: middle;
                    }
                    .info-table td {
                        padding-bottom: 30px;
                        vertical-align: top;
                        width: 50%;
                    }
                    .items-table th {
                        background: #f7fafc;
                        border-bottom: 2px solid #edf2f7;
                        font-weight: 700;
                        padding: 12px;
                        color: #2d3748;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .totals-table td {
                        padding: 6px 12px;
                    }
                    hr {
                        border: 0;
                        border-top: 1px solid #edf2f7;
                        margin: 20px 0;
                    }
                    @media print {
                        body { 
                            padding: 0; 
                            background-color: #fff;
                        }
                        .invoice-box {
                            box-shadow: none;
                            border: none;
                            padding: 0;
                            margin: 0;
                            max-width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <table class="header-table">
                        <tr>
                            <td>
                                <div style="font-size: 26px; font-weight: 800; color: #b8001f; letter-spacing: -0.5px;">
                                    Unity Threads
                                </div>
                                <div style="font-size: 11px; color: #718096; margin-top: 2px; font-weight: 600;">ஒன்றிணைந்த நூலிழை</div>
                            </td>
                            <td style="text-align: right;">
                                <div style="font-size: 20px; font-weight: 800; color: #2d3748; text-transform: uppercase; letter-spacing: 1px;">
                                    Tax Invoice
                                </div>
                                <div style="font-size: 13px; color: #718096; margin-top: 4px;">Original Copy</div>
                            </td>
                        </tr>
                    </table>

                    <hr />

                    <table class="info-table">
                        <tr>
                            <td>
                                <div style="color: #718096; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Billed To (Recipient):</div>
                                <div style="font-size: 15px; font-weight: 700; color: #2d3748; margin-bottom: 4px;">${customerName}</div>
                                <div style="color: #4a5568; line-height: 1.5;">
                                    ${shipping.address || 'N/A'}<br />
                                    ${shipping.city || 'N/A'}${shipping.state ? ', ' + shipping.state : ''} - ${shipping.pincode || shipping.postalCode || ''}<br />
                                    <strong>Phone:</strong> ${shipping.phone || 'N/A'}<br />
                                    <strong>Email:</strong> ${order.customerEmail || order.user?.email || userEmail || 'N/A'}
                                </div>
                            </td>
                            <td style="text-align: right;">
                                <div style="color: #718096; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order Details:</div>
                                <div style="color: #4a5568; line-height: 1.6;">
                                    <strong>Invoice No:</strong> ${orderNumber}<br />
                                    <strong>Purchase Date:</strong> ${orderDate}<br />
                                    <strong>Payment Method:</strong> ${order.paymentMethod || 'COD'}<br />
                                    <strong>Payment Status:</strong> <span style="font-weight: 700; color: ${order.paymentStatus === 'Paid' ? '#2f855a' : '#c05621'};">${order.paymentStatus || 'Pending'}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table class="items-table" style="margin-bottom: 25px;">
                        <thead>
                          <tr>
                            <th style="text-align: left;">Product Details</th>
                            <th style="width: 10%; text-align: center;">Qty</th>
                            <th style="width: 20%; text-align: right;">Unit Price</th>
                            <th style="width: 20%; text-align: right;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <table style="width: 45%; margin-left: auto; margin-bottom: 40px;" class="totals-table">
                        <tr>
                            <td style="text-align: right; color: #718096; font-size: 13px;">Subtotal:</td>
                            <td style="text-align: right; font-weight: 600; color: #2d3748; font-size: 13px;">₹${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; color: #718096; font-size: 13px;">Shipping Fee:</td>
                            <td style="text-align: right; font-weight: 600; color: #2d3748; font-size: 13px;">₹${shippingFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><hr style="margin: 8px 0;" /></td>
                        </tr>
                        <tr style="font-size: 16px; color: #b8001f;">
                            <td style="text-align: right; font-weight: 800; padding-top: 5px;">Grand Total:</td>
                            <td style="text-align: right; font-weight: 800; padding-top: 5px;">₹${grandTotal.toFixed(2)}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 60px; text-align: center; color: #a0aec0; font-size: 11px; border-top: 1px solid #edf2f7; padding-top: 20px; line-height: 1.5;">
                        Thank you for your purchase with Unity Threads!<br />
                        This is an electronically generated document and does not require a physical signature.<br />
                        For customer support, please contact help@unitythreads.com.
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    }
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
