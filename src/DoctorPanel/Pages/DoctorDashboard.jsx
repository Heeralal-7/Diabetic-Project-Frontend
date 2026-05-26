import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const context = useContext(MyContext) || {};
  const { doctorData, getDoctorAppointments, getCoupons1, coupons1 } = context;

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ accepted: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (getDoctorAppointments) {
          const res = await getDoctorAppointments();
          if (Array.isArray(res)) {
            setAppointments(res);
            const acc = res.filter(a => (a?.status == 1 || a?.appointment?.status == 1)).length;
            setStats({ accepted: acc, pending: res.length - acc, total: res.length });
          }
        }
        if (getCoupons1) await getCoupons1();
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={loaderContainer}>
      <div className="spinner-grow text-primary" role="status"></div>
      <h5 className="mt-4 fw-bold" style={{ color: '#0d6efd' }}>Syncing Clinic Records...</h5>
    </div>
  );

  return (
    <div style={wrapper}>
      {/* --- TOP WELCOME BANNER --- */}
      <div style={welcomeBanner}>
        <div style={{ zIndex: 2 }}>
          <h1 style={greetText}>Welcome back, Dr. {doctorData?.name || 'Doctor'}! ✨</h1>
          <p style={bannerSub}>You have <b>{stats.pending}</b> appointments waiting for review today.</p>
        </div>
        <Link to="/doctor/profile" style={topProfileCard}>
          <div style={avatarBox}>{doctorData?.name?.charAt(0) || 'D'}</div>
          <div className="d-none d-md-block">
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>My Profile</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Account Settings</div>
          </div>
        </Link>
      </div>

      {/* --- COLORFUL STATS GRID --- */}
      <div style={statsGrid}>
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon="fa-calendar-check"
          grad="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon="fa-hourglass-half"
          grad="linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)"
          darkText={true}
        />
        <StatCard
          label="Confirmed Today"
          value={stats.accepted}
          icon="fa-user-check"
          grad="linear-gradient(135deg, #00b09b 0%, #96c93d 100%)"
        />
        <StatCard
          label="Coupons Active"
          value={coupons1?.length || 0}
          icon="fa-ticket-alt"
          grad="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
      </div>

      {/* --- APPOINTMENT SECTION --- */}
      <div style={tableContainer}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: 800, color: '#2d3748', margin: 0 }}>Upcoming Schedule</h4>
          <Link to="/doctor/appointments" style={allBtn}>View Full List <i className="fas fa-arrow-right ms-2"></i></Link>
        </div>

        <div className="table-responsive">
          <table className="table table-borderless" style={modernTable}>
            <thead>
              <tr style={thRow}>
                <th>PATIENT NAME</th>
                <th>CONSULTATION TYPE</th>
                <th>TIME SLOT</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? appointments.slice(0, 6).map((item, i) => {
                const appt = item?.appointment || item;
                const user = item?.patient || item?.user;
                const isAccepted = (appt?.status == 1 || appt?.status == "1");

                return (
                  <tr key={i} style={trStyle}>
                    <td style={{ padding: '1.2rem' }}>
                      <div className="d-flex align-items-center">
                        <div style={patientIcon}>{user?.name?.charAt(0) || 'P'}</div>
                        <div>
                          <div style={pName}>{user?.name || 'Unknown Patient'}</div>
                          <div style={pEmail}>ID: #{user?._id?.slice(-6) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={serviceTag}>{appt?.serviceType || 'General Consultation'}</span></td>
                    <td>
                      <div style={timeTag}><i className="far fa-clock me-2"></i>{appt?.timeSlot || 'Not Set'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={statusDot(isAccepted)}>
                        {isAccepted ? '● Confirmed' : '● Pending'}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No appointments found for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MINI COMPONENTS ---

const StatCard = ({ label, value, icon, grad, darkText }) => (
  <div style={{ ...statCardStyle, background: grad, color: darkText ? '#333' : '#fff' }}>
    <div style={statIconArea}>
      <i className={`fas ${icon} fa-2x`} style={{ opacity: 0.6 }}></i>
    </div>
    <h2 style={{ fontWeight: 800, margin: '10px 0 0', fontSize: '2.2rem' }}>{value}</h2>
    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', opacity: 0.9 }}>{label}</p>
    <div style={statDecor}></div>
  </div>
);

// --- STYLES OBJECTS ---

const wrapper = {
  padding: '2.5rem',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const welcomeBanner = {
  background: '#ffffff',
  padding: '2.5rem',
  borderRadius: '24px',
  color: '#0d6efd',
  marginBottom: '2.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 15px 30px rgba(0, 100, 255, 0.08)',
  border: '1px solid #e2e8f0'
};

const greetText = { fontSize: '1.8rem', fontWeight: '800', margin: 0 };
const bannerSub = { margin: '8px 0 0', color: '#64748b', fontWeight: '500' };

const topProfileCard = {
  backgroundColor: '#0d6efd',
  padding: '10px 20px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#fff',
  textDecoration: 'none',
  transition: 'transform 0.2s ease'
};

const avatarBox = {
  width: '42px', height: '42px', backgroundColor: '#fff', color: '#0d6efd',
  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem'
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.5rem',
  marginBottom: '3rem'
};

const statCardStyle = {
  padding: '2rem', borderRadius: '28px', position: 'relative', overflow: 'hidden',
  boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease',
  border: '1px solid rgba(255,255,255,0.2)'
};

const statIconArea = { display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' };

const statDecor = {
  position: 'absolute', width: '120px', height: '120px', background: 'rgba(255,255,255,0.15)',
  borderRadius: '50%', top: '-30px', left: '-30px'
};

const tableContainer = {
  backgroundColor: '#fff', padding: '2.2rem', borderRadius: '32px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
};

const allBtn = {
  padding: '10px 22px', borderRadius: '14px', backgroundColor: '#eff6ff',
  color: '#0d6efd', fontWeight: '700', textDecoration: 'none', fontSize: '0.85rem',
  transition: 'all 0.2s ease'
};

const modernTable = { borderCollapse: 'separate', borderSpacing: '0 12px' };
const thRow = { color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '800' };
const trStyle = { backgroundColor: '#fcfdfe', borderRadius: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' };

const patientIcon = {
  width: '48px', height: '48px', backgroundColor: '#f0f7ff', color: '#0d6efd',
  borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: '800', marginRight: '16px', fontSize: '1.3rem'
};

const pName = { fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' };
const pEmail = { fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' };
const serviceTag = { padding: '7px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' };
const timeTag = { fontWeight: '700', color: '#0d6efd', fontSize: '0.95rem' };

const statusDot = (active) => ({
  display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: '12px',
  fontSize: '0.8rem', fontWeight: '700',
  backgroundColor: active ? '#ecfdf5' : '#fff7ed',
  color: active ? '#059669' : '#d97706'
});

const loaderContainer = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' };

export default DoctorDashboard;
