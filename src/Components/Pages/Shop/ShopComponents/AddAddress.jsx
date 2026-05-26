import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const AddAddress = ({ 
  mainTitle = "Delivery Address", 
  AddAddressBtn = "text-mainBlue", 
  submitBtn = "bg-mainRed text-light", 
  onAddressChange,
  addresses = [],
  fetchAddresses,
  addNewAddress,
  updateAddress,
  deleteAddress,
  onForceUpdate
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      dob: ""
    }
  });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    type: '', 
    message: '', 
    show: false 
  });

  // Watch form values
  const watchCountry = watch("country");
  const watchGender = watch("gender");

  // ✅ 10 Countries List
  const countries = [
    "India", "USA", "UK", "Canada", "Australia",
    "Germany", "France", "Japan", "Singapore", "UAE"
  ];

  // ✅ Gender Options
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
    { value: "Prefer not to say", label: "Prefer not to say" }
  ];

  // ✅ Auto-select first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      const addressId = defaultAddress?._id;
      setSelectedAddress(addressId);
      if (onAddressChange && defaultAddress) {
        onAddressChange(defaultAddress);
      }
    }
  }, [addresses]);

  // ✅ Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification({ type: '', message: '', show: false });
    }, 3000);
  };

  // ✅ Handle address selection
  const handleAddressSelect = (addressId) => {
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedAddress(addressId);
      if (onAddressChange) {
        onAddressChange(address);
      }
    }
  };

  // ✅ Handle edit - Properly load all fields
  const handleEdit = (address) => {
    if (!address) return;
    
    console.log("Editing address with data:", address);
    
    // ✅ Format DOB
    let formattedDob = '';
    if (address.dob) {
      if (/^\d{4}$/.test(address.dob.toString())) {
        formattedDob = address.dob.toString();
      } else if (address.dob.includes('-')) {
        const year = address.dob.split('-')[0];
        formattedDob = year;
      } else {
        formattedDob = address.dob.toString();
      }
    }
    
    // ✅ Set form values
    const formData = {
      name: address.name || "",
      dob: formattedDob,
      phone: address.phone || "",
      gender: address.gender || "",
      address: address.address || "",
      country: address.country || "India",
      state: address.state || "",
      city: address.city || "",
      pinCode: address.pinCode || ""
    };

    console.log("Setting form data:", formData);
    
    reset(formData);
    
    // Force update all fields in form state
    Object.keys(formData).forEach(key => {
      setValue(key, formData[key], { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    });

    setIsEditing(true);
    setCurrentEditingId(address._id);
    setShowAddForm(true);
    setError(null);
    setNotification({ type: '', message: '', show: false });
  };

  // ✅ Handle delete
  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      setLoading(true);
      setError(null);
      setNotification({ type: '', message: '', show: false });
      
      const response = await deleteAddress(addressId);
      
      let isSuccess = false;
      
      if (response) {
        if (response.success === true || response.success === 1 || response.status === 'success') {
          isSuccess = true;
        }
        if (response.data && (response.data.success === true || response.data.success === 1)) {
          isSuccess = true;
        }
      }
      
      if (!isSuccess) {
        throw new Error(response?.message || response?.error || "Failed to delete address");
      }
      
      showNotification('success', "Address deleted successfully!");
      
      if (fetchAddresses) {
        await fetchAddresses();
      }
      
      if (onForceUpdate) {
        onForceUpdate();
      }
      
      if (selectedAddress === addressId) {
        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
        if (remainingAddresses.length > 0) {
          handleAddressSelect(remainingAddresses[0]._id);
        } else {
          setSelectedAddress(null);
          if (onAddressChange) {
            onAddressChange(null);
          }
        }
      }
      
    } catch (err) {
      console.error("Error deleting address:", err);
      showNotification('error', err.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: onSubmit with proper gender and dob handling
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setNotification({ type: '', message: '', show: false });
      
      console.log("Form submitted data:", data);
      
      // Validate required fields
      const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pinCode', 'country'];
      const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill all required fields: ${missingFields.join(', ')}`);
      }

      // ✅ Process DOB
      let dobYear = "";
      if (data.dob && data.dob.toString().trim() !== "") {
        const year = parseInt(data.dob);
        const currentYear = new Date().getFullYear();
        
        if (isNaN(year)) throw new Error("Please enter a valid year");
        if (year < 1900) throw new Error("Year must be after 1900");
        if (year > currentYear) throw new Error("Year cannot be in future");
        
        dobYear = year.toString();
      }

      // ✅ Prepare complete address data
      const addressData = {
        name: data.name.toString().trim(),
        phone: data.phone.toString().trim(),
        gender: data.gender.toString().trim(),
        address: data.address.toString().trim(),
        city: data.city.toString().trim(),
        state: data.state.toString().trim(),
        pinCode: data.pinCode.toString().trim(),
        country: data.country.toString().trim(),
        dob: dobYear
      };

      console.log("Submitting address data:", addressData);

      let response;
      if (isEditing && currentEditingId) {
        console.log("Updating address ID:", currentEditingId);
        response = await updateAddress(currentEditingId, addressData);
      } else {
        console.log("Adding new address");
        response = await addNewAddress(addressData);
      }

      console.log("API Response:", response);

      if (!response) {
        throw new Error("No response received from server");
      }

      let isSuccess = false;
      let successMessage = isEditing ? "Address updated successfully!" : "Address added successfully!";
      let responseData = null;

      // Check different response formats
      if (response.success === 1 || response.success === true) {
        isSuccess = true;
        responseData = response.data || response.details || response.patient || response;
      } else if (response._id) {
        isSuccess = true;
        responseData = response;
      } else if (response.status === 'success') {
        isSuccess = true;
        responseData = response.data || response;
      }

      if (!isSuccess) {
        throw new Error(response.message || response.error || "Operation failed");
      }

      // ✅ Show success
      showNotification('success', successMessage);

      // ✅ Refresh addresses
      if (fetchAddresses) {
        console.log("Refreshing addresses...");
        await fetchAddresses();
      }

      // ✅ Notify parent
      if (onForceUpdate) {
        console.log("Notifying parent...");
        onForceUpdate();
      }

      // Auto-select new/updated address
      const newAddressId = responseData?._id || currentEditingId;
      if (newAddressId) {
        setTimeout(() => {
          const updatedAddress = addresses.find(addr => addr._id === newAddressId) || responseData;
          if (updatedAddress) {
            handleAddressSelect(newAddressId);
          }
        }, 1000);
      }

      // Reset form
      setTimeout(() => {
        resetForm();
      }, 1500);

      return { success: true, data: responseData };

    } catch (err) {
      console.error("Submission error:", err);
      showNotification('error', err.message || "Failed to save address");
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    reset({
      name: "",
      phone: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      dob: ""
    });
    setShowAddForm(false);
    setIsEditing(false);
    setCurrentEditingId(null);
    setError(null);
  };

  return (
    <div className="noBackdrop offcanvas CustomOffcan-lg-end offcanHeightFull" tabIndex={-1} id="addAddress"
      aria-labelledby="addAddressLabel">
      <div className="offcanvas-header border-bottom bg-light">
        <h5 className="offcanvas-title fw-bold text-dark" id="addAddressLabel">
          <button 
            className="btn p-0 d-lg-none me-3" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
            onClick={() => {
              setShowAddForm(false);
              resetForm();
            }}
          >
            <i className="ri-arrow-go-back-line fs-4"></i>
          </button>
          {mainTitle}
        </h5>
        <button 
          type="button" 
          className="btn-close d-none d-lg-block" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
          onClick={resetForm}
        />
      </div>
      
      <div className="offcanvas-body p-0">
        {/* Notification Banner */}
        {notification.show && (
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} m-0 border-0 rounded-0`}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className={`ri-${notification.type === 'success' ? 'checkbox-circle-fill' : 'error-warning-fill'} me-2`}></i>
                <span className="fw-medium">{notification.message}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setNotification({ type: '', message: '', show: false })}
              />
            </div>
          </div>
        )}

        {showAddForm ? (
          <div className="h-100 d-flex flex-column">
            {/* Form Header */}
            <div className="p-3 border-bottom bg-light">
              <h6 className="mb-0 fw-bold">
                <i className="ri-map-pin-line me-2"></i>
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </h6>
              <small className="text-muted">Fields marked with <span className="text-danger">*</span> are required</small>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="h-100 d-flex flex-column">
              <div className="flex-grow-1 overflow-auto p-3">
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        {...register("name", { required: "Name is required" })}
                        placeholder=" "
                        disabled={isSubmitting}
                        id="nameInput"
                      />
                      <label htmlFor="nameInput" className="fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      {errors.name && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.name.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Number */}
                  <div className="col-12">
                    <div className="form-floating">
                      <input 
                        type="tel" 
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        {...register("phone", { 
                          required: "Phone is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Enter 10 digit number"
                          }
                        })}
                        maxLength="10"
                        placeholder=" "
                        disabled={isSubmitting}
                        id="phoneInput"
                      />
                      <label htmlFor="phoneInput" className="fw-semibold">
                        Mobile Number <span className="text-danger">*</span>
                      </label>
                      {errors.phone && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Birth Year and Gender in one row */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="number" 
                        className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                        {...register("dob", {
                          validate: (value) => {
                            if (!value || value.toString().trim() === "") return true;
                            const year = parseInt(value);
                            const currentYear = new Date().getFullYear();
                            if (isNaN(year)) return "Enter valid year";
                            if (year < 1900) return "Year must be after 1900";
                            if (year > currentYear) return "Year cannot be in future";
                            return true;
                          }
                        })}
                        placeholder=" "
                        disabled={isSubmitting}
                        id="dobInput"
                        min="1900"
                        max={new Date().getFullYear()}
                        step="1"
                      />
                      <label htmlFor="dobInput" className="fw-semibold">
                        Birth Year (Optional)
                      </label>
                      <small className="text-muted d-block mt-1">
                        <i className="ri-information-line me-1"></i>
                        Year only (e.g., 1998)
                      </small>
                      {errors.dob && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.dob.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ Gender Dropdown */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <select 
                        className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                        {...register("gender")}
                        disabled={isSubmitting}
                        id="genderInput"
                      >
                        <option value="">Select Gender (Optional)</option>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="genderInput" className="fw-semibold">
                        Gender (Optional)
                      </label>
                      <small className="text-muted d-block mt-1">
                        <i className="ri-user-line me-1"></i>
                        Select your gender
                      </small>
                    </div>
                  </div>

                  {/* ✅ Country Dropdown */}
                  <div className="col-12">
                    <div className="form-floating">
                      <select 
                        className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                        {...register("country", { required: "Country is required" })}
                        disabled={isSubmitting}
                        id="countryInput"
                      >
                        <option value="">Select Country *</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="countryInput" className="fw-semibold">
                        Country <span className="text-danger">*</span>
                      </label>
                      {errors.country && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.country.message}
                        </div>
                      )}
                      {watchCountry && (
                        <div className="text-success small mt-1">
                          <i className="ri-checkbox-circle-fill me-1"></i>
                          Selected: {watchCountry}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Full Address */}
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea 
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        style={{ height: "100px" }}
                        {...register("address", { required: "Address is required" })}
                        placeholder=" "
                        disabled={isSubmitting}
                        id="addressInput"
                      />
                      <label htmlFor="addressInput" className="fw-semibold">
                        Full Address <span className="text-danger">*</span>
                      </label>
                      {errors.address && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.address.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* City & State */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        {...register("city", { required: "City is required" })}
                        placeholder=" "
                        disabled={isSubmitting}
                        id="cityInput"
                      />
                      <label htmlFor="cityInput" className="fw-semibold">
                        City <span className="text-danger">*</span>
                      </label>
                      {errors.city && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.city.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                        {...register("state", { required: "State is required" })}
                        placeholder=" "
                        disabled={isSubmitting}
                        id="stateInput"
                      />
                      <label htmlFor="stateInput" className="fw-semibold">
                        State <span className="text-danger">*</span>
                      </label>
                      {errors.state && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.state.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Pincode */}
                  <div className="col-12">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className={`form-control ${errors.pinCode ? 'is-invalid' : ''}`}
                        {...register("pinCode", { 
                          required: "Pincode is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Enter 6 digit pincode"
                          }
                        })}
                        maxLength="6"
                        placeholder=" "
                        disabled={isSubmitting}
                        id="pinCodeInput"
                      />
                      <label htmlFor="pinCodeInput" className="fw-semibold">
                        Pincode <span className="text-danger">*</span>
                      </label>
                      {errors.pinCode && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="ri-error-warning-line me-1"></i>
                          {errors.pinCode.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Footer */}
              <div className="p-3 bg-light border-top">
                <button 
                  type="submit" 
                  className={`btn w-100 py-3 fs-6 rounded-3 fw-semibold ${submitBtn}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <i className={`ri-${isEditing ? 'save-line' : 'add-line'} me-2`}></i>
                      {isEditing ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  <i className="ri-close-line me-2"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-100 d-flex flex-column">
            {/* Add Address Button */}
            <div className="p-3 bg-light border-bottom">
              <button 
                className={`btn w-100 border-2 py-3 rounded-3 fw-semibold ${AddAddressBtn}`}
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                disabled={isSubmitting || loading}
              >
                <i className="ri-add-line me-2"></i>
                Add New Address
              </button>
            </div>
            
            {/* Address List */}
            <div className="flex-grow-1 overflow-auto p-3">
              <h6 className="mb-3 fw-semibold d-flex align-items-center">
                <i className="ri-map-pin-line me-2"></i>
                Select Delivery Address
                <span className="badge bg-primary rounded-pill ms-2">{addresses.length}</span>
              </h6>
              
              <div className="address-list">
                {addresses.length > 0 ? (
                  addresses.map(address => (
                    <div 
                      key={address._id} 
                      className={`card mb-3 border ${selectedAddress === address._id ? 'border-primary border-2' : 'border-light'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => !isSubmitting && handleAddressSelect(address._id)}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h6 className="mb-0 fw-bold text-dark">{address.name}</h6>
                              {address.gender && (
                                <span className="badge bg-light text-dark border ms-2">
                                  <i className="ri-user-line me-1"></i>
                                  {address.gender}
                                </span>
                              )}
                            </div>
                            
                            {/* Info badges */}
                            <div className="mb-2">
                              {address.dob && (
                                <span className="badge bg-light text-dark border me-2">
                                  <i className="ri-calendar-line me-1"></i>
                                  Born: {address.dob}
                                </span>
                              )}
                              {address.country && (
                                <span className="badge bg-info text-white border">
                                  <i className="ri-global-line me-1"></i>
                                  {address.country}
                                </span>
                              )}
                            </div>
                            
                            {/* Address details */}
                            <div className="mb-3">
                              <p className="text-muted mb-2">
                                <i className="ri-map-pin-line me-1"></i>
                                {address.address}
                              </p>
                              <div className="d-flex flex-wrap gap-2 small text-muted">
                                <span className="d-flex align-items-center">
                                  <i className="ri-building-line me-1"></i>
                                  {address.city}, {address.state}
                                </span>
                                <span className="d-flex align-items-center">
                                  <i className="ri-mail-line me-1"></i>
                                  Pincode: {address.pinCode}
                                </span>
                                <span className="d-flex align-items-center">
                                  <i className="ri-phone-line me-1"></i>
                                  {address.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection indicator */}
                          {selectedAddress === address._id && (
                            <div className="text-primary ms-2">
                              <i className="ri-checkbox-circle-fill fs-4"></i>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="d-flex gap-2 mt-3 pt-3 border-top">
                          <button 
                            className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(address);
                            }}
                            disabled={isSubmitting || loading}
                          >
                            <i className="ri-edit-line me-1"></i>
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm flex-fill d-flex align-items-center justify-content-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(address._id);
                            }}
                            disabled={isSubmitting || loading}
                          >
                            <i className="ri-delete-bin-line me-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="ri-map-pin-line display-1 text-muted opacity-50"></i>
                    </div>
                    <h6 className="text-muted mb-2 fw-semibold">No saved addresses</h6>
                    <p className="text-muted small mb-4">Add your first address to get started with delivery</p>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                      }}
                    >
                      <i className="ri-add-line me-2"></i>
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-3 bg-light border-top">
              <button 
                type="button" 
                data-bs-dismiss='offcanvas' 
                className={`btn w-100 py-3 fs-6 rounded-3 fw-semibold ${submitBtn}`}
                disabled={!selectedAddress || isSubmitting || loading}
                onClick={() => {
                  if (selectedAddress) {
                    const selected = addresses.find(addr => addr._id === selectedAddress);
                    if (selected) {
                      showNotification('success', `Address selected: ${selected.name}`);
                    }
                  }
                }}
              >
                {isSubmitting || loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line me-2"></i>
                    Use Selected Address
                  </>
                )}
              </button>
              
              <div className="text-center mt-3">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <i className="ri-information-line me-1"></i>
                  {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} available
                </small>
                {selectedAddress && (
                  <small className="text-success mt-1 d-block">
                    <i className="ri-check-line me-1"></i>
                    Address selected for delivery
                  </small>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAddress;
