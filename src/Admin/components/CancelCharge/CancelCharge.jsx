import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const AdminCancellationSettings = () => {
  const { 
    getCancellationSettings, 
    updateCancellationSettings,
    getCancelledOrdersAdmin 
  } = useContext(MyContext);
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getCancellationSettings();
      setSettings(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateCancellationSettings(settings);
      alert('Settings updated successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No settings found
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
                Cancellation Settings
              </h2>
            </div>
            
            <div className="card-body">
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
                                <span className="input-group-text">$</span>
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
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
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

export default AdminCancellationSettings;