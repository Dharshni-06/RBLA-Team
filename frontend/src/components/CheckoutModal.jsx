// Architect: SP
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import { createRazorpayOrder, verifyRazorpayPayment, finalizeCheckout } from '../services/razorpayService';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import './CheckoutModal.css';

const CheckoutModal = ({ cart, subtotal, handleCheckoutSuccess, onClose }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    
    // Recalculate fees to match the exact summary in screenshots
    const deliveryFee = 75;
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

        if (!scriptLoaded) {
            setError('Payment gateway library is loading. Please try again.');
            return;
        }

        setProcessing(true);
        console.log("DEBUG: Frontend REACT_APP_RAZORPAY_KEY is:", process.env.REACT_APP_RAZORPAY_KEY);

        try {
            // Step 1: Call backend to create Razorpay order
            const rzpOrder = await createRazorpayOrder(finalTotal);
            console.log("DEBUG: Backend returned Razorpay Order object:", rzpOrder);

            // Step 2: Configure options for the Razorpay widget
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_defaultKeyId',
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'RBLA Store',
                description: 'Order Checkout Payment',
                order_id: rzpOrder.id,
                prefill: {
                    name: shippingAddress.name,
                    contact: shippingAddress.phone,
                    email: user?.email || ''
                },
                theme: {
                    color: '#0055ff' // Razorpay modal theme color
                },
                handler: async (response) => {
                    try {
                        setProcessing(true);
                        // Step 3: Verify signature in backend
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
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
                            razorpay_order_id: response.razorpay_order_id,
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

            // If it is a mock order (due to placeholder keys or API error), simulate payment success
            if (rzpOrder.id.startsWith('order_mock_')) {
                setError('Demo Mode: Simulating secure payment transaction...');
                setTimeout(async () => {
                    const mockResponse = {
                        razorpay_order_id: rzpOrder.id,
                        razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(2, 15),
                        razorpay_signature: "mock_signature_value"
                    };
                    // Call the handler directly to verify & finalize checkout
                    await options.handler(mockResponse);
                }, 1500);
                return;
            }

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
                                <option value="Razorpay">Razorpay</option>
                                <option value="UPI">Direct UPI Transfer</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                            </select>
                        </div>
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
                            I agree to the <span className="text-blue-link">Terms and Conditions</span> and <span className="text-blue-link">Privacy Policy</span> *
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
        </div>,
        document.body
    );
};

export default CheckoutModal;
