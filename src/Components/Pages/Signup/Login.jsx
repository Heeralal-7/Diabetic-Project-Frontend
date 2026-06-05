import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { submitPhoneNumber, verifyOtp } from "../../../Redux/signupSlice"; 
import { toast, ToastContainer } from "react-toastify";
import { getFCMToken } from "../../../getFCMToken"; 
import axios from "axios"; // Axios import kiya
import "react-toastify/dist/ReactToastify.css";
import loginImg from "../../Assets/img/Account/Login.png";
import OtpImg from "../../Assets/img/Account/Otp.png";

// CSS for Button Hover Fix and Animated Modal
const fixedStyles = `
  .blue-btn-solid {
    background-color: #0d6efd !important;
    color: white !important;
    border: none !important;
    font-weight: bold;
    padding: 12px;
    border-radius: 8px;
    transition: none !important;
  }
  .blue-btn-solid:hover {
    background-color: #0b5ed7 !important;
    color: white !important;
  }
  .welcome-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
    justify-content: center; z-index: 10000; backdrop-filter: blur(8px);
  }
  .welcome-card {
    background: white; padding: 40px; border-radius: 25px;
    text-align: center; max-width: 450px; width: 90%;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    animation: bouncePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  @keyframes bouncePop {
    0% { transform: scale(0.3); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .success-icon { font-size: 60px; display: block; margin-bottom: 10px; }
`;

// ========================================================
// 1. LOGIN COMPONENT (With Existence Check Logic)
// ========================================================
const Login = () => {
  const [formData, setFormData] = useState({ number: "", rememberMe: false });
  const [isNewUser, setIsNewUser] = useState(false); // State to track existence
  const [checking, setChecking] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const URL = process.env.REACT_APP_API_URL;

  // 🔥 Existence Check Function
  const checkUserExistence = async (num) => {
    try {
      setChecking(true);
      const res = await axios.post(`${URL}/user/check-existence`, { number: num });
      if (res.data.success === 1) {
        // Agar exists false hai, toh Signup mode on kar do
        setIsNewUser(!res.data.exists); 
      }
    } catch (error) {
      console.error("Existence check failed", error);
    } finally {
      setChecking(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = name === "number" ? value.replace(/\D/g, "") : value;
    
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : val }));

    // Logic: Jab 10 digits poore hon tabhi check karein
    if (name === "number") {
      if (val.length === 10) {
        checkUserExistence(val);
      } else {
        setIsNewUser(false); // Reset to Login if digits change
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.number.length !== 10) {
      toast.error("Enter valid 10-digit number.");
      return;
    }
    dispatch(submitPhoneNumber({ ctrCode: "+91", number: formData.number }))
      .unwrap()
      .then(() => {
        toast.success("OTP Sent!");
        navigate("/otp-verify", { state: { number: formData.number, ctrCode: "+91" } });
      })
      .catch(() => toast.error("Failed to send OTP."));
  };

  return (
    <>
      <style>{fixedStyles}</style>
      <div className="container-fluid login-container bg-white vh-100 d-flex align-items-center">
        <div className="row justify-content-center align-items-center w-100">
          <div className="col-md-6 d-none d-md-block text-center">
            <img src={loginImg} alt="Login" className="img-fluid" style={{maxHeight:'400px'}} />
          </div>
          <div className="col-md-5">
            <div className="login-box p-4 shadow rounded border bg-white mx-auto">
              {/* 🔥 Dynamic Heading */}
              <h2 className="text-center mb-2 fw-bold text-primary">
                {checking ? "Checking..." : (isNewUser ? "Sign Up" : "Login")}
              </h2>
              <p className="text-center text-muted small mb-4">
                {isNewUser ? "Create a new account to get started" : "Please login to your account"}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input 
                      type="text" 
                      className="form-control shadow-none" 
                      name="number" 
                      value={formData.number} 
                      onChange={handleInputChange} 
                      maxLength="10" 
                      placeholder="Enter 10 digit number"
                      required 
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="form-check mb-2">
                    <input type="checkbox" className="form-check-input shadow-none" id="rem" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} />
                    <label className="form-check-label small" htmlFor="rem">Remember Me</label>
                  </div>
                  <div className="mt-1">
                    <Link to="/only-signup" className="text-primary fw-bold small text-decoration-none">Don't have an account? Sign up</Link>
                  </div>
                </div>
                {/* 🔥 Dynamic Button Text */}
                <button type="submit" className="btn w-100 blue-btn-solid shadow-none" disabled={checking}>
                  {isNewUser ? "Register & Continue" : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

// ========================================================
// 2. OTP VERIFY COMPONENT (Remaining same with welcome modal)
// ========================================================
const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { number = "", ctrCode = "+91" } = location.state || {};

  useEffect(() => {
    if (!location.state) navigate("/UserLogin");
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fcmToken = await getFCMToken(); 
      
      dispatch(verifyOtp({ otp, ctrCode, number, regId: fcmToken }))
        .unwrap()
        .then((response) => {
          localStorage.setItem("token", response.details.token);
          localStorage.setItem("userId", response.details.userId);
          localStorage.setItem("name", response.details.name || "");
          localStorage.setItem("regId", response.details.regId);

          if (response.message.toLowerCase().includes("created")) {
            setShowWelcome(true);
          } else {
            toast.success("Logged in successfully");
            navigate("/");
          }
        })
        .catch(() => toast.error("Invalid OTP. Try 1111"));
    } catch (err) {
      dispatch(verifyOtp({ otp, ctrCode, number }));
    }
  };

  return (
    <>
      <style>{fixedStyles}</style>

      {/* --- WELCOME MODAL --- */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-card border-0">
            <span className="success-icon">🎉</span>
            <h2 className="fw-bold text-primary mb-2">Welcome!</h2>
            <h5 className="fw-bold mb-3">You are login successfully.</h5>
            <p className="text-muted mb-4 px-3">
              Are you want to fill more info about you to complete your health profile?
            </p>
            <div className="d-grid gap-2">
              <button className="btn blue-btn-solid rounded-pill py-3 shadow" onClick={() => navigate("/update-profile")}>Yes, Fill My Info</button>
              <button className="btn btn-link text-muted fw-bold text-decoration-none shadow-none" onClick={() => navigate("/")}>Skip for now</button>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid login-container bg-white vh-100 d-flex align-items-center">
        <div className="row justify-content-center align-items-center w-100 py-5">
          <div className="col-md-6 d-none d-md-block text-center">
            <img src={OtpImg} alt="OTP" className="img-fluid" style={{maxHeight:'400px'}} />
          </div>
          <div className="col-md-5">
            <div className="otp-form p-4 shadow rounded border bg-white mx-auto">
              <h2 className="mb-2 fw-bold text-primary text-center">Verification</h2>
              <p className="text-muted mb-4 small text-center">Enter 4-digit OTP sent to <strong>+91 {number}</strong></p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="form-control text-center mb-4 shadow-none border-primary fw-bold"
                  placeholder="X X X X"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="4"
                  required
                  style={{ letterSpacing: '20px', fontSize: '28px' }}
                />
                <button type="submit" className="btn w-100 blue-btn-solid shadow-none">Verify & Continue</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export { Login, OtpVerify };