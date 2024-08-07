import React, { createContext, useContext, useState } from 'react';

// Define the AlertContext and a custom hook for consuming it
const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

// AlertProvider component that provides the alert state and functions
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Function to set a success alert
  const success = (message) => {
    setAlert({ message, type: 'success' });
  };

  // Function to set an error alert
  const error = (message) => {
    setAlert({ message, type: 'error' });
  };

  // Function to clear the alert
  const clear = () => {
    setAlert({ message: '', type: '' });
  };

  return (
    <AlertContext.Provider value={{ alert, success, error, clear }}>
      {children}
    </AlertContext.Provider>
  );
};
