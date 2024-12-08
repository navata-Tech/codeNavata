import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../Component/ConfirmationModal'; // Ensure the correct path

const LogOut = () => {
  const [isModalVisible, setModalVisible] = useState(true); // Show the modal initially
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login'); // Ensure the login route is correct
  };

  const handleConfirm = () => {
    handleLogout();
  };

  const handleCancel = () => {
    setModalVisible(false); // Hide modal when canceled
  };

  return (
    <div>
      <ConfirmationModal
        isVisible={isModalVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        message="Are you sure you want to log out?" // Pass the logout message
      />
    </div>
  );
};

export default LogOut;
