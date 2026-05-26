import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaClock, FaInfoCircle, FaTimes, FaCheck,
  FaDownload, FaExclamationTriangle, FaUserMd, FaStethoscope,
  FaTag, FaFileMedical, FaEye, FaUserAlt
} from 'react-icons/fa';

// --- Status Config Matching Lab Design ---
const DOCTOR_STATUS_CONFIG = {
  "0": { text: "Pending", bg: "#fff3cd", color: "#856404", icon: FaClock },
  "1": { text: "Confirmed", bg: "#cff4fc", color: "#055160", icon: FaCheck },
  "9": { text: "Pending at Clinic", bg: "#fff3cd", color: "#856404", icon: FaClock },
  "2": { text: "In Progress", bg: "#e2e3e5", color: "#41464b", icon: FaClock }, 
  "3": { text: "Completed", bg: "#d1e7dd", color: "#0f5132", icon: FaCheck }, 
  "4": { text: "Cancelled", bg: "#f8d7da", color: "#842029", icon: FaTimes },   
  "5": { text: "Rescheduled", bg: "#e2e3e5", color: "#41464b", icon: FaCalendarAlt },
  "6": { text: "Postpone", bg: "#e2e3e5", color: "#41464b", icon: FaClock }
};

const StatusBadge = ({ status, isCancelled }) => {
  if (isCancelled || status === '4') {
    return (
      <span className="badge rounded-pill px-3 py-2 border border-danger bg-danger bg-opacity-10 text-danger">
        <FaTimes className="me-1" /> Cancelled
      </span>
    );
  }
  const config = DOCTOR_STATUS_CONFIG[status] || { text: 'Unknown', bg: '#e2e3e5', color: '#6c757d', icon: FaInfoCircle };
  const Icon = config.icon;
  return (
    <span className="badge rounded-pill px-3 py-2 border" style={{ backgroundColor: config.bg, color: config.color, borderColor: config.color }}>
      <Icon className="me-1" /> {config.text}
    </span>
  );
};

const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

function AppointmentHistory() {
  const { 
    getOrderHistory,
    loadingAppointments,
    errorAppointments,
    appointmentsData,
    currentPageAppointment,
    totalPagesAppointment,
    checkCancellationCharge,
    cancelOrderUser
  } = useContext(MyContext);

  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Local state for UI updates matches Lab Cancel State
  const [cancelState, setCancelState] = useState({
    loadingId: null,
    info: {},
    showCard: {}
  });

  // --- Helper Functions ---
  const getFileUrl = (path) => {
    if (!path) return null;
    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) return normalizedPath;
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${cleanBaseUrl}${cleanPath}`;
  };

  const handleDownload = async (url, filename) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`File fetch failed with status: ${response.status}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) throw new Error('Received HTML instead of a valid file.');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'Prescription.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed natively, falling back to new tab:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // --- API & Pagination ---
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = useCallback(async (page = 1) => {
    await getOrderHistory(page, statusFilter, itemsPerPage);
  }, [getOrderHistory, statusFilter, itemsPerPage]);

  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPagesAppointment) return;
    fetchAppointments(page);
  }, [fetchAppointments, totalPagesAppointment]);

  const handleFilterChange = useCallback((status) => {
    setStatusFilter(status);
    getOrderHistory(1, status, itemsPerPage);
  }, [getOrderHistory, itemsPerPage]);

  const handleItemsPerPageChange = useCallback((limit) => {
    setItemsPerPage(limit);
    getOrderHistory(1, statusFilter, limit);
  }, [getOrderHistory, statusFilter]);

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    range.push(1);
    for (let i = currentPageAppointment - delta; i <= currentPageAppointment + delta; i++) {
      if (i > 1 && i < totalPagesAppointment) range.push(i);
    }
    if (totalPagesAppointment > 1) range.push(totalPagesAppointment);
    range.sort((a, b) => a - b);
    let prev;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) rangeWithDots.push(prev + 1);
        else if (i - prev !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }
    return rangeWithDots;
  };

  // --- Utility getters ---
  const getOrderType = (appointment) => appointment.serviceType?.toLowerCase().includes('doctor') ? 'doctor' : 'lab';
  const getOrderId = (appointment) => appointment.orderId || appointment._id;
  const isAppointmentCancellable = (appointment) => {
    const cancellableStatuses = ['0', '1', '2', '9']; 
    return cancellableStatuses.includes(appointment.orderStatus) && appointment.cancellationStatus !== 'cancelled';
  };

  // --- Action Handlers ---
  const handleCheckCancellation = async (e, appointment) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = getOrderId(appointment);
    setCancelState(prev => ({ ...prev, loadingId: id }));
    
    try {
      const type = getOrderType(appointment);
      const info = await checkCancellationCharge(id, type);
      
      setCancelState(prev => ({
        ...prev,
        info: { ...prev.info, [id]: info },
        showCard: { ...prev.showCard, [id]: true },
        loadingId: null
      }));
    } catch (error) {
      alert(error.message);
      setCancelState(prev => ({ ...prev, loadingId: null }));
    }
  };

  const handleCancelOrder = async (e, appointment) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = getOrderId(appointment);
    const reason = prompt("Please enter cancellation reason:");
    if (!reason) return;

    setCancelState(prev => ({ ...prev, loadingId: id }));

    try {
      const type = getOrderType(appointment);
      const result = await cancelOrderUser(id, type, reason);
      
      alert(`✅ Cancellation Successful. Refund: ₹${result.refundAmount}`);
      
      setCancelState(prev => ({ 
        ...prev, 
        loadingId: null,
        showCard: { ...prev.showCard, [id]: false } 
      }));

      fetchAppointments(currentPageAppointment); 
    } catch (error) {
      alert(error.message);
      setCancelState(prev => ({ ...prev, loadingId: null }));
    }
  };

  const closeCancelCard = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelState(prev => ({
      ...prev,
      showCard: { ...prev.showCard, [id]: false }
    }));
  };

  const openDetailsModal = (e, appointment) => {
    e.preventDefault();
    setSelectedAppointment(appointment);
  };

  const formatAmountDisplay = (appointment) => {
    const amount = parseFloat(appointment.amount) || 0;
    const isFree = appointment.isFreeConsultation || false;
    
    if (isFree) return 'Free';
    return `₹${amount.toFixed(2)}`;
  };

  const appointments = appointmentsData?.data || [];
  const isInitialLoading = loadingAppointments && appointments.length === 0;

  return (
    <div className="container-xl py-5" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-1">My Doctor Appointments</h2>
        </div>
        <div className="col-md-6 mt-3 mt-md-0 d-flex justify-content-md-end gap-3">
          <select 
            className="form-select shadow-sm" 
            style={{ borderRadius: '8px', maxWidth: '200px' }}
            value={statusFilter} 
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Confirmed</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
            <option value="4">Cancelled</option>
          </select>
          <Link to="/venders/doctors" className="btn btn-primary shadow-sm" style={{ borderRadius: '8px' }}>
            + Book Appointment
          </Link>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading appointments...</p>
        </div>
      ) : errorAppointments ? (
         <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <h4 className="text-danger">{errorAppointments}</h4>
            <button className="btn btn-outline-primary mt-2 mx-auto" style={{maxWidth: '200px'}} onClick={() => fetchAppointments(currentPageAppointment)}>
              Retry
            </button>
         </div>
      ) : appointments.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
           <h4 className="text-muted">No Appointments Found</h4>
           <Link to="/venders/doctors" className="btn btn-outline-primary mt-2 mx-auto" style={{maxWidth: '250px'}}>Book an Appointment</Link>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {loadingAppointments && !isInitialLoading && (
              <div className="col-12 text-center">
                  <small className="text-primary spinner-border spinner-border-sm me-2"></small>
                  <small className="text-primary">Updating status...</small>
              </div>
            )}

            {appointments.map((appointment) => {
              const id = getOrderId(appointment);
              const isCancellable = isAppointmentCancellable(appointment);
              const showCancel = cancelState.showCard[id];
              const isLoading = cancelState.loadingId === id;
              const info = cancelState.info[id];
              const isFree = appointment.isFreeConsultation || false;

              // ✅ Check for Prescription in Status 3
              const hasPrescription = String(appointment.orderStatus) === '3' && appointment.doctorPrescriptionPdf;
              const prescriptionUrl = hasPrescription ? getFileUrl(appointment.doctorPrescriptionPdf) : null;

              return (
                <div key={id} className="col-lg-6 col-xl-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
                    <div className="card-header bg-white border-bottom-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-muted small">#{id?.slice(-6).toUpperCase()}</span>
                      <StatusBadge status={appointment.orderStatus} isCancelled={appointment.cancellationStatus === 'cancelled'} />
                    </div>

                    <div className="card-body px-3 pt-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h5 className="fw-bold text-dark text-truncate mb-0">
                          {appointment.doctorName || 'Doctor'}
                        </h5>
                        
                        {/* ✅ Small Badge if Prescription is ready */}
                        {hasPrescription && (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2 py-1 ms-2" style={{fontSize: '0.65rem'}}>
                            <FaFileMedical className="me-1"/> Ready
                          </span>
                        )}
                      </div>
                      
                      <div className="text-muted small mb-3 text-truncate d-flex align-items-center">
                        <FaStethoscope className="me-1"/> {appointment.specialization || 'General Consultation'}
                      </div>

                      <div className="row g-2 mb-3 bg-light rounded-3 p-2 mx-0">
                        <div className="col-6 border-end">
                          <small className="text-muted d-block">Date</small>
                          <span className="fw-medium text-dark">{formatDate(appointment.bookingDate).split(',')[0]}</span>
                        </div>
                        <div className="col-6 ps-3">
                          <small className="text-muted d-block">Slot</small>
                          <span className="fw-medium text-dark">{appointment.timeSlot || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                              <small className="text-muted">Final Amount</small>
                              <div className={`fw-bold fs-5 ${isFree ? 'text-success' : 'text-primary'}`}>
                                {formatAmountDisplay(appointment)}
                              </div>
                          </div>
                          <div className="text-end">
                               <small className="text-muted">Payment</small>
                               <div className={`fw-bold ${appointment.isPaid || isFree ? 'text-success' : 'text-warning'}`}>
                                 {isFree ? 'Membership' : (appointment.isPaid ? 'Paid' : 'Pending')}
                               </div>
                          </div>
                      </div>

                      {/* Cancellation Card */}
                      {showCancel && info && (
                        <div className="alert alert-danger p-3 mb-3 shadow-sm position-relative">
                          <h6 className="fw-bold text-danger d-flex align-items-center"><FaExclamationTriangle className="me-2"/> Cancel Order?</h6>
                          
                          <div className="d-flex justify-content-between small mb-2 border-bottom pb-2">
                            <span>Cancellation Fee:</span>
                            <span className="text-danger fw-bold">₹{info.cancellationCharge}</span>
                          </div>
                          <div className="d-flex justify-content-between small mb-3">
                            <span>Refund Amount:</span>
                            <span className="text-success fw-bold">₹{info.refundAmount}</span>
                          </div>
                          
                          <div className="d-grid gap-2">
                              <button 
                                  type="button"
                                  className="btn btn-danger btn-sm fw-bold" 
                                  onClick={(e) => handleCancelOrder(e, appointment)} 
                                  disabled={isLoading}
                              >
                                  {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                              </button>
                              <button 
                                  type="button"
                                  className="btn btn-light btn-sm border" 
                                  onClick={(e) => closeCancelCard(e, id)}
                                  disabled={isLoading}
                              >
                                  Go Back
                              </button>
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <button 
                          type="button"
                          className="btn btn-primary w-100 py-2 rounded-3"
                          onClick={(e) => openDetailsModal(e, appointment)}
                        >
                          <FaFileMedical className="me-2" /> Details
                        </button>

                        {/* ✅ Direct Download Button on Card */}
                        {hasPrescription && (
                           <button 
                              type="button"
                              className="btn btn-success text-white w-100 py-2 rounded-3 fw-medium"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleDownload(prescriptionUrl, `Prescription_${id}.pdf`);
                              }}
                           >
                              <FaDownload className="me-2" /> Prescription
                           </button>
                        )}
                        
                        {isCancellable && !showCancel && (
                          <button 
                            type="button"
                            className="btn btn-outline-danger w-100 py-2 rounded-3"
                            onClick={(e) => handleCheckCancellation(e, appointment)}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Wait...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPagesAppointment > 1 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 pt-3 border-top">
              <div className="mb-2 mb-md-0">
                <small className="text-muted">
                  Page <span className="fw-bold">{currentPageAppointment}</span> of <span className="fw-bold">{totalPagesAppointment}</span>
                </small>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handlePageChange(currentPageAppointment - 1)}
                  disabled={currentPageAppointment === 1 || loadingAppointments}
                  style={{ borderRadius: '8px' }}
                >
                  Previous
                </button>
                {getPaginationRange().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="mx-1 text-muted">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPageAppointment === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handlePageChange(page)}
                      disabled={loadingAppointments}
                      style={{ borderRadius: '8px' }}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handlePageChange(currentPageAppointment + 1)}
                  disabled={currentPageAppointment === totalPagesAppointment || loadingAppointments}
                  style={{ borderRadius: '8px' }}
                >
                  Next
                </button>
              </div>
              <div>
                <select 
                  className="form-select form-select-sm shadow-sm"
                  style={{ borderRadius: '8px' }}
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="15">15 per page</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reusable Modal Adapted for Doctor Details */}
      {selectedAppointment && (
        <OrderDetailsModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)}
          getFileUrl={getFileUrl}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
}

// --- Details Modal Matching Lab Design Exactly ---
const OrderDetailsModal = ({ appointment, onClose, getFileUrl, handleDownload }) => {
    const id = appointment.orderId || appointment._id;
    const isFree = appointment.isFreeConsultation || false;
    const originalPrice = parseFloat(appointment.originalPrice) || parseFloat(appointment.amount) || 0;
    const discountAmount = parseFloat(appointment.discountAmount) || 0;
    const finalPrice = isFree ? 0 : (parseFloat(appointment.amount) || 0);
    
    // Documents
    const userPrescriptionUrl = getFileUrl(appointment.userUploadedPrescription);
    const doctorPrescriptionUrl = getFileUrl(appointment.doctorPrescriptionPdf);

    // Cancellation
    const cancellationCharge = parseFloat(appointment.cancellationCharge) || 0;
    const refundAmount = parseFloat(appointment.refundAmount) || 0;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-3">
                    
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title d-flex align-items-center">
                            <FaStethoscope className="me-2" /> Appointment Details
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body bg-light">
                        {/* Status Card */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 text-muted">Appointment ID</h6>
                                    <span className="fw-bold text-dark">#{id?.slice(-8).toUpperCase()}</span>
                                </div>
                                <StatusBadge status={appointment.orderStatus} isCancelled={appointment.cancellationStatus === 'cancelled'} />
                            </div>
                        </div>

                        {/* Cancelled Alert */}
                        {appointment.cancellationStatus === 'cancelled' && (
                            <div className="alert alert-danger d-flex align-items-center mb-3">
                                <FaExclamationTriangle className="me-3 fs-4" />
                                <div>
                                    <strong>Appointment Cancelled</strong>
                                    <div className="small">Refund Processed: ₹{refundAmount} | Charge: ₹{cancellationCharge}</div>
                                </div>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white fw-bold text-primary">
                                        <FaUserAlt className="me-2"/> Patient Information
                                    </div>
                                    <div className="card-body pt-2">
                                        <h6 className="fw-bold mb-1">{appointment.patientName}</h6>
                                        <p className="text-muted small mb-1">{appointment.patientPhone || 'N/A'}</p>
                                        <p className="text-muted small mb-0">Gender: {appointment.patientGender} | Age: {appointment.patientAge || 'N/A'}</p>
                                        {appointment.problemDescription && (
                                            <div className="mt-2 pt-2 border-top">
                                                <small className="text-muted d-block">Description:</small>
                                                <span className="small text-dark">{appointment.problemDescription}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white fw-bold text-success">
                                        <FaUserMd className="me-2"/> Doctor Information
                                    </div>
                                    <div className="card-body pt-2 d-flex align-items-center">
                                        <img 
                                          src={getFileUrl(appointment.doctorImage)} 
                                          alt={appointment.doctorName}
                                          className="rounded-circle shadow-sm me-3 border"
                                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                          onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{appointment.doctorName}</h6>
                                            <p className="text-muted small mb-0">{appointment.specialization}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white fw-bold">Financial Summary</div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Consultation Fee</span>
                                    <span className="fw-bold">₹{originalPrice.toFixed(2)}</span>
                                </div>

                                {/* Discounts */}
                                {discountAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Discount</span>
                                        <span>- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {isFree && (
                                    <div className="d-flex justify-content-between mb-2 text-success border-bottom pb-2">
                                        <span className="d-flex align-items-center">
                                            <FaTag className="me-2" /> Membership Benefit
                                        </span>
                                        <span>- ₹{originalPrice.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Coupon */}
                                {appointment.couponCode && !isFree && (
                                    <div className="d-flex justify-content-between mb-2 text-success border-bottom pb-2">
                                        <span className="d-flex align-items-center">
                                            <FaTag className="me-2" /> Coupon Applied ({appointment.couponCode})
                                        </span>
                                    </div>
                                )}

                                {/* Cancellation Charge */}
                                {cancellationCharge > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-danger">
                                        <span>Cancellation Charge</span>
                                        <span>- ₹{cancellationCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Refund Amount */}
                                {refundAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-3 text-success border-bottom pb-3">
                                        <span>Refund Amount</span>
                                        <span>+ ₹{refundAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <hr className="my-3" />
                                
                                {/* Final Total */}
                                <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
                                    <span>
                                        {appointment.cancellationStatus === 'cancelled' ? 'Refund Amount' : 'Final Amount'}
                                    </span>
                                    <span className={appointment.cancellationStatus === 'cancelled' || isFree ? 'text-success' : 'text-primary'}>
                                        {isFree ? 'FREE' : `₹${finalPrice.toFixed(2)}`}
                                    </span>
                                </div>

                                {/* Payment Status */}
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Payment Status:</span>
                                            <span className={`fw-medium ${
                                                isFree || appointment.isPaid ? 'text-success' : 'text-warning'
                                            }`}>
                                                {isFree ? 'COVERED BY MEMBERSHIP' : (appointment.isPaid ? 'PAID' : 'PENDING')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prescriptions (Like Lab Reports) */}
                        {(userPrescriptionUrl || doctorPrescriptionUrl) && (
                            <div className="card border-success mb-3 shadow-sm">
                                <div className="card-header bg-success text-white fw-bold">
                                    <FaFileMedical className="me-2"/> Documents & Prescriptions
                                </div>
                                <div className="card-body">
                                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                                        {userPrescriptionUrl && (
                                            <a 
                                              href={userPrescriptionUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="btn btn-outline-success"
                                            >
                                                <FaEye className="me-2"/> View Uploaded Doc
                                            </a>
                                        )}

                                        {doctorPrescriptionUrl && (
                                            <button 
                                              onClick={() => handleDownload(doctorPrescriptionUrl, `Doctor_Prescription_${id}.pdf`)}
                                              className="btn btn-success"
                                            >
                                                <FaDownload className="me-2"/> Download Prescription
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white fw-bold">Booking Details</div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Service Type</small>
                                        <div className="fw-medium">{appointment.serviceType || 'Consultation'}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Appointment Date</small>
                                        <div className="fw-medium">{formatDate(appointment.bookingDate).split(',')[0]}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Time Slot</small>
                                        <div className="fw-medium">{appointment.timeSlot || 'N/A'}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Booked On</small>
                                        <div className="fw-medium">{formatDate(appointment.createdAt || appointment.bookingDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer bg-white">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentHistory;