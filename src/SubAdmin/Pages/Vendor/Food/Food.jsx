import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../../../Context/Context";

const FoodId = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [valueChange, setValueChange] = useState(null);
  const [activeTab, setActiveTab] = useState("Coupons");
  const [isDisable, setIsDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectionType, setRejectionType] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Using old context functions for coupons and documents (as specified)
  const {
    getVendorCoupon,
    coupon,
    searchVendorTest,
    searchTest,
    documents,
    vendorDocuments,
    vendorStatus,
    approveVendorDocumentField,
    rejectVendorDocumentField,
    toast
  } = useContext(MyContext);

  // New subadmin context for vendor details
  const {
    getFoodVendorById,
    foodVendorDetail,
    foodVendorDetailLoading,
    foodVendorDetailError,
    clearFoodVendorDetail
  } = useContext(MyContext);

  const LIMIT = process.env.REACT_APP_LIMIT;
  const [doc, setDoc] = useState();
  const [updateDoc, setUpdateDOc] = useState({});

  // Fetch vendor details when component mounts
  useEffect(() => {
    if (id) {
      getFoodVendorById(id);
    }

    return () => {
      clearFoodVendorDetail();
    };
  }, [id]);

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

  const handleClickValue = (value) => {
    console.log(value);
  };

  let debounceSearch = (fx, delay) => {
    let id = null;
    return (e) => {
      if (id) {
        clearTimeout(id);
      }
      id = setTimeout(() => {
        fx(e);
      }, delay);
    };
  };

  const debouncedSearch = useCallback(
    debounceSearch(() => searchVendorTest(valueChange), 1000),
    [valueChange]
  );

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const flattenedSearchData = searchTest.flat();
  const isSearchDataValid =
    Array.isArray(flattenedSearchData) &&
    flattenedSearchData.length > 0 &&
    flattenedSearchData.some((item) => item !== null && item !== undefined);

  useEffect(() => {
    if (activeTab === "Coupons") {
      getVendorCoupon(id);
    } else if (activeTab === "Documents") {
      vendorDocuments(id);
    }
  }, [id, activeTab, setActiveTab]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
  };

  const handleSaveClick = () => {
    setEditingIndex(null);
  };

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedTests = [...test];
    updatedTests[index][name] = value;
  };

  const handleApproveAll = async () => {
    try {
      setLoading(true);
      
      if (!documents || documents.length === 0) {
        toast.error("No documents to approve");
        return;
      }

      const documentId = documents[0]._id;
      const fieldsToApprove = [
        "registrationNoStatus",
        "licenceNoStatus",
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus"
      ];

      // Create an array of promises with proper error handling
      const approvalPromises = fieldsToApprove.map(field => {
        return approveVendorDocumentField(documentId, field)
          .then(() => ({ success: true, field }))
          .catch(error => ({
            success: false,
            field,
            error: error.response?.data?.message || error.message || "Unknown error"
          }));
      });

      // Wait for all promises to settle
      const results = await Promise.all(approvalPromises);

      // Analyze results
      const successfulApprovals = results.filter(r => r.success);
      const failedApprovals = results.filter(r => !r.success);

      // Show appropriate toast messages
      if (failedApprovals.length === 0) {
        toast.success("All documents approved successfully");
      } else if (successfulApprovals.length === 0) {
        toast.error("Failed to approve all documents");
      } else {
        const errorMessages = failedApprovals.map(f => `${f.field}: ${f.error}`).join(', ');
        toast.warning(
          `Approved ${successfulApprovals.length} documents, failed to approve ${failedApprovals.length}: ${errorMessages}`
        );
      }

    } catch (error) {
      console.error('Unexpected error in approve all:', error);
      toast.error("An unexpected error occurred during approval");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async (reason) => {
    try {
      setLoading(true);
      
      // Check if documents exist
      if (!documents || documents.length === 0) {
        toast.error("No documents to reject");
        return;
      }

      const documentId = documents[0]._id;
      const fieldsToReject = [
        "registrationNoStatus",
        "licenceNoStatus",
        "accreditationStatus",
        "aadharCardStatus",
        "panCardStatus",
        "drivingLicenceStatus"
      ];

      // Process all rejections
      const rejectionResults = await Promise.allSettled(
        fieldsToReject.map(field => 
          rejectVendorDocumentField(documentId, field, reason)
            .then(() => ({ success: true, field }))
        )
      );

      // Analyze results
      const successfulRejections = rejectionResults
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.field);

      const failedRejections = rejectionResults
        .filter(result => result.status === 'rejected')
        .map(result => ({
          field: result.reason.config?.data?.field || 'unknown',
          error: result.reason.response?.data?.message || 
                 result.reason.message || 
                 'Unknown error'
        }));

      // Show appropriate messages
      if (failedRejections.length === 0) {
        toast.success("All documents rejected successfully");
      } else if (successfulRejections.length === 0) {
        toast.error("Failed to reject all documents");
      } else {
        const successCount = successfulRejections.length;
        const failCount = failedRejections.length;
        toast.warning(
          `Rejected ${successCount} documents, failed to reject ${failCount}`
        );
      }

    } catch (error) {
      console.error('Error in reject all:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      if (rejectionType === 'single' && rejectionTarget) {
        await rejectVendorDocumentField(documents[0]._id, rejectionTarget, rejectReason);
      } else if (rejectionType === 'all') {
        await handleRejectAll(rejectReason);
      }
      closeRejectModal();
    } catch (error) {
      console.error("Error during rejection:", error);
    }
  };

  // Vendor info display
  const renderVendorInfo = () => {
    if (foodVendorDetailLoading) {
      return <div className="text-center py-4">Loading vendor details...</div>;
    }

    if (foodVendorDetailError) {
      return (
        <div className="alert alert-danger mb-4">
          Error loading vendor details: {foodVendorDetailError}
        </div>
      );
    }

    if (foodVendorDetail) {
      return (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Vendor Information</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {foodVendorDetail.name}</p>
                <p><strong>Business:</strong> {foodVendorDetail.business}</p>
                <p><strong>Email:</strong> {foodVendorDetail.email}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Phone:</strong> {foodVendorDetail.phone}</p>
                <p><strong>Location:</strong> {foodVendorDetail.city}, {foodVendorDetail.state}, {foodVendorDetail.country}</p>
                <p><strong>Food Items:</strong> {foodVendorDetail.foodItemsCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderVendorInfo()}

      <ul
        className="nav nav-pills gap-3 navAndTabs1 mb-3"
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
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
              <h1 className="text-center w-60">
                Food Coupons
              </h1>
            </div>
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Coupon Code</th>
                    <th scope="col">Description</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">Expire Date</th>
                    <th scope="col">Percentage Discount</th>
                    <th scope="col">Limit Redeem</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "Coupons" && (
                    <>
                      {coupon?.map((d, i) => (
                        <tr key={d._id}>
                          <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                          <td>{d.couponCode}</td>
                          <td>{d.description}</td>
                          <td>{d.startDate}</td>
                          <td>{d.expireDate}</td>
                          <td>{d.percentageDiscount}</td>
                          <td>{d.limitRedeem}</td>
                        </tr>
                      ))}
                    </>
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
                />
              </div>
              <h1 className="text-center w-60">
                Food Documents
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
                  {activeTab === "Documents" && documents?.map((d, i) => {
                    const documentTypes = [
                      { 
                        name: "Registration Certificate", 
                        key: "registrationNo", 
                        field: "registrationNo",
                        statusField: "registrationNoStatus" 
                      },
                      { 
                        name: "Food License", 
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
                      }
                    ];

                    return documentTypes.map((docType, index) => {
                      const status = d[docType.statusField];
                      let statusBadge;
                      
                      if (status === "1") {
                        statusBadge = <span className="badge bg-success">Approved</span>;
                      } else if (status === "2") {
                        statusBadge = <span className="badge bg-danger">Rejected</span>;
                      } else {
                        statusBadge = <span className="badge bg-warning text-dark">Pending</span>;
                      }

                      return (
                        <tr key={`${d._id}-${docType.key}`} className={index % 2 === 0 ? "table-light" : ""}>
                          <th scope="row">{index + 1}</th>
                          <td>{docType.name}</td>
                          <td>
                            {d[docType.field] ? (
                              <img
                                src={`${process.env.REACT_APP_API_URL}${
                                  Array.isArray(d[docType.field]) ? d[docType.field][0] : d[docType.field]
                                }`}
                                alt={docType.name}
                                height={40}
                                width={40}
                                className="rounded cursor-pointer"
                                style={{ objectFit: "cover" }}
                                onClick={() => {
                                  setSelectedImage(Array.isArray(d[docType.field]) ? d[docType.field][0] : d[docType.field]);
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
                            {status === "2" && d.rejectReasons?.[docType.statusField] && (
                              <div className="text-danger small mt-1">
                                Reason: {d.rejectReasons[docType.statusField]}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => approveVendorDocumentField(d._id, docType.statusField)}
                                disabled={status === "1" || loading}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openRejectModal('single', docType.statusField)}
                                disabled={status === "2" || loading}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk Action Buttons */}
            <div className="d-flex gap-3 mt-3">
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={handleApproveAll}
                disabled={loading}
              >
                <i className="bi bi-check-circle"></i>
                {loading ? "Processing..." : "Approve All"}
              </button>
              <button
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={() => openRejectModal('all')}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                {loading ? "Processing..." : "Reject All"}
              </button>
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
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  Rejection Reason
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
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim()}
                >
                  <i className="fas fa-times me-1"></i>
                  Confirm Rejection
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
                    src={`${process.env.REACT_APP_API_URL}${selectedImage}`} 
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
                  href={`${process.env.REACT_APP_API_URL}${selectedImage}`} 
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
    </>
  );
};

export default FoodId;