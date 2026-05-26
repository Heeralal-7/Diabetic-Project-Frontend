// components/User/CareProgram/ActiveMembership.js
import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../../Context/Context";

const ActiveMembership = () => {
  const navigate = useNavigate();
  const { 
    getActiveMembership,
    getMembershipBenefits,
    membershipLoading,
    activeMembership
  } = useContext(MyContext);

  const [benefits, setBenefits] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [deliveryBenefits, setDeliveryBenefits] = useState(null);

  useEffect(() => {
    // When activeMembership updates from context, update local usage stats
    if (activeMembership) {
      setUsageStats(activeMembership.usage);
    }
    fetchMembershipBenefits();
    // eslint-disable-next-line
  }, [activeMembership]);

  const fetchMembershipBenefits = async () => {
    const result = await getMembershipBenefits();
    if (result.success === 1) {
      setBenefits(result.data);
      // Extract delivery benefits from currentPlan
      if (result.data.currentPlan?.deliveryBenefits) {
        setDeliveryBenefits(result.data.currentPlan.deliveryBenefits);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  if (membershipLoading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your membership details...</p>
      </div>
    );
  }

  if (!activeMembership) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="alert alert-warning">
            <h4>No Active Membership Found</h4>
            <p>You don't have any active membership plan.</p>
            <Link to="/care-program" className="btn btn-primary">
              Browse Membership Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get delivery data from benefits or activeMembership
  const getDeliveryData = (type) => {
    if (deliveryBenefits && deliveryBenefits[type]) {
      return {
        limit: deliveryBenefits[type].limit,
        used: deliveryBenefits[type].used,
        remaining: deliveryBenefits[type].remaining,
        percentage: deliveryBenefits[type].limit > 0 
          ? (deliveryBenefits[type].used / deliveryBenefits[type].limit) * 100 
          : 0
      };
    }
    
    // Fallback to activeMembership data
    const limit = activeMembership.membership?.[`${type}DeliveryLimit`] || 0;
    const used = activeMembership[`${type}DeliveriesUsed`] || 0;
    const remaining = Math.max(0, limit - used);
    
    return {
      limit,
      used,
      remaining,
      percentage: limit > 0 ? (used / limit) * 100 : 0
    };
  };

  const labData = getDeliveryData('lab');
  const foodData = getDeliveryData('food');
  const pharmacyData = getDeliveryData('pharmacy');

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/care-program">Care Program</Link>
              </li>
              <li className="breadcrumb-item active">Active Membership</li>
            </ol>
          </nav>
          <h1 className="display-5">Your Active Membership</h1>
        </div>
      </div>

      {/* Membership Card */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {activeMembership.membership?.planName || benefits?.currentPlan?.planName || 'Unknown Plan'}
              </h4>
              <span className="badge bg-success border border-light">Active</span>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Left Column: Plan Details */}
                <div className="col-md-6 mb-4 mb-md-0">
                  <h6 className="text-primary fw-bold mb-3">Membership Details</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Plan:</strong> {activeMembership.membership?.planName || benefits?.currentPlan?.planName || 'N/A'}
                    </li>
                    <li className="mb-2">
                      <strong>Start Date:</strong> {formatDate(activeMembership.membership?.startDate)}
                    </li>
                    <li className="mb-2">
                      <strong>End Date:</strong> {formatDate(activeMembership.membership?.endDate)}
                    </li>
                    <li className="mb-2">
                      <strong>Price Paid:</strong> {formatPrice(activeMembership.membership?.pricePaid)}
                    </li>
                    {benefits?.currentPlan && (
                      <li className="mb-2">
                        <strong>Days Remaining:</strong> {benefits.currentPlan.daysRemaining} days
                      </li>
                    )}
                  </ul>
                  
                  {/* Health Profile Snapshot (if available) */}
                  {(activeMembership.membership?.BloodSugar || activeMembership.membership?.AgeGroup) && (
                    <div className="mt-3 p-2 bg-light rounded small">
                      <strong>Health Profile:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {activeMembership.membership?.BloodSugar && (
                          <span className="badge bg-secondary text-light">{activeMembership.membership.BloodSugar}</span>
                        )}
                        {activeMembership.membership?.AgeGroup && (
                          <span className="badge bg-secondary text-light">{activeMembership.membership.AgeGroup}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Usage Statistics */}
                <div className="col-md-6">
                  <h6 className="text-primary fw-bold mb-3">Usage Statistics</h6>
                  
                  {/* Consultation Usage */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Consultations</span>
                      <span>
                        {benefits?.currentPlan?.consultationsUsed || usageStats?.consultationsUsed || 0}
                        /
                        {benefits?.currentPlan?.consultationLimit || usageStats?.totalConsultations || 0}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar"
                        style={{ 
                          width: `${((benefits?.currentPlan?.consultationsUsed || usageStats?.consultationsUsed || 0) / 
                                  (benefits?.currentPlan?.consultationLimit || usageStats?.totalConsultations || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {benefits?.currentPlan?.consultationsRemaining || usageStats?.consultationsRemaining || 0} remaining
                    </small>
                  </div>

                  {/* Delivery Usage Stats */}
                  {(labData.limit > 0 || foodData.limit > 0 || pharmacyData.limit > 0) && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="small fw-bold text-muted mb-3">Free Delivery Limits</h6>
                      
                      {/* Lab Delivery */}
                      {labData.limit > 0 && (
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small">
                            <span><i className="ri-test-tube-line me-1"></i> Lab Orders</span>
                            <span>{labData.used}/{labData.limit}</span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${labData.percentage}%` }}
                            ></div>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {labData.remaining} free deliveries remaining
                          </small>
                        </div>
                      )}

                      {/* Food Delivery */}
                      {foodData.limit > 0 && (
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small">
                            <span><i className="ri-restaurant-line me-1"></i> Food Orders</span>
                            <span>{foodData.used}/{foodData.limit}</span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: `${foodData.percentage}%` }}
                            ></div>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {foodData.remaining} free deliveries remaining
                          </small>
                        </div>
                      )}

                      {/* Pharmacy Delivery */}
                      {pharmacyData.limit > 0 && (
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small">
                            <span><i className="ri-capsule-line me-1"></i> Meds Orders</span>
                            <span>{pharmacyData.used}/{pharmacyData.limit}</span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${pharmacyData.percentage}%` }}
                            ></div>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {pharmacyData.remaining} free deliveries remaining
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <p className="mb-0">
                      <strong>Days Remaining:</strong> 
                      {benefits?.currentPlan?.daysRemaining || usageStats?.daysRemaining || 0} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {/* <div className="row mt-4">
                <div className="col-12">
                  <h6 className="fw-bold">Quick Actions</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/Doctors')}
                    >
                      <i className="ri-stethoscope-line me-1"></i>
                      Book Consultation
                    </button>
                    <button 
                      className="btn btn-outline-success"
                      onClick={() => navigate('/lab-tests')}
                    >
                      <i className="ri-test-tube-line me-1"></i>
                      Book Lab Test
                    </button>
                    <button 
                      className="btn btn-outline-warning"
                      onClick={() => navigate('/food')}
                    >
                      <i className="ri-restaurant-line me-1"></i>
                      Order Food
                    </button>
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => navigate('/pharmacy')}
                    >
                      <i className="ri-capsule-line me-1"></i>
                      Order Medicines
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Benefits Section */}
          {benefits && (
            <div className="card mt-4 shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="ri-award-line me-2"></i>
                  Your Benefits Overview
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Statistics Column */}
                  <div className="col-md-6 mb-4 mb-md-0">
                    <h6 className="fw-bold text-primary mb-3">
                      <i className="ri-bar-chart-line me-2"></i>
                      Membership Statistics
                    </h6>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">{benefits.totalFreeConsultations || 0}</p>
                          <small className="text-muted">Free Consultations Used</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="ri-money-rupee-circle-fill text-warning fs-5"></i>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">{formatPrice(benefits.estimatedSavings || 0)}</p>
                          <small className="text-muted">Estimated Savings</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="ri-truck-line text-info fs-5"></i>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">
                            {(labData.used || 0) + (foodData.used || 0) + (pharmacyData.used || 0)}
                          </p>
                          <small className="text-muted">Free Deliveries Used</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Column */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary mb-3">
                      <i className="ri-gift-line me-2"></i>
                      Included Features
                    </h6>
                    <ul className="list-unstyled">
                      {benefits.benefits?.map((benefit, index) => (
                        <li key={index} className="mb-2">
                          <i className="ri-check-line text-success me-2"></i>
                          {benefit}
                        </li>
                      )) || (
                        <li className="text-muted">No benefits available</li>
                      )}
                    </ul>
                    
                    {/* Delivery Benefits Summary */}
                    {deliveryBenefits && (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="small fw-bold text-muted mb-2">Delivery Benefits Summary</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {labData.limit > 0 && (
                            <span className="badge bg-info">
                              <i className="ri-test-tube-line me-1"></i>
                              {labData.remaining}/{labData.limit} Lab
                            </span>
                          )}
                          {foodData.limit > 0 && (
                            <span className="badge bg-warning">
                              <i className="ri-restaurant-line me-1"></i>
                              {foodData.remaining}/{foodData.limit} Food
                            </span>
                          )}
                          {pharmacyData.limit > 0 && (
                            <span className="badge bg-success">
                              <i className="ri-capsule-line me-1"></i>
                              {pharmacyData.remaining}/{pharmacyData.limit} Meds
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Status Card */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body text-center">
              <div className={`circle-progress mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle border border-5 
                ${(benefits?.currentPlan?.daysRemaining || 0) < 7 ? 'border-warning text-warning' : 'border-success text-success'}`} 
                style={{width: '120px', height: '120px'}}
              >
                <div>
                  <h2 className="mb-0 fw-bold">
                    {benefits?.currentPlan?.daysRemaining || usageStats?.daysRemaining || 0}
                  </h2>
                  <small className="fw-bold">Days Left</small>
                </div>
              </div>
              <div className="mt-3">
                <div className={`alert ${(benefits?.currentPlan?.daysRemaining || 0) < 7 ? 'alert-warning' : 'alert-success'} mb-0`}>
                  {(benefits?.currentPlan?.daysRemaining || 0) < 7 ? 'Expiring Soon' : 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Progress Sidebar */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">Consultation Limit</h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                <h3 className="text-info fw-bold">
                  {benefits?.currentPlan?.consultationsRemaining || usageStats?.consultationsRemaining || 0}
                </h3>
                <p className="text-muted">Consultations Available</p>
                <div className="progress mb-2" style={{height: '8px'}}>
                  <div 
                    className="progress-bar bg-info"
                    style={{
                      width: `${((benefits?.currentPlan?.consultationsRemaining || 0) / 
                              (benefits?.currentPlan?.consultationLimit || 1)) * 100}%`
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  {benefits?.currentPlan?.consultationsUsed || 0} of {benefits?.currentPlan?.consultationLimit || 0} used
                </small>
              </div>
            </div>
          </div>

          {/* Delivery Benefits Sidebar */}
          {(labData.limit > 0 || foodData.limit > 0 || pharmacyData.limit > 0) && (
            <div className="card shadow-sm mb-4 border-0">
              <div className="card-header bg-white">
                <h6 className="mb-0 fw-bold">Delivery Benefits</h6>
              </div>
              <div className="card-body">
                {labData.limit > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">
                        <i className="ri-test-tube-line text-info me-1"></i>
                        Lab Orders
                      </span>
                      <span className="small fw-bold">{labData.remaining} left</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-info" style={{width: `${labData.percentage}%`}}></div>
                    </div>
                  </div>
                )}
                
                {foodData.limit > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">
                        <i className="ri-restaurant-line text-warning me-1"></i>
                        Food Orders
                      </span>
                      <span className="small fw-bold">{foodData.remaining} left</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-warning" style={{width: `${foodData.percentage}%`}}></div>
                    </div>
                  </div>
                )}
                
                {pharmacyData.limit > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">
                        <i className="ri-capsule-line text-success me-1"></i>
                        Meds Orders
                      </span>
                      <span className="small fw-bold">{pharmacyData.remaining} left</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-success" style={{width: `${pharmacyData.percentage}%`}}></div>
                    </div>
                  </div>
                )}
                
                <p className="small text-muted mb-0 mt-2">
                  Free delivery applies to eligible orders only. Standard delivery charges apply after limit is reached.
                </p>
              </div>
            </div>
          )}

          {/* Support Card */}
        
        </div>
      </div>
    </div>
  );
};

export default ActiveMembership;