// src/ClinicPanel/Pages/ClinicDoctors.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

// --- AddDoctorModal Component ---
// src/ClinicPanel/Pages/ClinicDoctors.jsx - Update AddDoctorModal
// src/ClinicPanel/Pages/ClinicDoctors.jsx - Updated AddDoctorModal
const AddDoctorModal = ({ onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        address: '',
        ctrCode: '+91',
        altphnctrcode: '+91',
        country: 'India',
        state: '',
        city: '',
        qualification: '',
        specialist: '',
        experience: '',
        licenceNumber: '',
        councilNumber: '',
        clinicName: '',
        password: 'Doctor@123',
        longitude: '77.1025',
        latitude: '28.7041',
        image: null,
        certificate: null,
        licenceImage: null,
        signature: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create FormData object
        const submitData = new FormData();
        
        // Append ALL fields that backend expects
        const fieldsToAppend = [
            'name', 'email', 'phoneNumber', 'alternatePhoneNumber', 'address',
            'ctrCode', 'altphnctrcode', 'country', 'state', 'city', 
            'qualification', 'specialist', 'experience', 'licenceNumber', 
            'councilNumber', 'clinicName', 'password', 'longitude', 'latitude'
        ];

        fieldsToAppend.forEach(field => {
            if (formData[field] !== undefined && formData[field] !== null) {
                submitData.append(field, formData[field].toString());
            }
        });

        // Append files with exact field names backend expects
        if (formData.image instanceof File) {
            submitData.append('image', formData.image);
        }
        if (formData.certificate instanceof File) {
            submitData.append('certificate', formData.certificate);
        }
        if (formData.licenceImage instanceof File) {
            submitData.append('licenceImage', formData.licenceImage);
        }
        if (formData.signature instanceof File) {
            submitData.append('signature', formData.signature);
        }

        // Debug: Check what's being sent
        console.log("Submitting doctor data to backend:");
        for (let [key, value] of submitData.entries()) {
            console.log(key, value);
        }

        onSubmit(submitData);
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title">Add New Doctor</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Basic Information */}
                                <div className="col-12">
                                    <h6 className="border-bottom pb-2">Basic Information *</h6>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Full Name *</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email *</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">+91</span>
                                        <input type="tel" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Alternate Phone Number *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">+91</span>
                                        <input type="tel" className="form-control" name="alternatePhoneNumber" value={formData.alternatePhoneNumber} onChange={handleChange} required />
                                    </div>
                                </div>
                                
                                {/* Address Information */}
                                <div className="col-12 mt-3">
                                    <h6 className="border-bottom pb-2">Address Information *</h6>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Complete Address *</label>
                                    <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} rows="2" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Country *</label>
                                    <input type="text" className="form-control" name="country" value={formData.country} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">State *</label>
                                    <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">City *</label>
                                    <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required />
                                </div>
                                
                                {/* Professional Details */}
                                <div className="col-12 mt-3">
                                    <h6 className="border-bottom pb-2">Professional Details *</h6>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Specialization *</label>
                                    <input type="text" className="form-control" name="specialist" value={formData.specialist} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Experience (Years) *</label>
                                    <input type="number" className="form-control" name="experience" value={formData.experience} onChange={handleChange} min="0" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Qualification *</label>
                                    <input type="text" className="form-control" name="qualification" value={formData.qualification} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Licence Number *</label>
                                    <input type="text" className="form-control" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Council Number</label>
                                    <input type="text" className="form-control" name="councilNumber" value={formData.councilNumber} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Clinic Name</label>
                                    <input type="text" className="form-control" name="clinicName" value={formData.clinicName} onChange={handleChange} />
                                </div>

                                {/* Location Coordinates */}
                                <div className="col-12 mt-3">
                                    <h6 className="border-bottom pb-2">Location Coordinates</h6>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Longitude</label>
                                    <input type="text" className="form-control" name="longitude" value={formData.longitude} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Latitude</label>
                                    <input type="text" className="form-control" name="latitude" value={formData.latitude} onChange={handleChange} />
                                </div>
                                
                                {/* File Uploads */}
                                <div className="col-12 mt-3">
                                    <h6 className="border-bottom pb-2">Documents & Images</h6>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Profile Image</label>
                                    <input type="file" className="form-control" name="image" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Certificate</label>
                                    <input type="file" className="form-control" name="certificate" accept="image/*,.pdf" onChange={handleFileChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Licence Image</label>
                                    <input type="file" className="form-control" name="licenceImage" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Signature</label>
                                    <input type="file" className="form-control" name="signature" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Adding Doctor...
                                    </>
                                ) : (
                                    'Add Doctor'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- DoctorEditModal Component (Keep your existing one) ---
const DoctorEditModal = ({ doctor, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: doctor.name || '',
        email: doctor.email || '',
        specialist: doctor.specialist || '',
        experience: doctor.experience || 0,
        address: doctor.address || '',
        phoneNumber: doctor.phoneNumber || '',
        licenceNumber: doctor.licenceNumber || '',
        councilNumber: doctor.councilNumber || '',
        qualification: doctor.qualification || '',
        image: null,
        posterimage: null,
    });

    useEffect(() => {
        setFormData({
            name: doctor.name || '',
            email: doctor.email || '',
            specialist: doctor.specialist || '',
            experience: doctor.experience || 0,
            address: doctor.address || '',
            phoneNumber: doctor.phoneNumber || '',
            licenceNumber: doctor.licenceNumber || '',
            councilNumber: doctor.councilNumber || '',
            qualification: doctor.qualification || '',
            image: null,
            posterimage: null,
        });
    }, [doctor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                if (key === 'image' || key === 'posterimage') {
                    if (formData[key] instanceof File) {
                        submitData.append(key, formData[key]);
                    }
                } else {
                    submitData.append(key, formData[key]);
                }
            }
        });

        onSubmit(submitData);
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Edit Dr. {doctor.name}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Name *</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email *</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Specialization</label>
                                    <input type="text" className="form-control" name="specialist" value={formData.specialist} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Experience (Years)</label>
                                    <input type="number" className="form-control" name="experience" value={formData.experience} onChange={handleChange} min="0" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Licence Number</label>
                                    <input type="text" className="form-control" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} rows="2" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Council Number</label>
                                    <input type="text" className="form-control" name="councilNumber" value={formData.councilNumber} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Qualification</label>
                                    <input type="text" className="form-control" name="qualification" value={formData.qualification} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Profile Image</label>
                                    <input type="file" className="form-control" name="image" accept="image/*" onChange={handleFileChange} />
                                    {doctor.image && (
                                        <small className="text-muted">
                                            Current: {doctor.image.split('/').pop()}
                                        </small>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Poster Image</label>
                                    <input type="file" className="form-control" name="posterimage" accept="image/*" onChange={handleFileChange} />
                                    {doctor.posterimage && (
                                        <small className="text-muted">
                                            Current: {doctor.posterimage.split('/').pop()}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const ClinicDoctors = () => {
  const { clinicDoctors, getClinicDoctors, deleteClinicDoctor, editClinicDoctor, addDoctor, loading } = useContext(MyContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      await getClinicDoctors();
    } catch (error) {
      console.error("Fetch doctors error:", error);
      toast.error('Failed to load doctors');
    }
  }, [getClinicDoctors]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctor) return;
    try {
      await deleteClinicDoctor(selectedDoctor._id); 
      toast.success('Doctor deleted successfully');
      setShowDeleteModal(false);
      setSelectedDoctor(null);
      await fetchDoctors();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error('Failed to delete doctor');
    }
  };

  const handleEditClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (formData) => {
    if (!selectedDoctor) return;
    try {
      console.log("Submitting edit for doctor:", selectedDoctor._id);
      const response = await editClinicDoctor(selectedDoctor._id, formData);
      
      if (response.success) {
        toast.success('Doctor updated successfully');
        setShowEditModal(false);
        setSelectedDoctor(null);
        await fetchDoctors();
      } else {
        toast.error(response.message || 'Failed to update doctor');
      }
    } catch (error) {
      console.error("Edit submit error:", error);
      toast.error(error.message || 'Failed to update doctor');
    }
  };

  const handleAddDoctor = async (formData) => {
    try {
      console.log("Adding new doctor...");
      const response = await addDoctor(formData);
      
      if (response.success) {
        toast.success('Doctor added successfully');
        setShowAddModal(false);
        await fetchDoctors();
      } else {
        toast.error(response.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error("Add doctor error:", error);
      toast.error(error.message || 'Failed to add doctor');
    }
  };

  const doctorCount = clinicDoctors ? clinicDoctors.length : 0;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Clinic Doctors</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Doctor
        </button>
      </div>

      {/* Doctors Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Doctors in Your Clinic</h5>
          <span className="badge bg-light text-dark">{doctorCount} Doctors</span>
        </div>
        <div className="card-body">
          {loading && !clinicDoctors ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading doctors...</p>
            </div>
          ) : clinicDoctors?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicDoctors.map(doctor => (
                    <tr key={doctor._id}>
                      <td>
                        <img 
                          src={doctor.image ? `${process.env.REACT_APP_API_URL}${doctor.image}` : '/default-avatar.jpg'} 
                          alt={doctor.name} 
                          className="rounded-circle" 
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }} 
                        />
                      </td>
                      <td className="fw-bold">Dr. {doctor.name}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phoneNumber}</td>
                      <td><span className="badge bg-info">{doctor.specialist || 'General'}</span></td>
                      <td>{doctor.experience || '0'} years</td>
                      <td><span className="badge bg-success">Active</span></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="Edit" onClick={() => handleEditClick(doctor)} disabled={loading}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-danger" title="Delete" onClick={() => handleDeleteClick(doctor)} disabled={loading}>
                            <i className="bi bi-trash"></i>
                          </button>
                          <button className="btn btn-outline-info" title="View Details" disabled={loading}>
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-5">
                <i className="bi bi-people display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No Doctors Found</h4>
                <p className="text-muted">You haven't added any doctors to your clinic yet.</p>
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Your First Doctor
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete Dr. {selectedDoctor?.name}? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Doctor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <AddDoctorModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddDoctor} 
          loading={loading} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDoctor && (
        <DoctorEditModal 
          doctor={selectedDoctor} 
          onClose={() => { setShowEditModal(false); setSelectedDoctor(null); }} 
          onSubmit={handleEditSubmit} 
          loading={loading} 
        />
      )}
    </div>
  );
};

export default ClinicDoctors;