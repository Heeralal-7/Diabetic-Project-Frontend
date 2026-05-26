import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../../Context/Context";

function DeliveryCharges() {
  const { 
    foodDeliveryCharges, 
    loadingCharges, 
    chargesError,
    fetchFoodDeliveryCharges, 
    updateFoodDeliveryCharges 
  } = useContext(MyContext);

  useEffect(() => {
    fetchFoodDeliveryCharges();
  }, []);

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-0">Food Delivery Charges</h1>
                </div>

                {chargesError && (
                  <div className="alert alert-danger mb-4">
                    {chargesError}
                  </div>
                )}

                {/* Food Delivery Charges Component */}
                <FoodDeliveryCharges 
                  charges={foodDeliveryCharges}
                  loading={loadingCharges}
                  updateCharges={updateFoodDeliveryCharges}
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
function FoodDeliveryCharges({ charges, loading, updateCharges }) {
  const [formData, setFormData] = useState({
    baseDeliveryCharge: "",
    freeDeliveryThreshold: "",
    rapidDeliveryCharge: "",
    taxPercentage: "",
    freeDeliveryRadius: "",
    perKmCharge: ""
  });

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
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

    // Validate that all required fields are present for backend
    const requiredFields = ['baseDeliveryCharge', 'freeDeliveryThreshold', 'rapidDeliveryCharge', 'taxPercentage', 'freeDeliveryRadius', 'perKmCharge'];
    const hasAllRequiredFields = requiredFields.every(field => submitData[field] !== undefined);
    
    if (!hasAllRequiredFields) {
      // If some fields are missing, use current values from charges for missing fields
      requiredFields.forEach(field => {
        if (submitData[field] === undefined && charges && charges[field] !== undefined) {
          submitData[field] = charges[field];
        }
      });
    }

    await updateCharges(submitData);
  };

  return (
    <div>
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
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodBaseDelivery"
            placeholder="Enter base delivery charge"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.01"
          />
          <span className="text-muted small">Current: ₹{charges?.baseDeliveryCharge || '50'}</span>
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
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodFreeThreshold"
            placeholder="Enter free delivery threshold"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.01"
          />
          <span className="text-muted small">Current: ₹{charges?.freeDeliveryThreshold || '300'}</span>
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
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodRapidDelivery"
            placeholder="Enter rapid delivery charge"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.01"
          />
          <span className="text-muted small">Current: ₹{charges?.rapidDeliveryCharge || '100'}</span>
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
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodTaxPercentage"
            placeholder="Enter tax percentage"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.01"
          />
          <span className="text-muted small">Current: {charges?.taxPercentage || '2'}%</span>
        </div>
      </div>

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
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodFreeRadius"
            placeholder="Enter free delivery radius"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.1"
          />
          <span className="text-muted small">Current: {charges?.freeDeliveryRadius || '10'} km</span>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="foodPerKmCharge" className="form-label fw-medium text-dark mb-2">
          Per KM Charge (₹)
        </label>
        <div className="d-flex align-items-center">
          <input
            type="number"
            name="perKmCharge"
            value={formData.perKmCharge}
            onChange={handleChange}
            className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
            id="foodPerKmCharge"
            placeholder="Enter per km charge"
            style={{ fontSize: '16px' }}
            min="0"
            step="0.01"
          />
          <span className="text-muted small">Current: ₹{charges?.perKmCharge || '5'}</span>
        </div>
      </div>

      <button
        className="btn btn-primary w-100 py-3 rounded-3 fw-medium"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Charges"}
      </button>
    </div>
  );
}

export default DeliveryCharges;