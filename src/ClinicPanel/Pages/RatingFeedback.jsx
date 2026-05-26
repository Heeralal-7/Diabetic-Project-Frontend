// src/ClinicPanel/Pages/ClinicRatingsFeedback.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicRatingsFeedback = () => {
  const {
    getClinicOrderHistory, // Keeping this here temporarily, but better to move to AppointmentHistory
    getClinicRating,
    getClinicDoctors, // Keeping this here temporarily, but better to move to AppointmentHistory
    getRatingFeedbackClinic,
    loading
  } = useContext(MyContext);

  const [activeSubTab, setActiveSubTab] = useState('ratings');
  const [orderHistory, setOrderHistory] = useState([]); // Kept for now, should move if only used in appointments
  const [ratings, setRatings] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [clinicDoctors, setClinicDoctors] = useState([]); // Kept for now, should move if only used in appointments

  // Fetch clinic doctors (needed for reassignment in Appointment tab, but kept here for now based on original structure)
  const fetchClinicDoctors = useCallback(async () => {
    try {
      const doctorsData = await getClinicDoctors();
      setClinicDoctors(doctorsData.details || []);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  }, [getClinicDoctors]);

  // Fetch data based on active sub-tab
  const fetchData = useCallback(async () => {
    try {
      switch (activeSubTab) {
        case 'ratings':
          const ratingsData = await getClinicRating();
          setRatings(ratingsData);
          break;
        
        case 'feedback':
          const feedbackData = await getRatingFeedbackClinic();
          setFeedback(feedbackData.details || []);
          break;
        
        default:
          break;
      }
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${activeSubTab}`);
    }
  }, [activeSubTab ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render clinic status badge (copied from original for consistency if status is used here, though not apparent for Ratings/Feedback)
  const renderClinicStatusBadge = (status) => {
    const statusConfig = {
      '1': { label: 'Active', class: 'bg-success' },
      '2': { label: 'Pending', class: 'bg-warning' },
      '3': { label: 'Rejected', class: 'bg-danger' },
      '4': { label: 'Completed', class: 'bg-info' }
    };

    const config = statusConfig[status] || { label: 'Unknown', class: 'bg-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  return (
    <div className="card shadow-sm">
      {/* Navigation Sub-Tabs */}
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          {[
            { id: 'ratings', label: 'Ratings', icon: 'bi-star' },
            { id: 'feedback', label: 'Feedback', icon: 'bi-chat-left-text' }
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
        {/* Ratings Tab Content */}
        {activeSubTab === 'ratings' && (
          <>
            <h5 className="card-title text-primary"><i className="bi bi-star me-2"></i>Clinic Ratings Summary</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Loading ratings...</p>
              </div>
            ) : ratings ? (
              <div className="row">
                <div className="col-md-4 text-center border-end">
                  <div className="display-4 fw-bold text-primary">{ratings.overallRating || 0}</div>
                  <div className="text-muted">Overall Rating</div>
                  <div className="mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i
                        key={star}
                        className={`bi bi-star${star <= (ratings.overallRating || 0) ? '-fill text-warning' : ''} me-1 fs-4`}
                      ></i>
                    ))}
                  </div>
                  <div className="mt-2 small text-muted">Based on {ratings.count || 0} reviews</div>
                </div>
                <div className="col-md-8">
                  {[
                    { label: 'Excellent (5 Star)', value: ratings.excellent || 0, color: 'success' },
                    { label: 'Good (4 Star)', value: ratings.good || 0, color: 'info' },
                    { label: 'Average (3 Star)', value: ratings.average || 0, color: 'warning' },
                    { label: 'Below Average (2 Star)', value: ratings.belowAverage || 0, color: 'secondary' },
                    { label: 'Poor (1 Star)', value: ratings.poor || 0, color: 'danger' }
                  ].map(item => (
                    <div key={item.label} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">{item.label}</span>
                        <span className="fw-bold">{item.value}</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div
                          className={`progress-bar bg-${item.color}`}
                          style={{ width: `${(item.value / (ratings.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-star display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No Ratings Yet</h4>
                <p className="text-muted">Your clinic hasn't received any ratings yet.</p>
              </div>
            )}
          </>
        )}

        {/* Feedback Tab Content */}
        {activeSubTab === 'feedback' && (
          <>
            <h5 className="card-title text-info"><i className="bi bi-chat-left-text me-2"></i>Patient Feedback Details</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Loading feedback...</p>
              </div>
            ) : feedback.length > 0 ? (
              <div className="row">
                {feedback.map(item => (
                  <div key={item._id} className="col-lg-6 mb-3">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={item.userId?.image ? `${process.env.REACT_APP_API_URL}/${item.userId.image}` : '/default-avatar.jpg'}
                            alt={item.userId?.name}
                            className="rounded-circle me-3 border"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0">{item.userId?.name || 'Anonymous'}</h6>
                            <div className="text-warning">
                              {[1, 2, 3, 4, 5].map(star => (
                                <i
                                  key={star}
                                  className={`bi bi-star${star <= item.rating ? '-fill' : ''}`}
                                ></i>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="card-text border-top pt-2">{item.feedback || 'No feedback provided'}</p>
                        <small className="text-muted">
                          Feedback on: {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-chat-left display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No Feedback Yet</h4>
                <p className="text-muted">Your clinic hasn't received any feedback yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicRatingsFeedback;