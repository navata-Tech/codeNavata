import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../Style/Invoice.css";

const ViewInvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [invoicesPerPage] = useState(10);  // Set number of invoices per page

    // Fetch the list of invoices when the component loads
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No token found! Make sure you're logged in.");
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_SERVERAPI}/api/invoices`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setInvoices(response.data); // Assuming the response data is an array of invoices
            } catch (error) {
                console.error('Error fetching invoices:', error.response?.data || error.message);
            }
        };

        fetchInvoices();
    }, []);

    // Get current invoices for pagination
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const viewInvoice = async (invoiceNumber) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found! Make sure you're logged in.");
                return;
            }

            // Fetch the invoice PDF
            const response = await axios.get(`${import.meta.env.VITE_SERVERAPI}/api/invoices-pdf/${invoiceNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Check if the response is OK (200)
            if (response.status !== 200) {
                console.error('Error in fetching PDF:', response.data);
                return;
            }

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice_${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error viewing invoice:', error.response?.data || error.message);
        }
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(invoices.length / invoicesPerPage);

    return (
        <div className="invoices-container">
            <h2>View Invoices</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Customer Name</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentInvoices.length > 0 ? (
                        currentInvoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td>{invoice.invoice_number}</td>
                                <td>{invoice.customer_name}</td>
                                <td>RS. {parseFloat(invoice.total_amount).toFixed(2)}</td>
                                <td>
                                    <button className="edit-button" onClick={() => viewInvoice(invoice.invoice_number)}>View Invoice</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-invoices">No invoices found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Component */}
            <div className="pagination-container">
                <ul className="pagination">
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ViewInvoicesPage;
