import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const EditSubAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSubAdmin, getSubAdminById, updateSubAdminPermissions, loading } = useContext(MyContext);

  const [permissions, setPermissions] = useState({
    vendors: {
      lab: { view: false, create: false, edit: false, delete: false },
      pharmacy: { view: false, create: false, edit: false, delete: false },
      food: { view: false, create: false, edit: false, delete: false }
    },
    clinics: { view: false, create: false, edit: false, delete: false },
    doctors: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false }
  });

  const [locationAccess, setLocationAccess] = useState({
    countries: [],
    states: [],
    cities: []
  });

  const [expandedModules, setExpandedModules] = useState({
    vendors: true,
    clinics: false,
    doctors: false,
    users: false
  });

  useEffect(() => {
    if (id) {
      getSubAdminById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentSubAdmin) {
      setPermissions(currentSubAdmin.permissions || {
        vendors: {
          lab: { view: false, create: false, edit: false, delete: false },
          pharmacy: { view: false, create: false, edit: false, delete: false },
          food: { view: false, create: false, edit: false, delete: false }
        },
        clinics: { view: false, create: false, edit: false, delete: false },
        doctors: { view: false, create: false, edit: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false }
      });
      setLocationAccess(currentSubAdmin.locationAccess || {});
    }
  }, [currentSubAdmin]);

  // ✅ UPDATED PERMISSION HANDLERS
  const handleVendorPermissionChange = (vendorType, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      vendors: {
        ...prev.vendors,
        [vendorType]: {
          ...prev.vendors[vendorType],
          [permission]: value
        }
      }
    }));
  };

  const handleModulePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value
      }
    }));
  };

  const handleLocationChange = (type, values) => {
    setLocationAccess(prev => ({
      ...prev,
      [type]: values.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  // ✅ UPDATED TOGGLE FUNCTIONS
  const toggleAllVendorPermissions = (vendorType, value) => {
    setPermissions(prev => ({
      ...prev,
      vendors: {
        ...prev.vendors,
        [vendorType]: {
          view: value,
          create: value,
          edit: value,
          delete: value
        }
      }
    }));
  };

  const toggleAllModulePermissions = (module, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        view: value,
        create: value,
        edit: value,
        delete: value
      }
    }));
  };

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await updateSubAdminPermissions(id, {
      permissions,
      locationAccess
    });

    if (result.success) {
      navigate(`/dashboard/subadmins/${id}`);
    }
  };

  // ✅ CONFIGURATION
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

  if (loading && !currentSubAdmin) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading sub-admin details...</p>
        </div>
      </div>
    );
  }

  if (!currentSubAdmin) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Sub-Admin Not Found</h3>
                <p className="text-muted">The requested sub-admin could not be found.</p>
                <button
                  onClick={() => navigate('/subadmins')}
                  className="btn btn-primary"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                Edit Permissions - <span className="text-primary">{currentSubAdmin.name}</span>
              </h4>
              <button
                onClick={() => navigate(`/subadmins/${id}`)}
                className="btn btn-outline-secondary"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Details
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* ✅ UPDATED PERMISSIONS SECTION */}
                <div className="mb-4">
                  <h5 className="mb-3 text-primary">
                    <i className="fas fa-shield-alt me-2"></i>
                    Module Permissions
                  </h5>

                  {/* Vendors Section */}
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
                                  className="btn btn-sm btn-success me-2"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleAllVendorPermissions(vendorType.key, false)}
                                  className="btn btn-sm btn-danger"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                {permissionsList.map(permission => (
                                  <div key={permission} className="col-md-3 mb-2">
                                    <div className="form-check form-switch">
                                      <input
                                        type="checkbox"
                                        checked={permissions.vendors[vendorType.key][permission]}
                                        onChange={(e) => handleVendorPermissionChange(vendorType.key, permission, e.target.checked)}
                                        className="form-check-input"
                                        role="switch"
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
                            className="btn btn-sm btn-success me-2"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllModulePermissions(module.key, false)}
                            className="btn btn-sm btn-danger"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {permissionsList.map(permission => (
                            <div key={permission} className="col-md-3 mb-2">
                              <div className="form-check form-switch">
                                <input
                                  type="checkbox"
                                  checked={permissions[module.key][permission]}
                                  onChange={(e) => handleModulePermissionChange(module.key, permission, e.target.checked)}
                                  className="form-check-input"
                                  role="switch"
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

                {/* Location Access Section - SAME */}
                <div className="mb-4">
                  <h5 className="mb-3 text-primary">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location Access Restrictions
                  </h5>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Countries</label>
                      <input
                        type="text"
                        placeholder="e.g., USA, Canada, UK"
                        value={locationAccess.countries.join(', ')}
                        onChange={(e) => handleLocationChange('countries', e.target.value)}
                        className="form-control"
                      />
                      <div className="form-text">Comma separated list</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">States</label>
                      <input
                        type="text"
                        placeholder="e.g., California, Texas, Florida"
                        value={locationAccess.states.join(', ')}
                        onChange={(e) => handleLocationChange('states', e.target.value)}
                        className="form-control"
                      />
                      <div className="form-text">Comma separated list</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Cities</label>
                      <input
                        type="text"
                        placeholder="e.g., New York, Los Angeles, Chicago"
                        value={locationAccess.cities.join(', ')}
                        onChange={(e) => handleLocationChange('cities', e.target.value)}
                        className="form-control"
                      />
                      <div className="form-text">Comma separated list</div>
                    </div>
                  </div>
                  <p className="text-muted">
                    Leave empty for no restrictions. Sub-admin will have access to all locations.
                  </p>
                </div>

                {/* Submit Buttons - SAME */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/subadmins/${id}`)}
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Permissions
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

export default EditSubAdmin;