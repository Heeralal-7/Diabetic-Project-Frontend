import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../Components/Assets/img/Logo.png";
import { toast } from "react-toastify";
import defaultAvatar from "../../../Components/Assets/img/LabTest/Group 1000009586.jpg"; // एक डिफ़ॉल्ट अवतार इमेज का उपयोग करें

// 1. MyContext को इम्पोर्ट करें
import { MyContext } from "../../../Context/Context";

const LabHeader = () => {
    // 2. कॉन्टेक्स्ट से वेंडर प्रोफ़ाइल डेटा और फ़ंक्शन प्राप्त करें
    const { vendorProfile, getVendorProfile } = useContext(MyContext);
    const navigate = useNavigate();
    
    // API बेस URL को .env फ़ाइल से प्राप्त करें
    const URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';

    // 3. कंपोनेंट लोड होने पर वेंडर की प्रोफ़ाइल फ़ेच करें
    useEffect(() => {
        // यदि प्रोफ़ाइल पहले से लोड नहीं है, तो उसे फ़ेच करें
        if (!vendorProfile) {
            getVendorProfile();
        }
    }, [getVendorProfile, vendorProfile]); // डिपेंडेंसी जोड़ें

    const handleLogout = () => {
        // संबंधित टोकन को सेशन स्टोरेज से हटा दें
        sessionStorage.removeItem("labtoken");
        sessionStorage.removeItem("labVendorId"); // यदि 'admin' अभी भी उपयोग हो रहा है
        toast.success("Logged out successfully");
        setTimeout(() => {
            navigate("/vendordashboard"); // वेंडर डैशबोर्ड या लॉगिन पेज पर रीडायरेक्ट करें
        }, 800);
    };
  
    return (
      <div className="header">
        <div className="navbar-custom navbar navbar-expand-lg">
          <div className="container-fluid px-0">
            <Link to="#" className="navbar-brand d-block d-md-none">
              <img src={logo} style={{ maxWidth: "150px" }} alt="logo" />
            </Link>
  
            <div className="me-auto d-flex gap-2 align-items-center">
              <Link to="#" className="nav-toggleBtn d-md-block d-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={28}
                  height={28}
                  fill="currentColor"
                  className="bi bi-text-indent-left text-muted"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.646 2.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L4.293 8 2.646 6.354a.5.5 0 0 1 0-.708zM7 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                </svg>
              </Link>
            </div>
  
            <ul className="navbar-nav navbar-right-wrap ms-lg-auto d-flex nav-top-wrap align-items-center ms-4 ms-lg-0">
              {/* Theme switch */}
              {/* <li>
                <div className="form-check form-switch theme-switch btn btn-ghost btn-icon rounded-circle border-0 mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                  />
                </div>
              </li> */}
  
              {/* Notification Bell (इस कोड में कोई बदलाव नहीं किया गया है) */}
              {/* <li className="dropdown stopevent ms-2">
                <Link
                  to="#"
                  className="btn btn-ghost btn-icon rounded-circle border-0"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
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
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                  <div className="border-bottom px-3 pt-2 pb-3 d-flex justify-content-between align-items-center">
                    <p className="mb-0 text-dark fw-medium fs-4">Notifications</p>
                    <Link to="#" className="text-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-settings me-1 icon-xs"
                      >
                        <circle cx={12} cy={12} r={3} />
                        <path d="M19.4 15a1.65..."></path>
                      </svg>
                    </Link>
                  </div>
                  <div className="p-2">
                    <ul className="list-group notification-list-scroll">
                      <li className="list-group-item">
                        <Link to="#" className="text-muted">
                          <h5 className="mb-1">Rishi Chopra</h5>
                          <p className="mb-0">New update available...</p>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="border-top text-center py-2">
                    <Link to="#">View all Notifications</Link>
                  </div>
                </div>
              </li> */}
  
              {/* User Dropdown */}
              <li className="dropdown-li ms-2">
                <Link
                  to="#"
                  className="rounded-circle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="avatar avatar-md avatar-indicators avatar-online">
                    {/* 4. वेंडर की इमेज दिखाएँ या डिफ़ॉल्ट इमेज दिखाएँ */}
                    <img
                      src={vendorProfile?.image ? `${URL}/${vendorProfile.image}` : defaultAvatar}
                      alt={vendorProfile?.name || "admin"}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <div className="dropdown-menu dropdown-menu-end" style={{ minWidth: "200px" }}>
                  <div className="px-4 pt-2 pb-0">
                    {/* 5. वेंडर का नाम दिखाएँ */}
                    <h5 className="mb-1">{vendorProfile?.name || "Lab Admin"}</h5>
                    <Link to="/panel/edit-profile" className="text-inherit fs-6">View my profile</Link>
                    <div className="dropdown-divider mt-3 mb-2" />
                  </div>
                  <ul className="list-unstyled mb-0">
                    {/* 6. रूट्स को lab-dashboard के अनुसार बदलें */}
                    {/* <li>
                      <Link to="/panel/edit-profile" className="dropdown-item">Edit Profile</Link>
                    </li> */}
                    <li>
                      <Link to="/panel/password" className="dropdown-item">Change Password</Link>
                    </li>
                    {/* <li>
                      <Link to="#" className="dropdown-item">Activity Log</Link>
                    </li> */}
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger">Logout Lab</button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default LabHeader;