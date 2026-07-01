import React, { useRef, useEffect } from 'react';
import { Canvas, Image as FabricImage } from 'fabric'; // Named imports from fabric.js
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import { useCart } from '../Context/CartContext';
import { toast } from 'react-toastify';
import './UploadDesignAndCheckout.css';

const UploadDesignAndCheckout = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate function
  const { addToCart } = useCart();

  useEffect(() => {
    if (canvasRef.current) return; // prevent double init (React 18 Strict Mode)

    // Initialize fabric.js canvas
    const canvas = new Canvas('designCanvas', {
      width: 600,
      height: 400,
      backgroundColor: '#f0f0f0',
    });
    canvasRef.current = canvas;

    return () => {
      canvas.dispose(); // properly destroy fabric canvas
      canvasRef.current = null;
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const fabricImg = new FabricImage(img, {
            left: 50,
            top: 50,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvasRef.current.add(fabricImg);
          toast.success('Image loaded onto canvas! You can resize and drag it.');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please log in first to checkout your uploaded design.');
      navigate('/loginsignup');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      toast.info('Processing design and adding to cart...', { autoClose: 1500 });

      // Grab canvas content as data URL
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0
      });

      const product = {
        _id: '6a1e605cba977b119c3adfef', // Map to a valid seeded Product ObjectId (Tote Bag)
        name: 'Uploaded Custom Design Product',
        price: 300, // custom uploaded design price
        image: dataUrl,
        size: 'default',
        color: 'default'
      };

      const success = await addToCart(product, 1);
      if (success) {
        toast.success('Design added to cart! Proceeding to checkout...');
        navigate('/checkout');
      } else {
        toast.error('Failed to add design to cart.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error preparing design for checkout.');
    }
  };

  return (
    <div className="upload-design-page">


      <h1>Upload Your Design</h1>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="upload-input"
        />
        <button
          className="clear-canvas-btn"
          onClick={() => canvasRef.current.clear()}
        >
          Clear Canvas
        </button>
      </div>
      <div className="canvas-container">
        <canvas id="designCanvas"></canvas>
      </div>
      <div className="checkout-section">
        <button className="checkout-btn" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
};

export default UploadDesignAndCheckout;
