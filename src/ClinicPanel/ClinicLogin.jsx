// components/Clinic/ClinicLogin.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginImg from '../Components/Assets/img/Account/Login.png';
import { MyContext } from '../Context/Context';

const ClinicLogin = () => {
  const navigate = useNavigate();
  const { loginClinic, loading, error, setError, clinicData } = useContext(MyContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const response = await loginClinic(email, password, '', 'clinic');

      if (response.success) {
        toast.success('Login successful!');
        navigate('/clinic/dashboard');
      } else {
        toast.error(response.message || 'Login failed.');
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    const tokenInfo = sessionStorage.getItem('clinictoken');
    if (tokenInfo) {
      navigate('/clinic/dashboard');
    }
  }, [navigate, clinicData]);

  return (
    <>
      <div className="container-fluid login-container2">
        <div className="row justify-content-center align-items-center w-100">
          <div className="col-md-6 login-image">
            <img src={LoginImg} alt="Login Illustration" />
          </div>
          <div className="col-md-6 login-form">
            <div className="login-box">
              <h2 className="text-center">Clinic Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email or Phone Number:
                  </label>
                  <input
                    type="text"
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

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 icon-box btn border-0 btn-outline-secondary"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login as Clinic'}
                </button>

                <div className="text-center mt-3">
                  <Link to="/clinic/forgot-password" className="text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
              </form>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?
                  <Link to="/clinics/register" className="text-primary"> Sign Up</Link>
                </p>
                <p>
                  Are you a doctor? 
                  <Link to="/doctors/login" className="text-primary"> Login as Doctor</Link>
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

export default ClinicLogin;