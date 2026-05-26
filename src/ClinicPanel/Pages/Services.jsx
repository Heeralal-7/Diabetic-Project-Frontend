import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicServices = () => {
  const { 
    addClinicServices, 
    getClinicSpecialists, 
    removeClinicSpecialist, 
    getAllSpecialists,
    clinicSpecialists, 
    allSpecialists,
    loading 
  } = useContext(MyContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [selectedSpecialists, setSelectedSpecialists] = useState([]);
  const [availableSpecialists, setAvailableSpecialists] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Base URL for images - adjust according to your backend
  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const IMAGE_BASE_PATH = `${BASE_URL}/uploads/specialists/`;

  // Function to get complete image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return '/default-specialist.jpg'; // fallback image
    return `${IMAGE_BASE_PATH}${imageName}`;
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      await getClinicSpecialists();
      const allSpecsData = await getAllSpecialists();
      setDataLoaded(true);
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error('Failed to load data');
      setDataLoaded(true);
    }
  }, [getClinicSpecialists, getAllSpecialists]);

  // Sirf first render pe data fetch karo
  useEffect(() => {
    if (!dataLoaded) {
      fetchData();
    }
  }, []);

  // Available specialists calculate karo
  useEffect(() => {    
    if (allSpecialists && Array.isArray(allSpecialists) && clinicSpecialists && Array.isArray(clinicSpecialists)) {
      const currentSpecialistIds = clinicSpecialists
        .filter(spec => spec && spec._id)
        .map(spec => spec._id);
      
      const selectedSpecialistIds = selectedSpecialists
        .filter(spec => spec && spec._id)
        .map(spec => spec._id);
      
      const filtered = allSpecialists.filter(spec => {
        if (!spec || !spec._id) return false;
        
        const isAlreadyAdded = currentSpecialistIds.includes(spec._id);
        const isSelected = selectedSpecialistIds.includes(spec._id);
        
        return !isAlreadyAdded && !isSelected;
      });
      
      setAvailableSpecialists(filtered);
    } else {
      setAvailableSpecialists([]);
    }
  }, [allSpecialists, clinicSpecialists, selectedSpecialists]);

  // Add specialist to selected list
  const handleAddSpecialist = () => {
    if (!selectedSpecialistId) {
      toast.error('Please select a specialist');
      return;
    }

    const specialistToAdd = allSpecialists.find(spec => spec && spec._id === selectedSpecialistId);
    if (!specialistToAdd) {
      toast.error('Selected specialist not found');
      return;
    }

    // Check if already selected
    if (selectedSpecialists.find(spec => spec && spec._id === selectedSpecialistId)) {
      toast.error('This specialist is already in the list');
      return;
    }

    setSelectedSpecialists(prev => [...prev, specialistToAdd]);
    setSelectedSpecialistId('');
    toast.success(`${specialistToAdd.specialists || specialistToAdd.name || 'Specialist'} added to list`);
  };

  // Remove specialist from selected list
  const handleRemoveSelected = (specialistId) => {
    setSelectedSpecialists(prev => prev.filter(spec => spec && spec._id !== specialistId));
  };

  // Save selected specialists
  const handleSaveSpecialists = async () => {
    if (selectedSpecialists.length === 0) {
      toast.error('Please select at least one specialist');
      return;
    }

    try {
      const specialistIds = selectedSpecialists
        .filter(spec => spec && spec._id)
        .map(spec => spec._id);
      
      const response = await addClinicServices(specialistIds);
      
      if (response.success) {
        toast.success(`${selectedSpecialists.length} specialist(s) added successfully`);
        setShowAddModal(false);
        setSelectedSpecialists([]);
        setSelectedSpecialistId('');
        // Refresh clinic specialists
        await getClinicSpecialists();
      }
    } catch (error) {
      if (error.response?.data?.duplicateIds) {
        toast.error('Some specialists are already added to your clinic');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add specialists');
      }
    }
  };

  // Remove existing specialist from clinic
  const handleRemoveSpecialist = async (specialistId) => {
    if (!window.confirm('Are you sure you want to remove this specialist?')) {
      return;
    }

    try {
      await removeClinicSpecialist(specialistId);
      toast.success('Specialist removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove specialist');
    }
  };

  // Refresh data function
  const handleRefresh = () => {
    setDataLoaded(false);
    setSelectedSpecialists([]);
    setSelectedSpecialistId('');
  };

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 text-primary">Clinic Services & Specialists</h1>
          <p className="text-muted mb-0">Manage your clinic's medical specialties and services</p>
        </div>
        <div>
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add New Specialists
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="card-title">
                    {clinicSpecialists && Array.isArray(clinicSpecialists) ? clinicSpecialists.length : 0}
                  </h4>
                  <p className="card-text mb-0">Total Specialists</p>
                </div>
                <i className="bi bi-heart-pulse display-6 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="card-title">
                    {clinicSpecialists && Array.isArray(clinicSpecialists) ? clinicSpecialists.length : 0}
                  </h4>
                  <p className="card-text mb-0">Active Services</p>
                </div>
                <i className="bi bi-check-circle display-6 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="card-title">
                    {allSpecialists && Array.isArray(allSpecialists) ? allSpecialists.length : 0}
                  </h4>
                  <p className="card-text mb-0">Available Specialties</p>
                </div>
                <i className="bi bi-list-ul display-6 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialists List */}
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-check me-2"></i>
            Current Specialists & Services
          </h5>
          <span className="badge bg-primary">
            {clinicSpecialists && Array.isArray(clinicSpecialists) ? clinicSpecialists.length : 0} items
          </span>
        </div>
        <div className="card-body">
          {loading && !dataLoaded ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading specialists...</p>
            </div>
          ) : clinicSpecialists && Array.isArray(clinicSpecialists) && clinicSpecialists.length > 0 ? (
            <div className="row">
              {clinicSpecialists.map((specialist) => (
                specialist && (
                  <div key={specialist._id} className="col-md-6 col-lg-3 mb-4">
                    <div className="card h-100 border specialist-card">
                      {/* Specialist Image */}
                      <div className="specialist-image-container">
                        <img 
                          src={getImageUrl(specialist.specialistImage)} 
                          alt={specialist.specialists || 'Specialist'}
                          className="specialist-image"
                          onError={(e) => {
                            e.target.src = '/default-specialist.jpg';
                          }}
                        />
                      </div>
                      
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="card-title text-capitalize mb-1">
                            {specialist.specialists || specialist.name || 'Specialist'}
                          </h6>
                          <span className="badge bg-success">Active</span>
                        </div>
                        <p className="card-text small text-muted mb-2">
                          Added on {specialist.createdAt ? new Date(specialist.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent border-top-0">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveSpecialist(specialist._id)}
                          disabled={loading}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inboxes display-1 text-muted"></i>
              <h4 className="text-muted mt-3">No Specialists Added</h4>
              <p className="text-muted">Start by adding your clinic's medical specialties and services.</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add First Specialist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Specialists Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Specialists
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSpecialists([]);
                    setSelectedSpecialistId('');
                  }}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Specialist Selection Section */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Select Specialist</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={selectedSpecialistId}
                      onChange={(e) => setSelectedSpecialistId(e.target.value)}
                      disabled={loading || availableSpecialists.length === 0}
                    >
                      <option value="">Choose a specialist...</option>
                      {availableSpecialists && Array.isArray(availableSpecialists) && availableSpecialists.map(specialist => (
                        specialist && (
                          <option key={specialist._id} value={specialist._id}>
                            {specialist.specialists || specialist.name || 'Unnamed Specialist'}
                          </option>
                        )
                      ))}
                    </select>
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleAddSpecialist}
                      disabled={loading || !selectedSpecialistId}
                    >
                      <i className="bi bi-plus-lg"></i> Add
                    </button>
                  </div>
                  <small className="text-muted">
                    {availableSpecialists.length === 0 
                      ? 'All specialists have been added to your clinic'
                      : `Select from ${availableSpecialists.length} available specialists`
                    }
                  </small>
                </div>

                {/* Selected Specialists List */}
                {selectedSpecialists.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Selected Specialists ({selectedSpecialists.length})
                    </label>
                    <div className="border rounded">
                      <div className="list-group list-group-flush">
                        {selectedSpecialists.map((specialist) => (
                          specialist && (
                            <div key={specialist._id} className="list-group-item d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                {/* Image in selected list */}
                                <img 
                                  src={getImageUrl(specialist.specialistImage)} 
                                  alt={specialist.specialists}
                                  className="rounded me-3"
                                  style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                  onError={(e) => {
                                    e.target.src = '/default-specialist.jpg';
                                  }}
                                />
                                <span className="text-capitalize fw-medium">
                                  {specialist.specialists || specialist.name || 'Specialist'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveSelected(specialist._id)}
                                disabled={loading}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSpecialists([]);
                    setSelectedSpecialistId('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveSpecialists}
                  disabled={loading || selectedSpecialists.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Add {selectedSpecialists.length} Specialist(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS styles for images */}
      <style jsx>{`
        .specialist-image-container {
          height: 150px;
          overflow: hidden;
          border-radius: 8px 8px 0 0;
        }
        .specialist-image {
          width: 600%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .specialist-card:hover .specialist-image {
          transform: scale(1.05);
        }
        .specialist-card { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);, width: 80%;  }
      `}</style>
    </div>
  );
};

export default ClinicServices;