import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MyContext } from "../../../Context/Context"; // Adjust path as necessary
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
// Assume URL is defined or available via process.env
const URL = process.env.REACT_APP_API_URL || "";
 
const ViewAdminClinic = () => {
  const { clinicId } = useParams(); // Get clinicId from URL
 
  const {
    clinicDocuments,
    documentsLoading,
    documentsError,
    getClinicDocument,
    approveDocumentField,
    rejectDocumentField
  } = useContext(MyContext);
 
 
  const [activeTab, setActiveTab] = useState("Documents");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedField, setSelectedField] = useState("");
  const [updatingField, setUpdatingField] = useState(null);
 
 
  // Fetch documents when component mounts or clinicId changes
  useEffect(() => {
    if (clinicId) {
      getClinicDocument(clinicId);
    }
  }, [clinicId]); // Added getClinicDocument to dependency array
 
  // --- Image Zoom Controls ---
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };
 
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
 
  const handleZoomReset = () => {
    setZoomLevel(1);
  };
 
  // --- Rejection Modal Handlers ---
  const openRejectModal = (field) => {
    setSelectedField(field);
    setShowRejectModal(true);
    // Populate reason if one exists for this field (assuming rejectReasons structure from API response)
    setRejectReason(clinicDocuments?.rejectReasons?.[field] || "");
  };
 
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedField("");
  };
 
  // --- API Call Handlers ---
  const handleApprove = async (field) => {
    if (clinicDocuments[field] === "1") return; // Already approved
   
    try {
      setUpdatingField(field);
      const result = await approveDocumentField(clinicId, field);
     
      if (result.success) {
        toast.success(result.message, { position: "top-right", autoClose: 3000 });
        // NOTE: setClinicDocuments update is handled inside approveDocumentField
      } else {
        toast.error(result.message, { position: "top-right", autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error approving document:", error);
      // Fallback toast error (though result.message should handle most cases)
      toast.error("An unexpected error occurred during approval.", { position: "top-right", autoClose: 3000 });
    } finally {
      setUpdatingField(null);
    }
  };
 
  const handleReject = async () => {
    if (!selectedField || !rejectReason.trim()) {
       toast.error("Please provide a rejection reason.", { position: "top-right", autoClose: 3000 });
       return;
    }
   
    try {
      setUpdatingField(selectedField);
      // Passed all three arguments: clinicId, field, rejectReason
      const result = await rejectDocumentField(clinicId, selectedField, rejectReason);
     
      if (result.success) {
        toast.success(result.message, { position: "top-right", autoClose: 3000 });
        closeRejectModal(); // Close modal and reset state on success
      } else {
        toast.error(result.message, { position: "top-right", autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      // Fallback toast error
      toast.error("An unexpected error occurred during rejection.", { position: "top-right", autoClose: 3000 });
    } finally {
      setUpdatingField(null);
    }
  };
 
  // --- Helper Functions ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "1": // Status '1' from Approve API
        return <span className="badge bg-success">Approved</span>;
      case "2": // Status '2' from Reject API
        return <span className="badge bg-danger">Rejected</span>;
      default: // Status '0' or anything else
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };
 
  const getImageUrl = (field) => {
    if (!clinicDocuments) return null;
   
    // Mapping status field keys to the actual image path keys in the Document response
    const fieldMap = {
      registrationNoStatus: clinicDocuments.registrationNo,
      licenceNoStatus: clinicDocuments.licenceNo,
      accreditationStatus: clinicDocuments.accreditation,
      aadharCardStatus: clinicDocuments.aadharCard?.[0], // Aadhar/Pan/DrivingLicence are arrays
      panCardStatus: clinicDocuments.panCard?.[0],
      drivingLicenceStatus: clinicDocuments.drivingLicence?.[0],
      doctorCertificateStatus: clinicDocuments.doctorCertificate
    };
 
    // The stored image path might start with a slash, which is fine for img src if the base URL is correct.
    return fieldMap[field];
  };
 
  const openImageModal = (field) => {
    const imageUrl = getImageUrl(field);
    if (imageUrl) {
      // Prepend base URL if the image path is relative (common in backend storage)
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${URL}${imageUrl}`;
      setSelectedImage(fullUrl);
      setShowImageModal(true);
      setZoomLevel(1);
    } else {
      toast.info("No image available for this document", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
 
  const documentTypes = [
    {
      name: "Registration Certificate",
      statusField: "registrationNoStatus",
      imageField: "registrationNo"
    },
    {
      name: "Medical License",
      statusField: "licenceNoStatus",
      imageField: "licenceNo"
    },
    {
      name: "Accreditation Certificate",
      statusField: "accreditationStatus",
      imageField: "accreditation"
    },
    {
      name: "Aadhar Card",
      statusField: "aadharCardStatus",
      imageField: "aadharCard"
    },
    {
      name: "Pan Card",
      statusField: "panCardStatus",
      imageField: "panCard"
    },
    {
      name: "Driving License",
      statusField: "drivingLicenceStatus",
      imageField: "drivingLicence"
    },
    {
      name: "Doctor Certificate",
      statusField: "doctorCertificateStatus",
      imageField: "doctorCertificate"
    }
  ];
 
  // --- Render Logic ---
  // Loading state
  if (documentsLoading) {
    return (
      <div className="container-fluid px-0">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading documents...</span>
        </div>
      </div>
    );
  }
 
  // Error state
  if (documentsError) {
    return (
      <div className="container-fluid px-0">
        <div className="alert alert-danger m-3">
          <h4 className="alert-heading">Error Loading Documents</h4>
          <p>{documentsError}</p>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => clinicId && getClinicDocument(clinicId)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
 
  // No documents state
  if (!clinicDocuments) {
    return (
      <div className="container-fluid px-0">
        <div className="alert alert-warning m-3">
          <h4 className="alert-heading">No Documents Found</h4>
          <p>No documents available for this clinic.</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="container-fluid px-0">
      {/* Tabs Navigation */}
      <ul
        className="nav nav-pills flex-column flex-sm-row gap-2 mb-3"
        style={{ backgroundColor: '#f8f9fa', padding: '0.5rem', borderRadius: '0.5rem' }}
        role="tablist"
      >
        
   <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Documents" ? "active" : ""}`}
            type="button"
            role="tab"
            onClick={() => setActiveTab("Documents")}
          >
            Documents
          </button>
        </li>
      </ul>
 
      <div className="tab-content">

 
        {/* Documents Tab */}
        <div
          className={`tab-pane fade ${activeTab === "Documents" ? "show active" : ""}`}
          role="tabpanel"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
              <h1 className="text-center flex-grow-1 fs-2">
                Clinic Documents
              </h1>
            </div>
           
            <div style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead className="table-light">
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Document Name</th>
                    <th scope="col">Document Image</th>
                    <th scope="col">Status</th>
                    <th scope="col">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.map((docType, index) => {
                    const currentStatus = clinicDocuments[docType.statusField];
                    const hasImage = getImageUrl(docType.statusField);
 
                    return (
                        <tr key={index} className={index % 2 === 0 ? "table-light" : ""}>
                        <th scope="row">{index + 1}</th>
                        <td>{docType.name}</td>
                        <td>
                            <div
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: hasImage ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => openImageModal(docType.statusField)}
                            title={hasImage ? "Click to view image" : "No image available"}
                            >
   <i
                                className="bi bi-file-earmark-image"
                                style={{
                                fontSize: '1.5rem',
                                color: hasImage ? '#6c757d' : '#ced4da'
                                }}
                            ></i>
                            </div>
                        </td>
                        <td>
                            {getStatusBadge(currentStatus)}
                            {/* Display reject reason if status is '2' (Rejected) */}
                            {currentStatus === "2" && clinicDocuments.rejectReasons?.[docType.statusField] && (
                            <div className="mt-1">
                                <small className="text-danger">
                                <strong>Reason:</strong> {clinicDocuments.rejectReasons[docType.statusField]}
                                </small>
                            </div>
                            )}
                        </td>
                        <td>
                            <div className="d-flex gap-2">
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApprove(docType.statusField)}
                                disabled={updatingField === docType.statusField || currentStatus === "1"}
                                title={currentStatus === "1" ? "Already Approved" : ""}
                            >
                                {updatingField === docType.statusField ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                'Approve'
                                )}
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openRejectModal(docType.statusField)}
                                disabled={updatingField === docType.statusField || currentStatus === "2"}
                                title={currentStatus === "2" ? "Already Rejected" : ""}
                            >
                                Reject
                            </button>
                            </div>
                        </td>
                        </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
 
      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Rejection Reason - {documentTypes.find(doc => doc.statusField === selectedField)?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRejectModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  Please provide a reason for rejection:
                </p>
                <div className="form-group">
                  <label htmlFor="rejectReason" className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="rejectReason"
                    className="form-control"
                    rows="4"
                    placeholder="Enter the reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                  disabled={updatingField === selectedField}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || updatingField === selectedField}
                >
                  {updatingField === selectedField ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-1"></i>
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Image View Modal */}
      {showImageModal && selectedImage && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <div className="btn-group">
                  <button
                    className="btn btn-dark"
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <i className="bi bi-zoom-in"></i>
                  </button>
                  <button
                    className="btn btn-dark"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <i className="bi bi-zoom-out"></i>
                  </button>
                  <button
                    className="btn btn-dark"
                    onClick={handleZoomReset}
                    title="Reset Zoom"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowImageModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body d-flex justify-content-center align-items-center">
                <div
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    cursor: zoomLevel > 1 ? 'grab' : 'default',
                    backgroundColor: '#fff',
                    padding: '2rem',
                    borderRadius: '0.5rem'
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Document"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.3s ease',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <a
                  href={selectedImage}
                  download
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ViewAdminClinic;
 