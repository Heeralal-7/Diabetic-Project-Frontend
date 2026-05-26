import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from "../../Components/Assets/img/Logo.png";
import "../../Admin/Assests/css/Sidebar.css"; // Stellt sicher, dass das gleiche CSS geladen wird

export const SubAdminSidebar = ({ children, userPermissions }) => {
    // Die Berechtigungsprüfungs-Logik bleibt erhalten, falls sie benötigt wird
    const hasPermission = (module, action = 'view', vendorType = null) => {
        // ... (Ihre bestehende Berechtigungs-Logik)
    };

    return (
        <div className="app-menu d-flex m-0">
            {/* Sidebar */}
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
                                        {/* Brand Logo */}
                                        <Link className="navbar-brand sticky-top bg-white" to="/subadmin-dashboard">
                                            <img src={logo} width="150px" alt="SubAdmin Logo" />
                                        </Link>

                                        {/* Navigation */}
                                        <ul className="navbar-nav flex-column" id="sideNavbar">
                                            {/* Dashboard */}
                                            <li className="nav-item">
                                                <NavLink
                                                    to="/subadmin-dashboard"
                                                    end
                                                    className={({ isActive }) =>
                                                        isActive ? "nav-link active" : "nav-link"
                                                    }
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-home nav-icon me-2 icon-xxs"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                                    Dashboard
                                                </NavLink>
                                            </li>

                                            {/* Vendors Heading */}
                                            <li className="nav-item">
                                                <div className="navbar-heading">Vendors</div>
                                            </li>

                                            {/* Clinic Dropdown */}
                                            <li className="nav-item">
                                                <div className="dropdown w-100">
                                                    <a className="btn btn-transparent ms-2 border-0" href="#" role="button" id="dropdownMenuLinkClinic" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                        Clinic
                                                        <i className="fa-solid fa-chevron-down" style={{ marginLeft: "130px" }}></i>
                                                    </a>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuLinkClinic">
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/clinic">Clinics</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/clinic/specialists">Specialist</Link></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            {/* Doctor Dropdown */}
                                            <li className="nav-item">
                                                <div className="dropdown w-100">
                                                    <a className="btn btn-transparent ms-2 border-0" href="#" role="button" id="dropdownMenuLinkDoctor" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                        Doctor
                                                        <i className="fa-solid fa-chevron-down" style={{ marginLeft: "125px" }}></i>
                                                    </a>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuLinkDoctor">
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/Doctor">Doctor</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/doctor/insurance">Insurance Upload</Link></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            {/* Lab Dropdown */}
                                            <li className="nav-item">
                                                <div className="dropdown">
                                                    <a className="btn btn-transparent ms-2 border-0" href="#" role="button" id="dropdownMenuLab" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                        Lab
                                                        <i className="fa-solid fa-chevron-down" style={{ marginLeft: "148px" }}></i>
                                                    </a>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuLab">
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/lab">Lab</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/lab/delivery-charges">Delivery Charges</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/labtest">Create Test</Link></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            {/* Pharmacy Dropdown */}
                                            <li className="nav-item">
                                                <div className="dropdown">
                                                    <a className="btn btn-transparent ms-2 border-0" href="#" role="button" id="dropdownMenuPharmacy" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                        Pharmacy
                                                        <i className="fa-solid fa-chevron-down" style={{ marginLeft: "105px" }}></i>
                                                    </a>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuPharmacy">
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                       " to="/subadmin-dashboard/pharmacy">Pharmacy</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/pharmacy/approve-medicine">Approval Medicine</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/pharmacy/medicine-products-approve">Approval Product</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/pharmacy/delivery-charges">Delivery Charges</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/pharmacy/medicine">Medicines</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/pharmacy/medicine-products">Medicine products</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
                                                        " to="/subadmin-dashboard/brand-images/pharmacy">Brand Images</Link></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            {/* Food Dropdown */}
                                            <li className="nav-item">
                                                <div className="dropdown">
                                                    <a className="btn btn-transparent ms-2 border-0" href="#" role="button" id="dropdownMenuFood" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                        Food
                                                        <i className="fa-solid fa-chevron-down" style={{ marginLeft: "138px" }}></i>
                                                    </a>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuFood">
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/food">Food</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/food/delivery-charges">Delivery Charges</Link></li>
                                                        <li><Link className="dropdown-item nav-item nav-link blog-links
 " to="/subadmin-dashboard/upload-food">Food Category</Link></li>
                                                    </ul>
                                                </div>
                                            </li>

                                            {/* Users and Banned links */}
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/user" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Users
                                                </NavLink>
                                            </li>

                                            {/* <li className="nav-item">
                                                <Link to="/dashboard/banned" className="nav-link has-arrow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Banned
                                                </Link>
                                            </li> */}
                                            {/* Others */}
                                            <li className="nav-item">
                                                <div className="navbar-heading">Others</div>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/membership-plans" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Membership Plans
                                                </NavLink>
                                            </li>
                                            
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/care-program-page" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Care Program Page
                                                </NavLink>
                                            </li>
                                            
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/user/about-us" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    About Us
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/footer" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Footer Content
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/contactUs" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Contact Us
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/max-distance" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Max Distance Management
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/cancellation-settings" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Cancellation Charge
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/video-upload" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Video Upload
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/user/science" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Science
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/subadmin-dashboard/user/blogs" className={({ isActive }) => isActive ? "nav-link has-arrow active" : "nav-link has-arrow"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user nav-icon me-2 icon-xxs"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
                                                    Blogs
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

            {/* Main Content: Bessere Struktur, die den Inhalt vom Sidebar trennt */}
            <div className="flex-grow-1 p-0">
                {children}
            </div>
        </div>
    );
};

export default SubAdminSidebar;