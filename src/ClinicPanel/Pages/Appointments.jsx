import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicAppointmentHistory = ({ showReassignModal, setShowReassignModal }) => {
  const {
    getAllClinicAppointments,
    acceptOrRejectAppointmentClinic,
    reassignDoctor,
    getClinicOrderHistory,
    getClinicDoctors,
    loading
  } = useContext(MyContext);

  const [activeSubTab, setActiveSubTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [localShowReassignModal, setLocalShowReassignModal] = useState(false);

  // Use the prop if provided, otherwise use local state
  const displayReassignModal = showReassignModal !== undefined ? showReassignModal : localShowReassignModal;
  const setDisplayReassignModal = setShowReassignModal || setLocalShowReassignModal;

  // Fetch clinic doctors
  const fetchClinicDoctors = useCallback(async () => {
    try {
      const doctorsData = await getClinicDoctors();
      setClinicDoctors(doctorsData.details || []);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  }, [getClinicDoctors]);
  
  // Fetch data - USING WORKING ORDER HISTORY CODE
  const fetchData = useCallback(async () => {
    try {
      switch (activeSubTab) {
        case 'appointments':
          const appointmentsData = await getAllClinicAppointments();
          setAppointments(appointmentsData.details || []);
          break;
          
        case 'history':
          const historyData = await getClinicOrderHistory();
          setOrderHistory(historyData.data || []);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${activeSubTab}`);
    }
  }, [activeSubTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (displayReassignModal && !clinicDoctors.length) {
      fetchClinicDoctors();
    }
    if (!displayReassignModal && activeSubTab === 'appointments') {
      fetchData();
    }
  }, [displayReassignModal]);

  // Fix date format function - Handle DD-MM-YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Check if date is in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date object from DD-MM-YYYY
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN'); // Indian date format
      }
    }
    
    // Fallback to regular date parsing
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  // Appointment Actions
  const handleAcceptAppointment = async (appointmentId, currentStatus) => {
    try {
      // Decide the status to send
      let statusToSend = '1'; // default accepted
      if (currentStatus === '9') {
        statusToSend = '0'; // move from Order Placed to Pending (Doctor)
      }

      await acceptOrRejectAppointmentClinic(appointmentId, statusToSend);
      toast.success(
        currentStatus === '9'
          ? 'Order moved to Pending (Doctor)'
          : 'Appointment accepted successfully'
      );
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to accept appointment');
    }
  };

  const handleRejectAppointment = async (appointmentId, reason) => {
    if (!reason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await acceptOrRejectAppointmentClinic(appointmentId, '2', reason);
      toast.success('Appointment rejected successfully');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to reject appointment');
    }
  };

  const handleMarkAsDone = async (appointmentId) => {
    try {
      await acceptOrRejectAppointmentClinic(appointmentId, '3');
      toast.success('Appointment marked as done');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to mark appointment as done');
    }
  };

  const handleReassignDoctor = async (appointmentId, doctorId) => {
    if (!doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    try {
      await reassignDoctor(appointmentId, doctorId);
      toast.success('Doctor reassigned successfully');
      setDisplayReassignModal(false);
      setSelectedAppointment(null);
      setSelectedDoctor('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to reassign doctor');
    }
  };

  // Open reassign modal
  const openReassignModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDoctor(appointment.doctorId?._id || '');
    setDisplayReassignModal(true);
  };

  // Close reassign modal
  const closeReassignModal = () => {
    setDisplayReassignModal(false);
    setSelectedAppointment(null);
    setSelectedDoctor('');
  };

  // Check if accept/reject buttons should be shown
  const shouldShowAcceptRejectButtons = (status) => {
    // Show accept/reject only for pending statuses (0 and 9)
    return status === '0' || status === '9';
  };

  // Check if reassign button should be shown
  const shouldShowReassignButton = (status) => {
    // Show reassign for pending and accepted statuses (0, 1, 9)
    return status === '0' || status === '1' || status === '9';
  };

  // Check if mark as done button should be shown
  const shouldShowMarkAsDoneButton = (status) => {
    // Show mark as done only for accepted status (1)
    return status === '1';
  };

  // Status badge (appointment.status)
  const renderStatusBadge = (status) => {
    const statusConfig = {
      '9': { label: 'Order Placed (Waiting Clinic)', class: 'bg-primary' },
      '0': { label: 'Pending (Doctor)', class: 'bg-warning' },
      '1': { label: 'Accepted (Doctor)', class: 'bg-success' },
      '2': { label: 'Rejected', class: 'bg-danger' },
      '10': { label: 'Rejected', class: 'bg-danger' },
      '3': { label: 'Done', class: 'bg-info' }
    };
    const config = statusConfig[status] || { label: 'Unknown', class: 'bg-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  // Clinic status badge
  const renderClinicStatusBadge = (status) => {
    const statusConfig = {
      '1': { label: 'Active', class: 'bg-success' },
      '2': { label: 'Pending (Clinic Approved)', class: 'bg-warning' },
      '3': { label: 'Rejected', class: 'bg-danger' },
      '4': { label: 'Completed', class: 'bg-info' }
    };
    const config = statusConfig[status] || { label: 'Unknown', class: 'bg-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };
  
  return (
    <div className="card shadow-sm">
      {/* Tabs */}
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          {[
            { id: 'appointments', label: 'Appointments', icon: 'bi-calendar-check' },
            { id: 'history', label: 'Order History', icon: 'bi-clock-history' },
          ].map(tab => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-link ${activeSubTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab.id)}
              >
                <i className={`bi ${tab.icon} me-2`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-body">
        {/* Appointments */}
        {activeSubTab === 'appointments' && (
          <>
            <h5 className="card-title text-primary">
              <i className="bi bi-calendar-check me-2"></i>Clinic Appointments
            </h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appointment => (
                      <tr key={appointment._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            
                            <div>
                              <div className="fw-bold">{appointment.patientDetails?.name || 'N/A'}</div>
                              <small className="text-muted">{appointment.patientDetails?.phone || ''}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">Dr. {appointment.doctorDetails?.name || 'N/A'}</div>
                          <small className="text-muted">{appointment.doctorDetails?.specialist || ''}</small>
                        </td>
                        <td>
                          <div>{formatDate(appointment.date)}</div>
                          <small className="text-muted">{appointment.timeSlot || appointment.time || ''}</small>
                        </td>
                        <td>{appointment.price || '0'}</td>
                        <td>
                          <span className={`badge ${appointment.type === 'Online' ? 'bg-info' : 'bg-secondary'}`}>
                            {appointment.type || 'Offline'}
                          </span>
                        </td>
                        <td>{renderStatusBadge(appointment.status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {/* Accept/Reject Buttons - Only show for pending statuses */}
                            {shouldShowAcceptRejectButtons(appointment.status) && (
                              <>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleAcceptAppointment(appointment._id, appointment.status)}
                                  disabled={loading}
                                  title="Accept"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => {
                                    const reason = prompt('Please provide reason for rejection:');
                                    if (reason) handleRejectAppointment(appointment._id, reason);
                                  }}
                                  disabled={loading}
                                  title="Reject"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            )}
                            
                            {/* Reassign Button - Show for pending and accepted statuses */}
                            {shouldShowReassignButton(appointment.status) && (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => openReassignModal(appointment)}
                                disabled={loading}
                                title="Reassign Doctor"
                              >
                                <i className="bi bi-arrow-left-right"></i>
                              </button>
                            )}
                            
                            {/* Mark as Done Button - Only show for accepted status */}
                            {shouldShowMarkAsDoneButton(appointment.status) && (
                              <button
                                className="btn btn-outline-info"
                                onClick={() => handleMarkAsDone(appointment._id)}
                                disabled={loading}
                                title="Mark as Done"
                              >
                                <i className="bi bi-check-all"></i>
                              </button>
                            )}
                            
                            {/* No actions message for completed/rejected appointments */}
                            {(appointment.status === '2' || appointment.status === '3' || appointment.status === '10') && (
                              <span className="text-muted small">No actions available</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No Appointments</h4>
                <p className="text-muted">No appointments found for your clinic.</p>
              </div>
            )}
          </>
        )}

        {/* History - USING WORKING ORDER HISTORY CODE */}
        {activeSubTab === 'history' && (
          <>
            <h5 className="card-title text-success">
              <i className="bi bi-clock-history me-2"></i>Order History
            </h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Loading order history...</p>
              </div>
            ) : orderHistory.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map(order => (
                      <tr key={order._id}>
                        <td>{order.patientDetails?.name || 'N/A'}</td>
                        <td>Dr. {order.doctorDetails?.name || 'N/A'}</td>
                        <td>{formatDate(order.date)}</td>
                        <td>{order.price || '0'}</td>
                        <td>{renderStatusBadge(order.status)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-receipt display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No Order History</h4>
                <p className="text-muted">No completed orders found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reassign Modal */}
      {displayReassignModal && selectedAppointment && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reassign Doctor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeReassignModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Reassign appointment for <strong>{selectedAppointment.patientDetails?.name}</strong> (Status:{' '}
                  {renderStatusBadge(selectedAppointment.status).props.children})
                </p>
                <div className="mb-3">
                  <label className="form-label">Select Doctor</label>
                  <select
                    className="form-select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Choose a doctor...</option>
                    {clinicDoctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeReassignModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReassignDoctor(selectedAppointment._id, selectedDoctor)}
                  disabled={loading || !selectedDoctor}
                >
                  {loading ? 'Reassigning...' : 'Reassign Doctor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicAppointmentHistory;