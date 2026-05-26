// src/pages/DoctorProfile.jsx
import React from 'react';
import {useContext} from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../Context/Context'; // To access doctorData

const DoctorProfile = () => {
  const { doctorData, loading } = useContext(MyContext);  // Get doctor data and loading state

  const URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (!doctorData) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Could not load profile. Please try logging in again.</div>;
  }

  // Helper function to display profile percentage
  const getProfilePercentage = (val) => {
    const requiredFields = [
      "name", "image", "email", "phoneNumber", "alternatePhoneNumber", "address",
      "ctrCode", "country", "state", "city", "qualification", "altphnctrcode",
      "specialist", "experience", "clinicName", "myDocumentId" // Assuming myDocumentId is populated
    ];
    const filledFields = requiredFields.filter(field => {
      const value = val[field];
      if (field === "myDocumentId") return value && value.toString();
      return typeof value === "string" && value.trim() !== "";
    });
    const completionPercentage = (filledFields.length / requiredFields.length) * 100;
    return parseFloat(completionPercentage.toFixed(2));
  };
  const defaultAvatar = 'https://via.placeholder.com/150'; // Default avatar image URL

  const profilePercentage = getProfilePercentage(doctorData);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Doctor Profile</h1>
        <Link to="/doctor/edit-profile" className="btn btn-primary">Edit Profile</Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* Left side: Image and Basic Info */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <img
            src={doctorData.image ? `${URL}/${doctorData.image}` : defaultAvatar}
            alt={doctorData.name || "Doctor"}
            className="rounded-circle mb-3"
            style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #eee' }}
          />
          <h3 style={{ margin: '0.5rem 0' }}>{doctorData.name}</h3>
          <p style={{ margin: '0.2rem 0', color: '#555' }}>{doctorData.specialist || 'Specialist Not Specified'}</p>
          <p style={{ margin: '0.2rem 0', color: '#777', fontSize: '0.9rem' }}>
            Experience: {doctorData.experience || 'N/A'} Years
          </p>
           <p style={{ margin: '0.2rem 0', color: '#777', fontSize: '0.9rem' }}>
            Profile Completion: <strong>{profilePercentage}%</strong>
          </p>
        </div>

        {/* Right side: Detailed Information */}
        <div style={{ flexGrow: 1 }}>
          <h4>Contact Information</h4>
          <p><strong>Email:</strong> {doctorData.email}</p>
          <p><strong>Phone:</strong> {doctorData.ctrCode} {doctorData.phoneNumber}</p>
          {doctorData.alternatePhoneNumber && (
            <p><strong>Alternate Phone:</strong> {doctorData.altphnctrcode} {doctorData.alternatePhoneNumber}</p>
          )}
          <p><strong>Address:</strong> {doctorData.address}, {doctorData.city}, {doctorData.state}, {doctorData.country}</p>

          <h4 style={{ marginTop: '1.5rem' }}>Professional Details</h4>
          <p><strong>Qualification:</strong> {doctorData.qualification}</p>
          <p><strong>Specialization:</strong> {doctorData.specialist}</p>
          <p><strong>Clinic Name:</strong> {doctorData.clinicName || 'N/A'}</p>
          <p><strong>License Number:</strong> {doctorData.licenceNumber || 'N/A'}</p>
          <p><strong>Council Registration No.:</strong> {doctorData.councilNumber || 'N/A'}</p>

          {/* Link to Documents if available */}
          {doctorData.myDocumentId && (
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/doctor/documents" className="btn btn-outline-primary">View Documents</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;