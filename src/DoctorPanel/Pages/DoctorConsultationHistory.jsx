// src/pages/DoctorConsultationHistory.jsx
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const DoctorConsultationHistory = () => {
  const { loading, error, getDoctorProfile } = useContext(MyContext);
  const [history, setHistory] = useState([]);
  const [doctorToken, setDoctorToken] = useState(null);

  useEffect(() => {
    const tokenInfo = sessionStorage.getItem('doctortoken');
    if (tokenInfo) {
      const parsedTokenInfo = JSON.parse(tokenInfo);
      if (parsedTokenInfo && parsedTokenInfo.token) {
        setDoctorToken(parsedTokenInfo.token);
        fetchConsultationHistory(parsedTokenInfo.token);
      }
    } else {
      console.log("No doctor token found. Redirecting to login.");
    }
  }, []);

  // Placeholder function for fetching history
  const fetchConsultationHistory = async (token) => {
    try {
      // Replace with actual API call from context
      // const response = await getConsultationHistory(token); // Example
      // setHistory(response.history); // Assuming response structure
      console.log("Fetching consultation history for token:", token);
      // Dummy data
      setHistory([
        { id: 101, patientName: 'Alice Wonderland', date: '2024-09-10', notes: 'Patient reported fever and cough.' },
        { id: 102, patientName: 'Bob The Builder', date: '2024-09-08', notes: 'Follow-up on knee injury.' },
      ]);
    } catch (err) {
      console.error("Failed to fetch consultation history:", err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading history...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Consultation History</h1>

      {history.length === 0 ? (
        <p>No consultation history available.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((consult) => (
              <tr key={consult.id}>
                <td>{consult.patientName}</td>
                <td>{consult.date}</td>
                <td>{consult.notes}</td>
                <td>
                  <button className="btn btn-sm btn-info">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorConsultationHistory;