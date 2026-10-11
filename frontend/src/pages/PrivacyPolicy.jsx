import React from 'react';
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="policy-page-container">
            <div className="policy-page-card">
                <button className="policy-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="policy-page-header">
                    <div className="policy-header-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <Lock size={20} />
                        <span>Data Protection & Privacy</span>
                    </div>
                    <h1>Privacy Policy</h1>
                    <p className="policy-last-updated">Last Updated: September 2026</p>
                </div>

                <div className="policy-page-content">
                    <div className="policy-section">
                        <h2>1. Overview & Commitment</h2>
                        <p>
                            At <strong>RBLA Store</strong>, we respect your privacy and are committed to protecting your personal data. This Privacy Policy details how we collect, use, and protect your information when you browse our website or make purchases.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>2. Information We Collect</h2>
                        <p>We only collect personal information necessary to fulfill your orders and enhance your store experience:</p>
                        <ul>
                            <li><strong>Identity Data:</strong> Full Name, Contact Number, Email Address.</li>
                            <li><strong>Delivery & Billing Data:</strong> Shipping street address, city, postal pincode, state, country.</li>
                            <li><strong>Order Information:</strong> Items purchased, customizer design configurations, invoice payment records.</li>
                        </ul>
                    </div>

                    <div className="policy-section">
                        <h2>3. 256-Bit SSL Encryption & Payment Protection</h2>
                        <div className="security-highlight-card" style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <ShieldCheck size={32} style={{ color: '#16a34a', flexShrink: 0 }} />
                            <div>
                                <strong style={{ color: '#14532d', fontSize: '1rem' }}>Bank-Grade SSL Security</strong>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                                    All data sent during checkout is encrypted using 256-bit SSL protocols. We do NOT store card numbers or UPI PINs; all payments are processed through Razorpay PCI-DSS certified servers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="policy-section">
                        <h2>4. How We Use Your Data</h2>
                        <p>Your information is exclusively used to:</p>
                        <ul>
                            <li>Dispatch products and send real-time delivery notifications.</li>
                            <li>Process secure payment verifications and issue tax receipts.</li>
                            <li>Assist customer care inquiries and order management.</li>
                        </ul>
                    </div>

                    <div className="policy-section">
                        <h2>5. Third-Party Sharing</h2>
                        <p>
                            We <strong>never sell or lease</strong> your personal data. We share necessary details strictly with verified courier delivery partners and payment processor Razorpay to complete your order.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>6. User Control & Data Rights</h2>
                        <p>
                            You have full rights to view, edit, or request complete removal of your personal information from our system at any point by contacting our privacy coordinator.
                        </p>
                    </div>

                    <div className="policy-contact-box">
                        <CheckCircle2 size={24} className="text-success" />
                        <div>
                            <strong>Need assistance with your data?</strong>
                            <p>Contact our Data Officer at <a href="mailto:privacy@rblastore.com">privacy@rblastore.com</a> or visit <a href="/HelpCenter">Help Center</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
