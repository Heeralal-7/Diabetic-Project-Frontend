// src/pages/DoctorRegister.js
import React, { useState, useContext, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toastify
import { MyContext } from '../Context/Context'; // Import the context hook
import "./css/Registration.css"

const DoctorRegister = () => {
  const navigate = useNavigate();
  // Access context functions and state
  // Removed setError from context destructuring here, as it will be handled by the catch block
  const { registerDoctor, loading, error } = useContext(MyContext);

  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    address: '',
    ctrCode: '',
    altphnctrcode: '',
    country: '',
    state: '',
    city: '',
    qualification: '',
    specialist: '',
    experience: '',
    licenceNumber: '',
    councilNumber: '',
    clinicName: '',
    password: '',
    loginType: '', // 'app' or 'clinic'
    clinicId: '', // Required if loginType is 'clinic'
  });

  // State for file inputs
  const [certificateFile, setCertificateFile] = useState(null);
  const [licenceFile, setLicenceFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Handler for text-based input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear global error if the user starts typing again
    // Note: A more granular error handling per field might be needed for complex forms
    // but for now, clearing the global error on input is a common pattern.
    // If you have specific field-level errors, you'd manage them separately.
  };

  // Handler for file input changes
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (name === 'certificate') setCertificateFile(file);
    else if (name === 'licenceImage') setLicenceFile(file);
    else if (name === 'signature') setSignatureFile(file);
    else if (name === 'image') setImageFile(file);
  };

  // Handler for selecting login type
  const handleLoginTypeChange = (type) => {
    setFormData({ ...formData, loginType: type, clinicId: '' }); // Reset clinicId when type changes
  };

  // Effect to clear any lingering errors when the component mounts or navigates away
  // This is a good practice so that a previous error doesn't persist if the user revisits the page.
  useEffect(() => {
    // You might need to access a global setError from context if you want to clear it here,
    // or rely on the submission handler to set the error. For simplicity, let's assume
    // errors are only shown after an action.
    // If you want to clear the error when the component unmounts:
    return () => {
      // Optional: clear error state on component unmount if desired
      // For example, if you have a global setError function available in context
      // setError(null);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Basic Frontend Validation ---
    if (!formData.loginType) {
      toast.error('Please select an account type (App or Clinic).');
      return;
    }
    if (formData.loginType === 'clinic' && !formData.clinicId) {
      toast.error('Clinic ID is required for Clinic account type.');
      return;
    }
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
        toast.error('Please fill in all required fields (Name, Email, Phone, Password).');
        return;
    }
    // Add more frontend validations as needed (e.g., email format, password strength, phone number format)

    // --- Prepare FormData ---
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      // Append all text-based form data
      data.append(key, formData[key]);
    });

    // Append files if they exist
    if (certificateFile) data.append('certificate', certificateFile);
    if (licenceFile) data.append('licenceImage', licenceFile);
    if (signatureFile) data.append('signature', signatureFile);
    if (imageFile) data.append('image', imageFile);

    try {
      // Call the registerDoctor function from context
      // This function now handles its own loading and error logic internally by re-throwing
      const response = await registerDoctor(data);

      // If registerDoctor succeeds (doesn't throw an error)
      if (response && response.success) { // Assuming response always has a 'success' property
        toast.success('Registration successful! Please login.');
        navigate('/doctors/login'); // Redirect to doctor login page
      } else {
        // This case handles when the API returns success: false but no error was thrown
        // (e.g., backend logic returned success: false with a message)
        toast.error(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      // Catch errors thrown by registerDoctor or during the API call itself
      // The error message is now part of err.message due to the re-throw in context
      toast.error(err.message || 'An unexpected error occurred during registration.');
      console.error("Registration submission error:", err);
      // Note: The 'error' state from context isn't directly used here for display,
      // as toast.error handles user feedback. If you have a global error display
      // component, you'd use the 'error' from context.
    }
  };

  return (
    <div className="registration-container"> {/* Added a container class for styling */}
      <h2>Doctor Registration</h2>
      <form onSubmit={handleSubmit} className="registration-form"> {/* Added form class for styling */}

        {/* Account Type Selection */}
        <div className="form-group">
          <label>Account Type:</label>
          <div className="login-type-buttons">
            <button
              type="button"
              className={formData.loginType === 'app' ? 'active' : ''}
              onClick={() => handleLoginTypeChange('app')}
            >
              Doctor (App)
            </button>
            <button
              type="button"
              className={formData.loginType === 'clinic' ? 'active' : ''}
              onClick={() => handleLoginTypeChange('clinic')}
            >
              Doctor (Clinic)
            </button>
          </div>
          {formData.loginType === 'clinic' && (
            <div className="form-group">
              <label htmlFor="clinicId">Clinic ID:</label>
              <input
                type="text"
                id="clinicId"
                name="clinicId"
                value={formData.clinicId}
                onChange={handleChange}
                placeholder="Enter Clinic ID (e.g., a valid MongoDB ObjectId)"
                // Consider adding validation for ObjectId format here if required by backend
                // or fetching a list of clinics to select from.
              />
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel" // Use tel for phone numbers
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your primary phone number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="alternatePhoneNumber">Alternate Phone Number (Optional):</label>
          <input
            type="tel"
            id="alternatePhoneNumber"
            name="alternatePhoneNumber"
            value={formData.alternatePhoneNumber}
            onChange={handleChange}
            placeholder="Enter alternate phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your full address"
            required
          />
        </div>
        <div className="form-group country-code-group">
            <label htmlFor="ctrCode">Country Code:</label>
            <input
                type="text"
                id="ctrCode"
                name="ctrCode"
                value={formData.ctrCode}
                onChange={handleChange}
                placeholder="+1"
                className="country-code-input"
                required
            />
            <label htmlFor="altphnctrcode">Alt. Country Code:</label>
            <input
                type="text"
                id="altphnctrcode"
                name="altphnctrcode"
                value={formData.altphnctrcode}
                onChange={handleChange}
                placeholder="+1"
                className="country-code-input"
            />
        </div>


        {/* Professional Details */}
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="qualification">Qualification:</label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="e.g., MBBS, MD"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialist">Specialization:</label>
          <input
            type="text"
            id="specialist"
            name="specialist"
            value={formData.specialist}
            onChange={handleChange}
            placeholder="e.g., Cardiology, Neurology"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="experience">Years of Experience:</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g., 10"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="licenceNumber">License Number:</label>
          <input
            type="text"
            id="licenceNumber"
            name="licenceNumber"
            value={formData.licenceNumber}
            onChange={handleChange}
            placeholder="Medical License Number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="councilNumber">Council Registration Number:</label>
          <input
            type="text"
            id="councilNumber"
            name="councilNumber"
            value={formData.councilNumber}
            onChange={handleChange}
            placeholder="Medical Council Registration Number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="clinicName">Clinic Name (if applicable):</label>
          <input
            type="text"
            id="clinicName"
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            placeholder="Name of your clinic"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            minLength="6" // Example: minimum password length
          />
        </div>

        {/* File Uploads */}
        <div className="form-group">
          <label htmlFor="image">Profile Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            accept="image/*" // Accept only image files
          />
        </div>
        <div className="form-group">
          <label htmlFor="certificate">Medical Certificate:</label>
          <input
            type="file"
            id="certificate"
            name="certificate"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx" // Accept PDF and Word documents
          />
        </div>
        <div className="form-group">
          <label htmlFor="licenceImage">License Image:</label>
          <input
            type="file"
            id="licenceImage"
            name="licenceImage"
            onChange={handleFileChange}
            accept="image/*,.pdf" // Accept images or PDFs
          />
        </div>
        <div className="form-group">
          <label htmlFor="signature">Signature:</label>
          <input
            type="file"
            id="signature"
            name="signature"
            onChange={handleFileChange}
            accept="image/*" // Accept only image files for signature
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {/* Display Global Error from Context */}
        {/* If your context provides a global 'error' state to display errors, use it here */}
        {/* {error && <p className="error-message">{error}</p>} */}

        {/* Login Link */}
        <div className="text-center mt-3">
          <p>
            Already have an account?
            <button type="button" onClick={() => navigate('/doctors/login')} className="link-button">
              Login here
            </button>
          </p>
        </div>
      </form>
      {/* ToastContainer should be at a higher level (e.g., App.js) */}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default DoctorRegister;