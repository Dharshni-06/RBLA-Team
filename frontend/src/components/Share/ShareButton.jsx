import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { RiShareForwardLine, RiWhatsappLine, RiTelegramLine, RiInstagramLine, RiTwitterXLine, RiMailLine } from 'react-icons/ri';
import { Copy, Check, X, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './ShareButton.css';

const ShareButton = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  const productId = product?._id || product?.id;
  const productName = product?.name || 'Handcrafted Product';
  const productPrice = product?.new_price || product?.price ? `₹${product.new_price || product.price}` : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = productId ? `${origin}/product/${productId}` : window.location.href;
      setProductUrl(url);
    }
  }, [productId]);

  if (!product) return null;

  const shareText = `Check out this handcrafted ${productName}${productPrice ? ` for ${productPrice}` : ''} on RBLA!`;
  const fullShareMessage = `${shareText}\n${productUrl}`;

  // Click on share button directly opens the share modal with all app options
  const handleShareClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleCopyLink = async () => {
    if (!productUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        // Fallback copy
        const textarea = document.createElement('textarea');
        textarea.value = productUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Could not copy link to clipboard.');
    }
  };

  // WhatsApp
  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(`${shareText}\n${productUrl}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Telegram
  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Instagram (Copies link and opens Instagram Direct)
  const shareToInstagram = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
      }
      toast.success('Link copied! Opening Instagram Direct...');
    } catch {
      toast.info('Opening Instagram Direct...');
    }
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Twitter / X
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Email
  const shareToEmail = () => {
    const subject = encodeURIComponent(`Handcrafted Product: ${productName}`);
    const body = encodeURIComponent(`${shareText}\n\nView details: ${productUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  // Device native share sheet (if available)
  const shareViaDevice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: fullShareMessage,
          url: productUrl,
        });
        setIsOpen(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Sharing failed: ' + err.message);
        }
      }
    } else {
      toast.info('Device native share is not supported on this browser.');
    }
  };

  const shareApps = [
    {
      name: 'WhatsApp',
      icon: RiWhatsappLine,
      color: '#25D366',
      handler: shareToWhatsApp,
    },
    {
      name: 'Telegram',
      icon: RiTelegramLine,
      color: '#229ED9',
      handler: shareToTelegram,
    },
    {
      name: 'Instagram',
      icon: RiInstagramLine,
      color: '#E1306C',
      handler: shareToInstagram,
    },
    {
      name: 'X (Twitter)',
      icon: RiTwitterXLine,
      color: '#111111',
      handler: shareToTwitter,
    },
    {
      name: 'Email',
      icon: RiMailLine,
      color: '#EA4335',
      handler: shareToEmail,
    },
  ];

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      <Tooltip title="Share this product">
        <IconButton
          onClick={handleShareClick}
          size="medium"
          sx={{
            color: '#444',
            transition: 'all 0.2s',
            '&:hover': {
              color: '#80002f',
              backgroundColor: 'rgba(128, 0, 47, 0.08)',
              transform: 'scale(1.08)',
            },
          }}
          aria-label="Share product"
        >
          <RiShareForwardLine size={24} />
        </IconButton>
      </Tooltip>

      {isOpen && (
        <div className="share-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiShareForwardLine size={22} color="#80002f" />
                <h3>Share Product</h3>
              </div>
              <button
                type="button"
                className="share-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close share dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Summary Preview */}
            <div className="share-product-preview">
              <div className="share-preview-info">
                <h4>{productName}</h4>
                {productPrice && <span className="share-preview-price">{productPrice}</span>}
              </div>
            </div>

            {/* Direct App Share Buttons */}
            <div className="share-apps-grid">
              {shareApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <button
                    key={app.name}
                    type="button"
                    className="share-app-item"
                    onClick={app.handler}
                    title={`Share to ${app.name}`}
                  >
                    <div className="share-app-icon-wrap" style={{ backgroundColor: app.color }}>
                      <IconComponent size={24} color="#fff" />
                    </div>
                    <span>{app.name}</span>
                  </button>
                );
              })}

              {hasNativeShare && (
                <button
                  type="button"
                  className="share-app-item"
                  onClick={shareViaDevice}
                  title="Share using device apps"
                >
                  <div className="share-app-icon-wrap" style={{ backgroundColor: '#7B1FA2' }}>
                    <Share2 size={22} color="#fff" />
                  </div>
                  <span>More Apps</span>
                </button>
              )}
            </div>

            {/* Copy Link Section */}
            <div className="share-copy-box">
              <input
                type="text"
                readOnly
                value={productUrl}
                className="share-url-input"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`share-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
