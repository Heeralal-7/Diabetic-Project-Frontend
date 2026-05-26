// src/Admin/layouts/IndexClinic.jsx
import React, { useState } from 'react';
import ClinicHeader from './ClinicHeader';
import ClinicSidebar from './ClinicSidebar';
import ClinicPageContent from './ClinicPageContent';

const IndexClinic = ({ children }) => {
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

          .clinic-sidebar {
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
            margin-left: 280px;
            transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
          }

          .toggled .clinic-sidebar {
            transform: translateX(-100%);
          }

          .toggled .main-content-wrapper {
            margin-left: 0;
            width: 100%;
          }

          @media (max-width: 768px) {
            .clinic-sidebar {
              transform: translateX(-100%);
            }
            
            .main-content-wrapper {
              margin-left: 0;
            }

            .toggled .clinic-sidebar {
              transform: translateX(0);
            }
          }
        `
      }} />

      <div className={`layout-container ${!isSidebarOpen ? 'toggled' : ''}`}>
        <ClinicSidebar />

        <div className="main-content-wrapper">
          <ClinicHeader toggleSidebar={toggleSidebar} />
          <ClinicPageContent>
            {children}
          </ClinicPageContent>
        </div>
      </div>
    </>
  );
};

export default IndexClinic;
