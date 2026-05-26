import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../../Context/Context";
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

const ViewDoctorSubadmin = () => {
  const {
    doctors,
    doctorsLoading,
    doctorDetails,
    doctorDetailsLoading,
    doctorDocuments,
    doctorDocumentsLoading,
    doctorDocumentsError,
    getDoctorsSubadmin: getDoctors,
    getDoctorById,
    getDoctorDocumentsSubadmin: getDoctorDocuments,
    // --- Coupon API Integration for Subadmin ---
    getDoctorCoupon:getDoctorCouponSubadmin,  // Function to fetch doctor's coupons
    doctorCoupon:doctorCoupons,            // State to hold doctor's coupons
    doctorCouponsLoading,     // Loading state for coupons
    // ------------------------------------------
    approveDocumentFieldSubadmin: approveDocumentField,
    rejectDocumentFieldSubadmin: rejectDocumentField,
    clearErrors
  } = useContext(MyContext);

  const { id: doctorIdFromParams } = useParams();

  // State management
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Documents"); // Initial active tab changed to Documents for better UX flow
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorIdFromParams || null);
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
        await getDoctors({
          page: 1,
          limit: 100
        });
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      }
    };
    fetchData();
  }, []);

  // Set initial selected doctor and fetch details
  useEffect(() => {
    if (doctors && doctors.length > 0 && !selectedDoctorId) {
      const doctorId = doctorIdFromParams || doctors[0]._id;
      setSelectedDoctorId(doctorId);
      getDoctorById(doctorId);
    } else if (selectedDoctorId) {
      // Ensure details are fetched if selectedDoctorId is already set (e.g., from params)
      getDoctorById(selectedDoctorId);
    }
  }, [doctors, doctorIdFromParams, selectedDoctorId]); // Added selectedDoctorId dependency

  // Fetch documents/coupons when selected doctor or active tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedDoctorId) {
        try {
          if (activeTab === "Documents") {
            await getDoctorDocuments(selectedDoctorId);
          } else if (activeTab === "Coupons") {
            // Fetch coupons only when the Coupons tab is active
            await getDoctorCouponSubadmin(selectedDoctorId);
          }
        } catch (error) {
          console.error(`Error fetching doctor ${activeTab.toLowerCase()}:`, error);
          toast.error(`Failed to load doctor ${activeTab.toLowerCase()}`);
        }
      }
    };
    fetchData();
  }, [selectedDoctorId, activeTab]); // Added activeTab dependency

  // Handle individual document approval
  const handleApproveDocument = async (documentId, statusField) => {
    if (!documentId || !statusField) {
      toast.error("Invalid document or field");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await approveDocumentField(selectedDoctorId, statusField);

      if (response?.success) {
        toast.success("Document approved successfully");
        // Refresh documents
        await getDoctorDocuments(selectedDoctorId);
      } else {
        toast.error(response?.message || "Failed to approve document");
      }
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error(error.message || "Failed to approve document");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle individual document rejection
  const handleRejectDocument = async (documentId, statusField, reason) => {
    if (!documentId || !statusField) {
      toast.error("Invalid document or field");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await rejectDocumentField(selectedDoctorId, statusField, reason);

      if (response?.success) {
        toast.success("Document rejected successfully");
        // Refresh documents
        await getDoctorDocuments(selectedDoctorId);
      } else {
        toast.error(response?.message || "Failed to reject document");
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error(error.message || "Failed to reject document");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle approve all documents
  const handleApproveAll = async () => {
    try {
      setIsProcessing(true);
      if (!doctorDocuments?._id) {
        toast.error("No documents to approve");
        return;
      }

      const fieldsToApprove = [
        "registrationNoStatus",
        "licenceNoStatus",
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus",
        "doctorCertificateStatus"
      ];

      let successfulApprovals = 0;
      let failedApprovals = 0;

      for (const field of fieldsToApprove) {
        try {
          const response = await approveDocumentField(selectedDoctorId, field);
          if (response?.success) {
            successfulApprovals++;
          } else {
            failedApprovals++;
          }
        } catch (error) {
          failedApprovals++;
        }
      }

      if (failedApprovals === 0) {
        toast.success("All documents approved successfully");
      } else if (successfulApprovals === 0) {
        toast.error("Failed to approve all documents");
      } else {
        toast.warning(
          `Approved ${successfulApprovals} documents, failed to approve ${failedApprovals}`
        );
      }

      // Refresh documents
      await getDoctorDocuments(selectedDoctorId);
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
      if (!doctorDocuments?._id) {
        toast.error("No documents to reject");
        return;
      }

      if (!reason?.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }

      const fieldsToReject = [
        "registrationNoStatus",
        "licenceNoStatus",
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus",
        "doctorCertificateStatus"
      ];

      let successfulRejections = 0;
      let failedRejections = 0;

      for (const field of fieldsToReject) {
        try {
          const response = await rejectDocumentField(selectedDoctorId, field, reason);
          if (response?.success) {
            successfulRejections++;
          } else {
            failedRejections++;
          }
        } catch (error) {
          failedRejections++;
        }
      }

      if (failedRejections === 0) {
        toast.success("All documents rejected successfully");
      } else if (successfulRejections === 0) {
        toast.error("Failed to reject all documents");
      } else {
        toast.warning(
          `Rejected ${successfulRejections} documents, failed to reject ${failedRejections}`
        );
      }

      // Refresh documents
      await getDoctorDocuments(selectedDoctorId);
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
        await handleRejectDocument(doctorDocuments._id, rejectionTarget, rejectReason);
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
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
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
        onChange={(e) => {
          setSelectedDoctorId(e.target.value);
          getDoctorById(e.target.value);
          // When doctor changes, also fetch documents/coupons for the new doctor
          if (activeTab === "Documents") {
            getDoctorDocuments(e.target.value);
          } else if (activeTab === "Coupons") {
            getDoctorCouponSubadmin(e.target.value);
          }
        }}
        disabled={doctorsLoading || isProcessing}
      >
        <option value="">Select a doctor</option>
        {doctors?.map(doc => (
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
            disabled={doctorsLoading || isProcessing}
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
            disabled={doctorsLoading || isProcessing}
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
                  disabled={doctorCouponsLoading || isProcessing}
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
                  {(doctorCouponsLoading || isProcessing) ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctorCoupons?.length > 0 ? (
                    doctorCoupons.map((coupon, index) => (
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
                  disabled={doctorsLoading || isProcessing}
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
                  {(doctorDocumentsLoading || isProcessing) && !doctorDocuments ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctorDocumentsError ? (
                    <tr>
                      <td colSpan="5" className="text-center text-danger">
                        Error loading documents: {doctorDocumentsError}
                      </td>
                    </tr>
                  ) : doctorDocuments ? (
                    documentTypes.map((docType, index) => {
                      // Note: Assuming "1" for Approved, "2" for Rejected, and others (or undefined) for Pending, based on common status codes.
                      // The first component used "3" for Approved, I will stick to "1" and "2" as used in the current subadmin code snippet's logic, but adjusted the Approved logic to match the first component's `ViewDoctor`'s status check for "3" to "1" for the subadmin component's logic.
                      const status = doctorDocuments[docType.statusField];
                      let statusBadge;

                      if (status === "1") { // Changed from "3" in ViewDoctor to "1" as per the subadmin component's status badge logic (if it was intended to use "1" for approved)
                        statusBadge = <span className="badge bg-success">Approved</span>;
                      } else if (status === "2") {
                        statusBadge = <span className="badge bg-danger">Rejected</span>;
                      } else {
                        statusBadge = <span className="badge bg-warning text-dark">Pending</span>;
                      }

                      const documentImage = doctorDocuments[docType.field];
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
                            {status === "2" && doctorDocuments.rejectReasons?.[docType.statusField] && (
                              <div className="text-danger small mt-1">
                                Reason: {doctorDocuments.rejectReasons[docType.statusField]}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApproveDocument(doctorDocuments._id, docType.statusField)}
                                disabled={status === "1" || doctorsLoading || isProcessing} // Changed status check to "1"
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openRejectModal('single', docType.statusField)}
                                disabled={status === "2" || doctorsLoading || isProcessing}
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
            {doctorDocuments && (
              <div className="d-flex gap-3 mt-3">
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={handleApproveAll}
                  disabled={doctorsLoading || isProcessing}
                >
                  <i className="bi bi-check-circle"></i>
                  {isProcessing ? "Processing..." : "Approve All"}
                </button>
                <button
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={() => openRejectModal('all')}
                  disabled={doctorsLoading || isProcessing}
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

export default ViewDoctorSubadmin;