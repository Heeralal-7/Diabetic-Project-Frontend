import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context'; 

const DoctorAvailability = () => {
  const {
    availability1,
    loading,
    error,
    setError,
    createAvailability1,
    getAllStartAndEndDate1,
    getAvailabiltyOfDoctorAndTime1,
    deleteAvailability1,
    timeSlots,
    formatDateForDisplay,
  } = useContext(MyContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDatesForSlots, setSelectedDatesForSlots] = useState({ 
    startDate: '', 
    endDate: '' 
  });
  const [localLoading, setLocalLoading] = useState(false); // For local operations

  const [formData, setFormData] = useState({
    day: 'Morning',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    slotTime: '30'
  });

  // Fetch availability dates on component mount
  useEffect(() => {
    const fetchData = async () => {
      await getAllStartAndEndDate1();
    };
    fetchData();
  }, []);

  // Handle form input changes for creation
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError(null);
  };

  // Handle date selection for the "Get Time Slots" section
  const handleSlotsDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDatesForSlots({
      ...selectedDatesForSlots,
      [name]: value
    });
    if (error) setError(null);
  };

  // Submit availability creation form (Fixed)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    // Basic Validation
    if (!formData.startTime || !formData.endTime || !formData.startDate || !formData.endDate) {
      setError('Please fill all required fields (Start/End Time, Start/End Date)');
      setLocalLoading(false);
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      setError('Start time must be before end time.');
      setLocalLoading(false);
      return;
    }
    
    if (formData.startDate > formData.endDate) {
      setError('Start date must be before or the same as end date.');
      setLocalLoading(false);
      return;
    }

    try {
      const response = await createAvailability1(formData);
      if (response.success) {
        setShowCreateForm(false);
        setFormData({
          day: 'Morning',
          startTime: '',
          endTime: '',
          startDate: '',
          endDate: '',
          slotTime: '30'
        });
      }
    } catch (err) {
      console.error('Error in handleCreateSubmit:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Get time slots for selected dates (Fixed)
  const handleGetTimeSlots = async () => {
    if (!selectedDatesForSlots.startDate || !selectedDatesForSlots.endDate) {
      setError('Please select both start and end dates for slots.');
      return;
    }
    
    if (selectedDatesForSlots.startDate > selectedDatesForSlots.endDate) {
      setError('Start date must be before or the same as end date.');
      return;
    }

    try {
      await getAvailabiltyOfDoctorAndTime1(selectedDatesForSlots.startDate, selectedDatesForSlots.endDate);
    } catch (err) {
      console.error('Error in handleGetTimeSlots:', err);
    }
  };

  // Handle deletion with confirmation (Fixed)
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this availability? This action cannot be undone.");
    if (!isConfirmed) return;

    setLocalLoading(true);
    try {
      const success = await deleteAvailability1(id);
      if (success) {
        console.log("Availability deleted successfully");
      } else {
        console.error("Failed to delete availability");
      }
    } catch (err) {
      console.error("Error in handleDelete:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Helper to render time slots, categorized by day part
  const renderTimeSlots = (slotsGroup) => {
    return (
      <>
        {slotsGroup.Morning && slotsGroup.Morning.length > 0 && (
          <div className="card mb-3">
            <div className="card-header bg-primary text-white"><strong>Morning</strong></div>
            <div className="card-body">
              {slotsGroup.Morning.map((slot, slotIndex) => (
                <span key={slotIndex} className="badge bg-light text-dark me-1 mb-1">{slot}</span>
              ))}
            </div>
          </div>
        )}
        {slotsGroup.Afternoon && slotsGroup.Afternoon.length > 0 && (
          <div className="card mb-3">
            <div className="card-header bg-warning text-dark"><strong>Afternoon</strong></div>
            <div className="card-body">
              {slotsGroup.Afternoon.map((slot, slotIndex) => (
                <span key={slotIndex} className="badge bg-light text-dark me-1 mb-1">{slot}</span>
              ))}
            </div>
          </div>
        )}
        {slotsGroup.Evening && slotsGroup.Evening.length > 0 && (
          <div className="card mb-3">
            <div className="card-header bg-secondary text-white"><strong>Evening</strong></div>
            <div className="card-body">
              {slotsGroup.Evening.map((slot, slotIndex) => (
                <span key={slotIndex} className="badge bg-light text-dark me-1 mb-1">{slot}</span>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Availability Management</h4>
                <small className="text-muted">Manage your consultation time slots</small>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={loading}
              >
                {showCreateForm ? 'Cancel' : 'Add New Availability'}
              </button>
            </div>

            <div className="card-body">
              {/* Error Message Display */}

              {/* Create Availability Form */}
              {showCreateForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Add New Availability</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleCreateSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Day Session *</label>
                          <select
                            className="form-select"
                            name="day"
                            value={formData.day}
                            onChange={handleCreateFormChange}
                            required
                          >
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Slot Time (minutes) *</label>
                          <select
                            className="form-select"
                            name="slotTime"
                            value={formData.slotTime}
                            onChange={handleCreateFormChange}
                            required
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Start Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleCreateFormChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">End Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleCreateFormChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Start Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleCreateFormChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">End Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleCreateFormChange}
                            required
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="text-end">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={localLoading || loading}
                        >
                          {localLoading ? 'Creating...' : 'Create Availability'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Get Time Slots Section */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5>View Available Time Slots</h5>
                </div>
                <div className="card-body">
                  <div className="row align-items-end">
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={selectedDatesForSlots.startDate}
                        onChange={handleSlotsDateChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={selectedDatesForSlots.endDate}
                        onChange={handleSlotsDateChange}
                        min={selectedDatesForSlots.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <button
                        className="btn btn-info w-100"
                        onClick={handleGetTimeSlots}
                        disabled={loading || !selectedDatesForSlots.startDate || !selectedDatesForSlots.endDate}
                      >
                        {loading ? 'Loading...' : 'Get Slots'}
                      </button>
                    </div>
                  </div>

                  {/* Display Time Slots */}
                  {timeSlots && timeSlots.length > 0 && (
                    <div className="mt-4">
                      <h6>Available Time Slots:</h6>
                      <div className="row">
                        {timeSlots.map((slotGroup, index) => (
                          <div key={index} className="col-md-4 mb-3">
                            {renderTimeSlots(slotGroup)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {timeSlots && timeSlots.length === 0 && (
                    <div className="alert alert-info mt-3" role="alert">
                      No time slots found for the selected date range.
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Dates List */}
              <div className="card">
                <div className="card-header">
                  <h5>Your Existing Availability</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Session</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Slot Duration</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && availability1.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : availability1.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              No availability dates found. Try adding some.
                            </td>
                          </tr>
                        ) : (
                          availability1.map((availability) => (
                            <tr key={availability._id}>
                              <td>
                                <span className={`badge ${
                                  availability.day === 'Morning' ? 'bg-primary' :
                                  availability.day === 'Afternoon' ? 'bg-warning text-dark' : 'bg-secondary'
                                }`}>
                                  {availability.day}
                                </span>
                              </td>
                              <td>{formatDateForDisplay(availability.startDate)}</td>
                              <td>{formatDateForDisplay(availability.endDate)}</td>
                              <td>{availability.startTime}</td>
                              <td>{availability.endTime}</td>
                              <td>{availability.slotTime} minutes</td>
                              <td>
                                <button
                                  className="btn btn-danger btn-sm me-1"
                                  onClick={() => handleDelete(availability._id)}
                                  disabled={localLoading || loading}
                                >
                                  {localLoading ? 'Deleting...' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;