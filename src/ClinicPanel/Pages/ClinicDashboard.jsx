import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../Context/Context';
import '../Css/ClinicDashboard.css';

// ✅ नया इम्पोर्ट: Revenue कंपोनेंट को इम्पोर्ट करें
// आपको अपने फ़ाइल स्ट्रक्चर के अनुसार पथ (path) को समायोजित (adjust) करना होगा।
import Revenue from './Revenue'; // मान लीजिए Revenue.js यहीं है, या सही पथ दें।

const ClinicDashboard = () => {
  const {
    clinicData,
    // Context से आने वाली variables (Doctor, Specialist, Achievement data)
    clinicDoctors, 
    clinicAchievements,
    clinicSpecialists,
    loading,
    error,
    getClinicProfile,
    getClinicDoctors,
    getClinicAchievements,
    getClinicSpecialists,
    // ✅ हटाया गया: getClinicOrderHistory अब Revenue कंपोनेंट में कॉल होगा।
    getClinicRating,
    getAllClinicAppointments
  } = useContext(MyContext);

  const navigate = useNavigate();
  // ✅ हटाया गया: const [orderHistory, setOrderHistory] = useState([]);
  const [clinicRatings, setClinicRatings] = useState(null);
  const [appointments, setAppointments] = useState([]); 
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    totalSpecialists: 0,
    totalAchievements: 0
  });

  const [revenueRefreshKey, setRevenueRefreshKey] = useState(0); // Revenue component को refresh करने के लिए

  // Fetch all data for overview (API calls for all context data and the second batch)
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // First batch: Updates MyContext
        await Promise.all([
          getClinicProfile(),
          getClinicDoctors(),
          getClinicAchievements(),
          getClinicSpecialists()
        ]);

        // Second batch: Updates local state (ratings, appointments)
        await loadOverviewData(); 
        setRevenueRefreshKey(prev => prev + 1); // Revenue component को भी refresh करें
      } catch (err) {
        console.error('Error fetching overview data:', err);
      }
    };

    fetchOverviewData();
  }, []);

  // Stats Calculation (Runs AFTER Context/Local state is updated) - Race Condition Fix
  useEffect(() => {
    setStats({
      totalDoctors: clinicDoctors.length,
      totalAppointments: appointments.length, 
      totalSpecialists: clinicSpecialists.length,
      totalAchievements: clinicAchievements.length
    });
  }, [clinicDoctors, clinicSpecialists, clinicAchievements, appointments]);


  const loadOverviewData = async () => {
    try {
      // ✅ getClinicOrderHistory() को हटा दिया गया है
      const [ratingsRes, appointmentsRes] = await Promise.all([
        getClinicRating(),
        getAllClinicAppointments()
      ]);

      // ✅ हटाया गया: if (orderHistoryRes.success) setOrderHistory(orderHistoryRes.data || []);
      
      if (ratingsRes.success) setClinicRatings(ratingsRes.data);
      
      // Appointments: यह मानकर चल रहे हैं कि यह API 'details' key के साथ आता है।
      if (appointmentsRes.success) setAppointments(appointmentsRes.details || []);

    } catch (err) {
      console.error('Error loading overview data:', err);
    }
  };

  // Navigation functions (कोई बदलाव नहीं)
  const navigateToDoctors = () => {
    navigate('/clinic/doctors');
  };

  const navigateToAchievements = () => {
    navigate('/clinic/achievements');
  };

  const navigateToSpecialists = () => {
    navigate('/clinic/services');
  };

  const navigateToAppointments = () => {
    navigate('/clinic/appointments');
  };

  // ✅ हटाया गया: prepareGraphData function

  // ✅ हटाया गया: const graphData = prepareGraphData();

  return (
    <div className="clinic-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Clinic Dashboard</h1>
        {clinicData && (
          <div className="clinic-info">
            <h2>{clinicData.clinicName}</h2>
            <p>{clinicData.email} | {clinicData.phone}</p>
            <div className="clinic-status">
              <span className={`status-badge status-${clinicData.status || 'active'}`}>
                {clinicData.status || 'Active'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading Dashboard Data...</p>
        </div>
      )}

      {/* Stats Cards with Navigation Buttons (कोई बदलाव नहीं) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-info">
              <h3>{stats.totalDoctors}</h3>
              <p>Total Doctors</p>
            </div>
          </div>
          <button 
            onClick={navigateToDoctors}
            className="nav-button"
            disabled={stats.totalDoctors === 0}
          >
            View Doctors →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <button 
            onClick={navigateToAppointments}
            className="nav-button"
            disabled={stats.totalAppointments === 0}
          >
            View Appointments →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.totalSpecialists}</h3>
              <p>Specialists</p>
            </div>
          </div>
          <button 
            onClick={navigateToSpecialists}
            className="nav-button"
            disabled={stats.totalSpecialists === 0}
          >
            View Specialists →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats.totalAchievements}</h3>
              <p>Achievements</p>
            </div>
          </div>
          <button 
            onClick={navigateToAchievements}
            className="nav-button"
            disabled={stats.totalAchievements === 0}
          >
            View Achievements →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="overview-content">
        
        {/* ✅ Revenue Graph Section को Revenue Component से बदल दिया गया है */}
        {/* <div className="graph-section full-width-revenue"> 
            <div className="section-header">
                <h3>Revenue Overview</h3>
                <button className="view-details-button" onClick={() => navigate('/clinic/revenue')}>
                  View Details
                </button>
            </div>

            <Revenue 
                refreshKey={revenueRefreshKey} 

            />
        </div> */}
        
        {/* Recent Appointments Section (कोई बदलाव नहीं) */}
        <div className="recent-appointments">
          <div className="section-header">
            <h3>Recent Appointments</h3>
            <button className="view-all-button" onClick={navigateToAppointments}>
              View All
            </button>
          </div>
          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.slice(0, 5).map((appointment, index) => (
                <div key={appointment._id || index} className="appointment-item">
                  <div className="appointment-info">
                    <div className="patient-info">
                      <strong>{appointment.patientDetails?.name || 'N/A'}</strong>
                      <span className="appointment-service">
                        {appointment.serviceType || 'Consultation'}
                      </span>
                    </div>
                    <div className="appointment-meta">
                      <span className="appointment-date">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                      <span className="appointment-time">
                        {appointment.timeSlot}
                      </span>
                    </div>
                  </div>
                  <div className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-card">
              <p>No recent appointments</p>
              <button className="secondary-button" onClick={() => navigate('/clinic/schedule')}>
                Schedule Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ratings Section (कोई बदलाव नहीं) */}
      {clinicRatings && (
        <div className="ratings-section">
          <div className="section-header">
            <h3>Clinic Ratings</h3>
            <button className="view-all-button" onClick={() => navigate('/clinic/ratings')}>
              View All Reviews
            </button>
          </div>
          <div className="ratings-card">
            <div className="rating-overview">
              <div className="rating-score">
                {clinicRatings.averageRating ? clinicRatings.averageRating.toFixed(1) : '0.0'}
                <span className="rating-out-of">/5.0</span>
              </div>
              <div className="rating-stars">
                {'★'.repeat(Math.floor(clinicRatings.averageRating || 0))}
                {'☆'.repeat(5 - Math.floor(clinicRatings.averageRating || 0))}
              </div>
              <div className="rating-count">
                Based on {clinicRatings.totalRatings || 0} reviews
              </div>
            </div>
            <div className="rating-breakdown">
              <div className="breakdown-item">
                <span>5 Stars</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ 
                      width: `${((clinicRatings.fiveStar || 0) / (clinicRatings.totalRatings || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span>{clinicRatings.fiveStar || 0}</span>
              </div>
              <div className="breakdown-item">
                <span>4 Stars</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ 
                      width: `${((clinicRatings.fourStar || 0) / (clinicRatings.totalRatings || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span>{clinicRatings.fourStar || 0}</span>
              </div>
              <div className="breakdown-item">
                <span>3 Stars</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ 
                      width: `${((clinicRatings.threeStar || 0) / (clinicRatings.totalRatings || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span>{clinicRatings.threeStar || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (कोई बदलाव नहीं) */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-button" onClick={() => navigate('/clinic/doctors')}>
            <span className="action-icon">➕</span>
            <span>Add New Doctor</span>
          </button>
          <button className="action-button" onClick={() => navigate('/clinic/achievements')}>
            <span className="action-icon">📸</span>
            <span>Upload Achievement</span>
          </button>
          <button className="action-button" onClick={() => navigate('/clinic/services')}>
            <span className="action-icon">🎯</span>
            <span>Add Specialist</span>
          </button>
          <button className="action-button" onClick={() => navigate('/clinic/profile')}>
            <span className="action-icon">⚙️</span>
            <span>Clinic Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;

// ----------------------------------------------------------------------------------
// NOTE: 
// अगर आप चाहते हैं कि Revenue component का कोड भी यहीं शामिल किया जाए, 
// तो आपको इसे ऊपर इम्पोर्ट करने के बजाय यहाँ चिपकाना होगा और export default हटाना होगा।
// यह आपके प्रोजेक्ट के फ़ाइल संगठन पर निर्भर करता है।
// 
// चूंकि Revenue कंपोनेंट बड़ा है, इसलिए मैं यहाँ उसका कोड नहीं चिपका रहा हूँ। 
// यह मान रहा हूँ कि आपने Revenue.js फ़ाइल बना ली है और उसे सही ढंग से इम्पोर्ट किया है।
// ----------------------------------------------------------------------------------