import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom";
import "../Style/Create.css"

const CreateInvoicePage = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    pan_vat: "",
    address: "",
    phone: "", // Default country code for Nepal
    email: "",
    mode_of_payment: "",
    items: [{ description: "", quantity: "", rate: "", amount: "" }],
    discount: "",
    sub_total: 0,
    total_amount: 0,
  });
  const navigate = useNavigate(); 
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (name.startsWith("item_")) {
      const items = [...formData.items];
      const itemIndex = parseInt(name.split("_")[1]);
      items[itemIndex] = { ...items[itemIndex], [name.split("_")[2]]: value };
      setFormData({ ...formData, items });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: "", rate: "", amount: "" },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const calculateTotals = () => {
    const sub_total = formData.items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      return total + amount;
    }, 0);

    const discount = parseFloat(formData.discount) || 0;
    const total_amount = sub_total - discount;

    setFormData((prevData) => ({
      ...prevData,
      sub_total,
      total_amount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Removed phone number validation
    if (formData.phone.trim() === "") {
      alert("Phone number must not be empty.");
      return;
    }

    if (!validateEmail(formData.email)) {
      alert("Invalid email. Please enter a valid @gmail.com address.");
      return;
    }

    const finalFormData = {
      ...formData,
      items: formData.items.map((item) => ({
        description: item.description,
        quantity: parseInt(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0),
      })),
    };

    console.log("Final Form Data:", JSON.stringify(finalFormData, null, 2));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERAPI}/create-invoice`,
        finalFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Invoice created successfully");

            // Redirect to invoice page after 2 seconds
            setTimeout(() => {
              navigate("/invoices"); // Change this to your invoice page route
            }, 2000);
      console.log(response.data);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        alert("Error creating invoice: " + error.response.data.message);
      } else {
        alert("Error creating invoice: " + error.message);
      }
    }
  };

  return (
    <div className="createInvoice">
      <h1>Create Invoice</h1>
      <form onSubmit={handleSubmit} className="createInvoice__form">
        <div className="createInvoice__field">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            required
            className="createInvoice__input"
          />
        </div>
        <div className="createInvoice__field">
          <label>PAN/VAT:</label>
          <input
            type="text"
            name="pan_vat"
            value={formData.pan_vat}
            onChange={handleInputChange}
            className="createInvoice__input"
          />
        </div>
        <div className="createInvoice__field">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="createInvoice__input"
          />
        </div>
        <div className="createInvoice__field">
          <label>Phone:</label>
          <div className="phone-input">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="createInvoice__input"
            />
          </div>
        </div>
        <div className="createInvoice__field">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="createInvoice__input"
          />
        </div>
        <div className="createInvoice__field">
          <label>Mode of Payment:</label>
          <select
            name="mode_of_payment"
            value={formData.mode_of_payment}
            onChange={handleInputChange}
            required
            className="createInvoice__input"
          >
            <option value="">Select a mode of payment</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {formData.mode_of_payment === "Other" && (
          <div className="createInvoice__field">
            <label>Specify Other Mode:</label>
            <input
              type="text"
              name="other_payment_mode"
              value={formData.other_payment_mode}
              onChange={handleInputChange}
              className="createInvoice__input"
            />
          </div>
        )}
        <h2>Invoice Items</h2>
        {formData.items.map((item, index) => (
          <div key={index} className="createInvoice__item">
            <label>Description:</label>
            <input
              type="text"
              name={`item_${index}_description`}
              value={item.description}
              onChange={handleInputChange}
              required
              className="createInvoice__input"
            />
            <label>Quantity:</label>
            <input
              type="number"
              name={`item_${index}_quantity`}
              value={item.quantity}
              onChange={handleInputChange}
              required
              className="createInvoice__input"
            />
            <label>Rate:</label>
            <input
              type="number"
              name={`item_${index}_rate`}
              value={item.rate}
              onChange={handleInputChange}
              required
              className="createInvoice__input"
            />
            <button
              type="button"
              className="createInvoice__button remove"
              onClick={() => handleRemoveItem(index)}
            >
              Remove Item
            </button>
          </div>
        ))}

        {/* Place the Add Item button above the discount field */}
        <div className="createInvoice__discount-section">
          <button
            type="button"
            className="createInvoice__button add"
            onClick={handleAddItem}
          >
            Add Item
          </button>
        </div>
        <div className="createInvoice__field">
          <label>Discount:</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            className="createInvoice__input"
          />
        </div>

        <div className="createInvoice__button-container">
          <button type="submit" className="createInvoice__button">
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;
