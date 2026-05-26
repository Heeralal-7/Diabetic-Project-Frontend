import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const SubAdminCancellationSettings = () => {
  const { 
    getCancellationSettingsSub, 
    updateCancellationSettingsSub,
    loadingCancellationSettingsSub,
    errorCancellationSettingsSub,
    loadingUpdateSettingsSub,
    errorUpdateSettingsSub
  } = useContext(MyContext);
  
  const [settings, setSettings] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLocalLoading(true);
      const data = await getCancellationSettingsSub();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLocalSaving(true);
      await updateCancellationSettingsSub(settings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLocalSaving(false);
    }
  };

  const formatServiceName = (service) => {
    const names = {
      food: 'Food Delivery',
      pharmacy: 'Pharmacy',
      lab: 'Lab Test',
      doctor: 'Doctor Consultation'
    };
    return names[service] || service.toUpperCase();
  };

  // Loading state
  const isLoading = localLoading || loadingCancellationSettingsSub;
  const isSaving = localSaving || loadingUpdateSettingsSub;

  // Show errors if any
  if (errorCancellationSettingsSub) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Error: {errorCancellationSettingsSub}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchSettings}>
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading cancellation settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No cancellation settings found
        <button className="btn btn-sm btn-outline-warning ms-3" onClick={fetchSettings}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0">
                <i className="bi bi-gear me-2"></i>
                Cancellation Settings (SubAdmin)
              </h2>
              <small className="opacity-75">
                Manage cancellation charges for different services
              </small>
            </div>
            
            <div className="card-body">
              {/* Show update error if any */}
              {errorUpdateSettingsSub && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errorUpdateSettingsSub}
                  <button type="button" className="btn-close" onClick={() => {}}></button>
                </div>
              )}
              
              <div className="row g-4">
                {['food', 'pharmacy', 'lab', 'doctor'].map((service) => (
                  <div key={service} className="col-md-6 col-lg-3">
                    <div className="card h-100 border-primary">
                      <div className="card-header bg-light">
                        <h5 className="card-title mb-0 text-primary">
                          <i className={`bi ${
                            service === 'food' ? 'bi-egg-fried' :
                            service === 'pharmacy' ? 'bi-capsule' :
                            service === 'lab' ? 'bi-flask' :
                            'bi-heart-pulse'
                          } me-2`}></i>
                          {formatServiceName(service)}
                        </h5>
                      </div>
                      
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id={`switch-${service}`}
                              checked={settings[service]?.enabled || false}
                              onChange={(e) => setSettings({
                                ...settings,
                                [service]: { 
                                  ...settings[service], 
                                  enabled: e.target.checked 
                                }
                              })}
                              disabled={isSaving}
                            />
                            <label className="form-check-label" htmlFor={`switch-${service}`}>
                              Enable Cancellation
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Charge Type</label>
                          <select
                            className="form-select"
                            value={settings[service]?.chargeType || 'percentage'}
                            onChange={(e) => setSettings({
                              ...settings,
                              [service]: { 
                                ...settings[service], 
                                chargeType: e.target.value 
                              }
                            })}
                            disabled={isSaving}
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          {settings[service]?.chargeType === 'percentage' ? (
                            <>
                              <label className="form-label fw-semibold">Percentage (%)</label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={settings[service]?.percentage || ''}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    [service]: { 
                                      ...settings[service], 
                                      percentage: e.target.value 
                                    }
                                  })}
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  disabled={isSaving}
                                />
                                <span className="input-group-text">%</span>
                              </div>
                              <div className="form-text">
                                Percentage of order value to charge
                              </div>
                            </>
                          ) : (
                            <>
                              <label className="form-label fw-semibold">Fixed Amount</label>
                              <div className="input-group">
                                <span className="input-group-text">₹</span>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={settings[service]?.fixedAmount || ''}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    [service]: { 
                                      ...settings[service], 
                                      fixedAmount: e.target.value 
                                    }
                                  })}
                                  min="0"
                                  step="0.01"
                                  disabled={isSaving}
                                />
                              </div>
                              <div className="form-text">
                                Fixed amount to charge for cancellation
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-footer bg-transparent">
                        <small className="text-muted">
                          {settings[service]?.enabled ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Cancellation enabled
                            </span>
                          ) : (
                            <span className="text-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              Cancellation disabled
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={fetchSettings}
                      disabled={isLoading || isSaving}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-light">
              <div className="alert alert-info mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> These settings will apply to all future orders. Changes will not affect existing orders.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminCancellationSettings;