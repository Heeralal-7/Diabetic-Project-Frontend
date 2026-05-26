import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CutoffSettingsPanel = () => {
  const [settings, setSettings] = useState({
    foodCutoff: 5,
    pharmacyCutoff: 5,
    labCutoff: 5,
    doctorCutoff: 5,
    clinicCutoff: 5,
    membershipCutoff: 10 // ✅ MEMBERSHIP CUTOFF ADDED
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCutoffSettings();
  }, []);

  const getToken = () => {
    const data = sessionStorage.getItem("admin");
    if (!data) return null;
    try {
      return JSON.parse(data).token;
    } catch {
      return null;
    }
  };

  const fetchCutoffSettings = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/cutoff-settings`,
        { headers: { token } }
      );

      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cutoff settings:', error);
      alert('Error fetching cutoff settings');
    }
  };

  const updateCutoffSettings = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin-revenue/cutoff-settings`,
        settings,
        { headers: { token } }
      );

      if (response.data.success) {
        alert('Cutoff settings updated successfully!');
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating cutoff settings:', error);
      alert('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCutoffChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: Math.min(100, Math.max(0, value))
    }));
  };

  // ✅ Helper function to get category icon and color
  const getCategoryInfo = (type) => {
    const categoryMap = {
      foodCutoff: { 
        label: 'Food Orders', 
        icon: 'fas fa-utensils', 
        color: 'primary',
        description: 'Restaurant and food delivery orders'
      },
      pharmacyCutoff: { 
        label: 'Pharmacy Orders', 
        icon: 'fas fa-pills', 
        color: 'success',
        description: 'Medicine and pharmacy product orders'
      },
      labCutoff: { 
        label: 'Lab Orders', 
        icon: 'fas fa-flask', 
        color: 'info',
        description: 'Lab tests and diagnostic services'
      },
      doctorCutoff: { 
        label: 'Doctor Orders', 
        icon: 'fas fa-user-md', 
        color: 'warning',
        description: 'Independent doctor consultations'
      },
      clinicCutoff: { 
        label: 'Clinic Orders', 
        icon: 'fas fa-hospital', 
        color: 'danger',
        description: 'Clinic-based doctor consultations'
      },
      membershipCutoff: { 
        label: 'Membership Purchases', 
        icon: 'fas fa-crown', 
        color: 'info', // ✅ MEMBERSHIP COLOR
        description: 'Doctor membership plan purchases'
      }
    };
    return categoryMap[type] || { label: type, icon: 'fas fa-cog', color: 'secondary' };
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-gradient-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-percentage me-2"></i>
              Revenue Cutoff Settings
            </h4>
            <span className="badge bg-light text-primary fs-6">
              Admin Commission Control
            </span>
          </div>
          <p className="mb-0 mt-2 opacity-75">
            Set commission percentages for different service categories
          </p>
        </div>

        <div className="card-body p-4">
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-info border-0">
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle fa-lg me-3"></i>
                  <div>
                    <strong>How it works:</strong> Set the percentage of each order that goes to admin as commission. 
                    The remaining amount goes to the vendor/doctor/clinic.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Food */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-2 border-primary ">
                <div className="card-header bg-primary bg-opacity-10 ">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-utensils text-primary me-2"></i>
                    <h6 className="mb-0 text-primary fw-bold">Food Orders</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Restaurant and food delivery orders
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-primary fs-6">{settings.foodCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.foodCutoff}
                    onChange={(e) =>
                      handleCutoffChange("foodCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Pharmacy */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-success">
                <div className="card-header bg-success bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-pills text-success me-2"></i>
                    <h6 className="mb-0 text-success fw-bold">Pharmacy Orders</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Medicine and pharmacy product orders
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-success fs-6">{settings.pharmacyCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.pharmacyCutoff}
                    onChange={(e) =>
                      handleCutoffChange("pharmacyCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Lab */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-info">
                <div className="card-header bg-info bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-flask text-info me-2"></i>
                    <h6 className="mb-0 text-info fw-bold">Lab Orders</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Lab tests and diagnostic services
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-info fs-6">{settings.labCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.labCutoff}
                    onChange={(e) =>
                      handleCutoffChange("labCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Doctor */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-warning">
                <div className="card-header bg-warning bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-md text-warning me-2"></i>
                    <h6 className="mb-0 text-warning fw-bold">Doctor Orders</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Independent doctor consultations
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-warning fs-6">{settings.doctorCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.doctorCutoff}
                    onChange={(e) =>
                      handleCutoffChange("doctorCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Clinic */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-danger">
                <div className="card-header bg-danger bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-hospital text-danger me-2"></i>
                    <h6 className="mb-0 text-danger fw-bold">Clinic Orders</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Clinic-based doctor consultations
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-danger fs-6">{settings.clinicCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.clinicCutoff}
                    onChange={(e) =>
                      handleCutoffChange("clinicCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* ✅ MEMBERSHIP - NEW CARD */}
            <div className="col-lg-6 col-xl-4">
              <div className="card h-100 border-info">
                <div className="card-header bg-info bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-crown text-info me-2"></i>
                    <h6 className="mb-0 text-info fw-bold">Membership Purchases</h6>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Doctor membership plan purchases
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Current Cutoff:</span>
                    <span className="badge bg-info fs-6">{settings.membershipCutoff}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.membershipCutoff}
                    onChange={(e) =>
                      handleCutoffChange("membershipCutoff", parseInt(e.target.value))
                    }
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Summary Card */}
            <div className="col-12">
              <div className="card h-100 border-0 bg-light">
                <div className="card-header bg-secondary bg-opacity-10 border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-chart-pie text-secondary me-2"></i>
                    <h6 className="mb-0 text-secondary fw-bold">Current Settings Summary</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm ">
                        <i className="fas fa-utensils text-primary me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Food</small>
                          <strong className="text-primary fs-5">{settings.foodCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                        <i className="fas fa-pills text-success me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Pharmacy</small>
                          <strong className="text-success fs-5">{settings.pharmacyCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                        <i className="fas fa-flask text-info me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Lab</small>
                          <strong className="text-info fs-5">{settings.labCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                        <i className="fas fa-user-md text-warning me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Doctor</small>
                          <strong className="text-warning fs-5">{settings.doctorCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                        <i className="fas fa-hospital text-danger me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Clinic</small>
                          <strong className="text-danger fs-5">{settings.clinicCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6">
                      <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                        <i className="fas fa-crown text-info me-3 fs-4"></i>
                        <div>
                          <small className="text-muted d-block">Membership</small>
                          <strong className="text-info fs-5">{settings.membershipCutoff}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                 
                  {/* Average Calculations */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded shadow-sm">
                        <h6 className="text-secondary mb-2">
                          <i className="fas fa-stethoscope me-2"></i>
                          Medical Services Average
                        </h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Doctor + Clinic</span>
                          <strong className="text-secondary fs-5">
                            {((settings.doctorCutoff + settings.clinicCutoff) / 2).toFixed(1)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded shadow-sm">
                        <h6 className="text-dark mb-2">
                          <i className="fas fa-chart-line me-2"></i>
                          Overall Platform Average
                        </h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>All Categories</span>
                          <strong className="text-dark fs-5">
                            {(
                              (settings.foodCutoff +
                               settings.pharmacyCutoff +
                               settings.labCutoff +
                               settings.doctorCutoff +
                               settings.clinicCutoff +
                               settings.membershipCutoff) / 6
                            ).toFixed(1)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-5">
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-primary px-5 py-2 fw-bold"
                onClick={updateCutoffSettings}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Updating Settings...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Update All Settings
                  </>
                )}
              </button>
              
              <button
                className="btn btn-outline-secondary px-4 py-2"
                onClick={fetchCutoffSettings}
                disabled={loading}
              >
                <i className="fas fa-sync me-2"></i>
                Refresh
              </button>
            </div>
            
            <p className="text-muted small mt-3">
              Changes will affect all future orders. Existing orders will maintain their original cutoff percentages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CutoffSettingsPanel;