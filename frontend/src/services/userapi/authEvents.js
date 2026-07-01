// Architect: SP
// Simple event system for auth state changes
const listeners = new Set();

export const authEvents = {
    subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    
    notify: (event) => {
        listeners.forEach(listener => listener(event));
    }
};

// Event types
export const AUTH_EVENTS = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT'
};
