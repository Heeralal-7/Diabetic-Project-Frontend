import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../../Context/Context";
import { useParams } from 'react-router-dom';

const ViewDoctor = () => {
  const {
    getDoctorDocuments,
    getDoctors,
    approveDoctorDocument,
    rejectDoctorDocument,
    getDoctorCoupon,
    doctorCoupon,
    doctor,
    loading,
    toast
  } = useContext(MyContext);

  const { id: doctorIdFromParams } = useParams();

  // State management
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Documents");
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorIdFromParams || null);
  const [documents, setDocuments] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectionType, setRejectionType] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const LIMIT = 10;

  // Image zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Fetch doctors list
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getDoctors();
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      }
    };
    fetchData();
  }, []);

  // Set initial selected doctor
  useEffect(() => {
    if (doctor && doctor.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorIdFromParams || doctor[0]._id);
    }
  }, [doctor, doctorIdFromParams]);

  // Fetch documents and coupons when selected doctor changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedDoctorId) {
        try {
          const documentData = await getDoctorDocuments(selectedDoctorId);
          if (documentData?.success) {
            setDocuments(documentData.data || null);
          } else {
            toast.error(documentData?.message || "Failed to load documents");
          }
          
          if (activeTab === "Coupons") {
            await getDoctorCoupon(selectedDoctorId);
          }
        } catch (error) {
          console.error("Error fetching doctor data:", error);
          toast.error("Failed to load doctor data");
        }
      }
    };
    fetchData();
  }, [selectedDoctorId, activeTab]);

  // Handle individual document approval
  const handleApproveDocument = async (documentId, statusField) => {
    if (!documentId || !statusField) {
      toast.error("Invalid document or field");
      return;
    }

    try {
      const response = await approveDoctorDocument(documentId, statusField);
      
      if (response?.success) {
        // Refresh documents
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          if (updatedData?.success) {
            setDocuments(updatedData.data || null);
          }
        }
      }
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error(error.message || "Failed to approve document");
    }
  };

  // Handle individual document rejection
  const handleRejectDocument = async (documentId, statusField, reason) => {
    if (!documentId || !statusField) {
      toast.error("Invalid document or field");
      return;
    }

    try {
      const response = await rejectDoctorDocument(documentId, statusField, reason);
      
      if (response?.success) {
        // Refresh documents
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          if (updatedData?.success) {
            setDocuments(updatedData.data || null);
          }
        }
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error(error.message || "Failed to reject document");
    }
  };

  // Handle approve all documents
  const handleApproveAll = async () => {
    try {
      setIsProcessing(true);
      if (!documents?._id) {
        toast.error("No documents to approve");
        return;
      }

      const documentId = documents._id;
      const fieldsToApprove = [
        "registrationNoStatus",
        "licenceNoStatus", 
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus",
        "doctorCertificateStatus"
      ];

      const results = await Promise.all(
        fieldsToApprove.map(field => 
          approveDoctorDocument(documentId, field)
        )
      );

      // Check results properly
      const successfulApprovals = results.filter(r => r && r.success);
      const failedApprovals = results.filter(r => !r || !r.success);

      if (failedApprovals.length === 0) {
        toast.success("All documents approved successfully");
      } else if (successfulApprovals.length === 0) {
        toast.error("Failed to approve all documents");
      } else {
        toast.warning(
          `Approved ${successfulApprovals.length} documents, failed to approve ${failedApprovals.length}`
        );
      }

      // Refresh documents
      if (selectedDoctorId) {
        const updatedData = await getDoctorDocuments(selectedDoctorId);
        if (updatedData?.success) {
          setDocuments(updatedData.data || null);
        }
      }
    } catch (error) {
      console.error('Error in approve all:', error);
      toast.error(error.message || "An unexpected error occurred during approval");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject all documents
  const handleRejectAll = async (reason) => {
    try {
      setIsProcessing(true);
      if (!documents?._id) {
        toast.error("No documents to reject");
        return;
      }

      if (!reason?.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }

      const documentId = documents._id;
      const fieldsToReject = [
        "registrationNoStatus",
        "licenceNoStatus", 
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus",
        "doctorCertificateStatus"
      ];

      const results = await Promise.all(
        fieldsToReject.map(field => 
          rejectDoctorDocument(documentId, field, reason)
      ));

      // Check results properly
      const successfulRejections = results.filter(r => r && r.success);
      const failedRejections = results.filter(r => !r || !r.success);

      if (failedRejections.length === 0) {
        toast.success("All documents rejected successfully");
      } else if (successfulRejections.length === 0) {
        toast.error("Failed to reject all documents");
      } else {
        toast.warning(
          `Rejected ${successfulRejections.length} documents, failed to reject ${failedRejections.length}`
        );
      }

      // Refresh documents
      if (selectedDoctorId) {
        const updatedData = await getDoctorDocuments(selectedDoctorId);
        if (updatedData?.success) {
          setDocuments(updatedData.data || null);
        }
      }
    } catch (error) {
      console.error('Error in reject all:', error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal handlers
  const openRejectModal = (type, target = null) => {
    setRejectionType(type);
    setRejectionTarget(target);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionType(null);
    setRejectionTarget(null);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      if (rejectionType === 'single' && rejectionTarget) {
        await handleRejectDocument(documents._id, rejectionTarget, rejectReason);
      } else if (rejectionType === 'all') {
        await handleRejectAll(rejectReason);
      }
      closeRejectModal();
    } catch (error) {
      console.error("Error during rejection:", error);
      toast.error("Failed to process rejection");
    }
  };

  // Document types for doctor
  const documentTypes = [
    { 
      name: "Registration Certificate", 
      key: "registrationNo", 
      field: "registrationNo",
      statusField: "registrationNoStatus" 
    },
    { 
      name: "Medical License", 
      key: "licenceNo", 
      field: "licenceNo",
      statusField: "licenceNoStatus" 
    },
    { 
      name: "Accreditation Certificate", 
      key: "accreditation", 
      field: "accreditation",
      statusField: "accreditationStatus" 
    },
    { 
      name: "Aadhar Card", 
      key: "aadharCard", 
      field: "aadharCard",
      statusField: "aadharCardStatus" 
    },
    { 
      name: "Pan Card", 
      key: "panCard", 
      field: "panCard",
      statusField: "panCardStatus" 
    },
    { 
      name: "Driving License", 
      key: "drivingLicence", 
      field: "drivingLicence",
      statusField: "drivingLicenceStatus" 
    },
    { 
      name: "Doctor Certificate", 
      key: "doctorCertificate", 
      field: "doctorCertificate",
      statusField: "doctorCertificateStatus" 
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }
      const date = new Date(dateString);
      return isNaN(date) ? dateString : date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Add doctor selector dropdown
  const renderDoctorSelector = () => (
    <div className="mb-4">
      <label htmlFor="doctorSelect" className="form-label">Select Doctor:</label>
      <select 
        id="doctorSelect"
        className="form-select"
        value={selectedDoctorId || ""}
        onChange={(e) => setSelectedDoctorId(e.target.value)}
        disabled={loading || isProcessing}
      >
        <option value="">Select a doctor</option>
        {doctor?.map(doc => (
          <option key={doc._id} value={doc._id}>
            {doc.name || `Doctor ${doc._id}`}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="container-fluid px-0">
      {renderDoctorSelector()}
      
      <ul
        className="nav nav-pills flex-column flex-sm-row gap-2 navAndTabs1 mb-3"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Coupons" ? "active" : ""}`}
            id="userCoupons-tab"
            data-bs-toggle="pill"
            data-bs-target="#userCoupons"
            type="button"
            role="tab"
            aria-controls="userCoupons"
            aria-selected={activeTab === "Coupons"}
            onClick={() => setActiveTab("Coupons")}
            disabled={loading || isProcessing}
          >
            Coupons
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Documents" ? "active" : ""}`}
            id="userDocument-tab"
            data-bs-toggle="pill"
            data-bs-target="#userDocument"
            type="button"
            role="tab"
            aria-controls="userDocument"
            aria-selected={activeTab === "Documents"}
            onClick={() => setActiveTab("Documents")}
            disabled={loading || isProcessing}
          >
            Documents
          </button>
        </li>
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {/* Coupons Tab */}
        <div
          className={`tab-pane fade ${activeTab === "Coupons" ? "show active" : ""}`}
          id="userCoupons"
          role="tabpanel"
          aria-labelledby="userCoupons-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  disabled={loading || isProcessing}
                />
              </div>
            </div>
            <h1 className="text-center flex-grow-1 my-4 fs-2 fs-lg-1">
              Doctor Coupons
            </h1>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Coupon Code</th>
                    <th scope="col">Description</th>
                    <th scope="col">Discount</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">Expire Date</th>
                    <th scope="col">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading || isProcessing) && !doctorCoupon ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctorCoupon?.length > 0 ? (
                    doctorCoupon.map((coupon, index) => (
                      <tr key={coupon._id || index}>
                        <th scope="row">{(page - 1) * LIMIT + index + 1}</th>
                        <td>{coupon.couponCode || "N/A"}</td>
                        <td>{coupon.description || "N/A"}</td>
                        <td>
                          {coupon.percentageDiscount 
                            ? `${coupon.percentageDiscount}%` 
                            : coupon.fixedAmountDiscount 
                              ? `$${coupon.fixedAmountDiscount}` 
                              : "N/A"}
                        </td>
                        <td>{formatDate(coupon.startDate)}</td>
                        <td>{formatDate(coupon.expireDate)}</td>
                        <td>{coupon.limitRedeem || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No coupons available for this doctor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Documents Tab */}
        <div
          className={`tab-pane fade ${activeTab === "Documents" ? "show active" : ""}`}
          id="userDocument"
          role="tabpanel"
          aria-labelledby="userDocument-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  disabled={loading || isProcessing}
                />
              </div>
              <h1 className="text-center w-60">
                Doctor Documents
              </h1>
            </div>
           
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
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
                  {(loading || isProcessing) && !documents ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : documents ? (
                    documentTypes.map((docType, index) => {
                      const status = documents[docType.statusField];
                      let statusBadge;
                      
                      if (status === "3") {
                        statusBadge = <span className="badge bg-success">Approved</span>;
                      } else if (status === "2") {
                        statusBadge = <span className="badge bg-danger">Rejected</span>;
                      } else {
                        statusBadge = <span className="badge bg-warning text-dark">Pending</span>;
                      }

                      const documentImage = documents[docType.field];
                      const imageUrl = documentImage ? 
                        (Array.isArray(documentImage) ? 
                          `${process.env.REACT_APP_API_URL}${documentImage[0]}` : 
                          `${process.env.REACT_APP_API_URL}${documentImage}`) : 
                        null;

                      return (
                        <tr key={`${docType.key}-${index}`} className={index % 2 === 0 ? "table-light" : ""}>
                          <th scope="row">{index + 1}</th>
                          <td>{docType.name}</td>
                          <td>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={docType.name}
                                height={40}
                                width={40}
                                className="rounded cursor-pointer"
                                style={{ objectFit: "cover" }}
                                onClick={() => {
                                  setSelectedImage(imageUrl);
                                  setShowImageModal(true);
                                  setZoomLevel(1);
                                }}
                              />
                            ) : (
                              <span className="text-muted">No image</span>
                            )}
                          </td>
                          <td>
                            {statusBadge}
                            {status === "2" && documents.rejectReasons?.[docType.statusField] && (
                              <div className="text-danger small mt-1">
                                Reason: {documents.rejectReasons[docType.statusField]}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApproveDocument(documents._id, docType.statusField)}
                                disabled={status === "3" || loading || isProcessing}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openRejectModal('single', docType.statusField)}
                                disabled={status === "2" || loading || isProcessing}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No documents found for this doctor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bulk Action Buttons */}
            {documents && (
              <div className="d-flex gap-3 mt-3">
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={handleApproveAll}
                  disabled={loading || isProcessing}
                >
                  <i className="bi bi-check-circle"></i>
                  {isProcessing ? "Processing..." : "Approve All"}
                </button>
                <button
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={() => openRejectModal('all')}
                  disabled={loading || isProcessing}
                >
                  <i className="bi bi-x-circle"></i>
                  {isProcessing ? "Processing..." : "Reject All"}
                </button>
              </div>
            )}
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
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  Rejection Reason
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRejectModal}
                  aria-label="Close"
                  disabled={isProcessing}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  {rejectionType === 'all'
                    ? 'Please provide a reason for rejecting all documents:'
                    : 'Please provide a reason for rejecting this document:'
                  }
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
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || isProcessing}
                >
                  <i className="fas fa-times me-1"></i>
                  {isProcessing ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <div className="zoom-controls btn-group">
                  <button 
                    className="btn btn-dark"
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <i className="fas fa-search-plus"></i>
                  </button>
                  <button 
                    className="btn btn-dark"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <i className="fas fa-search-minus"></i>
                  </button>
                  <button 
                    className="btn btn-dark"
                    onClick={handleZoomReset}
                    title="Reset Zoom"
                  >
                    <i className="fas fa-sync-alt"></i>
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
                  className="image-container"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    cursor: zoomLevel > 1 ? 'grab' : 'default'
                  }}
                >
                  <img 
                    src={selectedImage} 
                    alt="Document" 
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.3s ease',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    className="img-fluid"
                    onMouseDown={e => {
                      if (zoomLevel <= 1) return;
                      const startX = e.pageX;
                      const startY = e.pageY;
                      const startScrollLeft = e.currentTarget.parentElement.scrollLeft;
                      const startScrollTop = e.currentTarget.parentElement.scrollTop;
                      
                      const handleMouseMove = (e) => {
                        const dx = e.pageX - startX;
                        const dy = e.pageY - startY;
                        e.currentTarget.parentElement.scrollLeft = startScrollLeft - dx;
                        e.currentTarget.parentElement.scrollTop = startScrollTop - dy;
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <a 
                  href={selectedImage} 
                  download 
                  className="btn btn-primary"
                >
                  <i className="fas fa-download me-2"></i>
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

export default ViewDoctor;