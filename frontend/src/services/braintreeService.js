// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/user/braintree';

// Helper to get auth header - reusing your existing pattern
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Get client token from Braintree
export const getClientToken = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/token`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: 'Failed to get payment token' 
        };
    }
};

// Process payment through Braintree
export const processPayment = async (orderId, paymentData) => {
    try {
        // Convert card data to nonce format
        const nonce = await generateNonce(paymentData);
        
        const response = await axios.post(`${BASE_URL}/payment`, {
            orderId,
            nonce
        }, getAuthHeader());
        
        return response.data;
    } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: 'Payment processing failed' 
        };
    }
};

// Helper function to validate card using Luhn algorithm
export const validateCard = (number) => {
    let sum = 0;
    let isEven = false;
    
    // Remove any spaces or dashes
    number = number.replace(/\D/g, '');
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
};

// Detect card type based on number
export const detectCardType = (number) => {
    // Remove any spaces or dashes
    number = number.replace(/\D/g, '');
    
    const cards = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };
    
    for (const [type, regex] of Object.entries(cards)) {
        if (regex.test(number)) {
            return type;
        }
    }
    
    return 'unknown';
};

// Format card number with spaces
export const formatCardNumber = (number) => {
    if (!number) return '';
    
    // Remove any existing spaces
    number = number.replace(/\s/g, '');
    
    // Add space after every 4 digits
    return number.replace(/(\d{4})/g, '$1 ').trim();
};

// Validate expiry date
export const validateExpiry = (expiry) => {
    if (!expiry) return false;
    
    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    const expiryMonth = parseInt(month);
    const expiryYear = parseInt(year);
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    if (expiryMonth < 1 || expiryMonth > 12) return false;
    
    return true;
};

// Format expiry date
export const formatExpiry = (expiry) => {
    if (!expiry) return '';
    
    // Remove any non-digits
    expiry = expiry.replace(/\D/g, '');
    
    if (expiry.length >= 2) {
        return `${expiry.slice(0, 2)}/${expiry.slice(2, 4)}`;
    }
    
    return expiry;
};

// Generate payment nonce (this is a mock function - Braintree will provide the actual implementation)
const generateNonce = async (paymentData) => {
    // In a real implementation, this would use Braintree's client SDK
    // For now, we'll use a test nonce
    return 'fake-valid-nonce';
};
