import React from "react";
import "../Assests/css/Sidebar.css";
import logo from "../../Components/Assets/img/Logo.png";
import { useState, useRef,useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

const Sidebar = ({ children }) => {
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
                    <div className="simplebar-content" style={{ padding: "0px" }}>
                      <Link to="/" className="navbar-brand sticky-top bg-white">
                        <img src={logo} width="150px" alt="Logo" />
                      </Link>

                      <ul className="navbar-nav flex-column" id="sideNavbar">
                        {/* Dashboard */}
                        <li className="nav-item">
                          <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                              isActive ? "nav-link active" : "nav-link"
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
                        <li>
                                <Link className="dropdown-item nav-link blog-links" to="/dashboard/revenue-page">
                                      <i className="fa-solid fa-indian-rupee-sign fs-6 me-2"></i>Revenue
 
                                </Link>
                              </li>
                        <li>
                                <Link className="dropdown-item nav-link blog-links" to="/dashboard/payout-settings">
                                      <i className="fa-solid fa-indian-rupee-sign fs-6 me-2"></i>Payout Settings

                                </Link>
                              </li>
                        <li>
                                <Link className="dropdown-item nav-link blog-links" to="/dashboard/cancel-orders">
                                      <i className="fa-solid fa-indian-rupee-sign fs-6 me-2"></i>Cancel Orders

                                </Link>
                              </li>

                        {/* Vendors Heading */}
                        <li className="nav-item">
                          <div className="navbar-heading">Vendors</div>
                        </li>

                        {/* Doctor */}
                        <li className="nav-item">
                          <div className="dropdown w-100">
                            <a
                              className="btn btn-transparent ms-2 border-0"
                              href="#"
                              role="button"
                              id="dropdownMenuLinkDoctor"
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
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{ marginLeft: "125px" }}
                              ></i>
                            </a>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuLinkDoctor"
                            >
                              <li>
                                <Link className="dropdown-item nav-link blog-links" to="/dashboard/Doctor">
                                  Doctor
                                </Link>
                              </li>
                              <li>
                                <Link className="dropdown-item nav-link blog-links" to="/dashboard/doctor/insurance">
                                  Insurance Upload
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li>

                        {/* Clinic */}
                        <li className="nav-item">
                          <div className="dropdown w-100">
                            <a
                              className="btn btn-transparent ms-2 border-0"
                              href="#"
                              role="button"
                              id="dropdownMenuLinkClinic"
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
                              Clinic
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{ marginLeft: "130px" }}
                              ></i>
                            </a>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuLinkClinic"
                            >
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="/dashboard/admin/clinic"
                                >
                                  Clinics
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="/dashboard/clinic/specialist"
                                >
                                  Specialist Upload
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li>

                        {/* Lab */}
                        <li className="nav-item">
                          <div className="dropdown">
                            <a
                              className="btn btn-transparent ms-2 border-0"
                              href="#"
                              role="button"
                              id="dropdownMenuLab"
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
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{ marginLeft: "148px" }}
                              ></i>
                            </a>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuLab"
                            >
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="/dashboard/lab/user"
                                >
                                  Lab
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="/dashboard/lab/test-create"
                                >
                                  Create Test
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li>

                        {/* Pharmacy */}
                        <li className="nav-item">
                          <div className="dropdown">
                            <a
                              className="btn btn-transparent ms-2 border-0"
                              href="#"
                              role="button"
                              id="dropdownMenuPharmacy"
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
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{ marginLeft: "105px" }}
                              ></i>
                            </a>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuPharmacy"
                            >
                              <li>
                                <Link
                                  className=" nav-item nav-link blog-links"
                                  to="/dashboard/pharmacy"
                                >
                                  Pharmacy
                                </Link>
                              </li>
                                          <li className="nav-item nav-link blog-links">
                          <Link to="/dashboard/pending-medicines" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Approve Medicine
                          </Link>
                        </li>
                           
                              <li className="nav-item nav-link blog-links">
                          <Link to="/dashboard/pending-medicines-products" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Approve Products
                          </Link>
                        </li>
 
                              <li className="nav-item nav-link blog-links">
                          <Link to="/dashboard/delivery-charges" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Delivery Charges
                          </Link>
                        </li>
                        <li className="nav-item nav-link blog-links">
                          <Link to="/dashboard/medicines" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Medicines
                          </Link>
                        </li>
                        <li className="nav-item nav-link blog-links">
                          <Link
                            className="nav-link"
                            to="/dashboard/medicine-product"
                          >
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Medicine Product
                          </Link>
                        </li>
                        <li className="nav-item nav-link blog-links">
                          <Link
                            className="nav-link"
                            to="/dashboard/upload-brand-image"
                          >
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                             Brand Image
                          </Link>
                        </li>
                            </ul>
                          </div>
                        </li>

                        {/* Food */}
                        <li className="nav-item">
                          <div className="dropdown">
                            <a
                              className="btn btn-transparent ms-2 border-0"
                              href="#"
                              role="button"
                              id="dropdownMenuFood"
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
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{ marginLeft: "138px" }}
                              ></i>
                            </a>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuFood"
                            >
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="dashboard/viewFood"
                                >
                                  Food
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-link blog-links"
                                  to="/dashboard/CategoryFood"
                                >
                                  Food Category
                                </Link>
                              </li>
                              <li className="nav-item">
                          <Link to="/dashboard/delivery-charges/food" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Delivery Charges
                          </Link>
                        </li>
                            </ul>
                          </div>
                        </li>

                        {/* Users */}
                        <li className="nav-item">
                          <NavLink
                            to="/dashboard/active"
                            className={({ isActive }) =>
                              isActive
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
                          <Link
                            to="/dashboard/banned"
                            className="nav-link has-arrow"
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
                            Banned
                          </Link>
                        </li>

                        {/* Sub-Admins */}
                        <li className="nav-item">
                          <Link
                            to="/dashboard/subadmins"
                            className="nav-link has-arrow"
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
                            Sub-Admins
                          </Link>
                        </li>

                        {/* Banners */}
                        <li className="nav-item">
                          <Link
                            to="/dashboard/banner"
                            className="nav-link has-arrow"
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
                            Banners
                          </Link>
                        </li>




                  
                        {/* Others */}
                                                <li className="nav-item">
                          <div className="navbar-heading">Others</div>
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
                          <Link to="/dashboard/membership-plans" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Membership Plans
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/care-program-page" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Care Program Page
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/video-upload" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Video Upload
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/about-us" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            About Us
                          </Link>
                        </li>
                        
                        <li className="nav-item">
                          <Link to="/dashboard/max-distance" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Max Distance management
                          </Link>
                        </li>
                        
                        
                        <li className="nav-item">
                          <Link to="/dashboard/cancel-charge" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Cancellation Setting
                          </Link>
                        </li>
                        

                        <li className="nav-item">
                          <Link to="/dashboard/contact-admin" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Contact Us
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/footer-create" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Footer Management
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/science-page" className="nav-link blog-links">
                            <i className="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Science
                          </Link>
                        </li>
                        
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <main>{children}</main>
        </div>
      </div>
    </>
  );
};


// export default Sidebar; // Uncomment for use

export default Sidebar;

//lab vendor sidebar
const VendorSidebar = ({ children }) => {
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
      {/* Sidebar */}
      <div className="navbar-vertical navbar nav-dashboard bg-white shadow-sm" style={{ width: '280px' }}>
        <div className="h-100">
          <div className="simplebar-wrapper">
            <div className="simplebar-mask">
              <div className="simplebar-offset">
                <div
                  className="simplebar-content-wrapper"
                  style={{ height: "100%", overflow: "auto" }}
                >
                  <div className="simplebar-content p-3">
                    {/* Brand Logo */}
                    <Link className="navbar-brand mb-4 d-block" to="/panel">
                      <img src={logo} width="150px" alt="Lab Vendor Logo" className="img-fluid" />
                    </Link>

                    {/* Navigation */}
                    <ul className="navbar-nav flex-column gap-2" id="sideNavbar">
                      {/* Dashboard */}
                      <li className="nav-item">
                        <NavLink
                          to="/panel"
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
                          to="/panel/revenue"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-file-earmark-plus me-2"></i>
                          Revenue
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/panel/bank-settings"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-file-earmark-plus me-2"></i>
                          Bank Details
                        </NavLink>
                      </li>
                      

                      {/* Services Section */}
                      <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                          Services
                        </div>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/panel/services/AddTest"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-file-earmark-plus me-2"></i>
                          Add Test
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/panel/services/AddPackages"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-collection me-2"></i>
                          Add Packages
                        </NavLink>
                      </li>

                      {/* Ongoing Services Section */}
                      <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                          Ongoing Services
                        </div>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/panel/services/tests"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-clipboard-data me-2"></i>
                          Tests
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/panel/services/packages"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-box-seam me-2"></i>
                          Packages
                        </NavLink>
                      </li>

                      {/* Promotions Section */}
                      <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                          Others
                        </div>
                      </li>

                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("promotions") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("promotions")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-percent me-2"></i>
                            Promotions
                          </span>
                          <i className={`bi bi-chevron-${isOpen("promotions") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("promotions") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/panel/coupons"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-ticket-perforated me-2"></i>
                              Coupons
                            </NavLink>

                            <NavLink
                              to="/panel/generate-coupon"
                              className={({ isActive }) =>
                                `nav-link rounded d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Generate Coupon
                            </NavLink>
                          </div>
                        )}
                      </li>
                                            <li className="nav-item">
                        <NavLink
                          to="/panel/my-availability"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          My Availability
                        </NavLink>
                      </li>

                      {/* Driver Management Section */}
                      {/* <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold p-0">
                          Delivery Management
                        </div>
                      </li> */}

                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("drivers") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("drivers")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-truck me-2"></i>
                            Manage Driver
                          </span>
                          <i className={`bi bi-chevron-${isOpen("drivers") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("drivers") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/panel/drivers"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-people me-2"></i>
                              Drivers
                            </NavLink>

                            <NavLink
                              to="/panel/add-driver"
                              className={({ isActive }) =>
                                `nav-link rounded d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-person-plus me-2"></i>
                              Add New Driver
                            </NavLink>
                          </div>
                        )}
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/panel/documents"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Documents
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

      {/* Main Content */}
      <div className="main-content flex-grow-1 p-0 bg-light">
        {children}
      </div>
    </div>
  );
};
// pharmacy sidebar
const PharmacySidebar = ({ children }) => {
  const [openSections, setOpenSections] = useState([]);
  const sidebarRef = useRef(null);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section]
    );
  };

  const isOpen = (section) => openSections.includes(section);

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        // Your scroll handling logic here
        // Example: toggle classes based on scroll position
        const scrollPosition = window.scrollY;
        if (scrollPosition > 100) {
          sidebarRef.current.classList.add('scrolled');
        } else {
          sidebarRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="app-menu d-flex" ref={sidebarRef}>
      <div className="navbar-vertical navbar nav-dashboard bg-white shadow-sm" style={{ width: '280px' }}>
        <div className="h-100">
          <div className="simplebar-wrapper">
            <div className="simplebar-mask">
              <div className="simplebar-offset">
                <div
                  className="simplebar-content-wrapper"
                  style={{ height: "100%", overflow: "auto" }}
                >
                  <div className="simplebar-content p-3">
                    {/* Logo */}
                    <Link className="navbar-brand mb-4 d-block" to="/">
                      <img src={logo} width="150px" alt="Pharmacy Logo" className="img-fluid" />
                    </Link>

                    {/* Sidebar Items */}
                    <ul className="navbar-nav flex-column gap-2" id="sideNavbar">
                      {/* Dashboard */}
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard"
                          end
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-speedometer2 me-2"></i>
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard/revenue"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Revenue
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard/bank-settings"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Bank Details
                        </NavLink>
                      </li>

                      {/* Medicines */}
                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("medicines") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("medicines")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-capsule me-2"></i>
                            Medicines
                          </span>
                          <i className={`bi bi-chevron-${isOpen("medicines") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("medicines") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/pharmacy-dashboard/add-medicine"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Medicine
                            </NavLink>

                            <NavLink
                              to="/pharmacy-dashboard/all-Medicines"
                              className={({ isActive }) =>
                                `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-list-ul me-2"></i>
                              All Medicines
                            </NavLink>
                          </div>
                        )}
                      </li>

                      {/* Products */}
                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("products") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("products")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-box-seam me-2"></i>
                            Products
                          </span>
                          <i className={`bi bi-chevron-${isOpen("products") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("products") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/pharmacy-dashboard/today-orders"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Products
                            </NavLink>

                            <NavLink
                              to="/pharmacy-dashboard/all-products"
                              className={({ isActive }) =>
                                `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-list-ul me-2"></i>
                              All Products
                            </NavLink>
                          </div>
                        )}
                      </li>

                      {/* Manage Shops */}
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard/shop-management"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-shop me-2"></i>
                          Manage Shops
                        </NavLink>
                      </li>

                      {/* Promotions */}
                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("promotions") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("promotions")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-percent me-2"></i>
                            Promotions
                          </span>
                          <i className={`bi bi-chevron-${isOpen("promotions") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("promotions") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/pharmacy-dashboard/coupons"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-ticket-perforated me-2"></i>
                              Coupons
                            </NavLink>

                            <NavLink
                              to="/pharmacy-dashboard/generate-coupon"
                              className={({ isActive }) =>
                                `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Generate Coupon
                            </NavLink>
                          </div>
                        )}
                      </li>

                      {/* My Availability */}
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard/my-availability"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          My Availability
                        </NavLink>
                      </li>

                      {/* Manage Driver */}
                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("drivers") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("drivers")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-truck me-2"></i>
                            Manage Driver
                          </span>
                          <i className={`bi bi-chevron-${isOpen("drivers") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("drivers") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/pharmacy-dashboard/drivers"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-people me-2"></i>
                              Drivers
                            </NavLink>

                            <NavLink
                              to="/pharmacy-dashboard/add-driver"
                              className={({ isActive }) =>
                                `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-person-plus me-2"></i>
                              Add New Driver
                            </NavLink>
                          </div>
                        )}
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/pharmacy-dashboard/documents"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Documents
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

      {/* Page Content */}
      <div className="main-content flex-grow-1 p-0">
        {children}
      </div>
    </div>
  );
};
//food sidebar
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
    <div className="app-menu d-flex m-0">
      {/* Sidebar */}
      <div className="navbar-vertical navbar nav-dashboard bg-white shadow-sm" style={{ width: '280px' }}>
        <div className="h-100">
          <div className="simplebar-wrapper">
            <div className="simplebar-mask">
              <div className="simplebar-offset">
                <div
                  className="simplebar-content-wrapper"
                  style={{ height: "100%", overflow: "auto" }}
                >
                  <div className="simplebar-content p-3">
                    {/* Brand Logo */}
                    <Link className="navbar-brand mb-4 d-block" to="/food-dashboard/viewFood">
                      <img src={logo} width="150px" alt="Food Vendor Logo" className="img-fluid" />
                    </Link>

                    {/* Navigation */}
                    <ul className="navbar-nav flex-column gap-2" id="sideNavbar">
                      {/* Dashboard */}
                      <li className="nav-item">
                        <NavLink
                          to="/food-dashboard"
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
                          to="/food-dashboard/revenue"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          Revenue
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/food-dashboard/bank-settings"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          Bank Details
                        </NavLink>
                      </li>
                      

                      {/* Food Items Section */}
                      {/* <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold">
                          Food Management
                        </div>
                      </li> */}

                      {/* <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("foodItems") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("foodItems")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-egg-fried me-2"></i>
                            Food Items
                          </span>
                          <i className={`bi bi-chevron-${isOpen("foodItems") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("foodItems") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/food-dashboard/ongoing"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-arrow-repeat me-2"></i>
                              Ongoing
                            </NavLink>

                            <NavLink
                              to="/food-dashboard/pending"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-hourglass-split me-2"></i>
                              Pending
                            </NavLink>

                            <NavLink
                              to="/food-dashboard/reject"
                              className={({ isActive }) =>
                                `nav-link rounded d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-x-circle me-2"></i>
                              Rejected
                            </NavLink>
                          </div>
                        )}
                      </li> */}

                      {/* Orders Section */}
                      {/* <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold">
                          Orders
                        </div>
                      </li> */}

                      {/* <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("orders") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("orders")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-cart me-2"></i>
                            Order Management
                          </span>
                          <i className={`bi bi-chevron-${isOpen("orders") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("orders") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/food-dashboard/today-orders"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-calendar-day me-2"></i>
                              Today's Orders
                            </NavLink>

                            <NavLink
                              to="/food-dashboard/track-orders"
                              className={({ isActive }) =>
                                `nav-link rounded d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-truck me-2"></i>
                              Track Orders
                            </NavLink>
                          </div>
                        )}
                      </li> */}

                      {/* Promotions Section */}
                      {/* <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold">
                          Marketing
                        </div>
                      </li> */}

                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("promotions") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("promotions")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-megaphone me-2"></i>
                            Promotions
                          </span>
                          <i className={`bi bi-chevron-${isOpen("promotions") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("promotions") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/food-dashboard/coupons"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-ticket-perforated me-2"></i>
                              Coupons
                            </NavLink>

                            <NavLink
                              to="/food-dashboard/generate-coupon"
                              className={({ isActive }) =>
                                `nav-link rounded d-flex align-items-center ${
                                  isActive ? 'active bg-primary text-white' : 'text-dark'
                                }`
                              }
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Generate Coupon
                            </NavLink>
                          </div>
                        )}
                      </li>

                      {/* Availability */}
                      {/* <li className="nav-item mt-3">
                        <div className="navbar-heading text-uppercase small text-muted fw-bold">
                          Settings
                        </div>
                      </li> */}

                      <li className="nav-item">
                        <NavLink
                          to="/food-dashboard/my-availability"
                          className={({ isActive }) =>
                            `nav-link rounded d-flex align-items-center ${
                              isActive ? 'active bg-primary text-white' : 'text-dark'
                            }`
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          My Availability
                        </NavLink>
                      </li>
                                            {/* Manage Driver */}
                      <li className="nav-item">
                        <div
                          className={`nav-link rounded d-flex justify-content-between align-items-center ${
                            isOpen("drivers") ? 'active bg-light text-dark' : 'text-dark'
                          }`}
                          onClick={() => toggleSection("drivers")}
                          style={{ cursor: "pointer" }}
                        >
                          <span>
                            <i className="bi bi-truck me-2"></i>
                            Manage Driver
                          </span>
                          <i className={`bi bi-chevron-${isOpen("drivers") ? 'down' : 'right'}`}></i>
                        </div>

                        {isOpen("drivers") && (
                          <div className="ps-4 mt-2">
                            <NavLink
                              to="/food-dashboard/drivers"
                              className={({ isActive }) =>
                                `nav-link rounded mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-people me-2"></i>
                              Drivers
                            </NavLink>

                            <NavLink
                              to="/food-dashboard/add-driver"
                              className={({ isActive }) =>
                                `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                              }
                            >
                              <i className="bi bi-person-plus me-2"></i>
                              Add New Driver
                            </NavLink>
                          </div>
                        )}
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/food-dashboard/documents"
                          className={({ isActive }) =>
                            `nav-link rounded ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
                          }
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Documents
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

      {/* Main Content */}
      <div className="main-content flex-grow-1 p-0 bg-light">
        {children}
      </div>
    </div>
  );
};

export { Sidebar, VendorSidebar, PharmacySidebar, FoodSidebar };
