// src/pages/DoctorPatients.jsx
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const DoctorPatients = () => {
  const { loading, error, getDoctorProfile } = useContext(MyContext);
  const [patients, setPatients] = useState([]);
  const [doctorToken, setDoctorToken] = useState(null);

  useEffect(() => {
    const tokenInfo = sessionStorage.getItem('doctortoken');
    if (tokenInfo) {
      const parsedTokenInfo = JSON.parse(tokenInfo);
      if (parsedTokenInfo && parsedTokenInfo.token) {
        setDoctorToken(parsedTokenInfo.token);
        fetchPatients(parsedTokenInfo.token);
      }
    } else {
      console.log("No doctor token found. Redirecting to login.");
    }
  }, []);

  // Placeholder function for fetching patients
  const fetchPatients = async (token) => {
    try {
      // Replace with actual API call from context
      // const response = await getPatients(token); // Example
      // setPatients(response.patients); // Assuming response structure
      console.log("Fetching patients for token:", token);
      // Dummy data
      setPatients([
        { id: 501, name: 'John Doe', lastVisit: '2024-09-15', phone: '123-456-7890' },
        { id: 502, name: 'Jane Smith', lastVisit: '2024-09-15', phone: '987-654-3210' },
        { id: 503, name: 'Alex Johnson', lastVisit: '2024-09-16', phone: '555-123-4567' },
      ]);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading patients...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>My Patients</h1>

      {patients.length === 0 ? (
        <p>You have not registered any patients yet.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Last Visit</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.lastVisit}</td>
                <td>{patient.phone}</td>
                <td>
                  <button className="btn btn-sm btn-info me-1">View History</button>
                  <button className="btn btn-sm btn-secondary">Message</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorPatients;