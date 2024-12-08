import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import AdminSidebar from "./Component/AdminSidebar";
import InvoicesPage from "./Pages/InvoicesPage";
import CreateInvoicePage from "./Pages/CreateInvoicePage";
import ViewInvoicesPage from "./Pages/ViewInvoicesPage";
import EditInvoicePage from "./Component/EditInvoicePage";
import LogIn from "./Pages/LogIn";
import LogOut from "./Pages/LogOut";
import AdminProtectedRoute from "./Component/AdminProtectedRoute"; // Import Protected Route
import { isAdminAuthenticated, logoutAdmin } from "./Utility/auth"; // Import your authentication logic
import AddVacancy from "./Component/AddVacancy";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());

  // Check authentication on page load or route change
  useEffect(() => {
    const isLoggedIn = isAdminAuthenticated();
    setIsAuthenticated(isLoggedIn);

    if (!isLoggedIn && location.pathname !== "/login") {
      navigate("/login"); // Redirect to login if not authenticated
    }

    const checkTokenExpiration = () => {
      const expiration = localStorage.getItem("expiration");
      if (expiration && Date.now() > expiration) {
        logoutAdmin(); // Call logout if the token has expired
        setIsAuthenticated(false); // Update authentication state
        navigate("/login"); // Redirect to login page
      }
    };

    // Check token expiration every minute (60000 milliseconds)
    const intervalId = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(intervalId);
  }, [location, navigate]);

  // Hide sidebar on login page
  const hideSidebar = location.pathname === "/login";

  return (
    <>
      {!hideSidebar && isAuthenticated && (
        <div className="app-container d-flex">
          <AdminSidebar />
          <main className="content-container">
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<Navigate to="/invoices" />} />
                <Route
                  path="/invoices"
                  element={
                    <AdminProtectedRoute>
                      <InvoicesPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/create-invoice"
                  element={
                    <AdminProtectedRoute>
                      <CreateInvoicePage />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="/edit-invoice/:invoiceId"
                  element={
                    <AdminProtectedRoute>
                      <EditInvoicePage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/view-invoices"
                  element={
                    <AdminProtectedRoute>
                      <ViewInvoicesPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/add-vacancy"
                  element={
                    <AdminProtectedRoute>
                      <AddVacancy />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="/logout" element={<LogOut />} />
              </Routes>
            </div>
          </main>
        </div>
      )}

      {/* Show the login page when the user is not authenticated */}
      {(!isAuthenticated || hideSidebar) && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<LogIn setIsAuthenticated={setIsAuthenticated} />}
          />
        </Routes>
      )}
    </>
  );
}

export default App;
