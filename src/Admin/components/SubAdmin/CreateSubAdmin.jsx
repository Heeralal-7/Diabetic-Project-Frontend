import React, { useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { useNavigate } from 'react-router-dom';

const CreateSubAdmin = () => {
  const { createSubAdmin, loading } = useContext(MyContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    permissions: {
      vendors: {
        lab: { view: false, create: false, edit: false, delete: false },
        pharmacy: { view: false, create: false, edit: false, delete: false },
        food: { view: false, create: false, edit: false, delete: false }
      },
      clinics: { view: false, create: false, edit: false, delete: false },
      doctors: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false }
    },
    locationAccess: {
      countries: [],
      states: [],
      cities: []
    }
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [expandedModules, setExpandedModules] = useState({
    vendors: true,
    clinics: false,
    doctors: false,
    users: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  };

  // ✅ UPDATED PERMISSION HANDLERS FOR VENDOR TYPES
  const handleVendorPermissionChange = (vendorType, permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        vendors: {
          ...prev.permissions.vendors,
          [vendorType]: {
            ...prev.permissions.vendors[vendorType],
            [permission]: value
          }
        }
      }
    }));
  };

  const handleModulePermissionChange = (module, permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permission]: value
        }
      }
    }));
  };

  const handleLocationChange = (type, values) => {
    setFormData(prev => ({
      ...prev,
      locationAccess: {
        ...prev.locationAccess,
        [type]: values.split(',').map(item => item.trim()).filter(item => item)
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      permissions: formData.permissions,
      locationAccess: formData.locationAccess
    };

    console.log('Submitting data:', submitData);

    const result = await createSubAdmin(submitData, image);
    
    if (result.success) {
      navigate('/subadmins');
    }
  };

  // ✅ UPDATED TOGGLE FUNCTIONS FOR VENDOR TYPES
  const toggleAllVendorPermissions = (vendorType, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        vendors: {
          ...prev.permissions.vendors,
          [vendorType]: {
            view: value,
            create: value,
            edit: value,
            delete: value
          }
        }
      }
    }));
  };

  const toggleAllModulePermissions = (module, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          view: value,
          create: value,
          edit: value,
          delete: value
        }
      }
    }));
  };

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // ✅ VENDOR TYPES CONFIGURATION
  const vendorTypes = [
    { key: 'lab', label: 'Lab Vendors', icon: 'fa-flask' },
    { key: 'pharmacy', label: 'Pharmacy Vendors', icon: 'fa-pills' },
    { key: 'food', label: 'Food Vendors', icon: 'fa-utensils' }
  ];

  const modules = [
    { key: 'clinics', label: 'Clinics', icon: 'fa-clinic-medical' },
    { key: 'doctors', label: 'Doctors', icon: 'fa-user-md' },
    { key: 'users', label: 'Users', icon: 'fa-users' }
  ];

  const permissionsList = ['view', 'create', 'edit', 'delete'];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Create New Sub-Admin</h4>
              <button
                type="button"
                onClick={() => navigate('/dashboard/subadmins')}
                className="btn btn-secondary"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to List
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information - SAME */}
                <div className="mb-4">
                  <h5 className="mb-3 text-primary">
                    <i className="fas fa-info-circle me-2"></i>
                    Basic Information
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control ${shouldShowError('name') ? 'is-invalid' : ''}`}
                        placeholder="Enter full name"
                      />
                      {shouldShowError('name') && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control ${shouldShowError('email') ? 'is-invalid' : ''}`}
                        placeholder="Enter email address"
                      />
                      {shouldShowError('email') && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control ${shouldShowError('password') ? 'is-invalid' : ''}`}
                        placeholder="Enter password"
                      />
                      {shouldShowError('password') && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control ${shouldShowError('confirmPassword') ? 'is-invalid' : ''}`}
                        placeholder="Confirm password"
                      />
                      {shouldShowError('confirmPassword') && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control"
                      />
                      {errors.image && (
                        <div className="text-danger small mt-1">{errors.image}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ UPDATED PERMISSIONS SECTION */}
                <div className="mb-4">
                  <h5 className="mb-3 text-primary">
                    <i className="fas fa-shield-alt me-2"></i>
                    Permissions ( Optional / select as needed )
                  </h5>

                  {/* Vendors Section with Types */}
                  <div className="card mb-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="fas fa-store me-2"></i>
                        Vendors Management
                      </h6>
                      <button
                        type="button"
                        onClick={() => toggleModule('vendors')}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className={`fas fa-${expandedModules.vendors ? 'minus' : 'plus'} me-1`}></i>
                        {expandedModules.vendors ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                    {expandedModules.vendors && (
                      <div className="card-body">
                        {vendorTypes.map(vendorType => (
                          <div key={vendorType.key} className="card mb-3">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                <i className={`fas ${vendorType.icon} me-2`}></i>
                                {vendorType.label}
                              </h6>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleAllVendorPermissions(vendorType.key, true)}
                                  className="btn btn-sm btn-outline-success me-2"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleAllVendorPermissions(vendorType.key, false)}
                                  className="btn btn-sm btn-outline-danger"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                {permissionsList.map(permission => (
                                  <div key={permission} className="col-md-3 mb-2">
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.vendors[vendorType.key][permission]}
                                        onChange={(e) => handleVendorPermissionChange(vendorType.key, permission, e.target.checked)}
                                        className="form-check-input"
                                        id={`${vendorType.key}-${permission}`}
                                      />
                                      <label 
                                        className="form-check-label text-capitalize" 
                                        htmlFor={`${vendorType.key}-${permission}`}
                                      >
                                        {permission}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other Modules */}
                  {modules.map(module => (
                    <div key={module.key} className="card mb-3">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          <i className={`fas ${module.icon} me-2`}></i>
                          {module.label}
                        </h6>
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleAllModulePermissions(module.key, true)}
                            className="btn btn-sm btn-outline-success me-2"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllModulePermissions(module.key, false)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {permissionsList.map(permission => (
                            <div key={permission} className="col-md-3 mb-2">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module.key][permission]}
                                  onChange={(e) => handleModulePermissionChange(module.key, permission, e.target.checked)}
                                  className="form-check-input"
                                  id={`${module.key}-${permission}`}
                                />
                                <label 
                                  className="form-check-label text-capitalize" 
                                  htmlFor={`${module.key}-${permission}`}
                                >
                                  {permission}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location Access - SAME */}
                <div className="mb-4">
                  <h5 className="mb-3 text-primary">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location Access
                  </h5>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Countries (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., USA, Canada, UK"
                        onChange={(e) => handleLocationChange('countries', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">States (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., California, Texas, Florida"
                        onChange={(e) => handleLocationChange('states', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Cities (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., New York, Los Angeles, Chicago"
                        onChange={(e) => handleLocationChange('cities', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button - SAME */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/subadmins')}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create Sub-Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubAdmin;