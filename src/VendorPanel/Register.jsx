import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import LoginImg from "../Components/Assets/img/Account/Login.png";
import axios from "axios";

const VendorRegistration = () => {
  const URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    altrphone: "",
    ctrcode: "+91",
    altphnctrcode: "+91",
    country: "",
    state: "",
    city: "",
    vendor: "",
    password: "",
    image: null,
    licence: null,
    register: null,
    business: "",
  });

  const [countryList, setCountryList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewRegistration, setPreviewRegistration] = useState(null);
  const [previewLicense, setPreviewLicense] = useState(null);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  // Handle input changes for text and select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // If the selected field is 'country', fetch the states
    if (name === "country") {
      const selectedCountry = countryList.find(
        (country) => country.name === value
      );
      if (selectedCountry) {
        getState(selectedCountry.isoCode); // Pass the country code to fetch states
      }
    }

    // If the selected field is 'state', fetch the cities
    if (name === "state") {
      const selectedState = stateList.find((state) => state.name === value);
      if (selectedState) {
        const selectedCountry = countryList.find(
          (country) => country.name === formData.country
        );
        if (selectedCountry) {
          getcity(selectedCountry.isoCode, selectedState.isoCode); // Fetch cities based on country and state
        }
      }
    }
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setFormData({
      ...formData,
      [name]: files[0],
    });

    // Preview the selected files
    const reader = new FileReader();
    reader.onload = () => {
      if (name === "image") {
        setPreviewImage(reader.result); // Preview for profile picture
      } else if (name === "register") {
        setPreviewRegistration(reader.result); // Preview for registration certificate
      } else if (name === "licence") {
        setPreviewLicense(reader.result); // Preview for license
      }
    };
    reader.readAsDataURL(files[0]); // Read the file as a Data URL
  };

  useEffect(() => {
    getcountry();
  }, []);

  // Fetch countries
  const getcountry = async () => {
    try {
      const { data } = await axios.get(`${URL}/country`);
      if (data.success) {
        setCountryList(data.details);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  // Fetch states based on the selected country code (cCode)
  const getState = async (cCode) => {
    try {
      const { data } = await axios.post(`${URL}/country/states`, {
        cCode,
      });

      if (data.success) {
        setStateList(data.details);
      } else {
        console.error("Error fetching states:", data.message);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  // Get cities
  const getcity = async (cCode, sCode) => {
    try {
      const { data } = await axios.post(`${URL}/country/city`, {
        cCode,
        sCode,
      });
      if (data.success) {
        setCityList(data.details);
      } else {
        console.error("Error fetching cities", data.message);
      }
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  const submitRegister = (e) => {
    e.preventDefault();



    const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }

    register(data);
    navigate('/vendordashboard')
    
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post(
        `${URL}/vendor/register`,
        
          formData,
        
      );
      if (data.success == 1) {
        console.log("Registered successfully");
      }
    } catch (error) {
      console.error("Error while registering", error);
    }
  };

  return (
    <>
      <div className="container-fluid login-container3">
        <div className="row justify-content-center align-items-start w-100">
          {/* Left side with image illustration */}
          <div className="col-md-6 py-md-5 sticky-md-top login-image text-center" >
            <img
              src={LoginImg}
              className="w-80"
              alt="Diabetes Illustration"
            />
          </div>

          {/* Right side with form */}
          <div className="col-md-6 py-md-5 col-12">
            <div className="w-95 mx-auto">
              <h3 className="text-dark text-center">
                Welcome to
                <strong className="text-mainBlue"> Diabeteswala </strong> Family
              </h3>
              <h5 className="text-center">Let’s set up your profile</h5>

              <form onSubmit={submitRegister}>
                <div className="text-center my-4">
                  <label htmlFor="image" style={{ cursor: "pointer" }}>
                    {/* Display the profile image preview */}
                    <img
                      src={
                        previewImage ||
                        "https://pinnacle.works/wp-content/uploads/2022/06/dummy-image.jpg"
                      }
                      className="object-fit-cover object-position-center rounded-circle"
                      style={{ width: "100px", height: "100px" }}
                      alt="Profile Preview"
                    />
                  </label>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control d-none" // Hide the file input
                    id="image"
                    name="image"
                    onChange={handleFileChange} // Handle file change
                    accept="image/*"
                  />
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
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
                {/* Mobile Number */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Mobile Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      placeholder="Enter your mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {/* Alternative Mobile Number */}
                <div className="mb-3">
                  <label htmlFor="altrphone" className="form-label">
                    Alternative Mobile Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                      type="tel"
                      className="form-control"
                      id="altrphone"
                      name="altrphone"
                      placeholder="Enter alternative mobile number"
                      value={formData.altrphone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {/* Country Selection */}
                <div className="mb-3">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    className="form-select"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your country</option>
                    {countryList.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* State Selection */}
                <div className="mb-3">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <select
                    className="form-select"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your state</option>
                    {stateList.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* City Selection */}
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <select
                    className="form-select"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your city</option>
                    {cityList.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Business */}
                <div className="mb-3">
                  <label htmlFor="business" className="form-label">
                    Business
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="business"
                    name="business"
                    placeholder="Enter your business name"
                    value={formData.business}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Vendor Type Selection */}
                <div className="mb-3">
                  <label className="form-label">Vendor Type</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="vendor"
                        value="Lab"
                        checked={formData.vendor === "Lab"}
                        onChange={handleChange}
                        required
                      />
                      Lab
                    </label>
                    <label className="ms-3">
                      <input
                        type="radio"
                        name="vendor"
                        value="Pharmacy"
                        checked={formData.vendor === "Pharmacy"}
                        onChange={handleChange}
                        required
                      />
                      Pharmacy
                    </label>
                    <label className="ms-3">
                      <input
                        type="radio"
                        name="vendor"
                        value="Food"
                        checked={formData.vendor === "Food"}
                        onChange={handleChange}
                        required
                      />
                      Food
                    </label>
                    {/* Add more radio buttons as needed */}
                  </div>
                </div>
                {/* License Upload */}
                <div className="mb-3">
                  <label htmlFor="licence" className="form-label">
                    Upload License
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="licence"
                    name="licence"
                    onChange={handleFileChange}
                    accept="application/pdf,image/*"
                  />
                  <div className="text-center my-4">
                    <img
                      src={
                        previewLicense ||
                        "https://pinnacle.works/wp-content/uploads/2022/06/dummy-image.jpg"
                      }
                      className="object-fit-cover"
                      style={{ width: "100px", height: "100px" }}
                      alt="License Preview"
                    />
                  </div>
                </div>
                {/* Registration Certificate Upload */}
                <div className="mb-3">
                  <label htmlFor="register" className="form-label">
                    Upload Registration Certificate
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="register"
                    name="register"
                    onChange={handleFileChange}
                    accept="application/pdf,image/*"
                  />
                  <div className="text-center my-4">
                    <img
                      src={
                        previewRegistration ||
                        "https://pinnacle.works/wp-content/uploads/2022/06/dummy-image.jpg"
                      }
                      className="object-fit-cover"
                      style={{ width: "100px", height: "100px" }}
                      alt="Registration Preview"
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              
                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100 mt-4">
                  Register
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/vendordashboard" className="text-decoration-none">
                  Already have an account? Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default VendorRegistration;
