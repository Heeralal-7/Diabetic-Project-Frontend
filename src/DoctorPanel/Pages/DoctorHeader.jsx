// src/Admin/includes/DoctorHeader.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Components/Assets/img/Logo.png';
import defaultAvatar from '../../Components/Assets/img/LabTest/Group 1000009586.jpg';
import { toast } from 'react-toastify';
import { MyContext } from '../../Context/Context';

const DoctorHeader = ({ toggleSidebar }) => {
    const { doctorData, getDoctorProfile, logoutDoctor } = useContext(MyContext);
    const navigate = useNavigate();
    const URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';

    useEffect(() => {
        if (!doctorData && sessionStorage.getItem('doctortoken')) {
            const tokenData = JSON.parse(sessionStorage.getItem('doctortoken'));
            if (tokenData && tokenData.token) {
                getDoctorProfile(tokenData.token);
            }
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logoutDoctor();
            toast.success("Logged out successfully. Redirecting to login...");
            setTimeout(() => {
                navigate('/doctors/login');
            }, 1000);
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout error:", error);
        }
    };

    return (
      <div className="header">
        <div className="navbar-custom navbar navbar-expand-lg bg-white shadow-sm">
          <div className="container-fluid px-3 px-md-4">
            <Link to="/doctor/dashboard" className="navbar-brand d-block d-md-none">
              <img src={logo} style={{ maxWidth: "150px" }} alt="logo" />
            </Link>

            <div className="me-auto d-flex gap-2 align-items-center">
              <Link to="#" className="nav-toggleBtn" onClick={(e) => {
                e.preventDefault();
                toggleSidebar();
              }}>
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
                <li className="me-3">
    Today's Date: {new Date().toLocaleDateString()}    
</li>
                <li>
                    <h4 className='text-danger'>Dr. {doctorData?.name || "Doctor"}</h4>
                </li>
              <li className="dropdown-li ms-2">
                <Link
                  to="#"
                  className="rounded-circle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="avatar avatar-md avatar-indicators avatar-online">
                    <img
                      src={doctorData?.image ? `${URL}/${doctorData.image}` : defaultAvatar}
                      alt={doctorData?.name || "Doctor"}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <div className="dropdown-menu dropdown-menu-end" style={{ minWidth: "220px" }}>
                  <div className="px-4 pt-2 pb-0">
                    <h5 className="mb-1">Dr. {doctorData?.name || "Dr. [Name]"}</h5>
                    <Link to="/doctor/profile" className="text-inherit fs-6">View My Profile</Link>
                    <div className="dropdown-divider mt-3 mb-2" />
                  </div>
                  <ul className="list-unstyled mb-0">
                    <li>
                      <Link to="/doctor/profile" className="dropdown-item">My Profile</Link>
                    </li>
                    <li>
                      <Link to="/doctor/edit-profile" className="dropdown-item">Edit Profile</Link>
                    </li>
                    <li>
                      <Link to="/doctor/change-password" className="dropdown-item">Change Password</Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger">Logout Doctor</button>
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

export default DoctorHeader;