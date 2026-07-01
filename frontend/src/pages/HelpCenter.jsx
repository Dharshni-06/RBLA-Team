import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './HelpCenter.css';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Orders & Shipping',
      question: 'How long does shipping take?',
      answer: 'Typically, shipping takes between 3 to 5 business days for metro areas, and 5 to 7 days for regional villages and other clusters. Standard delivery is free on orders above ₹499!'
    },
    {
      id: 2,
      category: 'Orders & Shipping',
      question: 'Can I track my order?',
      answer: 'Yes! Once your order is dispatched, you will receive a tracking link under "My Orders" in your account dashboard. You can track the real-time movement of your package.'
    },
    {
      id: 3,
      category: 'Returns & Refunds',
      question: 'What is your return policy?',
      answer: 'We accept return requests for unused and undamaged items with original packaging and tags within 7 days of delivery. You can initiate a request in the Returns Centre, and we will pick it up free of charge.'
    },
    {
      id: 4,
      category: 'Custom Design',
      question: 'How does the custom design tool work?',
      answer: 'Under our customizable products (like Bags or Towels), you can click "Custom Design" to load our AI and digital customize panels. You can paint, upload patterns, or specify text. Our tailoring clusters will then stitch and ship it to you.'
    },
    {
      id: 5,
      category: 'NGO & Social Impact',
      question: 'Who makes these products?',
      answer: 'All products are handcrafted, stitched, or dyed by women artisans and self-help cooperatives supported by our NGO partners. 100% of profit margins are returned directly to these artisan clusters.'
    }
  ];

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="help-page-container">
      {/* Hero Header */}
      <div className="help-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Help Centre & FAQs</h1>
          <p>Have questions? We've got answers. Explore our guides or contact our support team.</p>
        </div>
      </div>

      <div className="help-content-section">
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="underline"></div>

          <div className="faq-list">
            {faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div className={`faq-item ${isOpen ? 'active' : ''}`} key={faq.id}>
                  <div className="faq-question-bar" onClick={() => toggleFaq(faq.id)}>
                    <div className="question-title-wrapper">
                      <FontAwesomeIcon icon={faQuestionCircle} className="faq-question-icon" />
                      <span>{faq.question}</span>
                    </div>
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="faq-arrow-icon" />
                  </div>
                  
                  {isOpen && (
                    <div className="faq-answer-bar animate-fade-in">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Contact Section */}
        <section className="need-help-cta">
          <div className="cta-wrapper">
            <h3>Still Need Assistance?</h3>
            <p>If you couldn't find the answer to your question, feel free to reach out to our dedicated support team.</p>
            <button className="cta-contact-btn" onClick={() => navigate('/contactus')}>
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
