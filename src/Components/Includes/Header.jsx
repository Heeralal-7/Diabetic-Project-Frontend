import { React, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img1 from "../Assets/img/Logo.png";
import $ from "jquery";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    navigate("/UserLogin");
  };

  useEffect(() => {
    const handleLinkClick = function () {
      const path = $(this).attr("href");
      sessionStorage.setItem("activePath", path);
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
    };

    // Get the active path from sessionStorage
    const activePath = sessionStorage.getItem("activePath") || location.pathname;
    $(".nav-link").each(function () {
      if ($(this).attr("href") === activePath) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });

    // Use jQuery to handle click events
    $(".nav-link").on("click", handleLinkClick);

    // Cleanup event listeners on component unmount
    return () => {
      $(".nav-link").off("click", handleLinkClick);
    };
  }, [location]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `.fs-small{
              font-size: 0.85rem;
            }
            .fixed-top {
              position: fixed;
              top: 0;
              right: 0;
              left: 0;
              z-index: 1000 !important;
            }
            .custom-dropdown-hover:hover {
              background-color: #c1d8f1ff !important; 
            }

            /* HOWER EFFECT: Text white and background blue */
            .custom-menu-hover {
              transition: all 0.2s ease-in-out;
            }
            .custom-menu-hover:hover, 
            .custom-menu-hover:hover span, 
            .custom-menu-hover:hover i {
              color: #ffffff !important;
              background-color: #0d6efd !important; /* Bootstrap Primary Blue */
              border-radius: 6px;
            }
            `,
        }}
      />
      <nav
        className="navbar fixed-top fw-bold navbar-expand-lg bg-primary-subtle shadow-sm"
        id="navbar"
      >
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ maxWidth: "180px" }}>
            <img style={{ width: "100%" }} src={img1} alt="" />
          </Link>

          <div
            className="offcanvas CustomHeaderOffcan offcanvas-end py-lg-2 OffCanWidth"
            tabIndex={-1}
            id="offcanvasNavbar"
            aria-labelledby="topNavBar"
          >
            <div className="offcanvas-header">
              <h5
                className="offcanvas-title"
                id="topNavBar"
                style={{ maxWidth: "200px" }}
              >
                <img style={{ width: "100%" }} src={img1} alt="" />
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body ps-4">
              <form
                className="d-flex mx-auto align-items-center btn-group flex-grow-1 d-lg-none d-xl-flex"
                style={{ maxWidth: "700px" }}
                role="search"
              >
                <input
                  className="form-control  shadow-none rounded-end-0 border"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button
                  className="btn border-mainBlue border border-2 btn-hoverBlue shadow-none text-nowrap"
                  type="submit"
                >
                  <i className="fa fa-search" aria-hidden="true" />
                </button>
              </form>
              <ul className="navbar-nav CustomNav text-nowrap align-items-start flex-grow-1 align-items-lg-center justify-content-end fs-small">
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Doctors">
                    Doctor
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Clinic">
                    Clinic
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/venders/labs">
                    Labs
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Pharmacy">
                    Pharmacy
                  </Link>
                </li>
                <li className="nav-item dropdown nav-item-hover mt-0 pt-0">
                  <button
                    className="nav-link text-start border-0 bg-transparent"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Shop
                    <i
                      className="fa fa-chevron-down ms-1 fs-7 CurrentColor"
                      aria-hidden="true"
                    />
                  </button>
                  <ul
                    className="dropdown-menu border-0 shadow-sm"
                    style={{ top: "31px" }}
                  >
                    <li className="w-100" data-bs-dismiss="offcanvas">
                      <Link className="dropdown-item" to="/pharmacy-shop">
                        Pharmacy Shop
                      </Link>
                    </li>
                  
                  </ul>
                </li>

                <li className="nav-item" data-bs-dismiss="offcanvas">
                      <Link className="nav-link" to="/shop/FoodAndNurition">
                        Food & Nurition
                      </Link>
                    </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/CareProgram">
                    Care Program
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Science">
                    Science
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/AboutUs">
                    About Us
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Blogs">
                    Blogs
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/videos">
                    Videos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="navbar-toggler border-0 fw-bold shadow-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <div className="dropdown custom-dropdown-hover">
              <button
                className="btn py-1 shadow-none border-0 border rounded-circle main-bg-dark d-xl-block ms-xl-0 my-xl-0 w-100 my-2 "
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-bs-auto-close="outside" 
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/64/64572.png"
                  className="imgFilter"
                  width={30}
                  alt=""
                />
              </button>
              <div
                className="dropdown-menu profileDropdwn w-auto rounded-4 DropdwnScale me-5 shadow-lg border-0"
                style={{ marginTop: "65px", minWidth: "250px" }}
              >
                <div className="border-bottom px-4 pb-3 pt-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="w-auto link-dark">
                      <Link to="/UserLogin" className="fw-bold fs-5 textBlack text-decoration-none">
                        Hello, {localStorage.getItem("name") || "User"}
                      </Link>
                      <br />
                      <Link
                        to="update-profile"
                        className="fw-medium link-danger fs-7 text-decoration-none"
                      >
                        View Profile
                      </Link>
                    </div>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/64/64572.png"
                      className="imgFilter ms-3"
                      width={30}
                      alt=""
                    />
                  </div>
                </div>

                <div className="py-2 px-2 d-flex flex-column">
                  {/* Login Button */}
                  <Link to="/UserLogin" className="text-decoration-none text-dark">
                    <button className="btn border-0 fw-bold w-100 text-start custom-menu-hover p-2 mb-1">
                      <i className="ri-login-circle-line fw-medium fs-4 align-middle" />
                      <span className="ms-3 align-middle">Login</span>
                    </button>
                  </Link>

                  {/* ===== SETTINGS DROPDOWN (CLICK TO EXPAND) ===== */}
                  <div className="w-100 my-1">
                    <button
                      className="btn border-0 fw-bold w-100 text-start d-flex justify-content-between align-items-center shadow-none custom-menu-hover p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#settingsSubmenu"
                      aria-expanded="false"
                      aria-controls="settingsSubmenu"
                    >
                      <div>
                        <i className="ri-settings-4-line fw-medium fs-4 align-middle" />
                        <span className="ms-3 align-middle">Settings</span>
                      </div>
                      <i className="fa fa-chevron-down fs-7 align-middle" />
                    </button>

                    {/* Khulne wale options */}
                    <div className="collapse w-100 mt-1" id="settingsSubmenu">
                      <ul className="list-unstyled mb-0 pb-1 ps-4 pe-2">
                        <li>
                          <Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/Doctors/history">
                            <i className="fa fa-caret-right me-2" style={{fontSize: "12px"}}></i>
                            Doctor Appointment
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/venders/labs/orders">
                            <i className="fa fa-caret-right me-2" style={{fontSize: "12px"}}></i>
                            Lab Tests
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/shop/FoodAndNurition/orders">
                            <i className="fa fa-caret-right me-2" style={{fontSize: "12px"}}></i>
                            Food Orders
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/pharmacy/order-history">
                            <i className="fa fa-caret-right me-2" style={{fontSize: "12px"}}></i>
                            Pharmacy History
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* ============================================== */}

                  {/* Logout Button */}
                  <button
                    className="btn border-0 fw-bold w-100 text-start mt-1 custom-menu-hover p-2"
                    onClick={logout}
                  >
                    <i className="ri-logout-circle-line fw-medium fs-4 align-middle text-danger" />
                    <span className="ms-3 align-middle text-danger">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;