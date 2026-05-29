import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import img1 from "../Assets/img/Logo.png";
import $ from "jquery";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // API data store karne ke liye
  const URL = process.env.REACT_APP_API_URL;

  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    navigate("/UserLogin");
  };

  // Profile Fetch karne ki API carefully logic ke saath
  const fetchProfileData = async () => {
    try {
      const tokenStr = sessionStorage.getItem("token");
      if (!tokenStr) return;
      const token = JSON.parse(tokenStr);

      const response = await axios.get(`${URL}/user/get`, {
        headers: { token: token },
      });

      if (response.data.success === 1) {
        setUser(response.data.details);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchProfileData(); // Component load hote hi profile fetch hogi

    const handleLinkClick = function () {
      const path = $(this).attr("href");
      sessionStorage.setItem("activePath", path);
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
    };

    const activePath = sessionStorage.getItem("activePath") || location.pathname;
    $(".nav-link").each(function () {
      if ($(this).attr("href") === activePath) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });

    $(".nav-link").on("click", handleLinkClick);

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

            .custom-menu-hover {
              transition: all 0.2s ease-in-out;
            }
            .custom-menu-hover:hover, 
            .custom-menu-hover:hover span, 
            .custom-menu-hover:hover i {
              color: #ffffff !important;
              background-color: #0d6efd !important; 
              border-radius: 6px;
            }
            .modal-label { font-weight: 700; color: #0d6efd; font-size: 0.8rem; text-transform: uppercase; }
            .modal-value { font-weight: 500; color: #333; margin-bottom: 10px; font-size: 0.95rem; }
            `,
        }}
      />

      {/* ================= PROFILE MODAL ================= */}
      <div className="modal fade" id="viewProfileModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-4 shadow border-0">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">User Profile Information</h5>
              <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body pt-3">
              <div className="text-center mb-4">
                <img
                  src={user?.image || "https://cdn-icons-png.flaticon.com/512/64/64572.png"}
                  className="rounded-circle border border-3 border-primary p-1 mb-2"
                  width={100} height={100} style={{ objectFit: 'cover' }} alt="profile"
                />
                <h4 className="fw-bold text-dark mb-0">{user?.name || "User"}</h4>
                <p className="text-muted small">Completion: {user?.profilePercentage}%</p>
              </div>

              <div className="row px-2">
                {/* Conditional Rendering: Sirf wahi keys dikhengi jisme data hai */}
                {user?.number && <div className="col-6"><div className="modal-label">Mobile</div><div className="modal-value">{user.number}</div></div>}
                {user?.email && <div className="col-6"><div className="modal-label">Email</div><div className="modal-value">{user.email}</div></div>}
                {user?.gender && <div className="col-6"><div className="modal-label">Gender</div><div className="modal-value">{user.gender}</div></div>}
                {user?.dob && <div className="col-6"><div className="modal-label">Year of Birth</div><div className="modal-value">{user.dob}</div></div>}
                {user?.occupation && <div className="col-6"><div className="modal-label">Occupation</div><div className="modal-value">{user.occupation}</div></div>}
                {user?.bloodgroup && <div className="col-6"><div className="modal-label">Blood Group</div><div className="modal-value">{user.bloodgroup}</div></div>}
                {user?.diabteticType && <div className="col-6"><div className="modal-label">Diabetes Type</div><div className="modal-value">{user.diabteticType}</div></div>}
                {user?.diabeticduration && <div className="col-6"><div className="modal-label">Duration</div><div className="modal-value">{user.diabeticduration}</div></div>}
                {user?.dailyactivity && <div className="col-6"><div className="modal-label">Activity Level</div><div className="modal-value">{user.dailyactivity}</div></div>}
                {user?.referralCode && <div className="col-6"><div className="modal-label">Referral Code</div><div className="modal-value">{user.referralCode}</div></div>}
                {user?.address && <div className="col-12"><div className="modal-label">Address</div><div className="modal-value">{user.address}</div></div>}
              </div>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-primary w-100 rounded-pill fw-bold" data-bs-dismiss="modal" onClick={() => navigate("/update-profile")}>Edit Profile</button>
            </div>
          </div>
        </div>
      </div>

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
                className="btn-close shadow-none"
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
                  <Link className="nav-link" aria-current="page" to="/">Home</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Doctors">Doctor</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Clinic">Clinic</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/venders/labs">Labs</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Pharmacy">Pharmacy</Link>
                </li>
                <li className="nav-item dropdown nav-item-hover mt-0 pt-0">
                  <button
                    className="nav-link text-start border-0 bg-transparent"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Shop
                    <i className="fa fa-chevron-down ms-1 fs-7 CurrentColor" aria-hidden="true" />
                  </button>
                  <ul className="dropdown-menu border-0 shadow-sm" style={{ top: "31px" }}>
                    <li className="w-100" data-bs-dismiss="offcanvas">
                      <Link className="dropdown-item" to="/pharmacy-shop">Pharmacy Shop</Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/shop/FoodAndNurition">Food & Nurition</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/CareProgram">Care Program</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Science">Science</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/AboutUs">About Us</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Blogs">Blogs</Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/videos">Videos</Link>
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
                  src={user?.image || "https://cdn-icons-png.flaticon.com/512/64/64572.png"}
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
                      <span className="fw-bold fs-5 textBlack text-decoration-none">
                        Hello, {user?.name || "User"}
                      </span>
                      <br />
                      {/* VIEW PROFILE BUTTON: Triggers the Modal */}
                      <button
                        className="fw-medium link-danger fs-6 text-decoration-none border-0 bg-transparent p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#viewProfileModal"
                      >
                        View Profile
                      </button>
                    </div>
                    <img
                      src={user?.image || "https://cdn-icons-png.flaticon.com/512/64/64572.png"}
                      className="imgFilter ms-3"
                      width={30}
                      alt=""
                    />
                  </div>
                </div>

                <div className="py-2 px-2 d-flex flex-column">
                  <Link to="/UserLogin" className="text-decoration-none text-dark">
                    <button className="btn border-0 fw-bold w-100 text-start custom-menu-hover p-2 mb-1">
                      <i className="ri-login-circle-line fw-medium fs-4 align-middle" />
                      <span className="ms-3 align-middle">Login</span>
                    </button>
                  </Link>

                  {/* NEW Signup Button added right below Login */}
                  <Link to="/only-signup" className="text-decoration-none text-dark">
                    <button className="btn border-0 fw-bold w-100 text-start custom-menu-hover p-2 mb-1">
                      <i className="ri-user-add-line fw-medium fs-4 align-middle text-primary" />
                      <span className="ms-3 align-middle text-primary">Sign up</span>
                    </button>
                  </Link>

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

                    <div className="collapse w-100 mt-1" id="settingsSubmenu">
                      <ul className="list-unstyled mb-0 pb-1 ps-4 pe-2">
                        <li><Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/Doctors/history"><i className="fa fa-caret-right me-2" style={{ fontSize: "12px" }}></i>Doctor Appointment</Link></li>
                        <li><Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/venders/labs/orders"><i className="fa fa-caret-right me-2" style={{ fontSize: "12px" }}></i>Lab Tests</Link></li>
                        <li><Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/shop/FoodAndNurition/orders"><i className="fa fa-caret-right me-2" style={{ fontSize: "12px" }}></i>Food Orders</Link></li>
                        <li><Link className="dropdown-item py-2 my-1 fw-medium custom-menu-hover" to="/pharmacy/order-history"><i className="fa fa-caret-right me-2" style={{ fontSize: "12px" }}></i>Pharmacy History</Link></li>
                      </ul>
                    </div>
                  </div>

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