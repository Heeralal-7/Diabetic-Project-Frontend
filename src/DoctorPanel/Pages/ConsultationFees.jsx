import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context'; // Make sure this path is correct

// Define internal styles
const styles = {
  container: {
    maxWidth: '450px',
    margin: '30px auto',
    padding: '25px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '25px',
    color: '#333',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderColor: '#f5c6cb',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '4px',
    padding: '12px 15px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '15px',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  primaryButtonHover: {
    backgroundColor: '#0056b3',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  successButtonHover: {
    backgroundColor: '#218838',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonHover: {
    backgroundColor: '#c82333',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  secondaryButtonHover: {
    backgroundColor: '#5a6268',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
    cursor: 'not-allowed',
  },
  feesDisplay: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #e0e0e0',
  },
  feesLabel: {
    fontWeight: '500',
    color: '#444',
    fontSize: '16px',
  },
  feesValue: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  flexOne: {
    flex: 1,
  },
  loadingIndicatorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    minHeight: '300px',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  closeButton: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginLeft: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#721c24',
  },
};

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ConsultationFeesComponent = () => {
  const {
    loading,
    error,
    fees,
    createFees,
    getFees,
    updateFees,
    deleteFees,
    clearError // Assuming this function exists in your context to clear global errors
  } = useContext(MyContext);

  const [formData, setFormData] = useState({
    onlineFees: '',
    offlineFees: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [operationError, setOperationError] = useState(null); // For errors during create/update/delete

  // Function to clear operation-specific errors and global context errors
  const clearAllErrors = () => {
    setOperationError(null);
    if (clearError) clearError();
  };

  useEffect(() => {
    // Fetch fees when component mounts
    getFees();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Update form data when fees are fetched or changed
    if (fees) {
      setFormData({
        onlineFees: fees.onlineFees || '',
        offlineFees: fees.offlineFees || ''
      });
    } else {
      // Reset form if fees are cleared (e.g., after deletion)
      setFormData({ onlineFees: '', offlineFees: '' });
    }
  }, [fees]); // Re-run when fees prop changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearAllErrors(); // Clear errors when user starts typing
  };

  const handleCreateFees = async (e) => {
    e.preventDefault();
    clearAllErrors(); // Clear previous errors before operation
    if (!formData.onlineFees || !formData.offlineFees) {
      setOperationError('Please fill in both online and offline fees.');
      return;
    }
    try {
      await createFees(formData);
      alert('Fees created successfully!'); // Use a toast notification in a real app
    } catch (err) {
      console.error('Error creating fees:', err);
      setOperationError(err.message || 'Failed to create fees.');
    }
  };

  const handleUpdateFees = async (e) => {
    e.preventDefault();
    clearAllErrors();
    if (!fees?._id) {
      setOperationError('Cannot update fees: No ID found.');
      return;
    }
    if (!formData.onlineFees || !formData.offlineFees) {
      setOperationError('Please fill in both online and offline fees.');
      return;
    }
    try {
      await updateFees(fees._id, formData);
      alert('Fees updated successfully!'); // Use a toast notification
      setIsEditing(false); // Exit editing mode on success
    } catch (err) {
      console.error('Error updating fees:', err);
      setOperationError(err.message || 'Failed to update fees.');
    }
  };

  const handleDeleteFees = async () => {
    clearAllErrors();
    if (!fees?._id) {
      setOperationError('Cannot delete fees: No ID found.');
      return;
    }

    if (window.confirm('Are you sure you want to delete the consultation fees?')) {
      try {
        await deleteFees(fees._id);
        alert('Fees deleted successfully!'); // Use a toast notification
        // The fees useEffect hook will handle form reset after context update
      } catch (err) {
        console.error('Error deleting fees:', err);
        setOperationError(err.message || 'Failed to delete fees.');
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revert form data to the current fetched fees
    if (fees) {
      setFormData({
        onlineFees: fees.onlineFees || '',
        offlineFees: fees.offlineFees || ''
      });
    }
    setIsEditing(false);
    clearAllErrors(); // Clear any errors when canceling edit
  };

  // --- Render Logic ---

  // Loading state when fetching initial data
  if (loading && !fees) {
    return (
      <div style={styles.loadingIndicatorContainer}>
        <style>{keyframes}</style>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Consultation Fees Management</h2>

      {/* Display global context error if available */}


      {/* Display operation-specific error if available */}
      {operationError && (
        <div style={styles.errorBox}>
          <span>{operationError}</span>
          <button onClick={clearAllErrors} style={styles.closeButton}>&times;</button>
        </div>
      )}

      {!fees ? (
        // --- Create Fees Form ---
        <form onSubmit={handleCreateFees} style={styles.inputGroup}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="onlineFees" style={styles.label}>
              Online Consultation Fees (INR)
            </label>
            <input
              id="onlineFees"
              type="number"
              name="onlineFees"
              value={formData.onlineFees}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="Enter online fees"
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="offlineFees" style={styles.label}>
              Offline Consultation Fees (INR)
            </label>
            <input
              id="offlineFees"
              type="number"
              name="offlineFees"
              value={formData.offlineFees}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="Enter offline fees"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.disabledButton : styles.primaryButton)
            }}
            onMouseOver={!loading ? e => e.currentTarget.style.backgroundColor = styles.primaryButtonHover.backgroundColor : null}
            onMouseOut={!loading ? e => e.currentTarget.style.backgroundColor = styles.primaryButton.backgroundColor : null}
          >
            {loading ? 'Creating...' : 'Create Fees'}
          </button>
        </form>
      ) : (
        // --- Display and Edit Fees Section ---
        <div>
          {isEditing ? (
            <form onSubmit={handleUpdateFees} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label htmlFor="editOnlineFees" style={styles.label}>
                  Online Consultation Fees (INR)
                </label>
                <input
                  id="editOnlineFees"
                  type="number"
                  name="onlineFees"
                  value={formData.onlineFees}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={styles.input}
                />
              </div>

              <div>
                <label htmlFor="editOfflineFees" style={styles.label}>
                  Offline Consultation Fees (INR)
                </label>
                <input
                  id="editOfflineFees"
                  type="number"
                  name="offlineFees"
                  value={formData.offlineFees}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...styles.flexOne,
                    ...(loading ? styles.disabledButton : styles.successButton)
                  }}
                   onMouseOver={!loading ? e => e.currentTarget.style.backgroundColor = styles.successButtonHover.backgroundColor : null}
                   onMouseOut={!loading ? e => e.currentTarget.style.backgroundColor = styles.successButton.backgroundColor : null}
                >
                  {loading ? 'Updating...' : 'Update Fees'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...styles.flexOne,
                    ...styles.secondaryButton
                  }}
                  onMouseOver={!loading ? e => e.currentTarget.style.backgroundColor = styles.secondaryButtonHover.backgroundColor : null}
                  onMouseOut={!loading ? e => e.currentTarget.style.backgroundColor = styles.secondaryButton.backgroundColor : null}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                <div style={styles.feesDisplay}>
                  <span style={styles.feesLabel}>Online Fees:</span>
                  <span style={styles.feesValue}>
                    ₹{fees.onlineFees !== undefined ? fees.onlineFees.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div style={styles.feesDisplay}>
                  <span style={styles.feesLabel}>Offline Fees:</span>
                  <span style={styles.feesValue}>
                    ₹{fees.offlineFees !== undefined ? fees.offlineFees.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={handleEditClick}
                  style={{
                    ...styles.button,
                    ...styles.flexOne,
                    ...styles.primaryButton
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = styles.primaryButtonHover.backgroundColor}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = styles.primaryButton.backgroundColor}
                >
                  Edit Fees
                </button>
                <button
                  onClick={handleDeleteFees}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...styles.flexOne,
                    ...(loading ? styles.disabledButton : styles.dangerButton)
                  }}
                  onMouseOver={!loading ? e => e.currentTarget.style.backgroundColor = styles.dangerButtonHover.backgroundColor : null}
                  onMouseOut={!loading ? e => e.currentTarget.style.backgroundColor = styles.dangerButton.backgroundColor : null}
                >
                  {loading ? 'Deleting...' : 'Delete Fees'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationFeesComponent;