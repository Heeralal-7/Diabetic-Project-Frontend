// src/Admin/layouts/ClinicPageContent.jsx
import React from 'react';

const ClinicPageContent = ({ children }) => {
  return (
    <div className="main-content" style={{ paddingTop: '50px', transition: 'margin-left 0.3s ease-in-out' }}>
      <div className="container-fluid px-3 px-md-4 pt-3">
        {children}
      </div>
    </div>
  );
};

export default ClinicPageContent;