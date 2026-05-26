// src/Admin/includes/DoctorSidebar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../Components/Assets/img/Logo.png';
import '../../Admin/Assests/css/Sidebar.css';

const DoctorSidebar = () => {
  return (
    <div className="doctor-sidebar navbar-vertical navbar nav-dashboard bg-white shadow-sm">
      <div className="h-100">
        <div className="simplebar-wrapper">
          <div className="simplebar-mask">
            <div className="simplebar-offset">
              <div
                className="simplebar-content-wrapper"
                style={{ height: "100%", overflow: "auto" }}
              >
                <div className="simplebar-content p-3">
                  <Link className="navbar-brand mb-4 d-block" to="/doctor/dashboard">
                    <img src={logo} width="150px" alt="Doctor Logo" className="img-fluid" />
                  </Link>

                  <ul className="navbar-nav flex-column gap-2" id="sideNavbar">
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/dashboard"
                        end
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-speedometer2 me-2"></i> {/* Dashboard icon */}
                        Dashboard
                      </NavLink>
                    </li>
                    <li className="nav-item">
  <NavLink
    to="/doctor/revenue"
    className={({ isActive }) =>
      `nav-link rounded d-flex align-items-center ${
        isActive ? 'active bg-primary text-white' : 'text-dark'
      }`
    }
  >
    <i className="bi bi-file-earmark-text me-2"></i> 
    Revenue
  </NavLink>
</li>
                    <li className="nav-item">
  <NavLink
    to="/doctor/bank-settings"
    className={({ isActive }) =>
      `nav-link rounded d-flex align-items-center ${
        isActive ? 'active bg-primary text-white' : 'text-dark'
      }`
    }
  >
    <i className="bi bi-file-earmark-text me-2"></i> 
    Bank Settings
  </NavLink>
</li>

                    {/* <li className="nav-item mt-3">
                      <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                        Services
                      </div>
                    </li> */}
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/appointments"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-calendar-check me-2"></i> {/* Appointments icon */}
                        Appointments
                      </NavLink>
                    </li>
                    {/* <li className="nav-item">
                      <NavLink
                        to="/doctor/consultation-history"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-clock-history me-2"></i> 
                        Consultation History
                      </NavLink>
                    </li> */}
                    {/* <li className="nav-item">
                      <NavLink
                        to="/doctor/patients"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-people me-2"></i> 
                        Patients
                      </NavLink>
                    </li> */}

                    {/* <li className="nav-item mt-3">
                      <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                        Documents
                      </div>
                    </li> */}
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/documents"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-file-earmark-text me-2"></i> {/* Documents icon */}
                        Documents
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/coupon"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-ticket-perforated me-2"></i> {/* Coupon icon */}
                        Coupon
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/availability"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-clock me-2"></i> {/* Availability icon */}
                        Availability
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/doctor/fees"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-currency-dollar me-2"></i> {/* Consultation Fees icon */}
                        Consultation Fees
                      </NavLink>
                    </li>
                    <li className="nav-item">
  <NavLink
    to="/doctor/policy"
    className={({ isActive }) =>
      `nav-link rounded d-flex align-items-center ${
        isActive ? 'active bg-primary text-white' : 'text-dark'
      }`
    }
  >
    <i className="bi bi-shield-lock me-2"></i> {/* Privacy Policy icon */}
    Privacy Policy
  </NavLink>
</li>
<li className="nav-item">
  <NavLink
    to="/doctor/rating"
    className={({ isActive }) =>
      `nav-link rounded d-flex align-items-center ${
        isActive ? 'active bg-primary text-white' : 'text-dark'
      }`
    }
  >
    <i className="bi bi-star me-2"></i> {/* Rating icon */}
    Ratings
  </NavLink>
</li>

   

                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;