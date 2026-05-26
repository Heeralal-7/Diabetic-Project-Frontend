import React, { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import { toast } from "react-toastify";

const Doctor = () => {
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

  // Location filter states
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [radius, setRadius] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Modal state for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Confirmation popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
  const [confirmDoctorId, setConfirmDoctorId] = useState(null);
  const [confirmDoctorName, setConfirmDoctorName] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Get user's current location automatically on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to retrieve your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    };

    getUserLocation();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Get distance text for display
  const getDistanceText = (doctor) => {
    if (!userLocation || !doctor.latitude || !doctor.longitude) return "N/A";

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(doctor.latitude),
      parseFloat(doctor.longitude)
    );

    return `${distance.toFixed(1)} km`;
  };

  // Get distance value for filtering
  const getDistanceValue = (doctor) => {
    if (!userLocation || !doctor.latitude || !doctor.longitude) return Infinity;

    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(doctor.latitude),
      parseFloat(doctor.longitude)
    );
  };

  // Get unique states and cities from doctors data
  useEffect(() => {
    if (doctor && doctor.length > 0) {
      // Get unique states
      const uniqueStates = [...new Set(doctor.map(doc => doc.state).filter(Boolean))];
      setStates(uniqueStates.sort());

      // Get unique cities based on selected state
      if (selectedState) {
        const stateCities = [...new Set(
          doctor
            .filter(doc => doc.state === selectedState && doc.city)
            .map(doc => doc.city)
        )];
        setCities(stateCities.sort());
      } else {
        const allCities = [...new Set(doctor.map(doc => doc.city).filter(Boolean))];
        setCities(allCities.sort());
      }
    }
  }, [doctor, selectedState]);

  useEffect(() => {
    getDoctors();
  }, []);

  // Filter doctors based on search term, location filters, and radius
  useEffect(() => {
    if (doctor && doctor.length > 0) {
      let filtered = doctor.filter(doc => {
        // Text search filter
        const matchesSearch =
          doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.city?.toLowerCase().includes(searchTerm.toLowerCase());

        // State filter
        const matchesState = !selectedState || doc.state === selectedState;

        // City filter
        const matchesCity = !selectedCity || doc.city === selectedCity;

        // Radius filter - STEP 1: Only show doctors within the specified km range
        let matchesRadius = true;
        if (userLocation && radius && doc.latitude && doc.longitude) {
          const distance = getDistanceValue(doc);
          matchesRadius = distance <= parseFloat(radius);
        } else if (userLocation && radius) {
          // If radius is set but doctor doesn't have coordinates, hide them
          matchesRadius = false;
        }

        return matchesSearch && matchesState && matchesCity && matchesRadius;
      });

      // Sort by distance if location is available
      if (userLocation) {
        filtered = filtered.sort((a, b) => {
          const distA = getDistanceValue(a);
          const distB = getDistanceValue(b);
          return distA - distB;
        });
      }

      setFilteredDoctors(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [doctor, searchTerm, selectedState, selectedCity, radius, userLocation]);

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity("");
  }, [selectedState]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setSearchTerm("");
    setRadius("");
  };

  // Show confirmation popup for approve/reject actions
  const showActionConfirmation = (action, doctorId, doctorName, event) => {
    setConfirmAction(action);
    setConfirmDoctorId(doctorId);
    setConfirmDoctorName(doctorName);

    // Get button position for popup placement
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: buttonRect.left + window.scrollX + (buttonRect.width / 2),
      y: buttonRect.top + window.scrollY - 10
    });

    setShowConfirmPopup(true);
  };

  const hideActionConfirmation = () => {
    setShowConfirmPopup(false);
  };

  const handleVerifyDoctor = async (doctorId) => {
    try {
      setActionLoading(`approve-${doctorId}`);
      console.log("Approving doctor with ID:", doctorId);

      const result = await getApproveDoctorAccount(doctorId);
      console.log("Approval result:", result);

      if (result && result.success) {
        await getDoctors(); // refresh doctor list
        toast.success("Doctor approved successfully!");
      }
    } catch (error) {
      console.error("Error in handleVerifyDoctor:", error);
      toast.error("Error approving doctor.");
    } finally {
      setActionLoading(null);
      hideActionConfirmation();
    }
  };

  const handleRejectDoctor = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setRejectReason("");
    setShowRejectModal(true);
    hideActionConfirmation();
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
        toast.success("Doctor rejected successfully!");
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
            onClick={(e) => showActionConfirmation('approve', doc._id, doc.name, e)}
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
            onClick={(e) => showActionConfirmation('reject', doc._id, doc.name, e)}
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
    <div className="container-fluid">
      <h1 className="text-center py-4">All Doctors</h1>
      <div className="p-3">
        {/* Search and Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-md-2">
            <div className="form-floating">
              <input
                type="text"
                className="form-control shadow-none"
                id="searchInput"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <label htmlFor="searchInput" className="text-muted">
                <i className="fas fa-search me-2"></i>Search Doctors
              </label>
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select shadow-none"
                id="stateSelect"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">All States</option>
                {states.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <label htmlFor="stateSelect" className="text-muted">
                <i className="fas fa-map me-2"></i>Select State
              </label>
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select shadow-none"
                id="citySelect"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState && states.length > 0}
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <label htmlFor="citySelect" className="text-muted">
                <i className="fas fa-city me-2"></i>Select City
              </label>
            </div>
          </div>

          <div className="col-md-3">
            <div className="flex-grow-1">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control shadow-none"
                  id="radiusInput"
                  placeholder="Radius"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  min="1"
                  max="500"
                  disabled={!userLocation}
                />
                <label htmlFor="radiusInput" className="text-muted">
                  <i className="fas fa-radius me-2"></i>
                  {userLocation ? 'Radius (km)' : 'Location Detecting...'}
                </label>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="d-flex gap-2 h-100">
              <button
                className="btn btn-outline-secondary"
                onClick={resetFilters}
                style={{ whiteSpace: 'nowrap' }}
              >
                <i className="fas fa-refresh me-2"></i>Reset All
              </button>
            </div>
          </div>
        </div>



        {/* Radius Filter Info */}
        {userLocation && radius && (
          <div className="alert alert-success">
            <i className="fas fa-filter me-2"></i>
            Showing doctors within <strong>{radius} km</strong> of your location.
            {filteredDoctors.length === 0 && " No doctors found in this radius."}
          </div>
        )}

        <div style={{ width: "auto", overflowX: "auto" }}>
          {/* STEP 1: Changed table header background to light with black text */}
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>S.No</th>
                <th>Image</th>
                <th>DOCTOR NAME</th>
                <th>EMAIL</th>
                <th>COUNTRY</th>
                <th>STATE</th>
                <th>CITY</th>
                <th>DISTANCE</th>
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
                        src={
                          doc.image
                            ? `${process.env.REACT_APP_API_URL}${doc.image}`
                            : "/api/placeholder/50/50"
                        }
                        alt={doc.name}
                        className="rounded-circle"
                        style={{
                          height: "50px",
                          width: "50px",
                          objectFit: "cover"
                        }}
                      />
                    </td>
                    <td>
                      <strong>{doc.name || "N/A"}</strong>
                    </td>
                    <td>{doc.email || "N/A"}</td>
                    <td>{doc.country || "N/A"}</td>
                    <td>
                      <span className="badge bg-info">{doc.state || "N/A"}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{doc.city || "N/A"}</span>
                    </td>
                    <td>
                      <span className={`badge ${userLocation ? 'bg-primary' : 'bg-secondary'}`}>
                        <i className="fas fa-location-arrow me-1"></i>
                        {getDistanceText(doc)}
                      </span>
                    </td>
                    <td>{getStatusBadge(doc.Accountverify)}</td>
                    <td>{getActionButtons(doc)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="text-muted">
                      <i className="fas fa-search fa-2x mb-3"></i>
                      <p>
                        {searchTerm || selectedState || selectedCity || radius
                          ? "No doctors found matching your filters."
                          : "No doctors found."}
                      </p>
                      {(searchTerm || selectedState || selectedCity || radius) && (
                        <button
                          className="btn btn-primary"
                          onClick={resetFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDoctors.length > 0 && (
          <nav aria-label="Page navigation" className="mt-4">
            <ul className="pagination justify-content-between px-5">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={handlePrevious} disabled={currentPage === 1}>
                  <i className="fas fa-chevron-left me-2"></i>Previous
                </button>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">
                  Page {currentPage} of {totalPages}
                  <span className="badge bg-primary ms-2">{filteredDoctors.length} doctors</span>
                </span>
              </li>
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={handleNext} disabled={currentPage === totalPages}>
                  Next<i className="fas fa-chevron-right ms-2"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
{/* Internal CSS for modal width */}
<style>
  {`
    .custom-modal-sm {
      max-width: 600px !important;
    }
    .custom-modal-sm .modal-content {
      border-radius: 12px;
    }
    .custom-modal-sm .modal-body {
      padding: 20px;
    }
  `}
</style>
        {/* STEP 2: Action Confirmation Popup - Now appears on click instead of hover */}
        {showConfirmPopup && (
          <div
            className="modal fade show width-200px "
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered custom-modal-sm ">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Action</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={hideActionConfirmation}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                    <p className="mb-3">
                      Are you sure you want to <strong>{confirmAction}</strong> doctor 
                      <strong> {confirmDoctorName}</strong>?
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={hideActionConfirmation}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${confirmAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => {
                      if (confirmAction === 'approve') {
                        handleVerifyDoctor(confirmDoctorId);
                      } else if (confirmAction === 'reject') {
                        handleRejectDoctor(confirmDoctorId);
                      }
                    }}
                  >
                    Yes, {confirmAction}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog custom-modal-sm ">
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
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
    </div>
  );
};

export default Doctor;