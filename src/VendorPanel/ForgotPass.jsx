import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ForgotImg from "../Components/Assets/img/Account/Forgot.png";

const VendorForgotPass = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigate = useNavigate(); // Initialize navigate

  const handleSendOtp = () => {
    setOtpSent(true);
    toast.success('OTP has been sent to the registered mobile number.');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordMatch(false);
      toast.error('Passwords do not match.');
    } else {
      setPasswordMatch(true);
      // Simulate a successful password reset process
      toast.success('Password reset successfully!');

      // Redirect to login page after a brief delay to show the success message
      setTimeout(() => {
        navigate('/vendordashboard'); // Redirect to login page
      }, 1500); // 2-second delay before redirecting
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100 align-items-center justify-content-center">
        <div className="col-md-6 login-image">
          <img
            src={ForgotImg}
            alt="Diabetes Illustration"
          />
        </div>
        <div className="col-lg-6 col-md-8">
          <div className="p-5">
            <h3 className="text-center mb-4">Forgot Password</h3>
            <form className="form-container">
              {/* Mobile Number Input */}
              {!otpSent && (
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="mobile"
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10} 
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-primary w-100 mt-3"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </button>
                </div>
              )}

              {/* New Password Inputs */}
              {otpSent && (
                <>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      maxLength={10} 
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password mismatch error */}
                  {!passwordMatch && (
                    <div className="text-danger mb-3">
                      Passwords do not match.
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary w-100 mt-3"
                    onClick={handlePasswordChange}
                  >
                    Reset Password
                  </button>
                </>
              )}

              <div className="text-center mt-3">
                Remember your password? <Link to="/vendordashboard">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>


    </div>
  );
};

export default VendorForgotPass;
