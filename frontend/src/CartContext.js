import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Function to add an item to the cart
  const addToCart = (item) => {
    if (!cart.some((cartItem) => cartItem.id === item.id)) {
      setCart([...cart, item]);
      alert(`${item.name} added to cart!`);
    } else {
      alert(`${item.name} is already in your cart.`);
    }
  };

  // Function to remove an item from the cart
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Derive the cart count dynamically
  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeItem, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
