import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../Style/Slidebar.css";

const AdminSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button className="menu-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h5 className="text-white">Admin Dashboard</h5>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              to="/invoices"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Invoices
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/create-invoice"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Create Invoice
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/view-invoices"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              View Invoices
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/add-vacancy"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Add Vacancy
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/logout"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AdminSidebar;
