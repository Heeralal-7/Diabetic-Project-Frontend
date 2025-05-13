import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS
import LoginImg from "../Components/Assets/img/Account/Login.png";
import axios from "axios";

const VendorLogin = () => {
  const URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type: type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error("Please select a vendor type.");
      return;
    }

    try {
      const { data } = await axios.post(`${URL}/vendor/login`, formData);

      if (data.success) {
        sessionStorage.setItem("labtoken", JSON.stringify(data.details));
        if (formData.type === "Lab") {
          navigate("/panel");
        } else if (formData.type === "Pharmacy") {
          navigate("/pharmacy-dashboard");
        } else if (formData.type === "Food") {
          navigate("/food-dashboard");
        }
        console.log(formData);
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login.");
    }
  };

  return (
    <>
      <div className="container-fluid login-container2">
        <div className="row justify-content-center align-items-center w-100">
          {/* Left side with image illustration */}
          <div className="col-md-6 login-image">
            <img src={LoginImg} alt="Diabetes Illustration" />
          </div>

          {/* Right side with form */}
          <div className="col-md-6 login-form">
            <div className="login-box">
              <h2 className="text-center">Login to Your Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">
                    Login As:
                  </label>
                  <div className="dropdown">
                    <button
                      className="btn border w-100 d-flex justify-content-between"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <div>{formData.type || "Select Vendor Type"}</div>
                      <div>
                        <i
                          className="fa fa-chevron-down"
                          aria-hidden="true"
                        ></i>
                      </div>
                    </button>
                    <ul className="dropdown-menu w-100">
                      <li>
                        <Link
                          className="dropdown-item"
                          onClick={() => handleTypeChange("Lab")}
                        >
                          Lab
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          onClick={() => handleTypeChange("Pharmacy")}
                        >
                          Pharmacy
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          onClick={() => handleTypeChange("Food")}
                        >
                          Food
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

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
                  />
                </div>

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
                >
                  Login
                </button>

                <div className="text-center mt-3">
                  <Link className="text-decoration-none">Forgot Password?</Link>
                </div>
              </form>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?
                  <Link
                    to="/vendordashboard/vendorregister"
                    className="text-primary"
                  >
                    Sign Up
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

export { VendorLogin };
