import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { submitPhoneNumber, verifyOtp, updateUser } from "../../../Redux/signupSlice"; // Ensure updateUser is in slice
import { toast, ToastContainer } from "react-toastify";
import { getFCMToken } from "../../../getFCMToken"; // Path jahan getFCMToken function rakha hai
import "react-toastify/dist/ReactToastify.css";
import loginImg from "../../Assets/img/Account/Login.png";
import OtpImg from "../../Assets/img/Account/Otp.png";

// ========================================================
// 1. LOGIN COMPONENT (Phone Number Input)
// ========================================================
const Login = () => {
  const [formData, setFormData] = useState({
    number: "",
    rememberMe: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(formData.number)) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }

    dispatch(submitPhoneNumber({ ctrCode: "+91", number: formData.number }))
      .unwrap()
      .then(() => {
        toast.success("OTP sent successfully!");
        navigate("/otp-verify", {
          state: { number: formData.number, ctrCode: "+91" },
        });
      })
      .catch((error) => {
        toast.error("Failed to send OTP, please try again.");
      });
  };

  return (
    <>
      <div className="container-fluid login-container">
        <div className="row justify-content-center align-items-center w-100">
          <div className="col-md-6 login-image">
            <img src={loginImg} alt="Diabetes Illustration" />
          </div>
          <div className="col-md-6 login-form">
            <div className="login-box">
              <h2 className="text-center">Login to Your Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="number" className="form-label">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                      type="text"
                      className="form-control"
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 icon-box btn border-0 btn-outline-secondary"
                >
                  Login
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
// 2. OTP VERIFY COMPONENT (OTP Input & FCM Sync)
// ========================================================
const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { number = "", ctrCode = "+91" } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      toast.error("Phone number not found. Please try again.");
      navigate("/UserLogin");
    }
  }, [location.state, navigate]);

  const handleOtpChange = (e) => {
    const { value } = e.target;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  }; 

  // 🔥 MAIN SUBMIT LOGIC WITH FCM INTEGRATION
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. Pehle FCM Token generate kar lo
    console.log("Generating Token...");
    const fcmToken = await getFCMToken(); 
    
    // 2. Ab Verify OTP dispatch karein aur saath mein regId bhi bhejein
    dispatch(verifyOtp({ otp, ctrCode, number, regId: fcmToken }))
      .unwrap()
      .then((response) => {
        if (response.success === 1) {
          localStorage.setItem("token", response.details.token);
          localStorage.setItem("userId", response.details.userId);
          localStorage.setItem("name", response.details.name || "");
          localStorage.setItem("regId", response.details.regId); // DB se wapas aaya hua token

          toast.success("Login Successful!");
          navigate("/");
        }
      })
      .catch((error) => {
        toast.error("Invalid OTP or Token issue.");
      });

  } catch (err) {
    console.error("FCM Error:", err);
    // Agar token fail bhi ho jaye toh login karwa do (Optional)
    dispatch(verifyOtp({ otp, ctrCode, number }));
  }
};
  
  const handleResendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      toast.success("OTP resent successfully!");
    }, 2000);
  };

  return (
    <>
      <div className="container-fluid login-container">
        <div className="row justify-content-center align-items-center w-100">
          <div className="col-md-6 login-image">
            <img src={OtpImg} alt="Illustration" />
          </div>

          <div className="col-md-6 login-form">
            <div className="otp-form p-4 shadow-lg rounded">
              <h2 className="mb-3">OTP Verification</h2>
              <p className="text-muted mb-4">
                Enter the OTP sent to <strong>+91 {number}</strong>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control otp-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 icon-box btn border-0 btn-outline-secondary"
                >
                  Verify & Login
                </button>
              </form>

              <div className="resend-otp mt-3 text-center">
                <p className="text-muted">
                  Didn't receive OTP? &nbsp;
                  <span
                    className="text-primary fw-bold"
                    onClick={handleResendOtp}
                    style={{ cursor: "pointer" }}
                  >
                    {isResending ? "Resending..." : "Resend"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export { Login, OtpVerify };