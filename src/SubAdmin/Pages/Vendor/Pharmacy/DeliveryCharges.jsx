import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../../../Context/Context";

function DeliveryCharges() {
  const { 
    deliveryChargesSub: deliveryCharges, 
    loadingCharges, 
    chargesError,
    getDeliveryChargesSubadmin: fetchDeliveryCharges, 
    updateDeliveryChargesSubadmin: updateDeliveryCharges 
  } = useContext(MyContext);

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-0">Pharmacy Delivery Charges</h1>
                  <p className="text-muted mt-2">Configure distance-based delivery pricing</p>
                </div>

                {chargesError && (
                  <div className="alert alert-danger mb-4">
                    {chargesError}
                  </div>
                )}

                {/* Pharmacy Delivery Charges Form */}
                <PharmacyDeliveryCharges 
                  charges={deliveryCharges} 
                  loading={loadingCharges}
                  updateCharges={(newCharges) => updateDeliveryCharges(newCharges)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pharmacy Delivery Charges Component
function PharmacyDeliveryCharges({ charges, loading, updateCharges }) {
  const [formData, setFormData] = useState({
    baseDeliveryCharge: "",
    freeDeliveryThreshold: "",
    rapidDeliveryCharge: "",
    taxPercentage: "",
    freeDeliveryRadius: "",
    perKmCharge: ""
  });

  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (charges) {
      setFormData({
        baseDeliveryCharge: charges.baseDeliveryCharge?.toString() || "50",
        freeDeliveryThreshold: charges.freeDeliveryThreshold?.toString() || "300",
        rapidDeliveryCharge: charges.rapidDeliveryCharge?.toString() || "100",
        taxPercentage: charges.taxPercentage?.toString() || "2",
        freeDeliveryRadius: charges.freeDeliveryRadius?.toString() || "10",
        perKmCharge: charges.perKmCharge?.toString() || "5"
      });
      setIsModified(false);
    }
  }, [charges]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setIsModified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isModified) {
      alert("No changes detected to update.");
      return;
    }
    
    // Convert string values to numbers
    const numericData = {
      baseDeliveryCharge: parseFloat(formData.baseDeliveryCharge),
      freeDeliveryThreshold: parseFloat(formData.freeDeliveryThreshold),
      rapidDeliveryCharge: parseFloat(formData.rapidDeliveryCharge),
      taxPercentage: parseFloat(formData.taxPercentage),
      freeDeliveryRadius: parseFloat(formData.freeDeliveryRadius),
      perKmCharge: parseFloat(formData.perKmCharge)
    };
    
    console.log("🚀 Sending Pharmacy Charges:", numericData);
    const result = await updateCharges(numericData);
    
    if (result?.success) {
      setIsModified(false);
    }
  };

  const handleReset = () => {
    if (charges) {
      setFormData({
        baseDeliveryCharge: charges.baseDeliveryCharge?.toString() || "50",
        freeDeliveryThreshold: charges.freeDeliveryThreshold?.toString() || "300",
        rapidDeliveryCharge: charges.rapidDeliveryCharge?.toString() || "100",
        taxPercentage: charges.taxPercentage?.toString() || "2",
        freeDeliveryRadius: charges.freeDeliveryRadius?.toString() || "10",
        perKmCharge: charges.perKmCharge?.toString() || "5"
      });
      setIsModified(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Delivery Charges Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 border-bottom pb-2">Basic Delivery Charges</h5>
        
        <div className="mb-3">
          <label htmlFor="baseDeliveryCharge" className="form-label fw-medium text-dark mb-2">
            Base Delivery Charge (₹)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="baseDeliveryCharge"
              value={formData.baseDeliveryCharge}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="baseDeliveryCharge"
              placeholder="Enter base delivery charge"
              style={{ fontSize: '16px' }}
              min="0"
              step="1"
              required
            />
            <span className="text-muted small">Current: ₹{charges?.baseDeliveryCharge || '50'}</span>
          </div>
          <div className="form-text">
            Standard delivery charge within free radius
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="freeDeliveryThreshold" className="form-label fw-medium text-dark mb-2">
            Free Delivery Threshold (₹)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="freeDeliveryThreshold"
              value={formData.freeDeliveryThreshold}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="freeDeliveryThreshold"
              placeholder="Enter free delivery threshold"
              style={{ fontSize: '16px' }}
              min="0"
              step="1"
              required
            />
            <span className="text-muted small">Current: ₹{charges?.freeDeliveryThreshold || '300'}</span>
          </div>
          <div className="form-text">
            Order amount above which base delivery is free (extra distance charges still apply)
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="rapidDeliveryCharge" className="form-label fw-medium text-dark mb-2">
            Rapid Delivery Charge (₹)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="rapidDeliveryCharge"
              value={formData.rapidDeliveryCharge}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="rapidDeliveryCharge"
              placeholder="Enter rapid delivery charge"
              style={{ fontSize: '16px' }}
              min="0"
              step="1"
              required
            />
            <span className="text-muted small">Current: ₹{charges?.rapidDeliveryCharge || '100'}</span>
          </div>
          <div className="form-text">
            Additional charge for express delivery service
          </div>
        </div>
      </div>

      {/* Distance-Based Charges Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 border-bottom pb-2">Distance-Based Charges</h5>
        
        <div className="mb-3">
          <label htmlFor="freeDeliveryRadius" className="form-label fw-medium text-dark mb-2">
            Free Delivery Radius (km)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="freeDeliveryRadius"
              value={formData.freeDeliveryRadius}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="freeDeliveryRadius"
              placeholder="Enter free delivery radius"
              style={{ fontSize: '16px' }}
              min="0"
              step="0.1"
              required
            />
            <span className="text-muted small">Current: {charges?.freeDeliveryRadius || '10'} km</span>
          </div>
          <div className="form-text">
            Distance within which only base delivery charge applies
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="perKmCharge" className="form-label fw-medium text-dark mb-2">
            Per Kilometer Charge (₹/km)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="perKmCharge"
              value={formData.perKmCharge}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="perKmCharge"
              placeholder="Enter per km charge"
              style={{ fontSize: '16px' }}
              min="0"
              step="0.5"
              required
            />
            <span className="text-muted small">Current: ₹{charges?.perKmCharge || '5'}/km</span>
          </div>
          <div className="form-text">
            Additional charge per kilometer beyond free radius (applies even for free delivery orders)
          </div>
        </div>
      </div>

      {/* Tax Section */}
      <div className="mb-4">
        <h5 className="text-primary mb-3 border-bottom pb-2">Tax Settings</h5>
        
        <div className="mb-3">
          <label htmlFor="taxPercentage" className="form-label fw-medium text-dark mb-2">
            Tax Percentage (%)
          </label>
          <div className="d-flex align-items-center">
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3 me-2"
              id="taxPercentage"
              placeholder="Enter tax percentage"
              style={{ fontSize: '16px' }}
              min="0"
              step="0.1"
              required
            />
            <span className="text-muted small">Current: {charges?.taxPercentage || '2'}%</span>
          </div>
          <div className="form-text">
            Tax percentage applied to order subtotal
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="mb-4 p-3 bg-light rounded-3">
        <h6 className="text-dark mb-2">Pricing Summary</h6>
        <div className="small text-muted">
          <div>• Base delivery: ₹{formData.baseDeliveryCharge || '50'} within {formData.freeDeliveryRadius || '10'}km</div>
          <div>• Extra charges: ₹{formData.perKmCharge || '5'}/km beyond {formData.freeDeliveryRadius || '10'}km</div>
          <div>• Free base delivery: Orders above ₹{formData.freeDeliveryThreshold || '300'}</div>
          <div>• Rapid delivery: +₹{formData.rapidDeliveryCharge || '100'}</div>
          <div>• Tax: {formData.taxPercentage || '2'}% on subtotal</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary flex-fill py-3 rounded-3 fw-medium"
          disabled={loading || !isModified}
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
        
        {isModified && (
          <button
            type="button"
            className="btn btn-outline-secondary py-3 rounded-3 fw-medium"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        )}
      </div>

      {/* Information Alert */}
      <div className="alert alert-info mt-3 small">
        <strong>Note:</strong> Free delivery applies only to base delivery charge. 
        Extra distance charges beyond {formData.freeDeliveryRadius || '10'}km radius will still apply even for orders above the free delivery threshold.
      </div>

      {/* Modification Indicator */}
      {isModified && (
        <div className="alert alert-warning mt-2 small">
          <i className="bi bi-exclamation-triangle me-2"></i>
          You have unsaved changes. Click "Update Charges" to save or "Reset" to discard changes.
        </div>
      )}
    </form>
  );
}

export default DeliveryCharges;