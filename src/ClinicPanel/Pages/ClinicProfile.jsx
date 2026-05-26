// src/ClinicPanel/Pages/ClinicProfile.jsx
import React, { useContext, useEffect } from 'react';
import { MyContext } from '../../Context/Context';

const ClinicProfile = () => {
  const { clinicData, getClinicProfile } = useContext(MyContext);

  useEffect(() => {
    getClinicProfile();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Clinic Profile</h1>
            <span className="badge bg-primary">
              Profile Completion: {clinicData?.profilePercentage || 0}%
            </span>
          </div>

          {clinicData && (
            <div className="row">
              <div className="col-lg-4 col-md-5">
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">Clinic Image</h5>
                  </div>
                  <div className="card-body text-center">
                    <img
                      src={clinicData.image ? `${process.env.REACT_APP_API_URL}/${clinicData.image}` : '/default-clinic.jpg'}
                      alt="Clinic"
                      className="img-fluid rounded-circle mb-3"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                    <h4 className="mb-1">{clinicData.clinicName}</h4>
                    <p className="text-muted">{clinicData.name}</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-8 col-md-7">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">Clinic Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Clinic Name</label>
                        <p className="form-control-plaintext">{clinicData.clinicName}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Owner Name</label>
                        <p className="form-control-plaintext">{clinicData.name}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Email Address</label>
                        <p className="form-control-plaintext">{clinicData.email}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Phone Number</label>
                        <p className="form-control-plaintext">{clinicData.phoneNumber}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Alternate Phone</label>
                        <p className="form-control-plaintext">{clinicData.alternatePhoneNumber || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Experience</label>
                        <p className="form-control-plaintext">{clinicData.experience || 'N/A'} years</p>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-bold">Address</label>
                        <p className="form-control-plaintext">{clinicData.address}</p>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">City</label>
                        <p className="form-control-plaintext">{clinicData.city}</p>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">State</label>
                        <p className="form-control-plaintext">{clinicData.state}</p>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Country</label>
                        <p className="form-control-plaintext">{clinicData.country}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Licence Number</label>
                        <p className="form-control-plaintext">{clinicData.licenceNumber || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Council Number</label>
                        <p className="form-control-plaintext">{clinicData.councilNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicProfile;