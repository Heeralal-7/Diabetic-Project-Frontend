import React, { useState, useContext } from 'react';
import { MyContext } from '../../Context/Context'; // Assuming your AuthContext is in '../../Context/Context.js'
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const { changePassword1, loading, error } = useContext(MyContext); // Removed getDoctorToken if not used on page
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '40px auto',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
      fontSize: '24px',
    },
    errorMessage: {
      color: '#d9534f',
      textAlign: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#f2dede',
      border: '1px solid #ebccd1',
      borderRadius: '4px',
    },
    successMessage: {
      color: '#5cb85c',
      textAlign: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#dff0d8',
      border: '1px solid #d6e9c6',
      borderRadius: '4px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#555',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box', // Important for padding and width
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '10px',
    },
    buttonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
    inputDisabled: {
      backgroundColor: '#e9ecef',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear previous success message

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await changePassword1(oldPassword, newPassword, confirmPassword);
      if (response.success) {
        setSuccessMessage('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      // If response.success is false, the error from the backend should be caught by the catch block or handled by context
    } catch (err) {
      console.error("Password change failed:", err);
      // The error state is managed by the context, so it will be displayed automatically.
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Change Password</h2>
      {/* {error && <p style={styles.errorMessage}>{error}</p>} */}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="oldPassword" style={styles.label}>Old Password</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={{ ...styles.input, ...(loading && styles.inputDisabled) }}
            disabled={loading}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="newPassword" style={styles.label}>New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ ...styles.input, ...(loading && styles.inputDisabled) }}
            disabled={loading}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ ...styles.input, ...(loading && styles.inputDisabled) }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;