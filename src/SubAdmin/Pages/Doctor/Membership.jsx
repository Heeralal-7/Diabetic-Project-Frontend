// components/SubAdmin/MembershipPlansListSub.js
import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const MembershipPlansListSub = () => {
  const {
    membershipPlans,
    loading,
    error,
    getSubMembershipPlans,
    createSubMembershipPlan,
    updateSubMembershipPlan,
    toggleSubMembershipPlanStatus,
    calculateSubDiscountPreview,
    getSubPlanDiscountMatrix,
    updateSubDiscountMatrix,
    clearError
  } = useContext(MyContext);

  const [filters, setFilters] = useState({
    status: 'active',
    page: 1,
    limit: 10,
    search: ''
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  
  // ✅ Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [discountMatrixData, setDiscountMatrixData] = useState(null);
  const [discountPreview, setDiscountPreview] = useState(null);
  
  // Initialize formData
  const initialFormState = {
    planName: '',
    description: '',
    durationDays: 90,
    consultationLimit: 30,
    // Delivery Limits
    labDeliveryLimit: 0,
    foodDeliveryLimit: 0,
    pharmacyDeliveryLimit: 0,
    
    price: 0,
    discountPercentage: 10,
    features: [
      "Free consultations for 90 days",
      "Priority support",
      "Health tracking",
      "Medicine reminders"
    ],
    // Default arrays for new plans
    BloodSugar: ["Normal", "Pre-diabetic", "Diabetic Type 1", "Diabetic Type 2"],
    AgeGroup: ["18-25", "26-35", "36-50", "51-65", "66+"],
    HadDiabetes: ["Yes", "No", "Family History", "Gestational"],
    LifeStyle: ["Very Active", "Active", "Moderate", "Sedentary"],
    BloodSugarDiscounts: [0, 5, 10, 15],
    AgeGroupDiscounts: [0, 3, 5, 8, 10],
    HadDiabetesDiscounts: [0, 10, 5, 8],
    LifeStyleDiscounts: [5, 3, 0, 0],
    showDiscounts: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // ✅ Updated resetForm to handle Edit state
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingId(null);
    setCreateLoading(false);
    setOperationError(null);
  };

  useEffect(() => {
    loadMembershipPlans();
    // eslint-disable-next-line
  }, [filters.status, filters.page, filters.search]);

  const loadMembershipPlans = async () => {
    try {
      await getSubMembershipPlans(filters);
      setOperationError(null);
    } catch (err) {
      setOperationError(err.message || 'Failed to load membership plans');
    }
  };

  const handleStatusToggle = async (planId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this plan?`)) {
      try {
        await toggleSubMembershipPlanStatus(planId);
        loadMembershipPlans();
      } catch (err) {
        setOperationError(err.message || 'Failed to toggle plan status');
      }
    }
  };

  // ✅ PREPARE DATA FOR EDITING - FIXED
  const handleEditClick = (plan) => {
    setIsEditing(true);
    setEditingId(plan._id);
    setOperationError(null);

    try {
      // Helper to extract options and discounts from discountMatrix
      const extractMatrixData = (category, plan) => {
        if (plan.discountMatrix && plan.discountMatrix[category]) {
          return {
            options: plan.discountMatrix[category].map(item => item.option),
            discounts: plan.discountMatrix[category].map(item => item.discount)
          };
        }
        // Fallback
        return {
          options: plan[category] || [],
          discounts: new Array(plan[category]?.length || 0).fill(0)
        };
      };

      const bsData = extractMatrixData('BloodSugar', plan);
      const agData = extractMatrixData('AgeGroup', plan);
      const hdData = extractMatrixData('HadDiabetes', plan);
      const lsData = extractMatrixData('LifeStyle', plan);

      const editFormData = {
        planName: plan.planName || '',
        description: plan.description || '',
        durationDays: plan.durationDays || 90,
        consultationLimit: plan.consultationLimit || 30,
        // Delivery Limits
        labDeliveryLimit: plan.labDeliveryLimit || 0,
        foodDeliveryLimit: plan.foodDeliveryLimit || 0,
        pharmacyDeliveryLimit: plan.pharmacyDeliveryLimit || 0,
        
        price: plan.price || 0,
        discountPercentage: plan.discountPercentage || 0,
        features: plan.features || [],
        showDiscounts: plan.showDiscounts !== false, // default true
        
        // Arrays
        BloodSugar: bsData.options,
        BloodSugarDiscounts: bsData.discounts,
        AgeGroup: agData.options,
        AgeGroupDiscounts: agData.discounts,
        HadDiabetes: hdData.options,
        HadDiabetesDiscounts: hdData.discounts,
        LifeStyle: lsData.options,
        LifeStyleDiscounts: lsData.discounts,
      };

      setFormData(editFormData);
      setShowCreateModal(true);
    } catch (err) {
      setOperationError('Error loading plan data for editing');
      console.error('Edit error:', err);
    }
  };

  const handleViewDiscountMatrix = async (planId) => {
    try {
      const result = await getSubPlanDiscountMatrix(planId);
      if (result.success === 1) {
        setDiscountMatrixData(result.data);
        setShowDiscountModal(planId);
        setOperationError(null);
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to load discount matrix');
    }
  };

  const handleCalculatePreview = async () => {
    if (!showDiscountModal || !discountMatrixData) return;

    try {
      const selections = {
        BloodSugar: discountMatrixData.options.BloodSugar[0] || '',
        AgeGroup: discountMatrixData.options.AgeGroup[0] || '',
        HadDiabetes: discountMatrixData.options.HadDiabetes[0] || '',
        LifeStyle: discountMatrixData.options.LifeStyle[0] || ''
      };

      const result = await calculateSubDiscountPreview({
        planId: showDiscountModal,
        selections
      });

      if (result.success === 1) {
        setDiscountPreview(result.data);
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to calculate discount preview');
    }
  };

  const handleUpdateDiscountMatrix = async () => {
    if (!showDiscountModal || !discountMatrixData) return;
    
    try {
      // Construct the matrix from the modal data
      const discountMatrix = {
          BloodSugar: (discountMatrixData.options.BloodSugar || []).map((option, index) => ({
            option,
            discount: parseFloat(discountMatrixData.discountMatrix?.BloodSugar?.[index]?.discount || 0)
          })),
          AgeGroup: (discountMatrixData.options.AgeGroup || []).map((option, index) => ({
            option,
            discount: parseFloat(discountMatrixData.discountMatrix?.AgeGroup?.[index]?.discount || 0)
          })),
          HadDiabetes: (discountMatrixData.options.HadDiabetes || []).map((option, index) => ({
            option,
            discount: parseFloat(discountMatrixData.discountMatrix?.HadDiabetes?.[index]?.discount || 0)
          })),
          LifeStyle: (discountMatrixData.options.LifeStyle || []).map((option, index) => ({
            option,
            discount: parseFloat(discountMatrixData.discountMatrix?.LifeStyle?.[index]?.discount || 0)
          }))
      };

      const result = await updateSubDiscountMatrix(showDiscountModal, {
        discountMatrix,
        showDiscounts: discountMatrixData.showDiscounts
      });

      if (result.success === 1) {
        alert('Discount matrix updated successfully!');
        setShowDiscountModal(null);
        setDiscountMatrixData(null);
        setDiscountPreview(null);
        loadMembershipPlans();
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to update discount matrix');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    const newArray = [...formData[fieldName]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  const handleDiscountArrayChange = (fieldName, index, value) => {
    const newArray = [...formData[fieldName]];
    newArray[index] = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  const addArrayFieldItem = (fieldName, discountFieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ''],
      [discountFieldName]: [...prev[discountFieldName], 0]
    }));
  };

  const removeArrayFieldItem = (fieldName, discountFieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      [discountFieldName]: prev[discountFieldName].filter((_, i) => i !== index)
    }));
  };

  // ✅ COMBINED SUBMIT HANDLER (CREATE & UPDATE) - FIXED
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setOperationError(null);
    clearError();

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        features: formData.features.filter(feature => feature.trim() !== ''),
        BloodSugar: formData.BloodSugar.filter(item => item.trim() !== ''),
        AgeGroup: formData.AgeGroup.filter(item => item.trim() !== ''),
        HadDiabetes: formData.HadDiabetes.filter(item => item.trim() !== ''),
        LifeStyle: formData.LifeStyle.filter(item => item.trim() !== ''),
        // Slice discounts to match option array lengths
        BloodSugarDiscounts: formData.BloodSugarDiscounts.slice(0, formData.BloodSugar.length),
        AgeGroupDiscounts: formData.AgeGroupDiscounts.slice(0, formData.AgeGroup.length),
        HadDiabetesDiscounts: formData.HadDiabetesDiscounts.slice(0, formData.HadDiabetes.length),
        LifeStyleDiscounts: formData.LifeStyleDiscounts.slice(0, formData.LifeStyle.length)
      };

      // Clean up the data
      delete submissionData._id;
      delete submissionData.adminId;
      delete submissionData.createdAt;

      let result;
      if (isEditing && editingId) {
        // ✅ Call Update API
        console.log('Updating plan:', editingId, submissionData);
        result = await updateSubMembershipPlan(editingId, submissionData);
      } else {
        // ✅ Call Create API
        console.log('Creating plan:', submissionData);
        result = await createSubMembershipPlan(submissionData);
      }

      if (result && result.success === 1) {
        setShowCreateModal(false);
        resetForm();
        await loadMembershipPlans();
        alert(isEditing ? 'Membership plan updated successfully!' : 'Membership plan created successfully!');
      } else {
        setOperationError(result?.message || 'Operation failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 
                      (isEditing ? 'Failed to update plan' : 'Failed to create plan');
      setOperationError(errorMsg);
      console.error('Submit error:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // ✅ Clear operation error
  const clearOperationError = () => {
    setOperationError(null);
    clearError();
  };

  if (loading && !membershipPlans.length) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading membership plans...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Membership Plans (Sub-Admin)</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          + Create New Plan
        </button>
      </div>

     
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="active">Active Plans</option>
            <option value="inactive">Inactive Plans</option>
            <option value="all">All Plans</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search plans..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary w-100" onClick={loadMembershipPlans}>
            Refresh
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="row">
        {membershipPlans && membershipPlans.length > 0 ? (
          membershipPlans.map((plan) => (
            <div key={plan._id} className="col-lg-4 col-md-6 mb-4">
              <div className={`card h-100 ${plan.isActive ? 'border-success' : 'border-secondary'}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{plan.planName}</h5>
                  <div>
                    <span className={`badge ${plan.isActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {plan.showDiscounts && (
                      <span className="badge bg-info">Dynamic</span>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-text text-muted small">{plan.description}</p>
                  
                  <div className="mb-3">
                    <div>
                      <strong>Price: {formatPrice(plan.price)}</strong>
                      {plan.discountPercentage > 0 && (
                        <span className="badge bg-warning text-dark ms-2">
                          {plan.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-6">
                      <small className="text-muted d-block">Duration</small>
                      <strong>{plan.durationDays} Days</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Consultations</small>
                      <strong>{plan.consultationLimit}</strong>
                    </div>
                  </div>

                  {/* Delivery Limits Display */}
                  <div className="mb-3 p-2 bg-light rounded border">
                    <small className="fw-bold d-block mb-1">Free Delivery Limits:</small>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-white text-dark border">
                        Lab: {plan.labDeliveryLimit || 0}
                      </span>
                      <span className="badge bg-white text-dark border">
                        Food: {plan.foodDeliveryLimit || 0}
                      </span>
                      <span className="badge bg-white text-dark border">
                        Pharm: {plan.pharmacyDeliveryLimit || 0}
                      </span>
                    </div>
                  </div>

                  {/* Features Preview */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-3">
                      <small className="fw-bold">Features:</small>
                      <ul className="list-unstyled mb-0 mt-1">
                        {plan.features.slice(0, 2).map((feature, i) => (
                          <li key={i} className="small text-muted text-truncate">• {feature}</li>
                        ))}
                        {plan.features.length > 2 && <li className="small text-primary">+{plan.features.length - 2} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleViewDiscountMatrix(plan._id)}
                    >
                      Discounts
                    </button>
                    <div className="d-flex gap-2">
                      {/* ✅ EDIT BUTTON CONNECTED */}
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => handleEditClick(plan)}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className={`btn btn-sm ${plan.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleStatusToggle(plan._id, plan.isActive)}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="alert alert-info">
              No membership plans found. Create your first plan!
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Plan Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-xl" style={{ maxWidth: '95%' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? 'Edit Membership Plan' : 'Create New Membership Plan (Sub-Admin)'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={createLoading}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Operation Error in Modal */}
                {operationError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {operationError}
                    <button type="button" className="btn-close" onClick={() => setOperationError(null)}></button>
                  </div>
                )}
                
                <form onSubmit={handleFormSubmit}>
                  {/* Basic Information Section */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="border-bottom pb-2">Basic Information</h6>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Plan Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="planName"
                        value={formData.planName}
                        onChange={handleInputChange}
                        required
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Price (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberInputChange}
                        min="0"
                        required
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Duration (Days) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleNumberInputChange}
                        min="1"
                        required
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Consultation Limit *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="consultationLimit"
                        value={formData.consultationLimit}
                        onChange={handleNumberInputChange}
                        min="0"
                        required
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Base Discount %</label>
                      <input
                        type="number"
                        className="form-control"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleNumberInputChange}
                        min="0"
                        max="100"
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Show Dynamic Discounts</label>
                        <select
                          className="form-select"
                          name="showDiscounts"
                          value={formData.showDiscounts}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            showDiscounts: e.target.value === 'true' 
                          }))}
                          disabled={createLoading}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        disabled={createLoading}
                      />
                    </div>
                  </div>

                  {/* Delivery Limits Section */}
                  <div className="row mb-4 bg-light p-3 rounded mx-1">
                    <div className="col-12">
                      <h6 className="border-bottom pb-2 text-primary">Free Delivery Limits</h6>
                      <small className="text-muted d-block mb-3">Set how many free deliveries are allowed per plan. Set 0 for none.</small>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold"><i className="bi bi-eyedropper"></i> Lab Delivery Limit</label>
                      <input
                        type="number"
                        className="form-control"
                        name="labDeliveryLimit"
                        value={formData.labDeliveryLimit}
                        onChange={handleNumberInputChange}
                        min="0"
                        placeholder="0"
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold"><i className="bi bi-basket"></i> Food Delivery Limit</label>
                      <input
                        type="number"
                        className="form-control"
                        name="foodDeliveryLimit"
                        value={formData.foodDeliveryLimit}
                        onChange={handleNumberInputChange}
                        min="0"
                        placeholder="0"
                        disabled={createLoading}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold"><i className="bi bi-capsule"></i> Pharmacy Delivery Limit</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pharmacyDeliveryLimit"
                        value={formData.pharmacyDeliveryLimit}
                        onChange={handleNumberInputChange}
                        min="0"
                        placeholder="0"
                        disabled={createLoading}
                      />
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="border-bottom pb-2">Features</h6>
                      {formData.features.map((feature, index) => (
                        <div key={index} className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                            disabled={createLoading}
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeFeature(index)}
                              disabled={createLoading}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={addFeature}
                        disabled={createLoading}
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  {/* Discount Matrix Section */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="border-bottom pb-2">Health Categories (Dynamic Discounts)</h6>
                    </div>

                    {/* Blood Sugar */}
                    <div className="col-md-12 mb-3">
                       <label className="form-label fw-bold text-muted">Blood Sugar Options</label>
                       {formData.BloodSugar.map((option, index) => (
                        <div key={index} className="row mb-1">
                          <div className="col-7">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={option} 
                              onChange={(e) => handleArrayFieldChange('BloodSugar', index, e.target.value)} 
                              placeholder="Option Name" 
                              disabled={createLoading}
                            />
                          </div>
                          <div className="col-3">
                            <input 
                              type="number" 
                              className="form-control form-control-sm" 
                              value={formData.BloodSugarDiscounts[index] || 0} 
                              onChange={(e) => handleDiscountArrayChange('BloodSugarDiscounts', index, e.target.value)} 
                              placeholder="%" 
                              disabled={createLoading}
                            />
                          </div>
                          <div className="col-2">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => removeArrayFieldItem('BloodSugar', 'BloodSugarDiscounts', index)}
                              disabled={createLoading}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                       ))}
                       <button 
                         type="button" 
                         className="btn btn-sm btn-link" 
                         onClick={() => addArrayFieldItem('BloodSugar', 'BloodSugarDiscounts')}
                         disabled={createLoading}
                       >
                         + Add Option
                       </button>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      disabled={createLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        isEditing ? 'Update Plan' : 'Create Plan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlansListSub;
