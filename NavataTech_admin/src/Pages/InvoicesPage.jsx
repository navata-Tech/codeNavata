import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Style/Invoice.css'; // Import the CSS file

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage] = useState(10); // Show 10 invoices per page
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const token = localStorage.getItem("token"); // Get the JWT token from localStorage
                const response = await axios.get(`${import.meta.env.VITE_SERVERAPI}/api/invoices`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the headers
                    }
                });
                console.log('Response Data:', response.data);

                if (Array.isArray(response.data)) {
                    setInvoices(response.data);
                } else {
                    console.error('Invoices data is not an array:', response.data);
                    setError('Unexpected data format');
                }
            } catch (error) {
                console.error('Error fetching invoices:', error.response ? error.response.data : error.message);
                setError('Failed to fetch invoices');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleEdit = (invoiceId) => {
        navigate(`/edit-invoice/${invoiceId}`);
    };

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="loader">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="invoices-container">
            <h2>Invoices</h2>
            {invoices.length === 0 ? (
                <p className="no-invoices">No invoices available.</p>
            ) : (
                <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice Number</th>
                                <th>Customer Name</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoice_number || 'N/A'}</td>
                                    <td>{invoice.customer_name || 'Unknown'}</td>
                                    <td>{invoice.date ? new Date(invoice.date).toLocaleString() : 'Invalid date'}</td>
                                    <td>RS.{parseFloat(invoice.total_amount).toFixed(2) || '0.00'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(invoice.id)} className="edit-button">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        invoicesPerPage={invoicesPerPage}
                        totalInvoices={invoices.length}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </>
            )}
        </div>
    );
};

// Pagination Component
const Pagination = ({ invoicesPerPage, totalInvoices, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalInvoices / invoicesPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="pagination-container">
            <ul className="pagination">
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <a onClick={() => paginate(number)} href="#" className="page-link">
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default InvoicesPage;
