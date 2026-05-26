// src/Admin/layouts/IndexDoctor.jsx
import React, { useState } from 'react';
import DoctorHeader from './DoctorHeader';
import DoctorSidebar from './DoctorSidebar';
import DoctorPageContent from './DoctorPageContent';

const IndexDoctor = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .layout-container {
            display: flex;
          }

          .doctor-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            z-index: 1000;
            transform: translateX(0);
            transition: transform 0.3s ease-in-out;
          }

          .main-content-wrapper {
            flex: 1;
            margin-left: 260px;
            transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
          }

          .toggled .doctor-sidebar {
            transform: translateX(-100%);
          }

          .toggled .main-content-wrapper {
            margin-left: 0;
            width: 100%;
          }
        `
      }} />

      <div className={`layout-container ${!isSidebarOpen ? 'toggled' : ''}`}>
        <DoctorSidebar />

        <div className="main-content-wrapper">
          <DoctorHeader toggleSidebar={toggleSidebar} />
          <DoctorPageContent>
            {children}
          </DoctorPageContent>
        </div>
      </div>
    </>
  );
};

export default IndexDoctor;
