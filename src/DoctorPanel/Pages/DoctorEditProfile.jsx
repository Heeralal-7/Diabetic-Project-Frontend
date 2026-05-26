// src/pages/DoctorEditProfile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../Context/Context';

const DoctorEditProfile = () => {
  const { doctorData, loading, error, updateDoctorProfile, getDoctorProfile, setError } = useContext(MyContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null); // Example for other files
  const [licenceFile, setLicenceFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';
  const defaultAvatar = 'https://via.placeholder.com/150'; // Default avatar image URL

  // Fetch current doctor data and initialize form
  useEffect(() => {
    const tokenInfo = sessionStorage.getItem('doctortoken');
    if (!tokenInfo) {
      navigate('/doctors/login');
      return;
    }
    const parsedTokenInfo = JSON.parse(tokenInfo);
    if (!doctorData) {
      getDoctorProfile(parsedTokenInfo.token).then(data => {
        if (data?.details) {
          // Set initial form data from fetched profile
          setFormData(data.details);
        }
      }).catch(err => {
        console.error("Error fetching profile for edit:", err);
        // Error handled by context toast/setError
      });
    } else {
      setFormData(doctorData); // Use data from context if available
    }
  }, [doctorData, getDoctorProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null); // Clear global error on input change
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (name === 'image') {
      setImageFile(file);
      // Optionally preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target.result }); // Display preview
      };
      if (file) reader.readAsDataURL(file);
    } else if (name === 'certificate') {
      setCertificateFile(file);
    } else if (name === 'licenceImage') {
      setLicenceFile(file);
    } else if (name === 'signature') {
      setSignatureFile(file);
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tokenInfo = sessionStorage.getItem('doctortoken');
    if (!tokenInfo) {
      navigate('/doctors/login');
      return;
    }
    const parsedTokenInfo = JSON.parse(tokenInfo);
    const token = parsedTokenInfo.token;

    const data = new FormData();
    // Append only changed fields or all fields depending on your backend expectation
    Object.keys(formData).forEach(key => {
      // Only append if it's not the image/file fields we handle separately
      // Or if the value has changed from original (more complex state needed for this)
      if (key !== 'image' && key !== 'certificate' && key !== 'licenceImage' && key !== 'signature') {
        data.append(key, formData[key]);
      }
    });

    if (imageFile) data.append('image', imageFile);
    if (certificateFile) data.append('certificate', certificateFile);
    if (licenceFile) data.append('licenceImage', licenceFile);
    if (signatureFile) data.append('signature', signatureFile);

    try {
      await updateDoctorProfile(data, token);
      // updateDoctorProfile already handles success message and re-fetching profile
      navigate('/doctor/profile'); // Navigate back to profile view after successful update
    } catch (err) {
      console.error("Error updating profile:", err);
      // Error feedback is provided by the context's toast and setError
    }
  };

  if (loading && !formData.name) return <div style={{ padding: '2rem' }}>Loading profile data...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Edit Doctor Profile</h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left side: Image upload and basic info */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <img
              src={formData.image ? (typeof formData.image === 'string' && formData.image.startsWith('data:') ? formData.image : `${URL}/${formData.image}`) : defaultAvatar}
              alt="Profile Preview"
              className="rounded-circle mb-3"
              style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #eee' }}
            />
            <div className="mb-3">
              <label htmlFor="image" className="form-label btn btn-outline-secondary w-100">
                {imageFile ? imageFile.name : 'Upload Image'}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
             <p style={{ margin: '0.2rem 0', color: '#777', fontSize: '0.9rem' }}>
                Profile Completion: <strong>Calculating...</strong> {/* Recalculate if needed */}
            </p>
          </div>

          {/* Right side: Form fields */}
          <div style={{ flexGrow: 1 }}>
            <h4>Contact Information</h4>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name:</label>
              <input type="text" id="name" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input type="email" id="email" name="email" className="form-control" value={formData.email || ''} onChange={handleChange} required readOnly disabled /> {/* Email often read-only */}
            </div>
            <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="ctrCode" className="form-label">Country Code:</label>
                    <input type="text" id="ctrCode" name="ctrCode" className="form-control" value={formData.ctrCode || ''} onChange={handleChange} placeholder="+1" />
                </div>
                <div className="col-md-8">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" className="form-control" value={formData.phoneNumber || ''} onChange={handleChange} required />
                </div>
            </div>
             <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="altphnctrcode" className="form-label">Alt. Country Code:</label>
                    <input type="text" id="altphnctrcode" name="altphnctrcode" className="form-control" value={formData.altphnctrcode || ''} onChange={handleChange} placeholder="+1" />
                </div>
                <div className="col-md-8">
                    <label htmlFor="alternatePhoneNumber" className="form-label">Alternate Phone Number:</label>
                    <input type="tel" id="alternatePhoneNumber" name="alternatePhoneNumber" className="form-control" value={formData.alternatePhoneNumber || ''} onChange={handleChange} />
                </div>
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address:</label>
              <input type="text" id="address" name="address" className="form-control" value={formData.address || ''} onChange={handleChange} required />
            </div>
             <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="country" className="form-label">Country:</label>
                    <input type="text" id="country" name="country" className="form-control" value={formData.country || ''} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <label htmlFor="state" className="form-label">State:</label>
                    <input type="text" id="state" name="state" className="form-control" value={formData.state || ''} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <label htmlFor="city" className="form-label">City:</label>
                    <input type="text" id="city" name="city" className="form-control" value={formData.city || ''} onChange={handleChange} required />
                </div>
            </div>

            <h4 className="mt-4">Professional Details</h4>
            <div className="mb-3">
              <label htmlFor="qualification" className="form-label">Qualification:</label>
              <input type="text" id="qualification" name="qualification" className="form-control" value={formData.qualification || ''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="specialist" className="form-label">Specialization:</label>
              <input type="text" id="specialist" name="specialist" className="form-control" value={formData.specialist || ''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="experience" className="form-label">Years of Experience:</label>
              <input type="number" id="experience" name="experience" className="form-control" value={formData.experience || ''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="clinicName" className="form-label">Clinic Name:</label>
              <input type="text" id="clinicName" name="clinicName" className="form-control" value={formData.clinicName || ''} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="licenceNumber" className="form-label">License Number:</label>
              <input type="text" id="licenceNumber" name="licenceNumber" className="form-control" value={formData.licenceNumber || ''} onChange={handleChange} required />
            </div>
             <div className="mb-3">
              <label htmlFor="councilNumber" className="form-label">Council Registration No.:</label>
              <input type="text" id="councilNumber" name="councilNumber" className="form-control" value={formData.councilNumber || ''} onChange={handleChange} required />
            </div>

            {/* File Uploads */}
            <div className="mt-4">
              <h5>Documents</h5>
              <div className="mb-3">
                <label htmlFor="certificate" className="form-label btn btn-outline-secondary w-100">
                  {certificateFile ? certificateFile.name : (formData.certificate ? 'Certificate.pdf' : 'Upload Medical Certificate')}
                </label>
                <input
                  type="file"
                  id="certificate"
                  name="certificate"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="licenceImage" className="form-label btn btn-outline-secondary w-100">
                  {licenceFile ? licenceFile.name : (formData.licenceImage ? 'License.pdf' : 'Upload License Image/PDF')}
                </label>
                <input
                  type="file"
                  id="licenceImage"
                  name="licenceImage"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                />
              </div>
               <div className="mb-3">
                <label htmlFor="signature" className="form-label btn btn-outline-secondary w-100">
                  {signatureFile ? signatureFile.name : (formData.signature ? 'Signature.png' : 'Upload Signature')}
                </label>
                <input
                  type="file"
                  id="signature"
                  name="signature"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="text-end mt-4">
          <button type="submit" className="btn btn-primary me-2">Save Changes</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/doctor/profile')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DoctorEditProfile;