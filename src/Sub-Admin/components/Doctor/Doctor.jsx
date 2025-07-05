import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import { toast } from "react-toastify";

const DoctorSA = () => {
  const {
    doctor,
    getDoctors,
    loading,
    getApproveDoctorAccount,
    getRejectDoctorAccount
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal state for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    getDoctors();
  }, []);

  useEffect(() => {
    if (doctor && doctor.length > 0) {
      const filtered = doctor.filter(doc =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [doctor, searchTerm]);

  const handleVerifyDoctor = async (doctorId) => {
    try {
      setActionLoading(`approve-${doctorId}`);
      console.log("Approving doctor with ID:", doctorId);
      
      const result = await getApproveDoctorAccount(doctorId);
      console.log("Approval result:", result);
      
      if (result && result.success) {
        await getDoctors(); // refresh doctor list
      }
    } catch (error) {
      console.error("Error in handleVerifyDoctor:", error);
      toast.error("Error approving doctor.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDoctor = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmRejectDoctor = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(`reject-${selectedDoctorId}`);
      console.log("Rejecting doctor with ID:", selectedDoctorId, "Reason:", rejectReason.trim());
      
      const result = await getRejectDoctorAccount(selectedDoctorId, rejectReason.trim());
      console.log("Rejection result:", result);
      
      if (result && result.success) {
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedDoctorId(null);
        await getDoctors(); // refresh doctor list
      }
    } catch (error) {
      console.error("Error in confirmRejectDoctor:", error);
      toast.error("Error rejecting doctor.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedDoctorId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "1":
        return <span className="badge bg-success">Verified</span>;
      case "2":
        return <span className="badge bg-danger">Rejected</span>;
      case "0":
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  const getActionButtons = (doc) => {
    const isApproveLoading = actionLoading === `approve-${doc._id}`;
    const isRejectLoading = actionLoading === `reject-${doc._id}`;
    
    return (
      <div className="d-flex align-items-center gap-2">
        {(doc.Accountverify === "0" || doc.Accountverify === "2") && (
          <button
            className="btn btn-success btn-sm"
            type="button"
            onClick={() => handleVerifyDoctor(doc._id)}
            disabled={isApproveLoading || isRejectLoading}
          >
            {isApproveLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Approving...
              </>
            ) : (
              "Approve"
            )}
          </button>
        )}
        {doc.Accountverify === "0" && (
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => handleRejectDoctor(doc._id)}
            disabled={isApproveLoading || isRejectLoading}
          >
            {isRejectLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </button>
        )}
        <Link to={`/dashboard/ViewDoctor/${doc._id}`}>
          <button className="btn btn-secondary bg-opacity-25 bg-gradient btn-sm" type="button">
            View
          </button>
        </Link>
      </div>
    );
  };

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-start mb-4">
        <div style={{ transform: "translateY(2.5rem)" }}>
          <input
            type="text"
            placeholder="Search Here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control shadow-none"
            style={{ maxWidth: "300px", margin: "0 auto" }}
          />
        </div>
      </div>

      <h1 className="text-center py-4">All Doctors</h1>

      <div style={{ width: "auto", overflowX: "auto" }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Image</th>
              <th>DOCTOR NAME</th>
              <th>EMAIL</th>
              <th>COUNTRY</th>
              <th>STATE</th>
              <th>CITY</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentDoctors && currentDoctors.length > 0 ? (
              currentDoctors.map((doc, index) => (
                <tr key={doc._id}>
                  <td>{indexOfFirstDoctor + index + 1}</td>
                  <td>
                    <img
                      src={doc.image || "/api/placeholder/50/50"}
                      alt={doc.name}
                      style={{
                        borderRadius: "50%",
                        height: "50px",
                        width: "50px",
                        objectFit: "cover"
                      }}
                    />
                  </td>
                  <td>{doc.name || "N/A"}</td>
                  <td>{doc.email || "N/A"}</td>
                  <td>{doc.country || "N/A"}</td>
                  <td>{doc.state || "N/A"}</td>
                  <td>{doc.city || "N/A"}</td>
                  <td>{getStatusBadge(doc.Accountverify)}</td>
                  <td>{getActionButtons(doc)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  {searchTerm
                    ? "No doctors found matching your search."
                    : "No doctors found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-between px-5">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={handlePrevious} disabled={currentPage === 1}>
              Previous
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">
              Page {currentPage} of {totalPages}
            </span>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Doctor Account</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleModalClose}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="rejectReason" className="form-label">
                    Please enter the rejection reason: <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="rejectReason"
                    className="form-control shadow-none"
                    rows="4"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter detailed reason for rejection..."
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleModalClose}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmRejectDoctor}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading === `reject-${selectedDoctorId}` ? (
                    <>
                      <span className="spinner-border spinner-border-sm  me-1" role="status" aria-hidden="true"></span>
                      Rejecting...
                    </>
                  ) : (
                    "Reject Doctor"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSA;