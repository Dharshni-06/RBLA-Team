import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Lock, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import './PolicyModal.css';

const PolicyModal = ({ isOpen, onClose, initialTab = 'terms' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Synchronize tab if initialTab changes when opening
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    return createPortal(
        <div className="policy-modal-overlay" onClick={onClose}>
            <div className="policy-modal-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="policy-modal-header">
                    <div className="policy-header-title">
                        <ShieldCheck size={22} className="header-shield-icon" />
                        <h2>Legal & Policy Transparency</h2>
                    </div>
                    <button className="policy-close-btn" onClick={onClose} aria-label="Close Policy Modal">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="policy-modal-tabs">
                    <button 
                        className={`policy-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('terms')}
                    >
                        <FileText size={16} />
                        <span>Terms and Conditions</span>
                    </button>
                    <button 
                        className={`policy-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        <Lock size={16} />
                        <span>Privacy Policy</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="policy-modal-body">
                    {activeTab === 'terms' ? (
                        <div className="policy-content-section animate-fade-in">
                            <div className="policy-banner-box">
                                <h3>Terms & Conditions</h3>
                                <p>Last updated: September 2026. Please review our terms before proceeding with your order.</p>
                            </div>

                            <div className="policy-block">
                                <h4>1. Introduction & Agreement</h4>
                                <p>
                                    Welcome to <strong>RBLA Store</strong>. By accessing our platform, placing an order, or utilizing custom customization services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not proceed with your transaction.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>2. Handcrafted & Handloom Product Specifications</h4>
                                <p>
                                    Our products (Towels, Bags, Napkins, Bedsheets, Cupcoasters, Bamboo products, and Paperfiles) are handcrafted by artisan craftspeople. Due to the nature of authentic handloom weaving and eco-friendly printing:
                                </p>
                                <ul>
                                    <li>Slight variations in weave, dye shade, or print alignment are natural markers of authenticity.</li>
                                    <li>Custom design uploads and AI customizer previews are digital approximations; slight color intensity variances may occur on natural fabrics.</li>
                                </ul>
                            </div>

                            <div className="policy-block">
                                <h4>3. Pricing, Taxes & Fees</h4>
                                <p>
                                    All prices listed on RBLA Store are in Indian Rupees (₹) and include applicable GST taxes unless stated otherwise. Delivery fees and platform fees are explicitly itemized at checkout prior to order confirmation.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>4. Payment Options & Order Confirmation</h4>
                                <p>
                                    We accept payments via <strong>Razorpay Payment Gateway</strong> (UPI, Credit/Debit Cards, Net Banking) and <strong>Cash on Delivery (COD)</strong> for eligible delivery pin codes. An order confirmation with invoice details is sent electronically upon successful payment or COD placement.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>5. Shipping, Handling & Delivery</h4>
                                <ul>
                                    <li>Standard dispatch occurs within 1-3 business days.</li>
                                    <li>Delivery usually completes in 3-7 business days depending on delivery location.</li>
                                    <li>Unforeseen transit delays caused by weather or regional disruptions will be updated via SMS/Email tracking.</li>
                                </ul>
                            </div>

                            <div className="policy-block">
                                <h4>6. Returns, Exchanges & Refunds</h4>
                                <p>
                                    Standard non-customized items can be returned within 7 days of receipt via our <a href="/ReturnOrder" target="_blank" rel="noreferrer">Returns Centre</a>. Items must be unused, in original packaging, with tags intact. Custom-printed or customized orders are non-returnable unless received defective or damaged.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>7. User Account & Platform Safety</h4>
                                <p>
                                    Users are responsible for maintaining the confidentiality of their account credentials. Submitting fraudulent billing/shipping details or attempting security bypasses will lead to immediate account suspension and legal reporting.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>8. Governing Law & Dispute Resolution</h4>
                                <p>
                                    These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="policy-content-section animate-fade-in">
                            <div className="policy-banner-box privacy-banner">
                                <h3>Privacy Policy</h3>
                                <p>Your trust is paramount. Learn how we safeguard and respect your personal information.</p>
                            </div>

                            <div className="policy-block">
                                <h4>1. Information We Collect</h4>
                                <p>We collect essential personal data required to process and fulfill your orders:</p>
                                <ul>
                                    <li><strong>Contact Information:</strong> Full name, phone number, email address, shipping and billing addresses.</li>
                                    <li><strong>Transaction Details:</strong> Items purchased, payment method selection, and order history.</li>
                                    <li><strong>Technical Data:</strong> IP address, device browser details, and session cookies for active cart persistence.</li>
                                </ul>
                            </div>

                            <div className="policy-block">
                                <h4>2. How We Use Your Information</h4>
                                <p>Your data is strictly used for legitimate business operations:</p>
                                <ul>
                                    <li>Processing transactions and dispatching shipments.</li>
                                    <li>Sending real-time delivery status updates and digital invoices.</li>
                                    <li>Providing customer support and resolving return or refund requests.</li>
                                    <li>Improving user experience and optimizing store performance.</li>
                                </ul>
                            </div>

                            <div className="policy-block">
                                <h4>3. 256-Bit SSL Security & Payment Safety</h4>
                                <div className="security-highlight-card">
                                    <ShieldCheck size={28} className="shield-card-icon" />
                                    <div>
                                        <strong>Bank-Grade Encryption:</strong>
                                        <p>All sensitive checkout communication is secured using 256-bit SSL encryption. We do <strong>NOT</strong> store raw credit/debit card details or UPI PINs on our servers. All transactions are securely processed by PCI-DSS compliant payment provider Razorpay.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="policy-block">
                                <h4>4. Data Sharing & Third-Party Services</h4>
                                <p>
                                    We <strong>never sell, rent, or trade</strong> your personal information to marketing advertisers. Data is shared exclusively with necessary operational partners:
                                </p>
                                <ul>
                                    <li>Logistics and courier partners to physically deliver your packages.</li>
                                    <li>Razorpay gateway for encrypted payment processing.</li>
                                </ul>
                            </div>

                            <div className="policy-block">
                                <h4>5. Cookies & Local Storage</h4>
                                <p>
                                    We utilize functional cookies and browser storage to maintain your logged-in state, save items in your shopping cart, and preserve your wishlist items. You can manage cookie preferences via your browser settings.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>6. Your Rights & Data Access</h4>
                                <p>
                                    You have full control over your information. You can inspect or update your account profile and shipping addresses at any time via your user dashboard, or request complete account deletion by contacting support.
                                </p>
                            </div>

                            <div className="policy-block">
                                <h4>7. Contact Privacy Officer</h4>
                                <p>
                                    For any questions, concerns, or privacy requests regarding your data, please contact our privacy compliance team at <strong>privacy@rblastore.com</strong> or visit our <a href="/HelpCenter" target="_blank" rel="noreferrer">Help Center</a>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="policy-modal-footer">
                    <div className="policy-trust-badge">
                        <CheckCircle2 size={16} className="text-success-icon" />
                        <span>Verified & Compliant Policy</span>
                    </div>
                    <button className="policy-accept-btn" onClick={onClose}>
                        I Understand & Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PolicyModal;
