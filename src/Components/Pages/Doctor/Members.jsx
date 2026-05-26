import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const MembersManagement = () => {
  const { createMember, getAllMemberOfPatients, members, loading } = useContext(MyContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    yearOfBirth: '',
    phoneNumber: '',
    gender: '',
    address: '',
    city: '',
    pinCode: '',
    image: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getAllMemberOfPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const result = await createMember(formData);
      if (result.success === 1) {
        setMessage({ type: 'success', text: 'Member added successfully!' });
        setShowAddForm(false);
        setFormData({
          name: '',
          yearOfBirth: '',
          phoneNumber: '',
          gender: '',
          address: '',
          city: '',
          pinCode: '',
          image: null
        });
        // Refresh the members list
        getAllMemberOfPatients();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to add member' });
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setMessage({ type: 'error', text: 'Error adding member. Please try again.' });
    }
  };

  const calculateAge = (yearOfBirth) => {
    if (!yearOfBirth) return 'N/A';
    return new Date().getFullYear() - parseInt(yearOfBirth);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Family Members</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
            >
              {showAddForm ? 'Cancel' : 'Add Member'}
            </button>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
              {message.text}
            </div>
          )}

          {showAddForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Add New Family Member</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Year of Birth *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="yearOfBirth"
                        value={formData.yearOfBirth}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={loading}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">PIN Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="row">
            {loading && !showAddForm ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading members...</p>
              </div>
            ) : members && members.length > 0 ? (
              members.map(member => (
                <div key={member._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      {member.image ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}${member.image}`}
                          alt={member.name}
                          className="rounded-circle mb-3"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                          style={{ width: '100px', height: '100px' }}
                        >
                          <i className="fas fa-user fa-2x"></i>
                        </div>
                      )}
                      <h5 className="card-title">{member.name}</h5>
                      <p className="card-text">
                        <strong>Age:</strong> {calculateAge(member.yearOfBirth)} years<br/>
                        <strong>Gender:</strong> {member.gender || 'Not specified'}<br/>
                        <strong>Phone:</strong> {member.phoneNumber || 'Not provided'}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          {member.address && `${member.address}, `}
                          {member.city && `${member.city} `}
                          {member.pinCode && `- ${member.pinCode}`}
                          {!member.address && !member.city && !member.pinCode && 'No address provided'}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h5>No family members added yet</h5>
                <p className="text-muted">Add your first family member to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersManagement;