// Architect: SP
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import { createRazorpayOrder, verifyRazorpayPayment, finalizeCheckout } from '../services/razorpayService';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import PolicyModal from './PolicyModal/PolicyModal';
import './CheckoutModal.css';

const CheckoutModal = ({ cart, subtotal, handleCheckoutSuccess, onClose }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    
    // Policy Modal State
    const [policyModalOpen, setPolicyModalOpen] = useState(false);
    const [policyTab, setPolicyTab] = useState('terms');

    const handleOpenPolicy = (e, tab) => {
        e.preventDefault();
        e.stopPropagation();
        setPolicyTab(tab);
        setPolicyModalOpen(true);
    };
    
    // Delivery fee: Free Shipping on Orders Above ₹1199
    const deliveryFee = subtotal > 1199 ? 0 : 75;
    const platformFee = 19;
    const finalTotal = subtotal + deliveryFee + platformFee;

    // Address state
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India'
    });

    const [billingAddress, setBillingAddress] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India'
    });

    const [billingOption, setBillingOption] = useState('same'); // 'same' or 'different'
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [upiId, setUpiId] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    
    // UI Feedback state
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Pre-fill user data if available
    useEffect(() => {
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phoneNumber || prev.phone
            }));
            setBillingAddress(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phoneNumber || prev.phone
            }));
        }
    }, [user]);

    // Load Razorpay Script dynamically
    useEffect(() => {
        const loadScript = () => {
            if (window.Razorpay) {
                setScriptLoaded(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            script.onerror = () => setError("Failed to load Razorpay payment gateway.");
            document.body.appendChild(script);
        };
        
        loadScript();
    }, []);

    // Form Validations
    const validateAddress = (addr) => {
        return (
            addr.name.trim() !== '' &&
            addr.phone.trim() !== '' &&
            addr.address.trim() !== '' &&
            addr.city.trim() !== '' &&
            addr.postalCode.trim() !== '' &&
            addr.country.trim() !== ''
        );
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const finalBilling = billingOption === 'same' ? shippingAddress : billingAddress;

        // Validation checks
        if (!validateAddress(shippingAddress)) {
            setError('Please fill in all required shipping address fields.');
            return;
        }
        if (!/^\d{10}$/.test(shippingAddress.phone)) {
            setError('Shipping phone number must contain exactly 10 digits.');
            return;
        }

        if (billingOption === 'different') {
            if (!validateAddress(billingAddress)) {
                setError('Please fill in all required billing address fields.');
                return;
            }
            if (!/^\d{10}$/.test(billingAddress.phone)) {
                setError('Billing phone number must contain exactly 10 digits.');
                return;
            }
        }

        if (!isTermsAccepted) {
            setError('You must agree to the Terms and Conditions and Privacy Policy.');
            return;
        }

        if (paymentMethod !== 'COD' && !scriptLoaded) {
            setError('Payment gateway library is loading. Please try again.');
            return;
        }

        setProcessing(true);
        console.log("DEBUG: Frontend REACT_APP_RAZORPAY_KEY is:", process.env.REACT_APP_RAZORPAY_KEY);

        try {
            // If paymentMethod is COD, skip Razorpay order generation and trigger checkout directly
            if (paymentMethod === 'COD') {
                const checkoutPayload = {
                    items: cart.map(item => ({
                        productid: item.productId || item._id,
                        productName: item.productDetails?.name || 'Product',
                        quantity: item.quantity,
                        price: item.price,
                        images: item.productDetails?.image ? [item.productDetails.image] : []
                    })),
                    shippingAddress,
                    billingAddress: finalBilling,
                    paymentMethod: 'COD',
                    totalPrice: finalTotal,
                    userEmail: user?.email || '',
                    razorpay_order_id: 'COD',
                    razorpay_payment_id: 'COD'
                };

                const checkoutResponse = await finalizeCheckout(checkoutPayload);

                if (checkoutResponse.success) {
                    setProcessing(false);
                    handleCheckoutSuccess();
                    onClose();
                    navigate(`/order/${checkoutResponse.orderId}`);
                } else {
                    throw new Error(checkoutResponse.message || 'Checkout finalization failed.');
                }
                return;
            }

            // Step 1: Call backend to create Razorpay order
            const rzpOrder = await createRazorpayOrder(finalTotal);
            console.log("DEBUG: Backend returned Razorpay Order object:", rzpOrder);

            // Step 2: Configure options for the Razorpay widget with explicit UPI block support
            const options = {
                key: rzpOrder.key || process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_TB2CyJmCWIEMYX',
                amount: rzpOrder.amount,
                currency: rzpOrder.currency || 'INR',
                name: 'RBLA Store',
                description: 'Order Checkout Payment',
                order_id: (rzpOrder.id && !rzpOrder.id.startsWith('order_mock_')) ? rzpOrder.id : undefined,
                prefill: {
                    name: shippingAddress.name,
                    contact: shippingAddress.phone,
                    email: user?.email || '',
                    method: (paymentMethod === 'UPI' || paymentMethod === 'Direct UPI Transfer') ? 'upi' : undefined
                },
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: 'Pay via UPI (GPay, PhonePe, Paytm, QR)',
                                instruments: [
                                    {
                                        method: 'upi'
                                    }
                                ]
                            }
                        },
                        sequence: ['block.upi', 'block.other'],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                },
                theme: {
                    color: '#0055ff' // Razorpay modal theme color
                },
                handler: async (response) => {
                    try {
                        setProcessing(true);
                        // Step 3: Verify signature in backend
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature || 'mock_signature_value',
                            paymentMethod,
                            amount: finalTotal,
                            billingAddress: finalBilling
                        };

                        await verifyRazorpayPayment(verificationData);

                        // Step 4: Finalize checkout, save order, clear cart, email receipt
                        const checkoutPayload = {
                            items: cart.map(item => ({
                                productid: item.productId || item._id,
                                productName: item.productDetails?.name || 'Product',
                                quantity: item.quantity,
                                price: item.price,
                                images: item.productDetails?.image ? [item.productDetails.image] : []
                            })),
                            shippingAddress,
                            billingAddress: finalBilling,
                            paymentMethod,
                            totalPrice: finalTotal,
                            userEmail: user?.email || '',
                            razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
                            razorpay_payment_id: response.razorpay_payment_id
                        };

                        const checkoutResponse = await finalizeCheckout(checkoutPayload);

                        if (checkoutResponse.success) {
                            setProcessing(false);
                            handleCheckoutSuccess();
                            onClose();
                            // Redirect to /order/:orderId
                            navigate(`/order/${checkoutResponse.orderId}`);
                        } else {
                            throw new Error(checkoutResponse.message || 'Checkout finalization failed.');
                        }
                    } catch (err) {
                        console.error('Checkout error:', err);
                        setError(err.message || 'Error occurred while finalizing order.');
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        setError('Payment process was cancelled by the user.');
                    }
                }
            };

            // Step 3: Open Razorpay modal
            const razorpayWidget = new window.Razorpay(options);
            razorpayWidget.open();

        } catch (err) {
            console.error('Order creation error:', err);
            setError(err.message || 'Could not initiate Razorpay order. Please try again.');
            setProcessing(false);
        }
    };

    return createPortal(
        <div className="checkout-modal-overlay">
            <div className="checkout-modal-container">
                {/* Header */}
                <div className="checkout-modal-header">
                    <h2>Checkout</h2>
                    <button className="close-modal-btn" onClick={onClose} disabled={processing}>
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <form className="checkout-modal-form" onSubmit={handleFormSubmit}>
                    
                    {error && (
                        <div className="checkout-modal-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Order Summary Section */}
                    <div className="checkout-section-box">
                        <div className="section-title-row">
                            <h3>Order Summary</h3>
                            <div className="items-list-right">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="summary-item-line">
                                        {item.productDetails?.name || 'Product'} {item.quantity} × ₹{item.price.toFixed(0)}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="checkout-summary-breakdown">
                            <div className="summary-breakdown-row">
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-breakdown-row">
                                <span>Delivery Fee:</span>
                                <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                            </div>
                            <div className="summary-breakdown-row">
                                <span>Platform Fee:</span>
                                <span>₹{platformFee.toFixed(2)}</span>
                            </div>
                            <div className="summary-breakdown-row total-highlight-row">
                                <span>Total:</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information Section */}
                    <div className="checkout-section-box">
                        <h3>Shipping Information</h3>
                        
                        <div className="checkout-form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                value={shippingAddress.name}
                                onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit phone number"
                                value={shippingAddress.phone}
                                onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label>Address *</label>
                            <input
                                type="text"
                                placeholder="Enter address details"
                                value={shippingAddress.address}
                                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                placeholder="Enter city"
                                value={shippingAddress.city}
                                onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label>Postal Code *</label>
                            <input
                                type="text"
                                placeholder="Enter postal code"
                                value={shippingAddress.postalCode}
                                onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label>Country *</label>
                            <input
                                type="text"
                                placeholder="Enter country"
                                value={shippingAddress.country}
                                onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Billing Information Section */}
                    <div className="checkout-section-box">
                        <h3>Billing Information</h3>
                        
                        <div className="checkout-radio-group">
                            <label className="checkout-radio-container">
                                <input
                                    type="radio"
                                    name="billingOption"
                                    value="same"
                                    checked={billingOption === 'same'}
                                    onChange={() => setBillingOption('same')}
                                />
                                <span className="radio-custom"></span>
                                Use Shipping Address as Billing Address
                            </label>
                            <label className="checkout-radio-container">
                                <input
                                    type="radio"
                                    name="billingOption"
                                    value="different"
                                    checked={billingOption === 'different'}
                                    onChange={() => setBillingOption('different')}
                                />
                                <span className="radio-custom"></span>
                                Use Different Billing Address
                            </label>
                        </div>

                        {billingOption === 'different' && (
                            <div className="nested-billing-fields animate-slide-in">
                                <div className="checkout-form-group">
                                    <label>Billing Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={billingAddress.name}
                                        onChange={e => setBillingAddress({ ...billingAddress, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter 10-digit phone number"
                                        value={billingAddress.phone}
                                        onChange={e => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Billing Address *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address details"
                                        value={billingAddress.address}
                                        onChange={e => setBillingAddress({ ...billingAddress, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter city"
                                        value={billingAddress.city}
                                        onChange={e => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Postal Code *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter postal code"
                                        value={billingAddress.postalCode}
                                        onChange={e => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Country *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter country"
                                        value={billingAddress.country}
                                        onChange={e => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Information Section */}
                    <div className="checkout-section-box">
                        <h3>Payment Information</h3>
                        <div className="checkout-form-group">
                            <label>Payment Method</label>
                            <select 
                                className="checkout-select"
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            >
                                <option value="Razorpay">Razorpay (Cards, Netbanking, Wallets, UPI)</option>
                                <option value="UPI">Direct UPI Transfer (GPay / PhonePe / Paytm / QR)</option>
                                <option value="COD">Cash on Delivery (COD)</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                            </select>
                        </div>

                        {(paymentMethod === 'UPI' || paymentMethod === 'Direct UPI Transfer') && (
                            <div className="upi-details-container animate-slide-in">
                                <div className="upi-qr-card">
                                    <div className="upi-apps-row">
                                        <span className="upi-app-badge gpay">Google Pay</span>
                                        <span className="upi-app-badge phonepe">PhonePe</span>
                                        <span className="upi-app-badge paytm">Paytm</span>
                                        <span className="upi-app-badge bhim">BHIM UPI</span>
                                    </div>
                                    <div className="qr-code-wrapper">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=rblastore@okicici&pn=RBLA%20Store&am=${finalTotal.toFixed(2)}&cu=INR`)}`} 
                                            alt="Scan UPI QR Code to Pay" 
                                            className="upi-qr-img"
                                        />
                                        <p className="qr-scan-text">Scan with Google Pay, PhonePe, Paytm, or BHIM to Pay <strong>₹{finalTotal.toFixed(2)}</strong></p>
                                    </div>
                                    <div className="checkout-form-group" style={{ marginBottom: 0 }}>
                                        <label>Or Enter Your UPI ID (VPA)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. mobile@upi / username@okicici"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Terms Agreement Checkbox */}
                    <div className="terms-checkbox-section">
                        <label className="checkout-checkbox-container">
                            <input
                                type="checkbox"
                                checked={isTermsAccepted}
                                onChange={e => setIsTermsAccepted(e.target.checked)}
                                required
                            />
                            <span className="checkbox-custom"></span>
                            <span className="terms-text-wrapper">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    className="text-blue-link-btn"
                                    onClick={(e) => handleOpenPolicy(e, 'terms')}
                                >
                                    Terms and Conditions
                                </button>
                                {' '}and{' '}
                                <button
                                    type="button"
                                    className="text-blue-link-btn"
                                    onClick={(e) => handleOpenPolicy(e, 'privacy')}
                                >
                                    Privacy Policy
                                </button>
                                {' '}*
                            </span>
                        </label>
                    </div>

                    {/* Pay Action Button */}
                    <div className="checkout-modal-footer-btn-container">
                        <button
                            type="submit"
                            className="checkout-pay-submit-btn"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="btn-spinner-text">
                                    <span className="spinner"></span> Processing...
                                </span>
                            ) : (
                                <>
                                    <Lock size={16} /> Pay ₹{finalTotal.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Secure Trust Badges */}
                <div className="checkout-trust-section">
                    <ShieldCheck size={14} className="text-success" />
                    <span>256-bit SSL encrypted connection. All details are kept safe.</span>
                </div>
            </div>

            {/* Policy Details Modal Overlay */}
            <PolicyModal
                isOpen={policyModalOpen}
                onClose={() => setPolicyModalOpen(false)}
                initialTab={policyTab}
            />
        </div>,
        document.body
    );
};

export default CheckoutModal;
