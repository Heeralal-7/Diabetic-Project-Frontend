// src/Admin/includes/ClinicSidebar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../Components/Assets/img/Logo.png';
import '../../Admin/Assests/css/Sidebar.css';

const ClinicSidebar = () => {
  return (
    <div className="clinic-sidebar navbar-vertical navbar nav-dashboard bg-white shadow-sm">
      <div className="h-100">
        <div className="simplebar-wrapper">
          <div className="simplebar-mask">
            <div className="simplebar-offset">
              <div
                className="simplebar-content-wrapper"
                style={{ height: "100%", overflow: "auto" }}
              >
                <div className="simplebar-content p-3">
                  <Link className="navbar-brand mb-4 d-block" to="/clinic/dashboard">
                    <img src={logo} width="150px" alt="Clinic Logo" className="img-fluid" />
                  </Link>

                  <ul className="navbar-nav flex-column gap-2" id="sideNavbar">
                    <li className="nav-item">
                      <NavLink
                        to="/clinic/dashboard"
                        end
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/revenue"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-trophy me-2"></i>
                        Revenue
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/bank-settings"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-trophy me-2"></i>
                        Bank Settings
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/doctors"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-people me-2"></i>
                        Clinic Doctors
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/appointments"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-calendar-check me-2"></i>
                        Appointments
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/achievements"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-person-heart me-2"></i>
                        Achievements
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/services"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-clipboard-plus me-2"></i>
                        Services
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/clinic/timings"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-clock me-2"></i>
                        Clinic Timings
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/clinic/documents"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-clock me-2"></i>
                         Documents
                      </NavLink>
                    </li>

                    

                    {/* <li className="nav-item">
                      <NavLink
                        to="/clinic/documents"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Documents
                      </NavLink>
                    </li> */}

                    {/* <li className="nav-item">
                      <NavLink
                        to="/clinic/coupon"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-ticket-perforated me-2"></i>
                        Coupons
                      </NavLink>
                    </li> */}

                    {/* <li className="nav-item">
                      <NavLink
                        to="/clinic/availability"
                        className={({ isActive }) =>
                          `nav-link rounded d-flex align-items-center ${
                            isActive ? 'active bg-primary text-white' : 'text-dark'
                          }`
                        }
                      >
                        <i className="bi bi-calendar-event me-2"></i>
                        Availability
                      </NavLink>
                    </li> */}
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

export default ClinicSidebar;