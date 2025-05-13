import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import { submitPhoneNumber, verifyOtp } from "../../../Redux/signupSlice";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css"; // Import toast CSS
import loginImg from "../../Assets/img/Account/Login.png";
import OtpImg from "../../Assets/img/Account/Otp.png";

// Login Component
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
      navigate("/otp-verify", {
        state: { 
          number: formData.number, 
          ctrCode: "+91" 
        },
        replace: true // optional, prevents going back to login
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

// Second functional component
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
      navigate("/UserLogin"); // or wherever your login route is
    }
  }, [location.state, navigate]);


  const handleOtpChange = (e) => {
    const { value } = e.target;

    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    dispatch(verifyOtp({ otp, ctrCode, number }))
      .unwrap()
      .then((response) => {
        console.log("OTP Verify Response:", response); // Debugging purpose
  
        if (
          response.success === 1 &&
          response.message === "User logged in successfully"
        ) {
          // ✅ Store token from details
          localStorage.setItem("token", response.details.token);
  
          toast.success("OTP verified successfully! Redirecting to home...");
          navigate("/");
        } else {
          toast.error("OTP verification failed. Redirecting to registration...");
          navigate("/UserLogin");
        }
      })
      .catch((error) => {
        toast.error("Failed to verify OTP, please try again.");
      });
  };
  
  
  // Handle Resend OTP
  const handleResendOtp = () => {
    setIsResending(true);

    // Simulate OTP resend logic
    setTimeout(() => {
      setIsResending(false);
      toast.success("OTP resent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }, 2000); // Simulate API call delay
  };

  return (
    <>
      <div className="container-fluid login-container">
        <div className="row justify-content-center align-items-center w-100">
          {/* Left side illustration */}
          <div className="col-md-6 login-image">
            <img src={OtpImg} alt="Illustration" />
          </div>

          {/* Right side form */}
          <div className="col-md-6 login-form">
            <div className="otp-form p-4 shadow-lg rounded">
              <h2 className="mb-3">OTP Verification</h2>
              <p className="text-muted mb-4">
                Enter the OTP sent to your Phone Number
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control otp-input"
                    placeholder="Enter OTP"
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
                  Verify
                </button>
              </form>

              <div className="resend-otp mt-3 text-center">
                <p className="text-muted">
                  Didn't receive OTP? &nbsp;
                  <span
                    className="text-primary"
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

// // Third functional component
// const ForgotPassword = () => {
//   const [number, setnumber] = useState("");

// Third functional component
// const ForgotPassword = () => {
//   return (
//     <>
//       <h1>Forgot Password Component</h1>
//     </>
//   );
// };

//   return (
//     <>
//       <div className="container-fluid login-container">
//         <div className="row justify-content-center align-items-center w-100">
//           {/* Left side with illustration */}
//           <div className="col-md-6 d-none d-md-block">
//             <img
//               src="https://via.placeholder.com/600x800"
//               alt="Forgot Password Illustration"
//               className="img-fluid"
//             />
//           </div>

//           {/* Right side with form */}
//           <div className="col-md-6">
//             <div className="forgot-pass-box p-5 shadow-lg rounded">
//               <h2 className="mb-4 text-center">Forgot Password</h2>
//               <p className="text-muted mb-4 text-center">
//                 Enter your registered Phone Number to receive a password reset
//                 link.
//               </p>
//               <form onSubmit={handleSubmit}>
//                 <div className="mb-3">
//                   <label htmlFor="number" className="form-label">
//                     Phone Number
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="number"
//                     value={number}
//                     onChange={(e) => setnumber(e.target.value)}
//                     placeholder="Enter your Phone Number"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   className="btn btn-primary w-100 icon-box btn border-0 btn-outline-secondary"
//                 >
//                   Send Reset Link
//                 </button>
//               </form>
//               <div className="mt-4 text-center">
//                 <Link to="/UserLogin" className="text-primary">
//                   Back to Login
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <ToastContainer />
//     </>
//   );
// };

export { Login, OtpVerify };
