import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import style from "../../../Assets/Css/ShopInput.module.css";

const AddAddress = ({ 
  mainTitle = "Delivery Address", 
  AddAddressBtn = "text-mainBlue", 
  submitBtn = "bg-mainRed text-light", 
  radioButton = "border-mainBlue text-mainBlue",
  onAddressChange,
  addresses = [],
  fetchAddresses,
  addNewAddress,
  updateAddress,
  deleteAddress
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      addressType: "Home"
    }
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentEditingId, setCurrentEditingId] = useState(null);

  const addressType = watch("addressType");

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]._id);
      if (onAddressChange) {
        onAddressChange(addresses[0]);
      }
    }
  }, [addresses]);

useEffect(() => {
  console.log('Received props:', {
    fetchAddresses: typeof fetchAddresses,
    addNewAddress: typeof addNewAddress,
    updateAddress: typeof updateAddress,
    deleteAddress: typeof deleteAddress
  });
}, []);

const handleAddressSelect = (addressId) => {
  const address = addresses.find(addr => addr._id === addressId);
  if (address) {
    setSelectedAddress(addressId);
    if (onAddressChange) {
      onAddressChange(address);
    }
  }
};

 const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEditing && currentEditingId) {
        await updateAddress(currentEditingId, data);
      } else {
        await addNewAddress(data);
      }
      
      // Refresh addresses list after successful operation
      const updatedAddresses = await fetchAddresses();
      
      if (updatedAddresses.length > 0) {
        const latestAddress = isEditing 
          ? updatedAddresses.find(addr => addr._id === currentEditingId)
          : updatedAddresses[updatedAddresses.length - 1];
        
        setSelectedAddress(latestAddress._id);
        if (onAddressChange) {
          onAddressChange(latestAddress);
        }
      }
      
      reset();
      setShowAddForm(false);
      setIsEditing(false);
      setCurrentEditingId(null);
    } catch (err) {
      console.error("Error submitting address:", err);
      setError(err.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    if (!address) return;
    
    Object.keys(address).forEach(key => {
      setValue(key, address[key]);
    });
    setIsEditing(true);
    setCurrentEditingId(address._id);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress(addressId);
      
      // Refresh addresses list after deletion
      const updatedAddresses = await fetchAddresses();
      
      if (updatedAddresses.length > 0) {
        // Select the first address by default
        setSelectedAddress(updatedAddresses[0]._id);
        if (onAddressChange) {
          onAddressChange(updatedAddresses[0]);
        }
      } else {
        // No addresses left
        setSelectedAddress(null);
        if (onAddressChange) {
          onAddressChange(null);
        }
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError(err.message || "Failed to delete address");
    }
  };


  return (
    <div className="noBackdrop offcanvas CustomOffcan-lg-end offcanHeightFull" tabIndex={-1} id="addAddress"
      aria-labelledby="addAddressLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="addAddressLabel">
          <button 
            className="btn p-0 d-lg-none" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
            onClick={() => setShowAddForm(false)}
          >
            <i className="ri-arrow-go-back-line fs-4"></i>
          </button>{" "}
          {mainTitle}
        </h5>
        <button 
          type="button" 
          className="btn-close d-none d-lg-block" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close" 
        />
      </div>
      <div className="offcanvas-body pb-0">
        {showAddForm ? (
          <div className="w-100 px-2 OfferOfcanvasHeight h-100" style={{ maxHeight: "calc(100vh - 182px)" }}>
            {error && (
              <div className="alert alert-danger mb-3">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                />
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="ps-4">
                <div className="customInput1 my-4">
                  <input 
                    className="px-3" 
                    type="text" 
                    {...register("name", { required: "Name is required" })}
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    Full Name <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                </div>
                
                <div className="customInput1 my-4">
                  <input 
                    className="px-3" 
                    type="tel" 
                    {...register("phone", { 
                      required: "Phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Invalid phone number"
                      }
                    })}
                    maxLength="10" 
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    Mobile Number <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                  <div className="form-text position-absolute">
                    For delivery communication
                  </div>
                </div>
                
                <div className="customInput1 mt-5" style={{ width: "130px" }}>
                  <input 
                    className="px-3" 
                    type="text" 
                    {...register("pinCode", { 
                      required: "Pincode is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Invalid pincode"
                      }
                    })}
                    maxLength="6" 
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    Pincode<span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                </div>
                
                <div className="customInput1 my-4">
                  <input 
                    className="px-3" 
                    type="text" 
                    {...register("address", { required: "Address is required" })}
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    Full Address <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                </div>
                
                <div className="customInput1 my-4">
                  <input 
                    className="px-3" 
                    type="text" 
                    {...register("city", { required: "City is required" })}
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    City <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                </div>
                
                <div className="customInput1 my-4">
                  <input 
                    className="px-3" 
                    type="text" 
                    {...register("state", { required: "State is required" })}
                    required 
                  />
                  <label className="customInputLabel1 fw-semibold">
                    State <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="underline" />
                </div>
                
                <div>
                  <label className="form-label text-mainBlue fw-semibold">
                    Address Type <span className="fs-4 lh-sm text-danger">*</span>
                  </label>
                  <div className="d-flex mt-2 gap-3">
                    {["Home", "Work", "Other"].map((type) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={`addressType-${type}`}
                          value={type}
                          {...register("addressType")}
                          className="d-none"
                        />
                        <label
                          htmlFor={`addressType-${type}`}
                          className={`btn rounded-pill ${radioButton} ${
                            addressType === type ? 'active' : ''
                          }`}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="py-2 bg-light w-100 sticky-bottom">
                <button 
                  type="submit" 
                  className={`btn w-100 py-3 fs-5 my-1 rounded-2 ${submitBtn}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    isEditing ? 'Update Address' : 'Save Address'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-100 px-2 OfferOfcanvasHeight h-100" style={{ maxHeight: "calc(100vh - 182px)" }}>
            <div className="">
              <div className="sticky-top">
                <button 
                  className={`btn border-mainBlue w-100 ${AddAddressBtn}`}
                  onClick={() => {
                    reset({
                      addressType: "Home"
                    });
                    setIsEditing(false);
                    setCurrentEditingId(null);
                    setShowAddForm(true);
                  }}
                >
                  Add New Address
                </button>
              </div>
              <div className="mt-5">
                <h6>Select Delivery Address</h6>
                <div className="py-2">
                  {error && (
                    <div className="alert alert-danger mb-3">
                      {error}
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setError(null)}
                      />
                    </div>
                  )}
                  
                  <div className={style.wrapper}>
                    {addresses.length > 0 ? (
                      addresses.map(address => (
                        <div className={style.card} key={address._id}>
                          <input 
                            className={style.input} 
                            type="radio" 
                            name="address" 
                            value={address._id}
                            checked={selectedAddress === address._id}
                            onChange={() => handleAddressSelect(address._id)}
                          />
                          <span className={style.check} />
                          <label className={style.label}>
                            <span className="fw-semibold">{address.addressType}</span>
                            <div className="fs-small">
                              <p className="text-black mb-0 fw-semibold">{address.name}</p>
                              <p className="text-muted mb-0">{address.address}, {address.city}, {address.pinCode}</p>
                              <p className="text-muted mb-0">{address.phone}</p>
                            </div>   
                          </label>
                          <div className="borderDashedTop mt-3 position-absolute ms-2" style={{ width: "95%", bottom: "5px" }}>
                            <div className="d-flex justify-content-between pt-2 px-2 position-relative" style={{ zIndex: "20" }}>
                              <button 
                                className="btn btn-link p-0 text-muted"
                                onClick={() => handleDelete(address._id)}
                              >
                                <i className="ri-delete-bin-fill fs-5"></i>
                              </button>
                              <button 
                                className="btn btn-link p-0 text-muted"
                                onClick={() => handleEdit(address)}
                              >
                                <i className="ri-edit-line fs-5 me-2"></i>Edit
                              </button>
                            </div>
                          </div>                   
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p>No saved addresses found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="py-2 bg-light w-100 sticky-bottom">
              <button 
                type="button" 
                data-bs-dismiss='offcanvas' 
                className={`btn w-100 py-3 fs-5 my-1 rounded-2 ${submitBtn}`}
                disabled={!selectedAddress}
              >
                Use Selected Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAddress;