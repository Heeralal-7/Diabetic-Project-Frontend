import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginImg from '../Components/Assets/img/Account/Login.png'; // Adjust path as needed
import { MyContext } from '../Context/Context'; // Import the context hook

const DoctorLogin = () => {
  const URL = process.env.REACT_APP_API_URL; // Ensure this is set
  const navigate = useNavigate();
  const location = useLocation();
  const { loginDoctor, loading, error,setError, doctorData } = useContext(MyContext); // Use the context hook

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState(''); // 'app' or 'clinic'
  const [regId, setRegId] = useState(''); // For FCM token

  // Handle login type selection
  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    // Clear previous errors if switching type
    if (error) setError(null);
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginType) {
      toast.error('Please select a login type (App or Clinic).');
      return;
    }
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const response = await loginDoctor(email, password, regId, loginType);

      if (response.success) {
        toast.success('Login successful!');
        // The loginDoctor function in context already saves the token
        // Now navigate based on loginType and successful login
        if (loginType === 'app') {
          navigate('/doctor/dashboard'); // Navigate to doctor dashboard for 'app' type
        } else if (loginType === 'clinic') {
          navigate('/doctor/dashboard'); // Navigate to clinic dashboard for 'clinic' type (create this page)
        }
      } else {
        toast.error(response.message || 'Login failed.');
      }
    } catch (err) {
      // The error is already set in the context, but we can show a toast here too
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  // If already logged in as a doctor, redirect
  useEffect(() => {
    const tokenInfo = sessionStorage.getItem('doctortoken');
    if (tokenInfo) {
      try {
        const parsedTokenInfo = JSON.parse(tokenInfo);
        // Check if the stored token's loginType matches the current selection or redirect
        // For simplicity, let's assume if a token exists, they are logged in as a doctor
        // You might need to be more specific if a user can be both app and clinic logged in
        if (parsedTokenInfo.loginType === 'app') { // Adjust based on what's in your token details
            navigate('/doctor/dashboard');
        } else if (parsedTokenInfo.loginType === 'clinic') {
            navigate('/doctor/dashboard');
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, [navigate, doctorData]); // Re-run if doctorData from context changes

  return (
    <>
      <div className="container-fluid login-container2">
        <div className="row justify-content-center align-items-center w-100">
          <div className="col-md-6 login-image">
            <img src={LoginImg} alt="Login Illustration" />
          </div>
          <div className="col-md-6 login-form">
            <div className="login-box">
              <h2 className="text-center">Login to Your Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginType" className="form-label">
                    Login As:
                  </label>
                  <div className="dropdown bg-light text-dark p-0" style={{ borderRadius: "0.25rem", height: "40px" }}>
                    <button
  className="btn border w-100 d-flex justify-content-between"
  type="button"
  data-bs-toggle="dropdown"
  aria-expanded="false"
>
  <div>
    {loginType === "app"
      ? "Doctor (Independent)"
      : loginType === "clinic"
      ? "Doctor (Clinic)"
      : "Select Account Type"}
  </div>
  <div>
    <i className="fa fa-chevron-down" aria-hidden="true"></i>
  </div>
</button>

                    <ul className="dropdown-menu w-100">
                      <li>
                        <Link className="dropdown-item" onClick={() => handleLoginTypeChange('app')}>
                          Doctor (Independent)
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" onClick={() => handleLoginTypeChange('clinic')}>
                          Doctor (Clinic)
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email or Phone Number:
                  </label>
                  <input
                    type="text" // Changed to text to allow phone number input
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or phone number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    required
                  />
                </div>

                {/* Optional: FCM Registration ID */}
                {/* {loginType === 'app' && (
                  <div className="mb-3">
                    <label htmlFor="regId" className="form-label">FCM Reg ID (Optional):</label>
                    <input
                      type="text"
                      className="form-control"
                      id="regId"
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="Enter FCM registration ID"
                    />
                  </div>
                )} */}

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 icon-box btn border-0 btn-outline-secondary"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* {error && <p className="text-danger text-center mt-2">{error}</p>} */}

                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link> {/* Update path */}
                </div>
              </form>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?
                  <Link to="/doctors/register" className="text-primary"> Sign Up</Link> {/* Update path */}
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

export default DoctorLogin;