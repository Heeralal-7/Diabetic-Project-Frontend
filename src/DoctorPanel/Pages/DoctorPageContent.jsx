// src/Admin/includes/DoctorPageContent.jsx
import React from 'react';

const DoctorPageContent = ({ children, isSidebarOpen }) => {
  return (
    <div className="main-content bg-light">
      <div className="container-fluid p-4 p-md-5">
        {children}
      </div>
    </div>
  );
};

export default DoctorPageContent;