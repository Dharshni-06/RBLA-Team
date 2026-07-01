import React from 'react';
import './bulkorders.css';
import { useNavigate } from 'react-router-dom';

const BulkOrders = () => {
    const navigate = useNavigate();
  return (
    <>
      <section className="bulk-orders">
        <div className="bulk-orders-content">
          <h1>Place a bulk order with us</h1>
          <div className="underline"></div>
          <p>
            We partner with store owners, corporate clients, event companies, or others 
            interested in wholesale buying. Each order will be fully customized to fit your needs.
          </p>
          {/* Button linked to ContactUs page */}
        <button className="bulk-orders-btn" onClick={() => navigate('/ContactUs')}>
          Get In Touch
        </button>
        </div>
        <div className="bulk-orders-image"></div>
      </section>

      <section className="how-it-works">
        <h1 className="title">How it works</h1>
        <div className="divider"></div>
        <div className="steps-container">
          <div className="step">
            <h2>1. Contact Us</h2>
            <p>
              Reach out to us via email, WhatsApp, or our contact form. We’d love to 
              partner with you for any large event, corporate gift, or any other occasion 
              you have in mind. Every bulk order is completely curated to your needs and 
              can be subject to discounts.
            </p>
          </div>
          <div className="step">
            <h2>2. Customize your order</h2>
            <p>
              We can customize any craft order for you. You may order any of the items 
              available on our website or submit a request for unfeatured crafts. We have 
              direct partnerships with our artisans, so we can create any craft product 
              from any part of the country.
            </p>
          </div>
          
          <div className="step">
            <h2>3. Our artisans make your order</h2>
            <p>
              We work closely with you throughout the period of production, keeping you 
              apprised and updated on how your order is progressing right from the 
              sampling to the end of the production schedule.
            </p>
          </div>
          <div className="step">
            <h2>4. Receive your shipment</h2>
            <p>
              Bulk orders can be delivered both domestically within India or 
              internationally. However, delivery times will vary depending on the items 
              selected or delivery destination.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h1 className="title">Details</h1>
        <div className="divider"></div>
        <div className="steps-container">
          <div className="step">
            <h2>MINIMUMS</h2>
            <p>
            The minimum opening order for wholesale pricing is (Rs 20000).
            Prices and products are based on availability. All our bulk orders are prepaid. No COD orders are accepted.
            </p>
          </div>
          <div className="step">
            <h2>RETURNS</h2>
            <p>
            All of our products are carefully inspected, securely packed and sealed before leaving the shop. Damage in transit can happen and must be reported to the carrier immediately. All packages are automatically insured. 
            Please note: Since we offer volume discounts, we do not accept returns on bulk orders.
            </p>
          </div>
          <div className="step">
            <h2>SHIPPING</h2>
            <p>
            Shipping costs are based on the final weight of the products. We will give you the final price prior to shipping. All our shipments are sent via internationally reputed logistics partners who handle customs clearances. 
            However, the customer will have to bear any additional customs duties or taxes that may arise.
            </p>
          </div>
          <div className="step">
            <h2>HANDCRAFTED VARIATIONS</h2>
            <p>
            All of our products are handcrafted. Bulk orders for these products are necessarily subject to a unique set of conditions, given the fact that each product will be made individually. 
            In spite of these variables, UnityThreads stands behind the quality of our products.
            </p>
          </div>
        </div>
      </section>


    </>
  );
};

export default BulkOrders;
