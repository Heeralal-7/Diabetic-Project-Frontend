// src/ClinicPanel/Pages/ClinicEditProfile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicEditProfile = () => {
  const { clinicData, getClinicProfile, updateClinicProfile } = useContext(MyContext);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClinicProfile();
  }, []);

  useEffect(() => {
    if (clinicData) {
      setFormData({
        name: clinicData.name || '',
        email: clinicData.email || '',
        phoneNumber: clinicData.phoneNumber || '',
        alternatePhoneNumber: clinicData.alternatePhoneNumber || '',
        address: clinicData.address || '',
        country: clinicData.country || '',
        state: clinicData.state || '',
        city: clinicData.city || '',
        clinicName: clinicData.clinicName || '',
        experience: clinicData.experience || '',
        licenceNumber: clinicData.licenceNumber || '',
        councilNumber: clinicData.councilNumber || '',
        qualification: clinicData.qualification || '',
        specialist: clinicData.specialist || '',
        About: clinicData.About || ''
      });
    }
  }, [clinicData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateClinicProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully!');
        getClinicProfile(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Edit Clinic Profile</h1>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Edit Clinic Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Clinic Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="clinicName"
                      value={formData.clinicName || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Owner Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Alternate Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="alternatePhoneNumber"
                      value={formData.alternatePhoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Experience (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Address *</label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      required
                      rows="3"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">Country *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">State *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Licence Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="licenceNumber"
                      value={formData.licenceNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Council Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="councilNumber"
                      value={formData.councilNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Qualification</label>
                    <input
                      type="text"
                      className="form-control"
                      name="qualification"
                      value={formData.qualification || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Specialization</label>
                    <input
                      type="text"
                      className="form-control"
                      name="specialist"
                      value={formData.specialist || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">About Clinic</label>
                    <textarea
                      className="form-control"
                      name="About"
                      value={formData.About || ''}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Tell us about your clinic, services, and expertise..."
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicEditProfile;