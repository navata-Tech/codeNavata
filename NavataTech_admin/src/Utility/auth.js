// Function to check if the admin is authenticated by verifying the token in localStorage
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const expiration = localStorage.getItem('expiration'); // Get expiration time

  if (!token || !expiration) {
    return false;  // If no token or expiration, return false (not authenticated)
  }

  const currentTime = Date.now();
  if (currentTime > expiration) {
    logoutAdmin(); // Call logout if the token has expired
    return false; // Token expired, not authenticated
  }

  return true; // Token exists and is not expired, so assume authenticated
};

// Function to log out the admin by removing the token from localStorage
export const logoutAdmin = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
  localStorage.removeItem('expiration'); // Remove expiration time
};
