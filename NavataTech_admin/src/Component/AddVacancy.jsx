import React, { useState } from "react";
import axios from "axios";
import "../Style/AddVacancy.css"; // For custom responsive styling

const AddVacancy = () => {
  const [vacancy, setVacancy] = useState({
    type: "Job", // Default value for vacancy type
    title: "",
    description: "",
    salary: "",
    responsibilities: "",
  });
  const [isVacancyAvailable, setIsVacancyAvailable] = useState(true); // State to toggle form visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVacancy({ ...vacancy, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/vacancies", vacancy); // Replace with your backend API URL
      if (response.status === 201) {
        alert("Vacancy added successfully!");
        setVacancy({
          type: "Job",
          title: "",
          description: "",
          salary: "",
          responsibilities: "",
        });
      }
    } catch (error) {
      console.error("Error posting vacancy:", error);
      alert("Failed to add vacancy. Please try again.");
    }
  };

  return (
    <div className="add-vacancy-container">
      {/* Company Logo and Name */}
      <header className="header">
        <img src="../../public/navata-logo.png" alt="Company Logo" className="logo" />
        <h1 className="company-name">Navata Tech Pvt. Ltd.</h1>
      </header>

      {/* Toggle Vacancy Option */}
      <div className="vacancy-toggle">
        <label>
          <input
            type="checkbox"
            checked={!isVacancyAvailable}
            onChange={() => setIsVacancyAvailable((prev) => !prev)}
          />
          No Vacancy Available Right Now
        </label>
      </div>

      {/* Conditionally Render Form or Message */}
      {isVacancyAvailable ? (
        <form className="vacancy-form" onSubmit={handleSubmit}>
          <h2>Add Vacancy</h2>

          <div className="form-group">
            <label htmlFor="type">Vacancy Type:</label>
            <select
              name="type"
              id="type"
              value={vacancy.type}
              onChange={handleChange}
            >
              <option value="Job">Job</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Vacancy Title:</label>
            <input
              type="text"
              name="title"
              id="title"
              value={vacancy.title}
              onChange={handleChange}
              placeholder="Enter vacancy title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              id="description"
              value={vacancy.description}
              onChange={handleChange}
              placeholder="Enter vacancy description"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary:</label>
            <input
              type="text"
              name="salary"
              id="salary"
              value={vacancy.salary}
              onChange={handleChange}
              placeholder="Enter salary details"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="responsibilities">Roles and Responsibilities:</label>
            <textarea
              name="responsibilities"
              id="responsibilities"
              value={vacancy.responsibilities}
              onChange={handleChange}
              placeholder="Enter roles and responsibilities"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">Post Vacancy</button>
        </form>
      ) : (
        <div className="no-vacancy-box">
          <h2>No Vacancy Available Right Now</h2>
          <p>Please check back later for updates.</p>
        </div>
      )}
    </div>
  );
};

export default AddVacancy;
