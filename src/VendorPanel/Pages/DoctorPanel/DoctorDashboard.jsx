import React from 'react';

const DoctorDashboard = () => {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Doctor Dashboard</h1>
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    background: '#f0f4f8',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h2>Patients</h2>
                    <p>12 Active</p>
                </div>
                <div style={{
                    background: '#f0f4f8',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h2>Appointments</h2>
                    <p>3 Today</p>
                </div>
                <div style={{
                    background: '#f0f4f8',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h2>Messages</h2>
                    <p>5 Unread</p>
                </div>
            </div>
            <div style={{ marginTop: '3rem' }}>
                <h3>Upcoming Appointments</h3>
                <ul>
                    <li>10:00 AM - John Doe</li>
                    <li>11:30 AM - Jane Smith</li>
                    <li>2:00 PM - Alex Johnson</li>
                </ul>
            </div>
        </div>
    );
};

export default DoctorDashboard;