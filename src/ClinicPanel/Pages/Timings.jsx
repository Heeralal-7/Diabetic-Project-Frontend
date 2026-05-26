import React, { useState, useContext, useEffect } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicTimings = () => {
  const { updateClinicTimings, getClinicProfile, clinicData, loading } = useContext(MyContext);

  // Initial state
  const [timings, setTimings] = useState({
    startDay: 'Monday',
    endDay: 'Saturday',
    MorningStartTime: '09:00',
    MorningEndTime: '13:00',
    eveningStartTime: '14:00',
    eveningEndTime: '18:00',
    holiday: 'Sunday'
  });

  const [initialLoad, setInitialLoad] = useState(true);

  // Days options
  const daysOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  // Clinic profile se timings data get karo
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        await getClinicProfile();
      } catch (error) {
        toast.error('Failed to load clinic data');
      }
    };

    fetchClinicData();
  }, []);

  // Clinic data milte hi timings update karo
  useEffect(() => {
    if (clinicData && initialLoad) {
      console.log("Clinic data received:", clinicData);
      
      setTimings({
        startDay: clinicData.startDay || 'Monday',
        endDay: clinicData.endDay || 'Saturday',
        MorningStartTime: clinicData.MorningStartTime || '09:00',
        MorningEndTime: clinicData.MorningEndTime || '13:00',
        eveningStartTime: clinicData.eveningStartTime || '14:00',
        eveningEndTime: clinicData.eveningEndTime || '18:00',
        holiday: clinicData.holiday || 'Sunday'
      });
      
      setInitialLoad(false);
    }
  }, [clinicData, initialLoad]);

  const handleChange = (field, value) => {
    setTimings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!timings.startDay || !timings.endDay) {
      toast.error('Please select working days');
      return;
    }

    if (!timings.MorningStartTime || !timings.MorningEndTime) {
      toast.error('Please set morning shift timings');
      return;
    }

    if (!timings.eveningStartTime || !timings.eveningEndTime) {
      toast.error('Please set evening shift timings');
      return;
    }

    if (!timings.holiday) {
      toast.error('Please select holiday');
      return;
    }

    try {
      const response = await updateClinicTimings(timings);
      if (response.success) {
        toast.success('Clinic timings updated successfully!');
        // Refresh clinic data after update
        await getClinicProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update timings');
    }
  };

  // Calculate total working hours function
  const calculateTotalHours = () => {
    try {
      const morningStart = new Date(`2000-01-01T${timings.MorningStartTime}`);
      const morningEnd = new Date(`2000-01-01T${timings.MorningEndTime}`);
      const eveningStart = new Date(`2000-01-01T${timings.eveningStartTime}`);
      const eveningEnd = new Date(`2000-01-01T${timings.eveningEndTime}`);
      
      const morningHours = (morningEnd - morningStart) / (1000 * 60 * 60);
      const eveningHours = (eveningEnd - eveningStart) / (1000 * 60 * 60);
      
      // Handle negative hours (overnight)
      const totalHours = morningHours > 0 && eveningHours > 0 ? morningHours + eveningHours : 0;
      return totalHours.toFixed(1);
    } catch (error) {
      return '0.0';
    }
  };

  // Get working days count
  const getWorkingDaysCount = () => {
    const startIndex = daysOptions.indexOf(timings.startDay);
    const endIndex = daysOptions.indexOf(timings.endDay);
    
    if (startIndex === -1 || endIndex === -1) return 0;
    
    let count = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      if (daysOptions[i] !== timings.holiday) {
        count++;
      }
    }
    return count;
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-clock me-2"></i>
                Clinic Timings Management
              </h5>
              {clinicData && (
                <span className="badge bg-light text-dark">
                  <i className="bi bi-building me-1"></i>
                  {clinicData.clinicName}
                </span>
              )}
            </div>
            <div className="card-body">
              {/* Loading State */}
              {initialLoad && loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Loading clinic timings...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Working Days */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Start Day</label>
                        <select
                          className="form-select"
                          value={timings.startDay}
                          onChange={(e) => handleChange('startDay', e.target.value)}
                          disabled={loading}
                        >
                          {daysOptions.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">End Day</label>
                        <select
                          className="form-select"
                          value={timings.endDay}
                          onChange={(e) => handleChange('endDay', e.target.value)}
                          disabled={loading}
                        >
                          {daysOptions.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Morning Shift */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-sun me-2"></i>
                        Morning Shift Timings
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Start Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={timings.MorningStartTime}
                              onChange={(e) => handleChange('MorningStartTime', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">End Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={timings.MorningEndTime}
                              onChange={(e) => handleChange('MorningEndTime', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evening Shift */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-moon me-2"></i>
                        Evening Shift Timings
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Start Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={timings.eveningStartTime}
                              onChange={(e) => handleChange('eveningStartTime', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">End Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={timings.eveningEndTime}
                              onChange={(e) => handleChange('eveningEndTime', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Holiday */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-calendar-x me-2"></i>
                        Weekly Holiday
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Select Holiday</label>
                        <select
                          className="form-select"
                          value={timings.holiday}
                          onChange={(e) => handleChange('holiday', e.target.value)}
                          disabled={loading}
                        >
                          {daysOptions.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <small className="text-muted">
                          Select the day when your clinic remains closed
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating Timings...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Update Timings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Current Timings Summary */}
              {!initialLoad && (
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          Current Timings Summary
                        </h6>
                        
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                              <span className="fw-medium">Working Days:</span>
                              <span className="text-success">
                                {timings.startDay} to {timings.endDay}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                              <span className="fw-medium">Weekly Holiday:</span>
                              <span className="text-danger">{timings.holiday}</span>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <div className="card border">
                              <div className="card-body">
                                <h6 className="card-title text-center">
                                  <i className="bi bi-sun text-warning me-2"></i>
                                  Morning Shift
                                </h6>
                                <div className="text-center">
                                  <span className="fw-bold h5">
                                    {timings.MorningStartTime} - {timings.MorningEndTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="card border">
                              <div className="card-body">
                                <h6 className="card-title text-center">
                                  <i className="bi bi-moon text-primary me-2"></i>
                                  Evening Shift
                                </h6>
                                <div className="text-center">
                                  <span className="fw-bold h5">
                                    {timings.eveningStartTime} - {timings.eveningEndTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="row text-center mt-3">
                          <div className="col-md-4">
                            <div className="border rounded p-2 bg-white">
                              <h6 className="mb-1">Working Days</h6>
                              <span className="fw-bold text-primary fs-5">
                                {getWorkingDaysCount()}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="border rounded p-2 bg-white">
                              <h6 className="mb-1">Daily Hours</h6>
                              <span className="fw-bold text-success fs-5">
                                {calculateTotalHours()} hrs
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="border rounded p-2 bg-white">
                              <h6 className="mb-1">Weekly Hours</h6>
                              <span className="fw-bold text-info fs-5">
                                {(calculateTotalHours() * getWorkingDaysCount()).toFixed(1)} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicTimings;