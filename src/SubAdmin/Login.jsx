import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginImg from "../Components/Assets/img/Account/Login.png";
import { MyContext } from "../Context/Context"; // Adjust path as needed

const SubAdminLogin = () => {
  const { loginSubAdmin } = useContext(MyContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginSubAdmin(formData);

      if (result.success) {
        toast.success("Login successful!");
        
        // Store additional data in sessionStorage if needed
        sessionStorage.setItem("subadminId", result.data.subAdmin.id);
        sessionStorage.setItem("subadminPermissions", JSON.stringify(result.data.subAdmin.permissions));
        sessionStorage.setItem("subadminLocationAccess", JSON.stringify(result.data.subAdmin.locationAccess));

        console.log("SubAdmin login successful:", result.data);
        
        // Redirect to subadmin dashboard
        setTimeout(() => {
          window.location.href = "/subadmin-dashboard";
        }, 1000);
        
      } else {
        toast.error(result.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid login-container2">
        <div className="row justify-content-center align-items-center w-100">
          {/* Left side with image illustration */}
          <div className="col-md-6 login-image">
            <img src={LoginImg} alt="SubAdmin Illustration" />
          </div>

          {/* Right side with form */}
          <div className="col-md-6 login-form">
            <div className="login-box">
              <h2 className="text-center">SubAdmin Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                    name="password"
                    placeholder="Enter your Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    disabled={loading}
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
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>

                <div className="text-center mt-3">
                  <Link className="text-decoration-none">Forgot Password?</Link>
                </div>
              </form>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?
                  <Link
                    to="/subadmin/register"
                    className="text-primary"
                  >
                    Request Access
                  </Link>
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

export { SubAdminLogin };