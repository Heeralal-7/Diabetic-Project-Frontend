import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const Appointments = () => {
  const { getAllUserAppointments, appointments, loading } = useContext(MyContext);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 1
  });

  useEffect(() => {
    getAllUserAppointments(filters.type, filters.status, filters.page);
  }, [filters.type, filters.status, filters.page]);

  const getStatusBadge = (status) => {
    const statusMap = {
      '0': 'warning', // pending
      '1': 'success', // confirmed/approved
      '2': 'info',    // completed
      '3': 'danger',  // cancelled
      '6': 'secondary' // postponed
    };
    return statusMap[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const statusMap = {
      '0': 'Pending',
      '1': 'Confirmed',
      '2': 'Completed', 
      '3': 'Cancelled',
      '6': 'Postponed'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Handle different date formats from API
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(`${month}/${day}/${year}`).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const refreshAppointments = () => {
    getAllUserAppointments(filters.type, filters.status, filters.page);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Appointments</h2>
            <div className="d-flex gap-2 align-items-center">
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
              >
                <option value="">All Types</option>
                <option value="0">Digital</option>
                <option value="1">Walk-in</option>
              </select>
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              >
                <option value="">All Status</option>
                <option value="0">Pending</option>
                <option value="1">Confirmed</option>
                <option value="2">Completed</option>
                <option value="3">Cancelled</option>
                <option value="6">Postponed</option>
              </select>
              <button 
                className="btn btn-outline-primary"
                onClick={refreshAppointments}
                disabled={loading}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading appointments...</p>
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="row">
              {appointments.map((appt, index) => (
                <div key={appt.appointment?._id || index} className="col-12 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <h5 className="card-title">
                            Dr. {appt.doctor?.name || appt.appointment?.doctorDetails?.name || 'Unknown Doctor'}
                          </h5>
                          <p className="card-text">
                            <strong>Service:</strong> {appt.appointment?.serviceType || 'Consultation'}<br/>
                            <strong>Date:</strong> {formatDate(appt.appointment?.date)}<br/>
                            <strong>Time:</strong> {appt.appointment?.timeSlot || appt.appointment?.startime || 'N/A'}<br/>
                            <strong>Type:</strong> {appt.appointment?.type === '0' || appt.appointment?.type === 'Online' ? 'Digital' : 'Walk-in'}<br/>
                            <strong>Problem:</strong> {appt.appointment?.problemDescription || 'Not specified'}
                          </p>
                          {appt.patient && (
                            <p className="card-text">
                              <strong>Patient:</strong> {appt.patient.name} ({appt.appointment?.age} years)
                            </p>
                          )}
                        </div>
                        <div className="col-md-4 text-md-end">
                          <span className={`badge bg-${getStatusBadge(appt.appointment?.status)}`}>
                            {getStatusText(appt.appointment?.status)}
                          </span>
                          <div className="mt-3">
                            <strong>Fee: {appt.appointment?.price || '₹0'}</strong>
                          </div>
                          {appt.appointment?.prescribe && (
                            <button className="btn btn-sm btn-outline-primary mt-2">
                              View Prescription
                            </button>
                          )}
                          {appt.appointment?.PostponeStaus === "1" && (
                            <div className="mt-2">
                              <small className="text-warning">
                                <i className="fas fa-exclamation-triangle"></i> Postponed
                              </small>
                            </div>
                          )}
                          {appt.appointment?.isPaid && (
                            <div className="mt-2">
                              <small className="text-success">
                                <i className="fas fa-check-circle"></i> Paid
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h5>No appointments found</h5>
              <p className="text-muted">You haven't booked any appointments yet.</p>
            </div>
          )}

          {/* Pagination */}
          {appointments && appointments.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button 
                className="btn btn-outline-primary"
                disabled={filters.page === 1 || loading}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <span>Page {filters.page}</span>
              <button 
                className="btn btn-outline-primary"
                disabled={loading || (appointments && appointments.length < 10)}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;