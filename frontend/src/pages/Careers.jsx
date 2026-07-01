import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faClock, faEnvelope, faTimes, faUpload, faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons';
import './Careers.css';

const Careers = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: ''
  });
  const [errors, setErrors] = useState({});

  const openPositions = [
    {
      id: 1,
      title: 'Social Media & Content Coordinator',
      department: 'Marketing & Outreach',
      location: 'Chennai / Remote',
      type: 'Part-Time / Volunteer',
      description: 'Help amplify the stories of our rural women artisans. You will create engaging content, photograph products, and manage social media campaigns to connect our heritage products with modern global consumers.',
      requirements: [
        'Passion for social impact and storytelling.',
        'Basic photo/video editing and social media management skills.',
        'Strong communication skills in Tamil and English is a plus.'
      ]
    },
    {
      id: 2,
      title: 'Creative Product Designer',
      department: 'Product Development',
      location: 'Hybrid (Rural Clusters & Chennai)',
      type: 'Full-Time / Internship',
      description: 'Collaborate directly with our village artisans to design modern block-printed towels, handmade bags, and bedsheets. You will blend traditional handloom techniques with contemporary color palettes and patterns.',
      requirements: [
        'Background in textile design, fashion design, or fine arts.',
        'Knowledge of design software (Adobe Creative Suite, Photoshop, Illustrator).',
        'Willingness to travel to local artisan clusters for co-creation workshops.'
      ]
    },
    {
      id: 3,
      title: 'Supply Chain & Logistics Volunteer',
      department: 'Operations',
      location: 'Chennai Office',
      type: 'Volunteer / Internship',
      description: 'Streamline the distribution network from village production centers to the e-commerce fulfillment warehouse. You will help coordinate inventory, track quality assurance, and manage orders.',
      requirements: [
        'Organized individual with strong attention to detail.',
        'Basic computer skills (Excel, Google Sheets).',
        'Strong sense of commitment to community-based business models.'
      ]
    }
  ];

  const handleOpenModal = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      resume: null,
      coverLetter: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      tempErrors.phone = 'Please enter a valid phone number (10-12 digits)';
    }
    if (!formData.resume) tempErrors.resume = 'Please upload a resume (PDF/DOC)';
    if (!formData.coverLetter.trim()) tempErrors.coverLetter = 'Cover letter statement is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Submitting Application:', {
        role: selectedRole.title,
        ...formData
      });
      toast.success(`Application submitted successfully for ${selectedRole.title}! We will get back to you soon.`);
      handleCloseModal();
    } else {
      toast.error('Please correct the validation errors in the form.');
    }
  };

  return (
    <div className="careers-page-container">
      {/* Hero Header */}
      <div className="careers-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Woven With Purpose</h1>
          <p>Join our mission to empower rural women artisans and sustain traditional heritage crafts.</p>
        </div>
      </div>

      <div className="careers-content-section">
        {/* Core Values Section */}
        <section className="why-us-section">
          <h2>Why Work With Unity Threads?</h2>
          <div className="underline"></div>
          <p className="section-intro">
            We are more than just an e-commerce platform. We are a social venture dedicated to creating 
            livelihoods, bringing financial autonomy to women, and keeping ancient textile arts alive. 
            When you join us, you contribute to a bigger cause.
          </p>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-wrapper">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
              </div>
              <h3>Empowerment</h3>
              <p>Directly support financial independence for women artisans in rural clusters.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-wrapper">
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h3>Heritage Preservation</h3>
              <p>Help preserve handloom, blockprinting, and organic dyeing methods for generations.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-wrapper">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3>Creative Autonomy</h3>
              <p>Work in a collaborative workspace where your designs and ideas directly shape products.</p>
            </div>
          </div>
        </section>

        {/* Job Openings List */}
        <section className="openings-section">
          <h2>Current Openings & Volunteering</h2>
          <div className="underline"></div>

          <div className="openings-list">
            {openPositions.map((role) => (
              <div className="opening-card" key={role.id}>
                <div className="opening-header">
                  <div className="title-area">
                    <h3>{role.title}</h3>
                    <span className="dept-tag">{role.department}</span>
                  </div>
                  <div className="meta-area">
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> {role.location}
                    </span>
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faClock} /> {role.type}
                    </span>
                  </div>
                </div>
                
                <p className="opening-desc">{role.description}</p>
                
                <div className="opening-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {role.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <button className="apply-btn" onClick={() => handleOpenModal(role)}>
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Application Form Modal */}
      {isModalOpen && selectedRole && (
        <div className="modal-overlay">
          <div className="modal-content-wrapper animate-slide-up">
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="modal-header">
              <h2>Job Application</h2>
              <p>Applying for: <strong>{selectedRole.title}</strong></p>
            </div>

            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'input-error' : ''}
                  placeholder="John Doe"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'input-error' : ''}
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'input-error' : ''}
                    placeholder="9876543210"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Resume / CV *</label>
                <div className={`file-upload-box ${errors.resume ? 'file-error' : ''}`}>
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="resume" className="file-upload-label">
                    <FontAwesomeIcon icon={faUpload} />
                    <span>{formData.resume ? formData.resume.name : 'Upload PDF, DOC or DOCX (Max 5MB)'}</span>
                  </label>
                </div>
                {errors.resume && <span className="error-text">{errors.resume}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Statement of Interest / Cover Letter *</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows="4"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className={errors.coverLetter ? 'input-error' : ''}
                  placeholder="Why do you want to join our mission? Tell us a bit about yourself..."
                ></textarea>
                {errors.coverLetter && <span className="error-text">{errors.coverLetter}</span>}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
