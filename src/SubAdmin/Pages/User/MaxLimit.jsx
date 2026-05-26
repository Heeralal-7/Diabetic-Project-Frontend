import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const MaxDistManageSub = () => {
  // Subadmin Context values destructuring
  const {
    distanceLimitSub,
    loadingDistanceSub,
    errorDistanceSub,
    fetchDistanceLimitSub,
    updateDistanceLimitSub,
  } = useContext(MyContext);
 
  const [currentView, setCurrentView] = useState('view');
 
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
 
  // Form State
  const [editForm, setEditForm] = useState({
    doctorLimit: '',
    clinicLimit: '',
    foodLimit: '',
    pharmacyLimit: '',
    labLimit: '',
  });
 
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  
  useEffect(() => {
    fetchDistanceLimitSub();
    // eslint-disable-next-line
  }, []);
 
  useEffect(() => {
    if (distanceLimitSub) {
      setEditForm({
        doctorLimit: distanceLimitSub.doctorLimit || '',
        clinicLimit: distanceLimitSub.clinicLimit || '',
        foodLimit: distanceLimitSub.foodLimit || '',
        pharmacyLimit: distanceLimitSub.pharmacyLimit || '',
        labLimit: distanceLimitSub.labLimit || '',
      });
    }
  }, [distanceLimitSub]);
 
  // Input Change Handler
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  // Switch to Edit Mode
  const handleSwitchToEdit = () => {
    if (distanceLimitSub) {
      setEditForm({
        doctorLimit: distanceLimitSub.doctorLimit || '',
        clinicLimit: distanceLimitSub.clinicLimit || '',
        foodLimit: distanceLimitSub.foodLimit || '',
        pharmacyLimit: distanceLimitSub.pharmacyLimit || '',
        labLimit: distanceLimitSub.labLimit || '',
      });
      setCurrentView('edit');
    }
  };
 
  // Notification Helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };
 
  // Submit Handler
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
   
    if (!distanceLimitSub?._id) {
      showNotification('error', 'Error: Record ID missing. Please refresh.');
      return;
    }
 
    setIsSubmitting(true);
 
    // API Payload creation
    const payload = {
      doctorLimit: Number(editForm.doctorLimit),
      clinicLimit: Number(editForm.clinicLimit),
      foodLimit: Number(editForm.foodLimit),
      pharmacyLimit: Number(editForm.pharmacyLimit),
      labLimit: Number(editForm.labLimit),
    };
 
    try {
     
      await updateDistanceLimitSub(distanceLimitSub._id, payload);
     
      showNotification('success', 'Distance limits updated successfully!');
     
      await fetchDistanceLimitSub();
      setCurrentView('view');
 
    } catch (error) {
      showNotification('error', error.message || 'Failed to update limits');
    } finally {
      setIsSubmitting(false);
    }
  };
 
 
  const NotificationComponent = () => {
    if (!notification.show) return null;
    const bgClass = notification.type === 'error' ? 'bg-danger' : 'bg-success';
   
    return (
      <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${bgClass}`} style={{ zIndex: 1050 }}>
        <div className="d-flex">
          <div className="toast-body">
            <strong>{notification.type === 'error' ? 'Error' : 'Success'}:</strong> {notification.message}
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setNotification({ ...notification, show: false })}></button>
        </div>
      </div>
    );
  };
 
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-map-marker-alt me-2"></i>Subadmin Distance Limits</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => fetchDistanceLimitSub()}
          disabled={loadingDistanceSub}
        >
          <i className="fas fa-sync-alt me-1"></i> Refresh
        </button>
      </div>
 
      <NotificationComponent />
 
      {/* Loading State */}
      {loadingDistanceSub && !distanceLimitSub && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p>Loading data...</p>
        </div>
      )}
 
      {/* Error State */}
      {errorDistanceSub && (
        <div className="alert alert-danger">{errorDistanceSub}</div>
      )}
 
      {/* Main Content */}
      {distanceLimitSub && !loadingDistanceSub && (
        <div className="card shadow">
          <div className="card-header bg-white py-3">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${currentView === 'view' ? 'active fw-bold' : ''}`}
                  onClick={() => setCurrentView('view')}
                >
                  View Limits
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${currentView === 'edit' ? 'active fw-bold' : ''}`}
                  onClick={handleSwitchToEdit}
                >
                  Edit Limits
                </button>
              </li>
            </ul>
          </div>
 
          <div className="card-body p-4">
            {currentView === 'view' ? (
              // VIEW MODE
              <div className="row g-4">
                {[
                  { label: 'Doctor Limit', val: distanceLimitSub.doctorLimit, icon: 'fa-user-md' },
                  { label: 'Clinic Limit', val: distanceLimitSub.clinicLimit, icon: 'fa-hospital' },
                  { label: 'Food Limit', val: distanceLimitSub.foodLimit, icon: 'fa-utensils' },
                  { label: 'Pharmacy Limit', val: distanceLimitSub.pharmacyLimit, icon: 'fa-pills' },
                  { label: 'Lab Limit', val: distanceLimitSub.labLimit, icon: 'fa-flask' },
                ].map((item, idx) => (
                  <div className="col-md-4" key={idx}>
                    <div className="p-3 border rounded bg-light d-flex align-items-center">
                      <div className="fs-2 text-primary me-3"><i className={`fas ${item.icon}`}></i></div>
                      <div>
                        <div className="text-muted small">{item.label}</div>
                        <div className="h4 mb-0">{item.val} <small className="fs-6 text-muted">km</small></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-12 text-muted small mt-3">
                  Last Updated: {distanceLimitSub.updatedAt ? new Date(distanceLimitSub.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            ) : (
              // EDIT MODE
              <form onSubmit={handleSubmitEdit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Doctor Limit (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="doctorLimit"
                      value={editForm.doctorLimit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Clinic Limit (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="clinicLimit"
                      value={editForm.clinicLimit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Food Limit (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="foodLimit"
                      value={editForm.foodLimit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Pharmacy Limit (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="pharmacyLimit"
                      value={editForm.pharmacyLimit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Lab Limit (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="labLimit"
                      value={editForm.labLimit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
 
                <div className="mt-4 d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentView('view')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default MaxDistManageSub;
 