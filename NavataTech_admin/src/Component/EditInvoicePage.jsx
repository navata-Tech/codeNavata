import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Style/Edit.css";

const EditInvoicePage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    customer_name: "",
    pan_vat: "",
    address: "",
    phone: "",
    email: "",
    mode_of_payment: "",
    discount: 0,
    items: [{ description: "", quantity: "", rate: "" }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVERAPI}/api/invoices/${invoiceId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`, // Attach token for authorization
            },
          }
        );
        setInvoiceData(response.data);
      } catch (err) {
        setError("Failed to fetch invoice details");
        console.error(err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...invoiceData.items];
    items[index] = { ...items[index], [name]: value };
    setInvoiceData((prevData) => ({ ...prevData, items }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVERAPI}/api/invoices/${invoiceId}`,
        invoiceData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      console.log('Invoice updated:', response.data);
      setSuccess("Invoice updated successfully!");
      setTimeout(() => {
        setSuccess(null);
        navigate("/invoices"); // Redirect after 2 seconds
      }, 2000);
    } catch (err) {
      setError("Failed to update invoice");
      console.error(err.response ? err.response.data : err.message);
    }
  };
  
  const calculateTotals = () => {
    const sub_total = invoiceData.items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      return total + amount;
    }, 0);

    const discount = parseFloat(invoiceData.discount) || 0;
    const total_amount = sub_total - discount;

    setInvoiceData((prevData) => ({
      ...prevData,
      sub_total,
      total_amount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items, invoiceData.discount]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="editInvoice">
      <h2>Edit Invoice</h2>

      {success && <div className="success-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleUpdate} className="editInvoice__form">
        <div className="editInvoice__field">
          <label>Customer Name</label>
          <input
            type="text"
            name="customer_name"
            value={invoiceData.customer_name}
            onChange={handleChange}
            required
            className="editInvoice__input"
          />
        </div>

        <div className="editInvoice__field">
          <label>PAN/VAT</label>
          <input
            type="text"
            name="pan_vat"
            value={invoiceData.pan_vat}
            onChange={handleChange}
            className="editInvoice__input"
          />
        </div>

        <div className="editInvoice__field">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={invoiceData.address}
            onChange={handleChange}
            required
            className="editInvoice__input"
          />
        </div>

        <div className="editInvoice__field">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={invoiceData.phone}
            onChange={handleChange}
            required
            className="editInvoice__input"
          />
        </div>

        <div className="editInvoice__field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={invoiceData.email}
            onChange={handleChange}
            className="editInvoice__input"
          />
        </div>
        <div className="editInvoice__field">
          <label>Mode of Payment:</label>
          <select
            name="mode_of_payment"
            value={invoiceData.mode_of_payment}
            onChange={handleChange}
            required
            className="editInvoice__input"
          >
            <option value="">Select a mode of payment</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {invoiceData.mode_of_payment === "Other" && (
          <div className="editInvoice__field">
            <label>Specify Other Mode:</label>
            <input
              type="text"
              name="other_payment_mode"
              value={invoiceData.other_payment_mode}
              onChange={handleChange}
              className="editInvoice__input"
            />
          </div>
        )}
        <div className="editInvoice__field">
          <label>Discount</label>
          <input
            type="number"
            name="discount"
            value={invoiceData.discount}
            onChange={handleChange}
            className="editInvoice__input"
          />
        </div>
        
        {invoiceData.items.map((item, index) => (
          <div key={index} className="editInvoice__item">
            <div className="editInvoice__item">
              <label>Item Description</label>
              <input
                type="text"
                name="description"
                value={item.description || ""}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </div>
            <div className="editInvoice__item">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={item.quantity || ""}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </div>
            <div className="editInvoice__item">
              <label>Rate</label>
              <input
                type="number"
                name="rate"
                value={item.rate || ""}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </div>
          </div>
        ))}

        <div className="editInvoice__button-container">
          <button type="submit" className="editInvoice__button update-button">
            Update Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInvoicePage;
