// components/Clinic/ClinicRegister.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from '../Context/Context';

const ClinicRegister = () => {
  const navigate = useNavigate();
  const { registerClinic, loading, error, setError } = useContext(MyContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    address: '',
    ctrCode: '+91',
    altphnctrcode: '+91',
    country: '',
    state: '',
    city: '',
    clinicName: '',
    password: '',
    confirmPassword: '',
    experience: '',
    licenceNumber: '',
    councilNumber: '',
    longitude: '',
    latitude: ''
  });

  const [files, setFiles] = useState({
    image: null,
    certificate: null,
    licenceImage: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.longitude || !formData.latitude) {
      toast.error('Please provide location coordinates');
      return;
    }

    try {
      const submitData = {
        ...formData,
        image: files.image,
        certificate: files.certificate,
        licenceImage: files.licenceImage
      };

      // Convert lat/long to numbers
      submitData.latitude = parseFloat(submitData.latitude);
      submitData.longitude = parseFloat(submitData.longitude);

      // Remove confirmPassword before sending
      delete submitData.confirmPassword;

      const response = await registerClinic(submitData);

      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/clinics/login');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success('Location fetched successfully!');
        },
        (error) => {
          toast.error('Unable to fetch location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h2 className="text-center">Clinic Registration</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      {/* Clinic Name */}
                      <div className="mb-3">
                        <label className="form-label">Clinic Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="clinicName"
                          value={formData.clinicName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Owner Name */}
                      <div className="mb-3">
                        <label className="form-label">Owner Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="mb-3">
                        <label className="form-label">Phone Number *</label>
                        <div className="input-group">
                          <select 
                            className="form-select" 
                            style={{maxWidth: '100px'}}
                            name="ctrCode"
                            value={formData.ctrCode}
                            onChange={handleInputChange}
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                          </select>
                          <input
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Alternate Phone Number (required) */}
                      <div className="mb-3">
                        <label className="form-label">Alternate Phone Number *</label>
                        <div className="input-group">
                          <select 
                            className="form-select" 
                            style={{maxWidth: '100px'}}
                            name="altphnctrcode"
                            value={formData.altphnctrcode}
                            onChange={handleInputChange}
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                          </select>
                          <input
                            type="tel"
                            className="form-control"
                            name="alternatePhoneNumber"
                            value={formData.alternatePhoneNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      {/* File Uploads */}
                      <div className="mb-3">
                        <label className="form-label">Profile Image</label>
                        <input
                          type="file"
                          className="form-control"
                          name="image"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Certificate Image</label>
                        <input
                          type="file"
                          className="form-control"
                          name="certificate"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Licence Image</label>
                        <input
                          type="file"
                          className="form-control"
                          name="licenceImage"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </div>

                      {/* Location */}
                      <div className="mb-3">
                        <label className="form-label">Location *</label>
                        <div className="d-flex gap-2 mb-2">
                          <button 
                            type="button" 
                            className="btn btn-outline-primary btn-sm"
                            onClick={getCurrentLocation}
                          >
                            Get Current Location
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Latitude"
                              name="latitude"
                              value={formData.latitude}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Longitude"
                              name="longitude"
                              value={formData.longitude}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address + Country/State/City */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Address *</label>
                        <textarea
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Country *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Licence Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="licenceNumber"
                          value={formData.licenceNumber}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Council Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="councilNumber"
                          value={formData.councilNumber}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Experience (years)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Confirm Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Clinic'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <p>
                    Already have an account? 
                    <Link to="/clinic/login" className="text-primary"> Login here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ClinicRegister;
