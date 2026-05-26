import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../../../Context/Context";

function DeliveryCharges() {
  const { 
    foodDeliveryCharges, 
    loadingCharges, 
    chargesError,
    fetchFoodDeliveryChargesSub: fetchFoodDeliveryCharges, 
    updateFoodDeliveryChargesSub: updateFoodDeliveryCharges,
    getCurrentUserInfo,
    clearChargesError
  } = useContext(MyContext);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user info and permissions
    const userInfo = getCurrentUserInfo();
    setUserInfo(userInfo);
    
    // Fetch charges if user has view permission
    if (userInfo.canViewFoodCharges) {
      fetchFoodDeliveryCharges();
    }
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearChargesError();
    };
  }, []);

  // Show permission denied message
  if (userInfo && !userInfo.canViewFoodCharges) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4 p-md-5 text-center">
                  <div className="mb-4">
                    <i className="fas fa-ban text-danger" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h3 className="text-danger mb-3">Access Denied</h3>
                  <p className="text-muted mb-4">
                    You don't have permission to view food delivery charges.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-2">Food Delivery Charges</h1>
                </div>

                {chargesError && (
                  <div className="alert alert-danger mb-4 d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {chargesError}
                  </div>
                )}

                {/* Food Delivery Charges Component */}
                <FoodDeliveryCharges 
                  charges={foodDeliveryCharges}
                  loading={loadingCharges}
                  updateCharges={updateFoodDeliveryCharges}
                  userInfo={userInfo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Food Delivery Charges Component
function FoodDeliveryCharges({ charges, loading, updateCharges, userInfo }) {
  const [formData, setFormData] = useState({
    baseDeliveryCharge: "",
    freeDeliveryThreshold: "",
    rapidDeliveryCharge: "",
    taxPercentage: "",
    freeDeliveryRadius: "",
    perKmCharge: ""
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (charges) {
      setFormData({
        baseDeliveryCharge: charges.baseDeliveryCharge?.toString() || "",
        freeDeliveryThreshold: charges.freeDeliveryThreshold?.toString() || "",
        rapidDeliveryCharge: charges.rapidDeliveryCharge?.toString() || "",
        taxPercentage: charges.taxPercentage?.toString() || "",
        freeDeliveryRadius: charges.freeDeliveryRadius?.toString() || "",
        perKmCharge: charges.perKmCharge?.toString() || ""
      });
    }
  }, [charges]);

  const handleChange = (e) => {
    if (!userInfo?.canEditFoodCharges) return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    if (!userInfo?.canEditFoodCharges) return;
    setIsEditing(!isEditing);
    
    // Reset form data when canceling edit
    if (isEditing && charges) {
      setFormData({
        baseDeliveryCharge: charges.baseDeliveryCharge?.toString() || "",
        freeDeliveryThreshold: charges.freeDeliveryThreshold?.toString() || "",
        rapidDeliveryCharge: charges.rapidDeliveryCharge?.toString() || "",
        taxPercentage: charges.taxPercentage?.toString() || "",
        freeDeliveryRadius: charges.freeDeliveryRadius?.toString() || "",
        perKmCharge: charges.perKmCharge?.toString() || ""
      });
    }
  };

  const handleSubmit = async () => {
    if (!userInfo?.canEditFoodCharges) {
      alert("You don't have permission to update delivery charges");
      return;
    }

    // Convert to numbers and filter out empty values
    const submitData = {};
    
    if (formData.baseDeliveryCharge) {
      submitData.baseDeliveryCharge = parseFloat(formData.baseDeliveryCharge);
    }
    if (formData.freeDeliveryThreshold) {
      submitData.freeDeliveryThreshold = parseFloat(formData.freeDeliveryThreshold);
    }
    if (formData.rapidDeliveryCharge) {
      submitData.rapidDeliveryCharge = parseFloat(formData.rapidDeliveryCharge);
    }
    if (formData.taxPercentage) {
      submitData.taxPercentage = parseFloat(formData.taxPercentage);
    }
    if (formData.freeDeliveryRadius) {
      submitData.freeDeliveryRadius = parseFloat(formData.freeDeliveryRadius);
    }
    if (formData.perKmCharge) {
      submitData.perKmCharge = parseFloat(formData.perKmCharge);
    }

    if (Object.keys(submitData).length === 0) {
      alert("Please enter at least one value to update");
      return;
    }

    const result = await updateCharges(submitData);
    
    if (result.success) {
      setIsEditing(false);
      // Show success message
      if (result.updatedBy) {
        console.log(`Charges updated by: ${result.updatedBy.subAdminName}`);
      }
    }
  };

  const getLastUpdatedInfo = () => {
    if (!charges?.lastUpdated) return null;
    
    const lastUpdated = new Date(charges.lastUpdated).toLocaleString();
    const updatedBy = charges.updatedBy?.subAdminName || charges.updatedBy?.adminName || 'System';
    
    return `Last updated: ${lastUpdated} by ${updatedBy}`;
  };

  return (
    <div>
      {/* Last Updated Info */}
      {getLastUpdatedInfo() && (
        <div className="alert alert-info mb-4">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            {getLastUpdatedInfo()}
          </small>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="foodBaseDelivery" className="form-label fw-medium text-dark mb-2">
          Base Delivery Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="baseDeliveryCharge"
            value={formData.baseDeliveryCharge}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodBaseDelivery"
            placeholder="Enter base delivery charge"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.01"
          />
          <span className="text-muted min-width-100">
            Current: ₹{charges?.baseDeliveryCharge || '50'}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="foodFreeThreshold" className="form-label fw-medium text-dark mb-2">
          Free Delivery Threshold (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="freeDeliveryThreshold"
            value={formData.freeDeliveryThreshold}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodFreeThreshold"
            placeholder="Enter free delivery threshold"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.01"
          />
          <span className="text-muted min-width-100">
            Current: ₹{charges?.freeDeliveryThreshold || '300'}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="foodRapidDelivery" className="form-label fw-medium text-dark mb-2">
          Rapid Delivery Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="rapidDeliveryCharge"
            value={formData.rapidDeliveryCharge}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodRapidDelivery"
            placeholder="Enter rapid delivery charge"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.01"
          />
          <span className="text-muted min-width-100">
            Current: ₹{charges?.rapidDeliveryCharge || '100'}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="foodTaxPercentage" className="form-label fw-medium text-dark mb-2">
          Tax Percentage (%)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="taxPercentage"
            value={formData.taxPercentage}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodTaxPercentage"
            placeholder="Enter tax percentage"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.01"
          />
          <span className="text-muted min-width-100">
            Current: {charges?.taxPercentage || '2'}%
          </span>
        </div>
      </div>

      {/* New Fields Added */}
      <div className="mb-3">
        <label htmlFor="foodFreeRadius" className="form-label fw-medium text-dark mb-2">
          Free Delivery Radius (km)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="freeDeliveryRadius"
            value={formData.freeDeliveryRadius}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodFreeRadius"
            placeholder="Enter free delivery radius"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.1"
          />
          <span className="text-muted min-width-100">
            Current: {charges?.freeDeliveryRadius || '10'} km
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="foodPerKmCharge" className="form-label fw-medium text-dark mb-2">
          Per Kilometer Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="perKmCharge"
            value={formData.perKmCharge}
            onChange={handleChange}
            className={`form-control shadow-none border border-1 form-control-lg rounded-3 px-3 py-3 me-2 ${
              isEditing ? 'bg-white' : 'bg-light'
            }`}
            id="foodPerKmCharge"
            placeholder="Enter per km charge"
            style={{ fontSize: '16px' }}
            disabled={!isEditing || !userInfo?.canEditFoodCharges}
            min="0"
            step="0.01"
          />
          <span className="text-muted min-width-100">
            Current: ₹{charges?.perKmCharge || '5'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        {userInfo?.canEditFoodCharges ? (
          <>
            {!isEditing ? (
              <button
                className="btn btn-primary flex-fill py-3 rounded-3 fw-medium"
                onClick={handleEditToggle}
                disabled={loading}
              >
                <i className="fas fa-edit me-2"></i>
                Edit Charges
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success flex-fill py-3 rounded-3 fw-medium"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Update Charges
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary py-3 rounded-3 fw-medium"
                  onClick={handleEditToggle}
                  disabled={loading}
                  style={{ minWidth: '100px' }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
              </>
            )}
          </>
        ) : (
          <div className="alert alert-warning w-100 text-center">
            <i className="fas fa-eye me-2"></i>
            View Only - No edit permissions
          </div>
        )}
      </div>

      {/* Permission Info */}
      {userInfo?.isSubAdmin && (
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <i className="fas fa-shield-alt me-1"></i>
            Your permissions: {userInfo.canEditFoodCharges ? 'Edit Access' : 'View Only'}
          </small>
        </div>
      )}
    </div>
  );
}

// Add some CSS for fixed width
const styles = `
  .min-width-100 {
    min-width: 100px;
  }
`;

// Add styles to head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DeliveryCharges;