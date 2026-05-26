import React, { useState, useContext } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const { changeClinicPassword, loading } = useContext(MyContext);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await changeClinicPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;

    const strengths = [
      { label: 'Very Weak', color: 'danger' },
      { label: 'Weak', color: 'warning' },
      { label: 'Fair', color: 'info' },
      { label: 'Good', color: 'primary' },
      { label: 'Strong', color: 'success' }
    ];

    return strengths[strength] || strengths[0];
  };

  const strengthInfo = passwordStrength(passwordData.newPassword);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Change Password
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Current Password */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Current Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePasswordVisibility('current')}
                      disabled={loading}
                    >
                      <i className={`bi ${showPassword.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {errors.currentPassword && (
                      <div className="invalid-feedback">
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="form-label fw-bold">New Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePasswordVisibility('new')}
                      disabled={loading}
                    >
                      <i className={`bi ${showPassword.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {errors.newPassword && (
                      <div className="invalid-feedback">
                        {errors.newPassword}
                      </div>
                    )}
                  </div>
                  
                  {/* Password Strength Meter */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="progress mb-1" style={{ height: '5px' }}>
                        <div
                          className={`progress-bar bg-${strengthInfo.color}`}
                          style={{ 
                            width: `${(strengthInfo.strength / 4) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <small className={`text-${strengthInfo.color}`}>
                        Password strength: {strengthInfo.label}
                      </small>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Confirm New Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePasswordVisibility('confirm')}
                      disabled={loading}
                    >
                      <i className={`bi ${showPassword.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="alert alert-info">
                  <h6 className="alert-heading">
                    <i className="bi bi-info-circle me-2"></i>
                    Password Requirements
                  </h6>
                  <ul className="mb-0 small">
                    <li>At least 6 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include numbers and special characters for stronger security</li>
                    <li>Should be different from your current password</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-md-2"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Tips */}
          <div className="card mt-4 border-0 bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-shield-check me-2"></i>
                Security Tips
              </h6>
              <ul className="small mb-0">
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Change your password regularly</li>
                <li>Never share your password with anyone</li>
                <li>Use a password manager to store your passwords securely</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;