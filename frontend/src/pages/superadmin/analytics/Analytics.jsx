import React from 'react';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics-container" style={{ padding: "20px", height: "100vh" }}>
      <h1 style={{ marginBottom: "20px" }}>Analytics Dashboard</h1>
      <div className="mongodb-chart-container" style={{ height: "calc(100vh - 100px)" }}>
        <iframe
          style={{
            background: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
            width: "100%",
            height: "100%",
            minHeight: "600px",
          }}
          src="https://charts.mongodb.com/charts-backend-data-ejmjhdz/public/dashboards/db604455-1592-4a10-9ed6-9533a169c216"
          title="MongoDB Charts Dashboard"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Analytics;
