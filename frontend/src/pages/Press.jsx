import React from 'react';
import './Press.css';

const Press = () => {
  const pressReleases = [
    {
      id: 1,
      date: 'April 20, 2026',
      source: 'The Hindu',
      title: 'Weaving Lives: How Unity Threads is empowering rural artisans',
      excerpt: 'Unity Threads, a social entrepreneurship venture, has successfully connected over 500 women artisans from rural Tamil Nadu directly with consumers. Their handloom blockprinted products have seen a surge in popularity...',
      link: '#'
    },
    {
      id: 2,
      date: 'February 12, 2026',
      source: 'Deccan Chronicle',
      title: 'Traditional blockprinting techniques find a modern audience in eco-friendly bags and towels',
      excerpt: 'With environmental concerns taking center stage, organic cotton products dyed with natural extracts from Unity Threads have become the highlight of Chennai Craft Expo 2026...',
      link: '#'
    },
    {
      id: 3,
      date: 'November 05, 2025',
      source: 'NGO Craft Chronicles',
      title: 'RBLA launches digital customizer tool to empower local tailoring clusters',
      excerpt: 'RBLA has introduced a custom web customization portal, allowing customers to design personalized linen products. The designs are directly transmitted to rural women cooperatives, offering high-margin sewing jobs...',
      link: '#'
    }
  ];

  return (
    <div className="press-page-container">
      {/* Hero Banner */}
      <div className="press-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Press Room & Stories</h1>
          <p>Read about our mission, coverage, and stories of empowerment from local communities.</p>
        </div>
      </div>

      <div className="press-content-section">
        <h2>In The Press & News</h2>
        <div className="underline"></div>

        <div className="press-grid">
          {pressReleases.map((release) => (
            <div className="press-card animate-fade-in" key={release.id}>
              <div className="press-meta">
                <span className="press-source">{release.source}</span>
                <span className="press-date">{release.date}</span>
              </div>
              <h3 className="press-title">{release.title}</h3>
              <p className="press-excerpt">{release.excerpt}</p>
              <a href={release.link} className="press-link" onClick={(e) => e.preventDefault()}>
                Read Full Coverage →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Press;
