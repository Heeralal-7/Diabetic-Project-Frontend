import React, { useContext, useState } from "react";
import { MyContext } from "../../Context/Context";

function ChangePassword() {
  const { changeSubAdminPassword } = useContext(MyContext);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage("All fields are required");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await changeSubAdminPassword(formData);
      
      if (result.success === 1) {
        setMessage("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setMessage(result.message || "Failed to change password");
      }
    } catch (error) {
      setMessage("Error changing password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-4 border-0 rounded-4 rounded-bottom-0">
                <h2 className="h4 fw-bold text-dark text-center mb-0">
                  Change Password
                </h2>
                <p className="text-muted text-center mt-2 mb-0">
                  Update your account password
                </p>
              </div>
              <div className="card-body p-4 p-md-5">
                {message && (
                  <div 
                    className={`alert ${
                      message.includes("successfully") 
                        ? "alert-success" 
                        : "alert-danger"
                    } alert-dismissible fade show`}
                    role="alert"
                  >
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage("")}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Current Password */}
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="form-label fw-medium">
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        <i className={`fas ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label fw-medium">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        <i className={`fas ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <div className="form-text">
                      Password must be at least 6 characters long
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        <i className={`fas ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>

                  {/* Security Tips */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="fw-medium mb-2">Password Tips:</h6>
                    <ul className="list-unstyled small mb-0">
                      <li className="mb-1">
                        <i className="fas fa-check text-success me-2"></i>
                        Use at least 6 characters
                      </li>
                      <li className="mb-1">
                        <i className="fas fa-check text-success me-2"></i>
                        Include numbers and special characters
                      </li>
                      <li className="mb-1">
                        <i className="fas fa-check text-success me-2"></i>
                        Avoid using personal information
                      </li>
                      <li className="mb-0">
                        <i className="fas fa-check text-success me-2"></i>
                        Don't reuse old passwords
                      </li>
                    </ul>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;