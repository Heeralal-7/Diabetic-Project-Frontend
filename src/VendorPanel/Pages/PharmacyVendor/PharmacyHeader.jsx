import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../Components/Assets/img/Logo.png";
import { toast } from "react-toastify";
import defaultAvatar from "../../../Components/Assets/img/Pharmacy/Brands/Brand1.png";
import { MyContext } from "../../../Context/Context";

const PharmacyHeader = () => {
    const { vendorProfile, getVendorProfile } = useContext(MyContext);
    const navigate = useNavigate();
    const URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';

    useEffect(() => {
        if (!vendorProfile) {
            getVendorProfile();
        }
    }, [getVendorProfile, vendorProfile]);

    const handleLogout = () => {
        sessionStorage.removeItem("Pharmacytoken");
        sessionStorage.removeItem("pharmacyVendorId");
        toast.success("Logged out successfully");
        setTimeout(() => {
            navigate("/vendordashboard");
        }, 800);
    };
  
    return (
      <>
        {/* =================================================================
          इंटरनल CSS: ड्रॉपडाउन ग्लिच और होवर इफ़ेक्ट को ठीक करने के लिए
        ================================================================== */}
        <style>
          {`
            /* 1. ड्रॉपडाउन को होवर पर दिखाने के लिए (ग्लिच फिक्स) */
            .navbar-nav .dropdown:hover .dropdown-menu {
              display: block;
              margin-top: 0;
            }

            /* 
              2. (अपडेट किया गया)
              यह ड्रॉपडाउन के ट्रिगर (जिसमें अब नाम और अवतार दोनों हैं)
              पर होवर करने पर आने वाले बैकग्राउंड कलर और अंडरलाइन को हटाता है।
            */
            .navbar-nav .dropdown > a.dropdown-toggle:hover {
              background-color: transparent !important;
              text-decoration: none; /* होवर पर अंडरलाइन भी हटा दें */
            }
          `}
        </style>

        <div className="header">
          <div className="navbar-custom navbar navbar-expand-lg">
            <div className="container-fluid px-0">
              <Link to="#" className="navbar-brand d-block d-md-none">
                <img src={logo} style={{ maxWidth: "150px" }} alt="logo" />
              </Link>
    
              <div className="me-auto d-flex gap-2 align-items-center">
                <Link to="#" className="nav-toggleBtn d-md-block d-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="currentColor" className="bi bi-text-indent-left text-muted" viewBox="0 0 16 16" >
                    <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.646 2.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L4.293 8 2.646 6.354a.5.5 0 0 1 0-.708zM7 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                  </svg>
                </Link>
              </div>
    
              <ul className="navbar-nav navbar-right-wrap ms-lg-auto d-flex nav-top-wrap align-items-center ms-4 ms-lg-0">
                {/* Theme switch */}
                <li>
                  {/* <div className="form-check form-switch theme-switch btn btn-ghost btn-icon rounded-circle border-0 mb-0">
                    <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                  </div> */}
                </li>
    
                {/* Notification Bell */}
                <li className="dropdown stopevent ms-2">
                  {/* ... (अधिसूचना कोड) ... */}
                </li>

                {/* =========================================================
                  JSX FIX: User Dropdown (नाम और अवतार को एक साथ ग्रुप किया गया)
                ========================================================== */}
                <li className="dropdown-li ms-2">
                  {/* अब यह लिंक नाम और अवतार दोनों को कवर करता है */}
                  <Link 
                    to="#" 
                    className="dropdown-toggle d-flex align-items-center text-dark text-decoration-none" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {/* वेंडर का नाम यहाँ ले जाया गया */}
                    <h5 className="mb-0 me-2">{vendorProfile?.name || "Vendor Name"}</h5>
                    
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                      <img
                        src={vendorProfile?.image ? `${URL}${vendorProfile.image}` : defaultAvatar}
                        alt={vendorProfile?.name || "admin"}
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  <div className="dropdown-menu dropdown-menu-end" style={{ minWidth: "200px" }}>
                    <div className="px-4 pt-2 pb-0">
                      <h5 className="mb-1">{vendorProfile?.name || "Admin"}</h5>
                      <Link to="/pharmacy-dashboard/edit-profile" className="text-inherit fs-6 pt-4">View my profile</Link>
                      <div className="dropdown-divider mt-3 mb-2" />
                    </div>
                    <ul className="list-unstyled mb-0">
                      <li>
                        <Link to="/pharmacy-dashboard/password" className="dropdown-item">Change Password</Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="dropdown-item text-danger">Logout pharmacy</button>
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
  
  export default PharmacyHeader;