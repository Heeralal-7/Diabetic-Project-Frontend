import React, { useState } from "react";

import "../Assests/css/Sidebar.css";

import logo from "../../Components/Assets/img/Logo.png";

import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../Context/Context";

const Sidebar = ({ children }) => {
  const { selectedServices } = useContext(MyContext);

  return (
    <>
      <div className="app-menu d-flex">
        <div className="navbar-vertical navbar nav-dashboard">
          <div className="h-100" data-simplebar="init">
            <div className="simplebar-wrapper" style={{ margin: "0px" }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer" />
              </div>

              <div className="simplebar-mask">
                <div className="simplebar-offset" style={{ right: "0px", bottom: "0px" }}>
                  <div
                    className="simplebar-content-wrapper"
                    tabIndex={0}
                    role="region"
                    aria-label="scrollable content"
                    style={{ height: "100%", overflow: "hidden scroll" }}
                  >
                    <div className="simplebar-content" style={{ padding: "0px" }}>
                      <Link className="navbar-brand sticky-top bg-white">
                        <img src={logo} width="150px" alt="" />
                      </Link>

                      <ul className="navbar-nav flex-column" id="sideNavbar">
                        <li className="nav-item">
                          <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive, isPending }) =>
                              isPending
                                ? "nav-link"
                                : isActive
                                ? "nav-link active"
                                : "nav-link"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-home nav-icon me-2 icon-xxs"
                            >
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Dashboard
                          </NavLink>
                        </li>

                        {(selectedServices.labVendor || selectedServices.pharmacy || 
                          selectedServices.foodVendor || selectedServices.doctor) && (
                          <li className="nav-item">
                            <div className="navbar-heading">Vendors</div>
                          </li>
                        )}

                        {selectedServices.doctor && (
                          <li className="nav-item">
                            <div className="dropdown w-100">
                              <a
                                className="btn btn-transparent ms-2 border-0"
                                href="#"
                                role="button"
                                id="dropdownMenuLink"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Doctor
                                <i className="fa-solid fa-chevron-down" style={{marginLeft:"125px"}}></i>
                              </a>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                <Link className="nav-link has-arrow" to="/dashboard/Doctor">
                                  <li><a className="dropdown-item">Doctor</a></li>
                                </Link>
                                <Link className="nav-link has-arrow" to="#">
                                  <li><a className="dropdown-item">Doctor Category</a></li>
                                </Link>
                              </ul>
                            </div>
                          </li>
                        )}

                        {selectedServices.labVendor && (
                          <li className="nav-item">
                            <div className="dropdown">
                              <a
                                className="btn btn-transparent ms-2 border-0"
                                href="#"
                                role="button"
                                id="dropdownMenuLink"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Lab
                                <i className="fa-solid fa-chevron-down" style={{marginLeft:"148px"}}></i>
                              </a>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                <Link className="nav-link has-arrow" to="/dashboard/lab/user">
                                  <li><a className="dropdown-item">Lab</a></li>
                                </Link>
                                <Link className="nav-link has-arrow" to="/dashboard/lab/labCategory">
                                  <li><a className="dropdown-item">Lab Category</a></li>
                                </Link>
                              </ul>
                            </div>
                          </li>
                        )}

                        {selectedServices.pharmacy && (
                          <li className="nav-item">
                            <div className="dropdown">
                              <a
                                className="btn btn-transparent ms-2 border-0"
                                href="#"
                                role="button"
                                id="dropdownMenuLink"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Pharmacy
                                <i className="fa-solid fa-chevron-down" style={{marginLeft:"105px"}}></i>
                              </a>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                <Link className="nav-link has-arrow" to="/dashboard/pharmacy">
                                  <li><a className="dropdown-item">Pharmacy</a></li>
                                </Link>
                                <Link className="nav-link has-arrow" to="#">
                                  <li><a className="dropdown-item">Pharmacy Category</a></li>
                                </Link>
                              </ul>
                            </div>
                          </li>
                        )}

                        {selectedServices.foodVendor && (
                          <li className="nav-item">
                            <div className="dropdown">
                              <a
                                className="btn btn-transparent ms-2 border-0"
                                href="#"
                                role="button"
                                id="dropdownMenuLink"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Food
                                <i className="fa-solid fa-chevron-down" style={{marginLeft:"138px"}}></i>
                              </a>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                <Link className="nav-link has-arrow" to="dashboard/viewFood">
                                  <li><a className="dropdown-item">Food</a></li>
                                </Link>
                                <Link className="nav-link has-arrow" to="/dashboard/CategoryFood">
                                  <li><a className="dropdown-item">Food Category</a></li>
                                </Link>
                              </ul>
                            </div>
                          </li>
                        )}

                        {selectedServices.user && (
                          <>
                            <li className="nav-item">
                              <NavLink
                                to="/dashboard/active"
                                className={({ isActive, isPending }) =>
                                  isPending
                                    ? "nav-link has-arrow"
                                    : isActive
                                    ? "nav-link has-arrow active"
                                    : "nav-link has-arrow"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Users
                              </NavLink>
                            </li>

                            <li className="nav-item">
                              <Link to="/dashboard/banned" className="nav-link has-arrow">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-user nav-icon me-2 icon-xxs"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx={12} cy={7} r={4} />
                                </svg>
                                Banned
                              </Link>
                            </li>
                          </>
                        )}

                        <li className="nav-item">
                          <Link to="/dashboard/banner" className="nav-link has-arrow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-user nav-icon me-2 icon-xxs"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx={12} cy={7} r={4} />
                            </svg>
                            Banners
                          </Link>
                        </li>

                        <li className="nav-item">
                          <div className="navbar-heading">Blogs</div>
                        </li>

                        <li className="nav-item">
                          <Link to="/dashboard/addblog" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Add Blog
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link to="/dashboard/getblogs" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Get Blogs
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link to="/dashboard/services" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Services
                          </Link>
                        </li>
                        <li className="nav-item">
                          <div className="navbar-heading">Pharmacy</div>
                        </li>

                        <li className="nav-item">
                          <Link to="/dashboard/medicines" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Medicines
                          </Link>

                        </li>
                                                <li className="nav-item">
                          <Link className="nav-link" to="/dashboard/medicine-product">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Medicine Product
                          </Link>
                        </li>
                                                                          <li className="nav-item">
                          <div className="navbar-heading">Others</div>
                        </li>


                        <li className="nav-item">
                          <Link to="/dashboard/specialist" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Specialist
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link to="/dashboard/insurance" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Insurance
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

const VendorSidebar = ({ children }) => {
  // const [isActive, setIsActive] = useState("");

  return (
    <>
      <div className="app-menu d-flex">
        {/* Sidebar */}

        {/* <div className={`${style['navbar-vertical']} navbar nav-dashboard`}> */}

        <div className="navbar-vertical navbar nav-dashboard">
          <div className="h-100" data-simplebar="init">
            <div className="simplebar-wrapper" style={{ margin: "0px" }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer" />
              </div>

              <div className="simplebar-mask">
                <div
                  className="simplebar-offset"
                  style={{ right: "0px", bottom: "0px" }}
                >
                  <div
                    className="simplebar-content-wrapper"
                    tabIndex={0}
                    role="region"
                    aria-label="scrollable content"
                    style={{ height: "100%", overflow: "hidden scroll" }}
                  >
                    <div
                      className="simplebar-content"
                      style={{ padding: "0px" }}
                    >
                      {/* Brand logo */}

                      <Link className="navbar-brand sticky-top bg-white">
                        <img src={logo} width="150px" alt="" />
                      </Link>

                      {/* Navbar nav */}

                      <ul className="navbar-nav flex-column" id="sideNavbar">
                        {/* Nav item */}

                        <li className="nav-item"></li>

                        <li className="nav-item">
                          <NavLink
                            to="/panel"
                            end
                            className={({ isActive, isPending }) =>
                              isPending
                                ? "nav-link"
                                : isActive
                                ? "nav-link active"
                                : "nav-link"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-home nav-icon me-2 icon-xxs"
                            >
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />

                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Dashboard
                          </NavLink>
                        </li>

                        {/* Nav item Heading*/}

                        {/* services start */}

                        <li className="nav-item">
                          <div className="navbar-heading">Services</div>
                        </li>

                        <li className="nav-item">
                          <NavLink
                            className="nav-link has-arrow "
                            to="/panel/services/AddTest"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-user nav-icon me-2 icon-xxs"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                              <circle cx={12} cy={7} r={4} />
                            </svg>
                            Add Test
                          </NavLink>
                        </li>

                        <li className="nav-item">
                          <NavLink
                            className="nav-link has-arrow "
                            to="/panel/services/AddPackages"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-user nav-icon me-2 icon-xxs"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                              <circle cx={12} cy={7} r={4} />
                            </svg>
                            Add Packages
                          </NavLink>
                        </li>

                        {/* services end */}

                        {/* ongoing services start */}

                        <li className="nav-item">
                          <div className="navbar-heading">Ongoing Services</div>
                        </li>

                        <li className="nav-item">
                          <NavLink
                            className="nav-link has-arrow "
                            to="/panel/services/tests"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-user nav-icon me-2 icon-xxs"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                              <circle cx={12} cy={7} r={4} />
                            </svg>
                            Tests
                          </NavLink>
                        </li>

                        <li className="nav-item">
                          <NavLink
                            className="nav-link has-arrow "
                            to="/panel/services/packages"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-user nav-icon me-2 icon-xxs"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                              <circle cx={12} cy={7} r={4} />
                            </svg>
                            Packages
                          </NavLink>
                        </li>

                        {/* ongoing services end */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="simplebar-placeholder"
                style={{ width: "auto", height: "949px" }}
              />
            </div>

            <div
              className="simplebar-track simplebar-horizontal"
              style={{ visibility: "hidden" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{ width: "0px", display: "none" }}
              />
            </div>

            <div
              className="simplebar-track simplebar-vertical"
              style={{ visibility: "visible" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{
                  height: "303px",

                  transform: "translate3d(0px, 0px, 0px)",

                  display: "block",
                }}
              />
            </div>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

const PharmacySidebar = ({ children }) => {
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section]
    );
  };

  const isOpen = (section) => openSections.includes(section);

  return (
    <div className="app-menu d-flex">
      <div className="navbar-vertical navbar nav-dashboard">
        <div className="h-100" data-simplebar="init">
          <div className="simplebar-wrapper">
            <div className="simplebar-mask">
              <div className="simplebar-offset">
                <div
                  className="simplebar-content-wrapper"
                  style={{ height: "100%", overflow: "auto" }}
                >
                  <div className="simplebar-content">
                    {/* Logo */}

                    <Link className="navbar-brand sticky-top bg-white">
                      <img src={logo} width="150px" alt="Logo" />
                    </Link>

                    {/* Sidebar Items */}

                    <ul className="navbar-nav flex-column" id="sideNavbar">
                      {/* Dashboard */}

                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard"
                          end
                          className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                          }
                        >
                          Dashboard
                        </NavLink>
                      </li>

                      {/* Medicines */}

                      <li className="nav-item">
                        <div
                          className={`nav-link has-arrow ${
                            isOpen("medicines") ? "active" : ""
                          }`}
                          onClick={() => toggleSection("medicines")}
                          style={{ cursor: "pointer" }}
                        >
                          Medicines
                        </div>

                        {isOpen("medicines") && (
                          <ul className="nav flex-column ms-3">
                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/add-medicine"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Add Medicine
                              </NavLink>
                            </li>

                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/ongoing-medicines"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Ongoing Medicines
                              </NavLink>
                            </li>

                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/out-of-stock"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Out of Stock
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* Orders */}

                      <li className="nav-item">
                        <div
                          className={`nav-link has-arrow ${
                            isOpen("orders") ? "active" : ""
                          }`}
                          onClick={() => toggleSection("orders")}
                          style={{ cursor: "pointer" }}
                        >
                          Orders
                        </div>

                        {isOpen("orders") && (
                          <ul className="nav flex-column ms-3">
                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/today-orders"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Today Orders
                              </NavLink>
                            </li>

                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/track-orders"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Track Orders
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* Coupons */}

                      <li className="nav-item">
                        <div
                          className={`nav-link has-arrow ${
                            isOpen("promotions") ? "active" : ""
                          }`}
                          onClick={() => toggleSection("promotions")}
                          style={{ cursor: "pointer" }}
                        >
                          Promotions
                        </div>

                        {isOpen("promotions") && (
                          <ul className="nav flex-column ms-3">
                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/coupons"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Coupons
                              </NavLink>
                            </li>

                            <li className="nav-item">
                              <NavLink
                                to="/pharmacy-dashboard/generate-coupon"
                                className={({ isActive }) =>
                                  isActive
                                    ? "nav-link bg-primary text-white"
                                    : "nav-link"
                                }
                              >
                                Generate Coupon
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

const FoodSidebar = ({ children }) => {
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section]
    );
  };

  const isOpen = (section) => openSections.includes(section);

  return (
    <>
      <div className="app-menu d-flex">
        <div className="navbar-vertical navbar nav-dashboard">
          <div className="h-100" data-simplebar="init">
            <div className="simplebar-wrapper" style={{ margin: "0px" }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer" />
              </div>

              <div className="simplebar-mask">
                <div
                  className="simplebar-offset"
                  style={{ right: "0px", bottom: "0px" }}
                >
                  <div
                    className="simplebar-content-wrapper"
                    tabIndex={0}
                    role="region"
                    aria-label="scrollable content"
                    style={{ height: "100%", overflow: "hidden scroll" }}
                  >
                    <div
                      className="simplebar-content"
                      style={{ padding: "0px" }}
                    >
                      {/* Brand logo */}

                      <Link className="navbar-brand sticky-top bg-white">
                        <img src={logo} width="150px" alt="Logo" />
                      </Link>

                      {/* Sidebar Nav */}

                      <ul className="navbar-nav flex-column" id="sideNavbar">
                        {/* Dashboard */}

                        <li className="nav-item">
                          <NavLink
                            to="/food-dashboard/viewFood"
                            end
                            className={({ isActive }) =>
                              isActive ? "nav-link active" : "nav-link"
                            }
                          >
                            Dashboard Food
                          </NavLink>
                        </li>

                        {/* Food Items */}

                        <li className="nav-item">
                          <div
                            className={`nav-link has-arrow ${
                              isOpen("foodItems") ? "active" : ""
                            }`}
                            onClick={() => toggleSection("foodItems")}
                            style={{ cursor: "pointer" }}
                          >
                            All Food Items
                          </div>

                          {isOpen("foodItems") && (
                            <ul className="nav flex-column ms-3">
                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/ongoing"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Ongoing
                                </NavLink>
                              </li>

                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/pending"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Pending
                                </NavLink>
                              </li>

                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/reject"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Reject
                                </NavLink>
                              </li>
                            </ul>
                          )}
                        </li>

                        {/* Orders */}

                        <li className="nav-item">
                          <div
                            className={`nav-link has-arrow ${
                              isOpen("orders") ? "active" : ""
                            }`}
                            onClick={() => toggleSection("orders")}
                            style={{ cursor: "pointer" }}
                          >
                            Orders
                          </div>

                          {isOpen("orders") && (
                            <ul className="nav flex-column ms-3">
                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/today-orders"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Today Orders
                                </NavLink>
                              </li>

                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/track-orders"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Track Orders
                                </NavLink>
                              </li>
                            </ul>
                          )}
                        </li>

                        {/* Promotions */}

                        <li className="nav-item">
                          <div
                            className={`nav-link has-arrow ${
                              isOpen("promotions") ? "active" : ""
                            }`}
                            onClick={() => toggleSection("promotions")}
                            style={{ cursor: "pointer" }}
                          >
                            Promotions
                          </div>

                          {isOpen("promotions") && (
                            <ul className="nav flex-column ms-3">
                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/coupons"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Coupons
                                </NavLink>
                              </li>

                              <li className="nav-item">
                                <NavLink
                                  to="/food-dashboard/generate-coupon"
                                  className={({ isActive }) =>
                                    isActive
                                      ? "nav-link bg-primary text-white"
                                      : "nav-link"
                                  }
                                >
                                  Generate Coupon
                                </NavLink>
                              </li>
                            </ul>
                          )}
                        </li>

                        {/* My Availability */}
                        <li className="nav-item">
                          <NavLink
                            to="/food-dashboard/my-availability"
                            className={({ isActive }) =>
                              isActive ? "nav-link active" : "nav-link"
                            }
                          >
                            My Availability
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="simplebar-placeholder"
                style={{ width: "auto", height: "949px" }}
              />
            </div>

            <div
              className="simplebar-track simplebar-horizontal"
              style={{ visibility: "hidden" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{ width: "0px", display: "none" }}
              />
            </div>

            <div
              className="simplebar-track simplebar-vertical"
              style={{ visibility: "visible" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{
                  height: "303px",
                  transform: "translate3d(0px, 0px, 0px)",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

export { Sidebar, VendorSidebar, PharmacySidebar, FoodSidebar };
