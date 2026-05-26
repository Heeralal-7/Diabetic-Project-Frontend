import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Button, Form, Alert, Spinner, Card, Badge } from "react-bootstrap";
import { FaMapMarkerAlt, FaEdit, FaTrash, FaCheck, FaPlus } from "react-icons/fa";

const PharmacyAddress = ({ 
  addresses = [],
  onAddressChange,
  addNewAddress,
  updateAddress,
  deleteAddress,
  fetchAddresses
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      addressType: "Home",
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "",
      gender: "",
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

  const addressType = watch("addressType");
  const watchCountry = watch("country");

  const countries = ["India", "USA", "UK", "Canada", "Australia",
    "Germany", "France", "Japan", "Singapore", "UAE"];
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];
  const addressTypes = ["Home", "Work", "Other"];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress?._id);
    }
  }, [addresses]);

  const handleAddressSelect = (addressId) => {
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedAddress(addressId);
      if (onAddressChange) {
        onAddressChange(address);
      }
    }
  };

  const handleEdit = (address) => {
    if (!address) return;
    
    const formattedAddress = {
      ...address,
      dob: address.dob || "",
      gender: address.gender || ""
    };
    
    Object.keys(formattedAddress).forEach(key => {
      if (key in formattedAddress) {
        setValue(key, formattedAddress[key], { shouldValidate: true });
      }
    });

    setIsEditing(true);
    setCurrentEditingId(address._id);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      setLoading(true);
      await deleteAddress(addressId);
      const updatedAddresses = await fetchAddresses();
      
      if (selectedAddress === addressId) {
        if (updatedAddresses.length > 0) {
          handleAddressSelect(updatedAddresses[0]._id);
        } else {
          setSelectedAddress(null);
          if (onAddressChange) {
            onAddressChange(null);
          }
        }
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError(err.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pinCode', 'country'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill all required fields: ${missingFields.join(', ')}`);
      }

      const addressData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        country: data.country,
        addressType: data.addressType,
        gender: data.gender || "",
        dob: data.dob || ""
      };

      let response;
      if (isEditing && currentEditingId) {
        response = await updateAddress(currentEditingId, addressData);
      } else {
        response = await addNewAddress(addressData);
      }

      if (!response) {
        throw new Error("Failed to save address");
      }

      const updatedAddresses = await fetchAddresses();
      
      if (response._id) {
        const newAddress = updatedAddresses.find(addr => addr._id === response._id);
        if (newAddress) {
          handleAddressSelect(newAddress._id);
        }
      }

      resetForm();
      
    } catch (err) {
      console.error("Address submission error:", err);
      setError(err.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      addressType: "Home",
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "",
      gender: "",
      dob: ""
    });
    setShowAddForm(false);
    setIsEditing(false);
    setCurrentEditingId(null);
  };

  return (
    <div className="h-100 d-flex flex-column">
      {showAddForm ? (
        <div className="flex-grow-1 overflow-auto p-3">
          {error && (
            <Alert variant="danger" className="d-flex justify-content-between align-items-center mb-3">
              <span>{error}</span>
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => setError(null)}
              >
                &times;
              </Button>
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
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

              {/* Birth Year and Gender */}
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
                        message: "Enter 10 digit phone number"
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

              {/* Country */}
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
                    {...register("address", { required: "Address is required" })}
                    placeholder=" "
                    disabled={isSubmitting}
                    id="addressInput"
                    style={{ height: "100px" }}
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

              {/* City and State */}
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

            

              {/* Submit Buttons */}
              <div className="col-12">
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" className="me-2" />
                        {isEditing ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      isEditing ? 'Update Address' : 'Save Address'
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      ) : (
        <>
          <div className="p-3 bg-light border-bottom">
            <Button 
              variant="outline-primary" 
              className="w-100"
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
            >
              <FaPlus className="me-2" />
              Add New Address
            </Button>
          </div>
          
          <div className="flex-grow-1 overflow-auto p-3">
            {error && (
              <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => setError(null)}
                >
                  &times;
                </Button>
              </Alert>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-5">
                <FaMapMarkerAlt size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No saved addresses</h5>
                <p className="text-muted">Add your first address to get started</p>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map(address => (
                  <Card 
                    key={address._id} 
                    className={`mb-3 ${selectedAddress === address._id ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAddressSelect(address._id)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg="primary" className="me-2">
                              {address.addressType}
                            </Badge>
                            <h6 className="mb-0">{address.name}</h6>
                          </div>
                          
                          {(address.gender || address.dob) && (
                            <p className="text-muted small mb-1">
                              {address.gender && `${address.gender}`}
                              {address.dob && ` • Born: ${address.dob}`}
                            </p>
                          )}
                          <p className="text-muted small mb-2">
                            <FaMapMarkerAlt className="me-1" />
                            {address.address}, {address.city}, {address.state} - {address.pinCode}
                          </p>
                          <p className="text-muted small mb-0">
                            Phone: {address.phone}
                          </p>
                        </div>
                        
                        {selectedAddress === address._id && (
                          <FaCheck className="text-primary mt-1 ms-2" />
                        )}
                      </div>
                      
                      <div className="d-flex gap-2 mt-3 pt-2 border-top">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                        >
                          <FaEdit className="me-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address._id);
                          }}
                          disabled={loading}
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PharmacyAddress;
