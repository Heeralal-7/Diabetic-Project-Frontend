import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Components/Assets/img/Logo.png";
import { toast } from "react-toastify";
import defaultAvatar from "../../Admin/Assests/images/download.jpeg";
import { MyContext } from "../../Context/Context";

const SubAdminHeader = () => {
    const { getSubAdminProfile } = useContext(MyContext);
    const [subAdminProfile, setSubAdminProfile] = useState(null);
    const navigate = useNavigate();
    
    const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchSubAdminProfile();
    }, []);

    const fetchSubAdminProfile = async () => {
        try {
            const result = await getSubAdminProfile();
            if (result.success === 1) {
                setSubAdminProfile(result.data);
            } else {
                console.error("Failed to fetch subadmin profile:", result.message);
            }
        } catch (error) {
            console.error("Error fetching subadmin profile:", error);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("subadmintoken");
        sessionStorage.removeItem("subadminId");
        sessionStorage.removeItem("subadminDepartment");
        toast.success("Logged out successfully");
        setTimeout(() => {
            navigate("/subadmin/login");
        }, 800);
    };

    // Function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return defaultAvatar;
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it's a relative path from backend, prepend the base URL
        if (imagePath.startsWith('/')) {
            // Remove the /api part if it's already in URL
            const baseUrl = URL.replace('/api', '');
            return `${baseUrl}${imagePath}`;
        }
        
        return `${URL}/${imagePath}`;
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
              {/* User Dropdown */}
              <li className="dropdown-li ms-2">
                <Link
                    to="#" 
                    className="dropdown-toggle d-flex align-items-center text-dark text-decoration-none" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                >
                  <h5 className="mb-0 me-2">{subAdminProfile?.name || "Sub Admin"}</h5>

                  <div className="avatar avatar-md avatar-indicators avatar-online">
                    <img
                      src={getImageUrl(subAdminProfile?.image)}
                      alt={subAdminProfile?.name || "subadmin"}
                      className="rounded-circle"
                      style={{ 
                          width: "40px", 
                          height: "40px", 
                          objectFit: 'cover',
                          border: '2px solid #dee2e6'
                      }}
                      onError={(e) => {
                          e.target.src = defaultAvatar;
                      }}
                    />
                  </div>
                </Link>
                <div className="dropdown-menu dropdown-menu-end" style={{ minWidth: "200px" }}>
                  <div className="px-4 pt-2 pb-0">
                    <h5 className="mb-1">{subAdminProfile?.name || "Sub Admin"}</h5>
                    <p className="text-muted mb-1 small">{subAdminProfile?.email || ""}</p>
                    <Link to="/subadmin-dashboard/edit-profile" className="text-inherit fs-6">View my profile</Link>
                    <div className="dropdown-divider mt-3 mb-2" />
                  </div>
                  <ul className="list-unstyled mb-0">
                    <li>
                      <Link to="/subadmin-dashboard/edit-profile" className="dropdown-item">
                        <i className="fas fa-user-edit me-2"></i>
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/subadmin-dashboard/password" className="dropdown-item">
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </Link>
                    </li>
                    <li>
                      <Link to="/subadmin-dashboard/activity-log" className="dropdown-item">
                        <i className="fas fa-history me-2"></i>
                        Activity Log
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
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
  
  export default SubAdminHeader;