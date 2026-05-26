import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../Context/Context';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const SubAdminClinicTable = () => {
  const { 
    subAdminClinic, 
    loading, 
    error, 
    getSubAdminClinic, 
    approveSubAdminClinic, 
    rejectSubAdminClinic 
  } = useContext(MyContext);
  
  const [updatingId, setUpdatingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getSubAdminClinic();
  }, []);

  // Helper to display Account Verification status
  const getAccountStatus = (status) => {
    if (status === '1') {
      return <span className="badge bg-success">Approved</span>;
    } else if (status === '2') {
      return <span className="badge bg-danger">Rejected</span>;
    }
    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  // Handle approve clinic
  const handleApprove = async (clinicId) => {
    try {
      setUpdatingId(clinicId);
      const result = await approveSubAdminClinic(clinicId);

      if (result.success) {
        toast.success('Clinic approved successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setShowApproveModal(false);
      } else {
        toast.error(`Failed to approve: ${result.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error approving clinic:", error);
      toast.error("Error approving clinic", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setUpdatingId(null);
      setSelectedClinic(null);
    }
  };

  // Handle reject clinic
  const handleReject = async () => {
    if (!selectedClinic) return;

    try {
      setUpdatingId(selectedClinic._id);
      const result = await rejectSubAdminClinic(selectedClinic._id, rejectReason);

      if (result.success) {
        toast.success('Clinic rejected successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        toast.error(`Failed to reject: ${result.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error rejecting clinic:", error);
      toast.error("Error rejecting clinic", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setUpdatingId(null);
      setSelectedClinic(null);
    }
  };

  // Open approve modal
  const openApproveModal = (clinic) => {
    setSelectedClinic(clinic);
    setShowApproveModal(true);
  };

  // Open reject modal
  const openRejectModal = (clinic) => {
    setSelectedClinic(clinic);
    setRejectReason(clinic.rejectReason || '');
    setShowRejectModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedClinic(null);
    setRejectReason('');
  };

  // Safe array check
  const clinicsArray = Array.isArray(subAdminClinic)
    ? subAdminClinic
    : subAdminClinic?.clinics || subAdminClinic?.data?.clinics || [];

  // Filter clinics based on search term
  const filteredClinics = clinicsArray.filter(clinic =>
    clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.phoneNumber?.includes(searchTerm)
  );

  // --- Conditional Rendering ---
  if (loading && clinicsArray.length === 0) {
    return (
      <div className="alert alert-info mt-4" role="alert">
        <div className="d-flex align-items-center">
          <div className="spinner-border me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>
            <h4 className="alert-heading mb-1">Loading Clinic Data</h4>
            <p className="mb-0">Please wait while we fetch the clinic information...</p>
          </div>
        </div>
      </div>
    );
  }

  

  if (!clinicsArray || clinicsArray.length === 0) {
    return (
      <div className="alert alert-warning mt-4" role="alert">
        <h4 className="alert-heading">No Clinics Found</h4>
        <p className="mb-3">No clinic details were returned from the API.</p>
        <button className="btn btn-sm btn-warning" onClick={getSubAdminClinic}>
          Retry Loading Data
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Approval</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to approve <strong>{selectedClinic?.name} - {selectedClinic?.clinicName}</strong>?</p>
                <p className="text-muted">This action will verify the clinic and allow them to access all features.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                  disabled={updatingId === selectedClinic?._id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedClinic._id)}
                  disabled={updatingId === selectedClinic?._id}
                >
                  {updatingId === selectedClinic?._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Approving...
                    </>
                  ) : (
                    'Yes, Approve'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Clinic</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <p>Rejecting: <strong>{selectedClinic?.name} - {selectedClinic?.clinicName}</strong></p>
                <div className="mb-3">
                  <label htmlFor="rejectReason" className="form-label">Rejection Reason *</label>
                  <textarea
                    className="form-control"
                    id="rejectReason"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                  disabled={updatingId === selectedClinic?._id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || updatingId === selectedClinic?._id}
                >
                  {updatingId === selectedClinic?._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>SubAdmin Clinic List</h3>
        <div className="d-flex align-items-center gap-3">
          {/* Search Input */}
          <div className="search-box">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="Search by name, clinic name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '300px' }}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
          <span className="badge bg-primary">
            {filteredClinics.length} of {clinicsArray.length} Clinics
          </span>
        </div>
      </div>

      {/* Compact Summary Statistics */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="card border-primary">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 text-primary">Total</h6>
                  <p className="card-text h4 mb-0">{clinicsArray.length}</p>
                </div>
                <div className="text-primary">
                  <i className="bi bi-hospital fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card border-success">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 text-success">Approved</h6>
                  <p className="card-text h4 mb-0 text-success">
                    {clinicsArray.filter(clinic => clinic.Accountverify === '1').length}
                  </p>
                </div>
                <div className="text-success">
                  <i className="bi bi-check-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card border-warning">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 text-warning">Pending</h6>
                  <p className="card-text h4 mb-0 text-warning">
                    {clinicsArray.filter(clinic => clinic.Accountverify === '0').length}
                  </p>
                </div>
                <div className="text-warning">
                  <i className="bi bi-clock fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card border-danger">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 text-danger">Rejected</h6>
                  <p className="card-text h4 mb-0 text-danger">
                    {clinicsArray.filter(clinic => clinic.Accountverify === '2').length}
                  </p>
                </div>
                <div className="text-danger">
                  <i className="bi bi-x-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table">
            <tr>
              <th scope="col">S No</th>
              <th scope="col">Clinic Name</th>
              <th scope="col">Contact Info</th>
              <th scope="col">Location</th>
              <th scope="col">Status</th>
              <th scope="col">Created Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClinics.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">
                    <i className="bi bi-search display-4 d-block mb-2"></i>
                    <h5>No clinics found</h5>
                    <p>No clinics match your search criteria "{searchTerm}"</p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClinics.map((clinic, index) => (
                <tr key={clinic._id || index}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    <strong>{clinic.name || 'N/A'}</strong>
                    <br />
                    <small className="text-muted">{clinic.clinicName || ''}</small>
                  </td>
                  <td>
                    <div><strong>Phone:</strong> {clinic.phoneNumber || 'N/A'}</div>
                    <div><strong>Email:</strong> {clinic.email ? clinic.email.trim() : 'N/A'}</div>
                  </td>
                  <td>
                    <div>{clinic.city || 'N/A'}, {clinic.country || 'N/A'}</div>
                    <small className="text-muted d-block" style={{ maxWidth: '150px' }}>
                      {clinic.address || ''}
                    </small>
                  </td>
                  <td>{getAccountStatus(clinic.Accountverify)}</td>
                  <td>
                    {clinic.createdAt ? new Date(clinic.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {/* Show Approve button only for pending clinics (status '0') */}
                      {clinic.Accountverify === '0' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => openApproveModal(clinic)}
                          disabled={updatingId === clinic._id}
                          title="Approve Clinic"
                        >
                          {updatingId === clinic._id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            'Approve'
                          )}
                        </button>
                      )}

                      {/* Show Reject button only for pending clinics (status '0') */}
                      {clinic.Accountverify === '0' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openRejectModal(clinic)}
                          disabled={updatingId === clinic._id}
                          title="Reject Clinic"
                        >
                          Reject
                        </button>
                      )}

                      {/* Show View button for all statuses */}
                      <Link to={`/subadmin-dashboard/clinic/${clinic._id}`}>
                        <button className="btn btn-secondary bg-opacity-25 bg-gradient btn-sm" type="button">
                          View
                        </button>
                      </Link>
                    </div>

                    {/* Show rejection reason if clinic is rejected */}
                    {clinic.rejectReason && clinic.Accountverify === '2' && (
                      <small className="text-danger d-block mt-1" title={clinic.rejectReason}>
                        <strong>Reason:</strong> {clinic.rejectReason.length > 50
                          ? `${clinic.rejectReason.substring(0, 50)}...`
                          : clinic.rejectReason}
                      </small>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubAdminClinicTable;