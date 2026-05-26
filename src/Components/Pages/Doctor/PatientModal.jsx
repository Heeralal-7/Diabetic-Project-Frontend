// PatientModalsAndSelection.jsx

import React from 'react';

const PatientModalsAndSelection = ({
    patients,
    patientLoading,
    selectedPatient,
    imageUrl,
    calculateAge,
    
    showPatientModal,
    setShowPatientModal,
    handlePatientSelect,
    handleEditPatientStart,
    handleDeletePatient,

    showAddPatientModal,
    setShowAddPatientModal,
    newPatientData,
    setNewPatientData,
    handleAddPatient,

    showEditPatientModal,
    setShowEditPatientModal,
    editingPatient,
    setEditingPatient,
    editPatientData,
    setEditPatientData,
    handleUpdatePatient,
}) => {
    // Shared modal backdrop style
    const modalStyle = {
        backgroundColor: 'rgba(0,0,0,0.5)'
    };

    const handleEditModalClose = () => {
        setShowEditPatientModal(false);
        setEditingPatient(null);
        setShowPatientModal(true); // Reopen selection modal
    };
    
    const handleAddModalClose = () => {
        setShowAddPatientModal(false);
        setShowPatientModal(true); // Go back to selection modal
    };
    
    // Prevent selection if patientLoading is true
    const handlePatientSelection = (patient) => {
        if (!patientLoading) {
             handlePatientSelect(patient);
        }
    };

    return (
        <>
            {/* Patient Selection Modal */}
            {showPatientModal && (
                <div className="modal fade show d-block" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select Patient</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowPatientModal(false)}
                                    disabled={patientLoading}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6>Choose from existing patients or add new</h6>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            setShowAddPatientModal(true);
                                            setShowPatientModal(false); // Close selection modal when opening add modal
                                        }}
                                        disabled={patientLoading}
                                    >
                                        + Add New Patient
                                    </button>
                                </div>
                                
                                {patientLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading patients...</span>
                                        </div>
                                        <p className="mt-2">Loading patients...</p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {patients.length > 0 ? (
                                            patients.map(patient => (
                                                <div key={patient._id} className="col-md-6 mb-3">
                                                    <div 
                                                        className={`card patient-card ${selectedPatient?._id === patient._id ? 'selected' : ''}`}
                                                    >
                                                        {/* Clickable area for selection */}
                                                        <div className="card-body" onClick={() => handlePatientSelection(patient)}>
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={patient.pic ? `${imageUrl}${patient.pic}` : "https://placehold.co/100x100?text=Patient"}
                                                                    className="rounded-circle me-3"
                                                                    style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                    alt={patient.name}
                                                                    onError={(e) => {
                                                                        e.target.src = "https://placehold.co/100x100?text=Patient";
                                                                    }}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-1">{patient.name}</h6>
                                                                    <p className="text-muted mb-1">
                                                                        Age: {calculateAge(patient.dob)} | {patient.gender}
                                                                    </p>
                                                                    <small className="text-muted">
                                                                        {patient.city && `${patient.city}, `}{patient.state}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-footer d-flex justify-content-between bg-white">
                                                            <button
                                                                className="btn btn-sm btn-outline-info"
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); // Prevent card body click event
                                                                    handleEditPatientStart(patient);
                                                                }}
                                                                disabled={patientLoading}
                                                            >
                                                                <i className="ri-edit-line"></i> Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent card body click event
                                                                    handleDeletePatient(patient._id);
                                                                }}
                                                                disabled={patientLoading}
                                                            >
                                                                <i className="ri-delete-bin-line"></i> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-12 text-center py-4">
                                                <p>No patients/addresses found. Please add a new patient to continue.</p>
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        setShowAddPatientModal(true);
                                                        setShowPatientModal(false);
                                                    }}
                                                >
                                                    Add First Patient
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowPatientModal(false)}
                                    disabled={patientLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Patient Modal */}
            {showAddPatientModal && (
                <div className="modal fade show d-block" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Patient</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleAddModalClose}
                                    disabled={patientLoading}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPatientData.name}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, name: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newPatientData.dob}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, dob: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Gender *</label>
                                        <select
                                            className="form-control"
                                            value={newPatientData.gender}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, gender: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={newPatientData.phone}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, phone: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={newPatientData.address}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, address: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPatientData.country}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, country: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPatientData.state}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, state: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPatientData.city}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, city: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">PIN Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPatientData.pinCode}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, pinCode: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Medical Problem Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={newPatientData.problemDescription}
                                            onChange={(e) => setNewPatientData(prev => ({...prev, problemDescription: e.target.value}))}
                                            placeholder="Describe any existing medical conditions..."
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => setNewPatientData(prev => ({...prev, pic: e.target.files[0]}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleAddModalClose}
                                    disabled={patientLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleAddPatient}
                                    disabled={patientLoading || !newPatientData.name || !newPatientData.dob || !newPatientData.gender}
                                >
                                    {patientLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        "Add Patient"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Patient Modal */}
            {showEditPatientModal && editingPatient && (
                <div className="modal fade show d-block" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Patient: {editingPatient.name}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleEditModalClose}
                                    disabled={patientLoading}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editPatientData.name}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, name: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editPatientData.dob} 
                                            onChange={(e) => setEditPatientData(prev => ({...prev, dob: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Gender *</label>
                                        <select
                                            className="form-control"
                                            value={editPatientData.gender}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, gender: e.target.value}))}
                                            required
                                            disabled={patientLoading}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={editPatientData.phone}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, phone: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={editPatientData.address}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, address: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editPatientData.country}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, country: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editPatientData.state}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, state: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editPatientData.city}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, city: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">PIN Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editPatientData.pinCode}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, pinCode: e.target.value}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Medical Problem Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={editPatientData.problemDescription}
                                            onChange={(e) => setEditPatientData(prev => ({...prev, problemDescription: e.target.value}))}
                                            placeholder="Describe any existing medical conditions..."
                                            disabled={patientLoading}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Profile Picture (Leave blank to keep existing)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => setEditPatientData(prev => ({...prev, pic: e.target.files[0]}))}
                                            disabled={patientLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleEditModalClose}
                                    disabled={patientLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleUpdatePatient}
                                    disabled={patientLoading || !editPatientData.name || !editPatientData.dob || !editPatientData.gender}
                                >
                                    {patientLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PatientModalsAndSelection;