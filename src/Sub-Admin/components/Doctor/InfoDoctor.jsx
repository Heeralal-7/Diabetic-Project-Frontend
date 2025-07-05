import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../../Context/Context";
import { useParams } from 'react-router-dom';

const ViewDoctorSA = () => {
  const {
    getDoctorDocuments,
    getDoctors,
    approveDoctorDocument,
    rejectDoctorDocument,
    approveAllDocuments,
    rejectAllDocuments,
    getDoctorCoupon,
    doctorCoupon,
    doctor,
    loading
  } = useContext(MyContext);

  // State management
  const [page, setPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [valueChange, setValueChange] = useState(null);
  const [activeTab, setActiveTab] = useState("Tests");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [DoctorDocument, setDoctorDocument] = useState(null);

  // Modal state for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectionType, setRejectionType] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  // Dummy data for tests and coupons
  const [test] = useState([
    {
      _id: "test1",
      testCategory: "Blood Test",
      testName: "Complete Blood Count",
      testType: "Diagnostic",
      sampleRequired: "Blood Sample",
      description: "Measures various components in your blood",
      amount: "$35"
    }
  ]);

  

  // Document types mapping based on your API response
   const documentTypes = [
    { 
      id: 1, 
      name: "Registration Certificate", 
      field: "registrationNo", 
      statusField: "registrationNoStatus",
      imageField: "registrationNoImage"
    },
    { 
      id: 2, 
      name: "Medical License", 
      field: "licenceNo", 
      statusField: "licenceNoStatus",
      imageField: "licenceNoImage"
    },
    { 
      id: 3, 
      name: "Accreditation Certificate", 
      field: "accreditation", 
      statusField: "accreditationStatus",
      imageField: "accreditationImage"
    },
    { 
      id: 4, 
      name: "Aadhar Card", 
      field: "aadharCard", 
      statusField: "aadharCardStatus",
      imageField: "aadharCardImage"
    },
    { 
      id: 5, 
      name: "Pan Card", 
      field: "panCard", 
      statusField: "panCardStatus",
      imageField: "panCardImage"
    },
    { 
      id: 6, 
      name: "Driving License", 
      field: "drivingLicence", 
      statusField: "drivingLicenceStatus",
      imageField: "drivingLicenceImage"
    },
    { 
      id: 7, 
      name: "Doctor Certificate", 
      field: "doctorCertificate", 
      statusField: "doctorCertificateStatus",
      imageField: "doctorCertificateImage"
    }
  ];

  const LIMIT = 10;

  // Fetch doctors 
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getDoctors();
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchData();
  }, []);
  // Fetch doctors Coupon
useEffect(() => {
  getDoctors();
}, []);

useEffect(() => {
  if (selectedDoctorId) {
    console.log("doctorId used in getDoctorCoupon:", selectedDoctorId);
    getDoctorCoupon(selectedDoctorId);
  }
}, [selectedDoctorId]);

useEffect(() => {
  console.log("Doctor Coupons:", doctorCoupon);
}, [doctorCoupon]);
  // Fetch documents when doctor is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (doctor && doctor.length > 0 && !selectedDoctorId) {
        const firstDoctorId = doctor[0]._id;
        setSelectedDoctorId(firstDoctorId);
        try {
          const documentData = await getDoctorDocuments(firstDoctorId);
          setDoctorDocument(documentData?.details || null);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      }
    };
    fetchDocuments();
  }, [doctor, selectedDoctorId, getDoctorDocuments]);

  // Handle individual document approval (status = 1)
  const handleApproveDocument = async (documentId, documentType) => {
    try {
      // Use selectedDoctorId if DoctorDocument._id is not available
      const docId = documentId || selectedDoctorId;
      if (!docId) {
        console.error("No document ID or selected doctor ID available");
        alert("Please select a doctor first");
        return;
      }

      const result = await approveDoctorDocument(docId, documentType);
      if (result) {
        console.log(`${documentType} approved successfully`);
        // Refresh document data if selectedDoctorId exists
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          setDoctorDocument(updatedData?.details || null);
        }
      }
    } catch (error) {
      console.error(`Error approving ${documentType}:`, error);
      alert(`Error approving document: ${error.message}`);
    }
  };

  // Handle individual document rejection (status = 2)
  const handleRejectDocument = async (documentId, documentType, reason = "Document rejected by admin") => {
    try {
      // Use selectedDoctorId if DoctorDocument._id is not available
      const docId = documentId || selectedDoctorId;
      if (!docId) {
        console.error("No document ID or selected doctor ID available");
        alert("Please select a doctor first");
        return;
      }

      const result = await rejectDoctorDocument(docId, documentType, reason);
      if (result) {
        console.log(`${documentType} rejected successfully`);
        // Refresh document data if selectedDoctorId exists
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          setDoctorDocument(updatedData?.details || null);
        }
      }
    } catch (error) {
      console.error(`Error rejecting ${documentType}:`, error);
      alert(`Error rejecting document: ${error.message}`);
    }
  };

  // Handle approve all documents
  const handleApproveAllDocuments = async () => {
    try {
      // Use DoctorDocument._id if available, otherwise use selectedDoctorId
      const docId = DoctorDocument?._id || selectedDoctorId;
      if (!docId) {
        console.error("No document ID or selected doctor ID available");
        alert("Please select a doctor first");
        return;
      }

      const result = await approveAllDocuments(docId);
      if (result) {
        console.log("All documents approved successfully");
        // Refresh document data if selectedDoctorId exists
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          setDoctorDocument(updatedData?.details || null);
        }
      }
    } catch (error) {
      console.error("Error approving all documents:", error);
      alert(`Error approving all documents: ${error.message}`);
    }
  };

  // Handle reject all documents
  const handleRejectAllDocuments = async (reason) => {
    try {
      // Use DoctorDocument._id if available, otherwise use selectedDoctorId
      const docId = DoctorDocument?._id || selectedDoctorId;
      if (!docId) {
        console.error("No document ID or selected doctor ID available");
        alert("Please select a doctor first");
        return;
      }

      const result = await rejectAllDocuments(docId, reason);
      if (result) {
        console.log("All documents rejected successfully");
        // Refresh document data if selectedDoctorId exists
        if (selectedDoctorId) {
          const updatedData = await getDoctorDocuments(selectedDoctorId);
          setDoctorDocument(updatedData?.details || null);
        }
      }
    } catch (error) {
      console.error("Error rejecting all documents:", error);
      alert(`Error rejecting all documents: ${error.message}`);
    }
  };

  // Open rejection modal
  const openRejectModal = (type, target = null) => {
    setRejectionType(type);
    setRejectionTarget(target);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Close rejection modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionType(null);
    setRejectionTarget(null);
    setRejectReason("");
  };

  // Handle rejection confirmation
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      if (rejectionType === 'single' && rejectionTarget) {
        // Use DoctorDocument._id if available, otherwise use selectedDoctorId
        const docId = DoctorDocument?._id || selectedDoctorId;
        await handleRejectDocument(docId, rejectionTarget, rejectReason);
      } else if (rejectionType === 'all') {
        await handleRejectAllDocuments(rejectReason);
      }
      closeRejectModal();
    } catch (error) {
      console.error("Error during rejection:", error);
    }
  };

  // Get document status based on field name
  const getDocumentStatus = (statusField) => {
    if (!DoctorDocument) return 0; // pending
    const status = DoctorDocument[statusField];
    return status !== undefined ? status : 0;
  };

  // Get status text and color based on status number
  const getStatusInfo = (status) => {
    switch (status) {
      case 0:
        return { text: "Pending", class: "bg-warning text-dark" };
      case 1:
        return { text: "Approved", class: "bg-success" };
      case 2:
        return { text: "Rejected", class: "bg-danger" };
      default:
        return { text: "Pending", class: "bg-warning text-dark" };
    }
  };

  // Get document file/image based on field name
  const getDocumentFile = (fieldName) => {
    if (!DoctorDocument) return null;
    
    // Handle array fields (like aadharCard, panCard)
    const documentField = DoctorDocument[fieldName];
    if (Array.isArray(documentField) && documentField.length > 0) {
      return documentField[0]; // Return first image in array
    }
    
    return documentField || null;
  };

  // Edit and save handlers for tests
  const handleSaveClick = () => {
    setEditingIndex(null);
  };
  const handleChange = (index, event) => {
    // This would update the test data in a real application
    // Omitted for dummy implementation
  };

  return (
    <div className="container-fluid px-0">
      <ul
        className="nav nav-pills flex-column flex-sm-row gap-2 navAndTabs1 mb-3"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Tests" ? "active" : ""}`}
            id="userTests-tab"
            data-bs-toggle="pill"
            data-bs-target="#userTests"
            type="button"
            role="tab"
            aria-controls="userTests"
            aria-selected={activeTab === "Tests"}
            onClick={() => setActiveTab("Tests")}
          >
            Test
          </button>
        </li>
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
        {/* Tests Tab */}
        <div
          className={`tab-pane fade ${activeTab === "Tests" ? "show active" : ""}`}
          id="userTests"
          role="tabpanel"
          aria-labelledby="userTests-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
            </div>
            <h1 className="text-center flex-grow-1 fs-2 my-4 fs-lg-1">
              Doctor Tests
            </h1>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Test Category</th>
                    <th scope="col">Test Name</th>
                    <th scope="col">Test Type</th>
                    <th scope="col">Sample Required</th>
                    <th scope="col">Description</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {test.map((d, i) => (
                    <tr key={d._id || i}>
                      <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="testCategory"
                            value={d.testCategory}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.testCategory
                        )}
                      </td>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="testName"
                            value={d.testName}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.testName
                        )}
                      </td>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="testType"
                            value={d.testType}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.testType
                        )}
                      </td>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="sampleRequired"
                            value={d.sampleRequired}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.sampleRequired
                        )}
                      </td>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="description"
                            value={d.description}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.description
                        )}
                      </td>
                      <td>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            name="amount"
                            value={d.amount}
                            onChange={(e) => handleChange(i, e)}
                          />
                        ) : (
                          d.amount
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {editingIndex === i ? (
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={handleSaveClick}
                            >
                              Save
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                type="button"
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                    <th scope="col">Start Date</th>
                    <th scope="col">Expire Date</th>
                    <th scope="col">Percentage Discount</th>
                    <th scope="col">Limit Redeem</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
               <tbody>
  {doctorCoupon && doctorCoupon.length > 0 ? (
    doctorCoupon.map((d, i) => (
      <tr key={d._id || i}>
        <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
        <td>{d.couponCode}</td>
        <td>{d.description}</td>
        <td>{d.startDate}</td>
        <td>{d.expireDate}</td>
        <td>{d.percentageDiscount}</td>
        <td>{d.limitRedeem}</td>
        <td>
          <div className="btn-group">
            <button className="btn btn-secondary bg-opacity-25 bg-gradient">
              View
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="text-center text-muted">
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
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
            </div>
            <div>
              <h1 className="flex-grow-1 fs-2 fs-lg-1 text-center my-4">
                Doctor Documents
              </h1>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr className="text-center">
                        <th scope="col">S.No</th>
                        <th scope="col">Document Name</th>
                        <th scope="col" className="text-center">Document Image</th>
                        <th scope="col">Status</th>
                        <th scope="col">View</th>
                        <th scope="col">Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentTypes && documentTypes.length > 0 ? (
                        documentTypes.map((docType, index) => {
                          const documentFile = getDocumentFile(docType.field);
                          const documentStatus = getDocumentStatus(docType.statusField);
                          const statusInfo = getStatusInfo(documentStatus);

                          return (
                            <tr key={docType.id} className="text-center">
                              <th scope="row">{index + 1}</th>
                              <td>{docType.name}</td>
                              <td>
                                {documentFile ? (
                                  <img
                                    src={documentFile}
                                    alt={docType.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    className="rounded"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'inline';
                                    }}
                                  />
                                ) : (
                                  <span className="text-muted">No image</span>
                                )}
                                {documentFile && (
                                  <span className="text-muted" style={{ display: 'none' }}>
                                    Image not available
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${statusInfo.class}`}>
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  type="button"
                                  onClick={() => documentFile && window.open(documentFile, '_blank')}
                                  disabled={!documentFile}
                                >
                                  View
                                </button>
                              </td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className="btn btn-success btn-sm px-3"
                                    type="button"
                                    onClick={() => handleApproveDocument(DoctorDocument?._id, docType.statusField)}
                                    disabled={loading}
                                    title="Approve Document"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm px-3"
                                    type="button"
                                    onClick={() => openRejectModal('single', docType.statusField)}
                                    disabled={loading}
                                    title="Reject Document"
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
                          <td colSpan="6" className="text-center">
                            No documents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Approve and Reject All buttons */}
                <div className="d-flex justify-content-start mt-4 gap-3">
                  <button
                    className="btn btn-success px-4 py-2"
                    type="button"
                    onClick={handleApproveAllDocuments}
                    disabled={loading}
                  >
                    <i className="fas fa-check-double me-2"></i>
                    {loading ? "Processing..." : "Approve All"}
                  </button>
                  <button
                    className="btn btn-danger px-4 py-2"
                    type="button"
                    onClick={() => openRejectModal('all')}
                    disabled={loading}
                  >
                    <i className="fas fa-times-circle me-2"></i>
                    {loading ? "Processing..." : "Reject All"}
                  </button>
                </div>
              </>
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
    </div>
  );
};

export default ViewDoctorSA;