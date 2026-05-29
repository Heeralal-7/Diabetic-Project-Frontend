import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import signupImg from "../../Assets/img/Account/Register.png";

const OnlySignup = () => {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    birthyear: "",
    gender: "Male",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupAndLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.number.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    setIsSubmitting(true);
    try {
      // 1. Backend API Call
      const response = await axios.post(`${URL}/user/signup`, {
        ...formData,
        ctrCode: "+91",
      });

      if (response.data.success === 1) {
        // 2. Token ko Session aur Local storage dono mein save karein (Header compatibility ke liye)
        const token = response.data.token;
        sessionStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("token", token);
        localStorage.setItem("name", formData.name);

        toast.success("Account Created & Logged in!");

        // 3. Redirect to Home Page
        setTimeout(() => {
          navigate("/"); 
          // Page refresh zaroori ho sakta hai Header ke fetch ko trigger karne ke liye
          window.location.reload(); 
        }, 1000);

      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Registration error or user already exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid login-container bg-white py-5">
      <div className="row justify-content-center align-items-center w-100">
        <div className="col-md-6 d-none d-md-block text-center">
          <img src={signupImg} alt="Signup" className="img-fluid" style={{maxWidth: '80%'}} />
        </div>
        <div className="col-md-5">
          <div className="p-4 shadow-lg rounded border bg-white">
            <h2 className="fw-bold mb-2">Sign Up</h2>
            <p className="text-muted mb-4">Create an account to get started</p>
            
            <form onSubmit={handleSignupAndLogin}>
              <div className="mb-3">
                <label className="form-label fw-bold small">Full Name</label>
                <input type="text" name="name" className="form-control" required onChange={handleInputChange} placeholder="Your Name" />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input type="text" name="number" className="form-control" maxLength="10" required onChange={handleInputChange} placeholder="Phone Number" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Email Address</label>
                <input type="email" name="email" className="form-control" onChange={handleInputChange} placeholder="email@example.com" />
              </div>

              <div className="row mb-4">
                <div className="col-6">
                  <label className="form-label fw-bold small">Year of Birth</label>
                  <select name="birthyear" className="form-select" required onChange={handleInputChange}>
                    <option value="">Year</option>
                    {Array.from({length: 80}, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small">Gender</label>
                  <select name="gender" className="form-select" onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* No Hover Effect Button */}
              <button 
                type="submit" 
                className="btn w-100 py-2 fw-bold" 
                disabled={isSubmitting}
                style={{backgroundColor: '#0d6efd', border: 'none', color: 'white'}}
              >
                {isSubmitting ? "Registering..." : "Sign Up & Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default OnlySignup;