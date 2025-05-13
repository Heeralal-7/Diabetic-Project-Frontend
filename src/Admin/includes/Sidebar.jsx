import React, { useState }  from "react";
import logo from "../../Components/Assets/img/Logo.png";
import { Link, NavLink } from "react-router-dom";
 const Sidebar = ({ children }) => {
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
                        {/* <img
                      src="https://images.unsplash.com/photo-1718062457138-2d6fcab216d9?q=80&w=2110&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      width alt="dash ui " /> */}
                        <img src={logo} width="150px" alt="" />
                        {/* <h1 className="fw-bold">Diabetics</h1> */}
                      </Link>
                      {/* Navbar nav */}
                      <ul className="navbar-nav flex-column" id="sideNavbar">
                        {/* Nav item */}
                        <li className="nav-item"></li>
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
                        {/* Nav item Heading*/}
                        <li className="nav-item">
                          <div className="navbar-heading">Vendors</div>
                        </li>
                        {/* Lab */}
                        {/* Nav item DropDown */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#vendor"
                            aria-expanded="false"
                            aria-controls="GamesDropDown"
                          >
                            <i className="bi bi-joystick me-2 icon-xxs nav-icon" />
                            Lab
                          </Link>
                          <div
                            id="vendor"
                            className="collapse"
                            data-bs-parent="#mainVendor"
                            style={{}}
                          >
                            <ul className="nav flex-column">
                              <li
                                className="nav-item"
                                style={{ color: "white" }}
                              >
                                <NavLink
                                  to="/dashboard/lab/user"
                                  className={({ isActive, isPending }) =>
                                    isPending
                                      ? "nav-link"
                                      : isActive
                                      ? "nav-link "
                                      : "nav-link"
                                  }
                                >
                                  User
                                </NavLink>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Food
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li> */}
                        {/* Lab */}
                        {/* Nav item DropDown */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#Food"
                            aria-expanded="false"
                          >
                            <i className="bi bi-joystick me-2 icon-xxs nav-icon" />
                            Food
                          </Link>
                          <div
                            id="Food"
                            className="collapse"
                            data-bs-parent="#mainVendor"
                            style={{}}
                          >
                            <ul className="nav flex-column">
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">Lab</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Pharmacy
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Food
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li> */}
                        <li className="nav-item">
                          <Link className="nav-link has-arrow " to="/dashboard/lab/user">
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
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link has-arrow " to="/dashboard/pharmacy">
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
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link has-arrow " to="/dashboard/viewFood">
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
                          </Link>
                        </li>
                        <li className="nav-item">
                          <div className="navbar-heading">Users</div>
                        </li>
                        {/* Nav item */}
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
                        {/* <li className="nav-item">
                          <NavLink to="/" className="nav-link has-arrow ">
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
                            Inactive
                          </NavLink>
                        </li> */}
                        <li className="nav-item">
                          <Link className="nav-link has-arrow " to="/dashboard/banned">
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
                            </svg>{" "}
                            Banned
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link has-arrow " to="/dashboard/banner">
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
                            </svg>{" "}
                            Banners
                          </Link>
                        </li>
                        <li className="nav-item">
                          {/* <Link className="nav-link has-arrow ">
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
                            </svg>{" "}
                            Leaderboard
                          </Link> */}
                        </li>
                        {/* Nav item Heading*/}
                        {/* <li className="nav-item">
                          <div className="navbar-heading">Games</div>
                        </li>
                        {/* Nav item DropDown */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#GamesDropDown"
                            aria-expanded="false"
                            aria-controls="GamesDropDown"
                          >
                            <i className="bi bi-joystick me-2 icon-xxs nav-icon" />
                            Admin Games
                          </Link>
                          <div
                            id="GamesDropDown"
                            className="collapse"
                            data-bs-parent="#sideNavbar"
                            style={{}}
                          >
                            <ul className="nav flex-column">
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Offline
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Today
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Premium
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Upcomming
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li>
                        {/* Nav item DropDown */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow  collapsed "
                            data-bs-toggle="collapse"
                            data-bs-target="#GamesDropDown1"
                            aria-expanded="false"
                            aria-controls="GamesDropDown1"
                          >
                            <i className="bi bi-joystick me-2 icon-xxs nav-icon" />
                            User Games
                          </Link>
                          <div
                            id="GamesDropDown1"
                            className="collapse "
                            data-bs-parent="#sideNavbar"
                          >
                            <ul className="nav flex-column">
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Offline
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Today
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Premium
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link has-arrow ">
                                  Upcomming
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </li> */}
                        {/* Nav item Heading*/}
                        <li className="nav-item">
                          <div className="navbar-heading">Blogs</div>
                        </li>
                        <li className="nav-item">
                          <Link to="/dashboard/addblog" className="nav-link">
                            <i class="bi bi-substack  me-2 icon-xxs nav-icon"></i>
                            Add Blog
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/dashboard/getblogs">
                            <i class="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Get Blogs
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                          <Link className="nav-link" to="/dashboard/addblogSubheading">
                            <i class="bi bi-substack me-2 icon-xxs nav-icon"></i>
                            Add Blog SubHeading
                          </Link>
                        </li> */}


                        {/* Nav item Heading settings start */}
                        {/* <li className="nav-item">
                          <div className="navbar-heading">Settings</div>
                        </li>
                        
                        
                        <li className="nav-item">
                          <Link className="nav-link">
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
                              className="feather feather-settings nav-icon me-2 icon-xxs"
                            >
                              <circle cx={12} cy={12} r={3} />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>{" "}
                            Genral Settings
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link">
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
                              className="feather feather-settings nav-icon me-2 icon-xxs"
                            >
                              <circle cx={12} cy={12} r={3} />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>{" "}
                            Payment Gateway Settings
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link">
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
                              className="feather feather-settings nav-icon me-2 icon-xxs"
                            >
                              <circle cx={12} cy={12} r={3} />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            FireBase Settings
                          </Link>
                        </li> */}
{/* settings end */}


                        {/* Nav item */}
                        
                        {/* Nav item */}
                        {/* <li className="nav-item">
                          <Link className="nav-link">
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
                            </svg>{" "}
                            Profile
                          </Link>
                        </li> */}
                        {/* Nav item */}
                        {/* <li className="nav-item">
                          <Link className="nav-link">
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
                            </svg>{" "}
                            Change Password
                          </Link>
                        </li> */}
                       
                        {/* Nav item */}
                        {/* <li className="nav-item">
                          <div className="navbar-heading">UI Components</div>
                        </li>
                        {/* Nav item */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow  collapsed "
                            data-bs-toggle="collapse"
                            data-bs-target="#navComponents"
                            aria-expanded="false"
                            aria-controls="navComponents"
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
                              className="feather feather-package nav-icon me-2 icon-xxs"
                            >
                              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1={12} y1="22.08" x2={12} y2={12} />
                            </svg>{" "}
                            Components
                          </Link>
                          <div
                            id="navComponents"
                            className="collapse "
                            data-bs-parent="#sideNavbar"
                          >
                            <ul className="nav flex-column">
                              <li className="nav-item">
                                <Link className="nav-link ">Accordions</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Alert</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Badge</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Breadcrumb</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Buttons</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Button group</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Card</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Carousel</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Close Button</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Collapse</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Dropdowns</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Forms</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">List group</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Modal</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Navs and tabs</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Navbar</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Offcanvas</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Pagination</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Placeholders</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Popovers</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Progress</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Scrollspy</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Spinners</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Tables</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Toasts</Link>
                              </li>
                              <li className="nav-item">
                                <Link className="nav-link ">Tooltips</Link>
                              </li>
                            </ul>
                          </div>
                        </li> */}
                        {/* Nav item */}
                        {/* <li className="nav-item">
                          <Link
                            className="nav-link has-arrow  collapsed "
                            data-bs-toggle="collapse"
                            data-bs-target="#navMenuLevel"
                            aria-expanded="false"
                            aria-controls="navMenuLevel"
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
                              className="feather feather-corner-left-down nav-icon me-2 icon-xxs"
                            >
                              <polyline points="14 15 9 20 4 15" />
                              <path d="M20 4h-7a4 4 0 0 0-4 4v12" />
                            </svg>{" "}
                            Menu Level
                          </Link>
                          <div
                            id="navMenuLevel"
                            className="collapse "
                            data-bs-parent="#sideNavbar"
                          >
                            <ul className="nav flex-column">
                              <li className="nav-item">
                                <Link
                                  className="nav-link has-arrow collapsed"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#navMenuLevelSecond"
                                  aria-expanded="false"
                                  aria-controls="navMenuLevelSecond"
                                >
                                  Two Level
                                </Link>
                                <div
                                  id="navMenuLevelSecond"
                                  className="collapse"
                                  data-bs-parent="#navMenuLevel"
                                >
                                  <ul className="nav flex-column">
                                    <li className="nav-item">
                                      <Link className="nav-link ">
                                        NavItem 1
                                      </Link>
                                    </li>
                                    <li className="nav-item">
                                      <Link className="nav-link ">
                                        NavItem 2
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </li>
                              <li className="nav-item">
                                <Link
                                  className="nav-link has-arrow  collapsed  "
                                  data-bs-toggle="collapse"
                                  data-bs-target="#navMenuLevelThree"
                                  aria-expanded="false"
                                  aria-controls="navMenuLevelThree"
                                >
                                  Three Level
                                </Link>
                                <div
                                  id="navMenuLevelThree"
                                  className="collapse "
                                  data-bs-parent="#navMenuLevel"
                                >
                                  <ul className="nav flex-column">
                                    <li className="nav-item">
                                      <Link
                                        className="nav-link  collapsed "
                                        data-bs-toggle="collapse"
                                        data-bs-target="#navMenuLevelThreeOne"
                                        aria-expanded="false"
                                        aria-controls="navMenuLevelThreeOne"
                                      >
                                        NavItem 1
                                      </Link>
                                      <div
                                        id="navMenuLevelThreeOne"
                                        className="collapse collapse "
                                        data-bs-parent="#navMenuLevelThree"
                                      >
                                        <ul className="nav flex-column">
                                          <li className="nav-item">
                                            <Link className="nav-link ">
                                              NavChild Item 1
                                            </Link>
                                          </li>
                                        </ul>
                                      </div>
                                    </li>
                                    <li className="nav-item">
                                      <Link className="nav-link ">
                                        Nav Item 2
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </li> */}
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
                          <NavLink className="nav-link has-arrow " to="/panel/services/AddTest">
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
                          <NavLink className="nav-link has-arrow " to="/panel/services/AddPackages">
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
                          <NavLink className="nav-link has-arrow " to="/panel/services/tests">
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
                          <NavLink className="nav-link has-arrow " to="/panel/services/packages">
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
                <div className="simplebar-content-wrapper" style={{ height: "100%", overflow: "auto" }}>
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
                            to="/food-dashboard"
                            end
                            className={({ isActive }) =>
                              isActive ? "nav-link active" : "nav-link"
                            }
                          >
                            Dashboard
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


export { Sidebar , VendorSidebar, PharmacySidebar, FoodSidebar };
