import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="policy-page-container">
            <div className="policy-page-card">
                <button className="policy-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="policy-page-header">
                    <div className="policy-header-badge">
                        <FileText size={20} />
                        <span>Legal Documentation</span>
                    </div>
                    <h1>Terms and Conditions</h1>
                    <p className="policy-last-updated">Last Updated: September 2026</p>
                </div>

                <div className="policy-page-content">
                    <div className="policy-section">
                        <h2>1. Introduction & Agreement</h2>
                        <p>
                            Welcome to <strong>RBLA Store</strong>. By accessing our website, purchasing our handcrafted products, or engaging our custom printing services, you agree to comply with and be bound by the following terms and conditions.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>2. Product Specifications & Customizations</h2>
                        <p>
                            Our products (including Towels, Bags, Napkins, Bedsheets, Cupcoasters, Bamboo items, and Paperfiles) are crafted using traditional techniques and sustainable materials.
                        </p>
                        <ul>
                            <li>Minor variations in fabric texture, dye intensity, and weave are characteristic of authentic handloom items.</li>
                            <li>For custom print designs, digital mockups displayed in customizers serve as visual guides; exact printed colors may vary slightly based on natural fiber absorption.</li>
                        </ul>
                    </div>

                    <div className="policy-section">
                        <h2>3. Pricing & Billing</h2>
                        <p>
                            All product prices are quoted in Indian Rupees (₹) inclusive of applicable taxes. Platform and shipping charges are explicitly detailed prior to checkout completion. We reserve the right to revise prices without prior notice.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>4. Payment Gateways & Processing</h2>
                        <p>
                            Payments are securely handled via <strong>Razorpay Payment Gateway</strong> or Cash on Delivery (COD) for eligible pin codes. Orders are processed once payment authorization is confirmed.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>5. Shipping & Order Fulfillments</h2>
                        <p>
                            Orders are dispatched within 1-3 business days. Estimated delivery timeframe is 3-7 business days depending on customer geographic location. Real-time tracking details will be supplied via SMS and email.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>6. Returns & Cancellation Policy</h2>
                        <p>
                            Standard unused items in original condition may be returned within 7 days via our <a href="/ReturnOrder">Returns Centre</a>. Custom personalized items are non-refundable unless damaged upon arrival.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>7. Governing Law</h2>
                        <p>
                            These terms shall be governed by and construed in accordance with the laws of India. Any disputes will be subject to exclusive jurisdiction in Tamil Nadu, India.
                        </p>
                    </div>

                    <div className="policy-contact-box">
                        <CheckCircle2 size={24} className="text-success" />
                        <div>
                            <strong>Questions regarding our terms?</strong>
                            <p>Contact our support team at <a href="mailto:support@rblastore.com">support@rblastore.com</a> or visit our <a href="/HelpCenter">Help Center</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
