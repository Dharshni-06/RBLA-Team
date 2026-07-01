import React from "react";
import "./Gallery.css";
//import videoFile from "../Components/Assets/intro.mp4"; // Add your video file here


const employees = [
  {
    name: "John Doe",
    position: "Software Engineer",
    image: "https://via.placeholder.com/150",
    achievements: "Developed a scalable app used by 1M+ users."
  },
  {
    name: "Jane Smith",
    position: "Product Manager",
    image: "https://via.placeholder.com/150",
    achievements: "Successfully launched 5+ products in 2023."
  },
  {
    name: "Mike Johnson",
    position: "UI/UX Designer",
    image: "https://via.placeholder.com/150",
    achievements: "Redesigned the company website, increasing user engagement by 50%."
  },
  {
    name: "Emily Davis",
    position: "Data Scientist",
    image: "https://via.placeholder.com/150",
    achievements: "Created machine learning models that improved predictions by 30%."
  }
];

const Gallery = () => {
  return (
    <div className="gallery">
      <h1 className="gallery-header">Employee Achievements</h1>
      <p className="gallery-subheader">Celebrating the success and dedication of our team</p>
      <div className="gallery-grid">
        {employees.map((employee, index) => (
          <div key={index} className="gallery-card">
            <img
              src={employee.image}
              alt={`${employee.name}'s profile`}
              className="gallery-image"
            />
            <h2 className="employee-name">{employee.name}</h2>
            <p className="employee-position">{employee.position}</p>
            <p className="employee-achievements">{employee.achievements}</p>
          </div>
          
        ))}
      </div>
      
    </div>
  );
};

export default Gallery;
