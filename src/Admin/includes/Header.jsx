import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../Components/Assets/img/Logo.png";
import { MyContext } from "../../Context/Context";

const Header = () => {
  const {getAdmin,admin} = useContext(MyContext)
  const URL = process.env.REACT_APP_API_URL

  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    toast.success("Logged out successfully");
    setTimeout(() => {
      navigate("/admin");
    }, 800);
  };

  useEffect(()=>{
    getAdmin()
  })
  return (
    <>
      <div className="header">
        {/* navbar */}
        <div className="navbar-custom navbar navbar-expand-lg">
          <div className="container-fluid px-0">
            <Link className="navbar-brand d-block d-md-none">
              <img src={logo} style={{ maxWidth: "150px" }} alt="logo" />
            </Link>
            <div className="me-auto d-flex gap-2 align-items-center">
              <Link className="nav-toggleBtn d-md-block d-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={28}
                  height={28}
                  fill="currentColor"
                  className="bi bi-text-indent-left text-muted"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.646 2.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L4.293 8 2.646 6.354a.5.5 0 0 1 0-.708zM7 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"></path>
                </svg>
              </Link>
            </div>
            {/*Navbar nav */}
            <ul className="navbar-nav navbar-right-wrap ms-lg-auto d-flex nav-top-wrap align-items-center ms-4 ms-lg-0">
              {/* <Link className="form-check form-switch theme-switch btn btn-ghost btn-icon rounded-circle border-0 mb-0 ">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckDefault"
                />
              </Link> */}
              {/* Notifications */}
              <li className="dropdown-li stopevent ms-2">
                <Link
                  className="btn btn-ghost btn-icon rounded-circle border-0"
                  data-bs-auto-close="outside"
                  role="button"
                  id="dropdownNotification"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
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
                    className="feather feather-bell icon-xs"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </Link>
                <div
                  style={{ minWidth: "300px" }}
                  className="dropdown-menu dropdown-menu-lg dropdown-menu-end "
                  aria-labelledby="dropdownNotification"
                >
                  <div>
                    <div className="border-bottom px-3 pt-2 pb-3 d-flex justify-content-between align-items-center">
                      <p className="mb-0 text-dark fw-medium fs-4">
                        Notifications
                      </p>
                      <Link className="text-muted">
                        <span>
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
                            className="feather feather-settings me-1 icon-xs"
                          >
                            <circle cx={12} cy={12} r={3} />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </span>
                      </Link>
                    </div>
                    <div data-simplebar="init" style={{ height: "250px" }}>
                      <div
                        className="simplebar-wrapper"
                        style={{ margin: "0px" }}
                      >
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
                              style={{ height: "auto", overflow: "hidden" }}
                            >
                              <div
                                className="simplebar-content"
                                style={{ padding: "0px" }}
                              >
                                {/* List group */}
                                <ul className="list-group list-group-flush notification-list-scroll HoverScrol CustomScrollBar">
                                  {/* List group item */}
                                  <li className="list-group-item bg-light">
                                    <Link className="text-muted">
                                      <h5 className=" mb-1">Rishi Chopra</h5>
                                      <p className="mb-0">
                                        Mauris blandit erat id nunc blandit, ac
                                        eleifend dolor pretium.
                                      </p>
                                    </Link>
                                  </li>
                                  {/* List group item */}
                                  <li className="list-group-item">
                                    <Link className="text-muted">
                                      <h5 className=" mb-1">Neha Kannned</h5>
                                      <p className="mb-0">
                                        Proin at elit vel est condimentum
                                        elementum id in ante. Maecenas et sapien
                                        metus.
                                      </p>
                                    </Link>
                                  </li>
                                  {/* List group item */}
                                  <li className="list-group-item">
                                    <Link className="text-muted">
                                      <h5 className=" mb-1">Nirmala Chauhan</h5>
                                      <p className="mb-0">
                                        Morbi maximus urna lobortis elit
                                        sollicitudin sollicitudieget elit vel
                                        pretium.
                                      </p>
                                    </Link>
                                  </li>
                                  {/* List group item */}
                                  <li className="list-group-item">
                                    <Link className="text-muted">
                                      <h5 className=" mb-1">Sina Ray</h5>
                                      <p className="mb-0">
                                        Sed aliquam augue sit amet mauris
                                        volutpat hendrerit sed nunc eu diam.
                                      </p>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="simplebar-placeholder"
                          style={{ width: "0px", height: "0px" }}
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
                        style={{ visibility: "hidden" }}
                      >
                        <div
                          className="simplebar-scrollbar"
                          style={{ height: "0px", display: "none" }}
                        />
                      </div>
                    </div>
                    <div className="border-top px-3 py-2 text-center">
                      <Link className="text-inherit ">
                        View all Notifications
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                {/* Display admin name here */}
                {admin && <span>{admin.name}</span>}
              </li>

              {/* List */}
              <li className="dropdown-li ms-2">
                <Link
                  className="rounded-circle"
                  role="button"
                  id="dropdownUser"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="avatar avatar-md avatar-indicators avatar-online">
                    <img
                      alt="avatar"
                      src={`${URL}/${admin.image}`}
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px' }}
                    />
                  </div>
                </Link>
                <div
                  style={{ minWidth: "200px" }}
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="dropdownUser"
                >
                  <div className="px-4 pb-0 pt-2">
                    <div className="lh-1 ">
                      <h5 className="mb-1">{admin ? admin.name : 'Admin'}</h5>
                      <Link to="/dashboard/edit" className="text-inherit fs-6">View my profile</Link>
                    </div>
                    <div className=" dropdown-divider mt-3 mb-2" />
                  </div>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/dashboard/edit" className="dropdown-item d-flex align-items-center">
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
                          className="feather feather-user me-2 icon-xxs dropdown-item-icon"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/password" className="dropdown-item d-flex align-items-center">
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
                          className="feather feather-user me-2 icon-xxs dropdown-item-icon"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                        Change Password
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item">
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
                          className="feather feather-activity me-2 icon-xxs dropdown-item-icon"
                        >
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        Activity Log
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center">
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
                          className="feather feather-settings me-2 icon-xxs dropdown-item-icon"
                        >
                          <circle cx={12} cy={12} r={3} />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                      </Link>
                    </li>
                    <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                      <Link className="dropdown-item">
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
                          className="feather feather-power me-2 icon-xxs dropdown-item-icon"
                        >
                          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                          <line x1={12} y1={2} x2={12} y2={12} />
                        </svg>
                        Sign Out
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};


export default Header;
