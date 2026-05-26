import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../../../Context/Context";

function LabDeliveryCharges() {
  const { 
    labDeliveryCharges, 
    loadingCharges, 
    chargesError,
    fetchLabDeliveryChargesSub:fetchLabDeliveryCharges, 
    updateLabDeliveryChargesSub:updateLabDeliveryCharges,
    clearChargesError 
  } = useContext(MyContext);

  useEffect(() => {
    fetchLabDeliveryCharges();
  }, []);

  // Clear error when component unmounts or when user dismisses it
  useEffect(() => {
    return () => {
      clearChargesError();
    };
  }, []);

  const handleDismissError = () => {
    clearChargesError();
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-0">Lab Delivery Charges</h1>
                  <p className="text-muted mt-2">Manage delivery charges for lab services</p>
                </div>

                {chargesError && (
                  <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
                    <span>{chargesError}</span>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={handleDismissError}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Lab Delivery Charges Component */}
                <LabChargesForm 
                  charges={labDeliveryCharges}
                  loading={loadingCharges}
                  updateCharges={updateLabDeliveryCharges}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// LAB DELIVERY CHARGES FORM
// ================================
function LabChargesForm({ charges, loading, updateCharges }) {
  const [formData, setFormData] = useState({
    baseDeliveryCharge: "",
    freeDeliveryThreshold: "",
    rapidDeliveryCharge: "",
    taxPercentage: "",
    freeDeliveryRadius: "",
    perKmCharge: ""
  });

  const [successMessage, setSuccessMessage] = useState("");

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
    const { name, value } = e.target;
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    const submitData = {};

    // Convert values and ensure all required fields are included
    const requiredFields = [
      'baseDeliveryCharge',
      'freeDeliveryThreshold', 
      'rapidDeliveryCharge',
      'taxPercentage',
      'freeDeliveryRadius',
      'perKmCharge'
    ];

    requiredFields.forEach(field => {
      // Use form value if provided, otherwise use current charges value
      const value = formData[field] !== "" 
        ? parseFloat(formData[field]) 
        : (charges && charges[field]) || getDefaultValue(field);
      
      submitData[field] = value;
    });

    // Validate all fields have valid numbers
    const hasInvalidFields = requiredFields.some(field => 
      isNaN(submitData[field]) || submitData[field] < 0
    );

    if (hasInvalidFields) {
      alert("Please enter valid positive numbers for all fields");
      return;
    }

    const result = await updateCharges(submitData);
    
    if (result.success) {
      setSuccessMessage("Delivery charges updated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Helper function to get default values
  const getDefaultValue = (field) => {
    const defaults = {
      baseDeliveryCharge: 50,
      freeDeliveryThreshold: 300,
      rapidDeliveryCharge: 100,
      taxPercentage: 0,
      freeDeliveryRadius: 10,
      perKmCharge: 5
    };
    return defaults[field] || 0;
  };

  const getCurrentValue = (field) => {
    return charges?.[field] ?? getDefaultValue(field);
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && (
        <div className="alert alert-success mb-4">
          {successMessage}
        </div>
      )}

      {/* Base Delivery Charge */}
      <div className="mb-3">
        <label className="form-label fw-medium text-dark mb-2">
          Base Delivery Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="baseDeliveryCharge"
            value={formData.baseDeliveryCharge}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter base delivery charge"
          />
          <span className="text-muted small min-width-100">
            Current: ₹{getCurrentValue('baseDeliveryCharge')}
          </span>
        </div>
      </div>

      {/* Free Delivery Threshold */}
      <div className="mb-3">
        <label className="form-label fw-medium text-dark mb-2">
          Free Delivery Threshold (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="freeDeliveryThreshold"
            value={formData.freeDeliveryThreshold}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter free delivery threshold"
          />
          <span className="text-muted small min-width-100">
            Current: ₹{getCurrentValue('freeDeliveryThreshold')}
          </span>
        </div>
      </div>

      {/* Rapid Delivery Charge */}
      <div className="mb-3">
        <label className="form-label fw-medium text-dark mb-2">
          Rapid Delivery Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="rapidDeliveryCharge"
            value={formData.rapidDeliveryCharge}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter rapid delivery charge"
          />
          <span className="text-muted small min-width-100">
            Current: ₹{getCurrentValue('rapidDeliveryCharge')}
          </span>
        </div>
      </div>

      {/* Tax Percentage */}
      <div className="mb-3">
        <label className="form-label fw-medium text-dark mb-2">
          Tax Percentage (%)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="taxPercentage"
            value={formData.taxPercentage}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter tax percentage"
          />
          <span className="text-muted small min-width-100">
            Current: {getCurrentValue('taxPercentage')}%
          </span>
        </div>
      </div>

      {/* Free Delivery Radius */}
      <div className="mb-3">
        <label className="form-label fw-medium text-dark mb-2">
          Free Delivery Radius (km)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="freeDeliveryRadius"
            value={formData.freeDeliveryRadius}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter free delivery radius"
          />
          <span className="text-muted small min-width-100">
            Current: {getCurrentValue('freeDeliveryRadius')} km
          </span>
        </div>
      </div>

      {/* Per KM Charge */}
      <div className="mb-4">
        <label className="form-label fw-medium text-dark mb-2">
          Per KM Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="text"
            name="perKmCharge"
            value={formData.perKmCharge}
            onChange={handleChange}
            className="form-control form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            placeholder="Enter per km charge"
          />
          <span className="text-muted small min-width-100">
            Current: ₹{getCurrentValue('perKmCharge')}
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 py-3 rounded-3 fw-medium"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Updating...
          </>
        ) : (
          "Update Charges"
        )}
      </button>
    </form>
  );
}

// Add some CSS for min-width
const styles = `
  .min-width-100 {
    min-width: 100px;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default LabDeliveryCharges;