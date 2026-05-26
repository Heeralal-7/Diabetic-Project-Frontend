import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMedal, FaRupeeSign } from 'react-icons/fa';

const PharmacyOrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  console.log('PharmacyOrderSuccess state:', state); // Debug log

  // Get Order ID from various possible sources
  const getOrderId = () => {
    if (state?.orderResult?.order?._id) {
      return state.orderResult.order._id;
    }
    if (state?.orderResult?.orderId) {
      return state.orderResult.orderId;
    }
    if (state?.orderId) {
      return state.orderId;
    }
    if (state?.orderResult?._id) {
      return state.orderResult._id;
    }
    if (state?.orderResult?.data?._id) {
      return state.orderResult.data._id;
    }
    return 'Processing...';
  };

  // Get Payment ID from various possible sources
  const getPaymentId = () => {
    if (state?.paymentId) {
      return state.paymentId;
    }
    if (state?.razorpayPaymentId) {
      return state.razorpayPaymentId;
    }
    if (state?.orderResult?.paymentId) {
      return state.orderResult.paymentId;
    }
    if (state?.orderResult?.order?.paymentId) {
      return state.orderResult.order.paymentId;
    }
    if (state?.orderResult?.razorpayPaymentId) {
      return state.orderResult.razorpayPaymentId;
    }
    return state?.paymentMethod === 'cod' ? 'COD - Pay on Delivery' : 'Processing...';
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    
    if (typeof address === 'string') {
      return address;
    }
    
    if (Array.isArray(address)) {
      const addressParts = address.filter(part => part && part.trim() !== '');
      return addressParts.join(', ') || 'Address not available';
    }
    
    return 'Address format not recognized';
  };

  // Get customer name
  const getCustomerName = () => {
    if (state?.addressName) {
      return state.addressName;
    }
    if (state?.address?.split(',')[0]) {
      return state.address.split(',')[0];
    }
    if (state?.patientAddress?.name) {
      return state.patientAddress.name;
    }
    if (state?.orderSummary?.patientDetails?.name) {
      return state.orderSummary.patientDetails.name;
    }
    return 'Customer';
  };

  // Get customer phone
  const getCustomerPhone = () => {
    if (state?.phone) {
      return state.phone;
    }
    if (state?.patientAddress?.phone) {
      return state.patientAddress.phone;
    }
    if (state?.orderSummary?.patientDetails?.phone) {
      return state.orderSummary.patientDetails.phone;
    }
    return 'Not available';
  };

  // Get total amount
  const getTotalAmount = () => {
    return state?.grandTotal || state?.orderSummary?.grandTotal || state?.orderResult?.order?.grandTotal || 0;
  };

  // Get order date
  const getOrderDate = () => {
    if (state?.orderResult?.order?.createdAt) {
      return new Date(state.orderResult.order.createdAt).toLocaleDateString();
    }
    if (state?.orderResult?.createdAt) {
      return new Date(state.orderResult.createdAt).toLocaleDateString();
    }
    if (state?.dateSlot) {
      return state.dateSlot;
    }
    return new Date().toLocaleDateString();
  };

  // Get order status
  const getOrderStatus = () => {
    if (state?.orderResult?.order?.status) {
      return state.orderResult.order.status;
    }
    if (state?.orderResult?.status) {
      return state.orderResult.status;
    }
    return 'confirmed';
  };

  // Get payment status
  const getPaymentStatus = () => {
    if (state?.orderResult?.order?.paymentStatus) {
      return state.orderResult.order.paymentStatus;
    }
    if (state?.orderResult?.paymentStatus) {
      return state.orderResult.paymentStatus;
    }
    return state?.isCod ? 'pending' : 'completed';
  };

  // ✅ NEW: Get membership data
  const getMembershipData = () => {
    if (state?.membershipData) {
      return state.membershipData;
    }
    if (state?.orderSummary?.membershipData) {
      return state.orderSummary.membershipData;
    }
    return null;
  };

  // ✅ NEW: Get membership discount
  const getMembershipDiscount = () => {
    if (state?.membershipDiscount) {
      return state.membershipDiscount;
    }
    if (state?.orderSummary?.deliveryCalculation?.membershipDiscount) {
      return state.orderSummary.deliveryCalculation.membershipDiscount;
    }
    return 0;
  };

  // ✅ NEW: Check if membership was applied
  const isMembershipApplied = () => {
    if (state?.membershipApplied || state?.membershipWasApplied) {
      return true;
    }
    if (state?.orderSummary?.deliveryCalculation?.membershipApplied) {
      return true;
    }
    return false;
  };

  // ✅ NEW: Get remaining deliveries
  const getRemainingDeliveries = () => {
    if (state?.membershipRemainingDeliveries) {
      return state.membershipRemainingDeliveries;
    }
    if (state?.orderSummary?.deliveryCalculation?.membershipRemainingDeliveries) {
      return state.orderSummary.deliveryCalculation.membershipRemainingDeliveries;
    }
    if (state?.membershipData?.remainingDeliveries) {
      return state.membershipData.remainingDeliveries;
    }
    return 0;
  };

  // Handle navigation
  const handleViewOrders = () => {
    navigate('/pharmacy/order-history');
  };

  const handleContinueShopping = () => {
    navigate('/pharmacy');
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
        return 'bg-success';
      case 'pending':
      case 'processing':
        return 'bg-warning';
      case 'dispatched':
      case 'shipped':
        return 'bg-info';
      case 'out_for_delivery':
        return 'bg-primary';
      case 'cancelled':
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      case 'refunded':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Get delivery type
  const getDeliveryType = () => {
    if (state?.isRapidDelivery) {
      return 'Rapid Delivery';
    }
    return 'Standard Delivery';
  };

  // Get delivery slot
  const getDeliverySlot = () => {
    if (state?.isRapidDelivery) {
      return 'As soon as possible';
    }
    if (state?.timeSlot) {
      return state.timeSlot;
    }
    return 'Standard slot';
  };

  const membershipData = getMembershipData();
  const membershipDiscount = getMembershipDiscount();
  const membershipApplied = isMembershipApplied();
  const remainingDeliveries = getRemainingDeliveries();

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Success Header */}
          <div className="text-center mb-5">
            <div className="success-icon mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 className="text-success fw-bold">Order Confirmed!</h1>
            <p className="text-muted fs-5">
              Your pharmacy order has been placed successfully. {state?.isCod ? 'Please keep cash ready for delivery.' : 'Your payment was successful.'}
            </p>
            
            {/* ✅ Membership Success Message */}
            {membershipApplied && membershipDiscount > 0 && (
              <div className="alert alert-success d-inline-flex align-items-center mt-3">
                <FaMedal className="me-2 fs-4" />
                <div>
                  <strong className="d-block">Pharmacy Membership Benefits Applied!</strong>
                  <small>
                    You saved ₹{membershipDiscount.toFixed(2)} on delivery charges
                    {remainingDeliveries > 0 && (
                      <span className="d-block mt-1">
                        {remainingDeliveries} free pharmacy deliveries remaining
                      </span>
                    )}
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-receipt-line me-2"></i>Order Summary
              </h5>
              {membershipApplied && (
                <span className="badge bg-gradient-warning text-dark float-end">
                  <FaMedal className="me-1" /> Membership Applied
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Order ID:</strong> 
                    <div className="mt-1 font-monospace text-primary fw-bold">
                      {getOrderId()}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Payment ID:</strong> 
                    <div className="mt-1 font-monospace text-info">
                      {getPaymentId()}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Order Date:</strong> 
                    <div className="mt-1">{getOrderDate()}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Type:</strong> 
                    <div className="mt-1">{getDeliveryType()}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Payment Status:</strong> 
                    <div className="mt-1">
                      <span className={`badge ${getPaymentStatusBadgeColor(getPaymentStatus())} fs-6`}>
                        {getPaymentStatus()?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Total Amount:</strong> 
                    <div className="mt-1 fs-5 text-success fw-bold">
                      ₹{getTotalAmount().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-bold mb-3">Price Breakdown</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Items Total:</span>
                      <span>₹{(state?.subTotal || state?.orderSummary?.subTotal || 0).toFixed(2)}</span>
                    </div>
                    {(state?.couponDiscount || state?.orderSummary?.couponDiscount || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-₹{(state.couponDiscount || state.orderSummary?.couponDiscount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {(state?.tax || state?.orderSummary?.tax || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <span>₹{(state.tax || state.orderSummary?.tax || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    {/* ✅ Membership Delivery Discount */}
                    {membershipApplied && membershipDiscount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>
                          <FaMedal className="me-1" />
                          Membership Delivery:
                        </span>
                        <span>-₹{membershipDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {(state?.deliveryCharges || state?.orderSummary?.deliveryCharges || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Delivery Charges:</span>
                        <span className={membershipApplied ? "text-success" : (state?.deliveryCharges === 0 ? "text-success" : "")}>
                          {membershipApplied ? "FREE (Membership)" : (state?.deliveryCharges === 0 ? "FREE" : `₹${(state.deliveryCharges || state.orderSummary?.deliveryCharges || 0).toFixed(2)}`)}
                        </span>
                      </div>
                    )}
                    
                    {state?.orderSummary?.deliveryCalculation?.extraCharges > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Extra Distance Charges:</span>
                        <span>₹{state.orderSummary.deliveryCalculation.extraCharges?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                    
                    {state?.isRapidDelivery && (state?.rapidDeliveryFee || state?.orderSummary?.rapidDeliveryFee || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Rapid Delivery Fee:</span>
                        <span>₹{(state.rapidDeliveryFee || state.orderSummary?.rapidDeliveryFee || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ✅ Membership Savings Summary */}
                {membershipApplied && membershipDiscount > 0 && (
                  <div className="alert alert-success mt-3">
                    <div className="d-flex align-items-center">
                      <FaMedal className="me-3 fs-4" />
                      <div>
                        <h6 className="mb-1 fw-bold">Pharmacy Membership Savings</h6>
                        <p className="mb-0 small">
                          Your pharmacy membership saved you ₹{membershipDiscount.toFixed(2)} on this order.
                          {remainingDeliveries > 0 && (
                            <span className="d-block mt-1">
                              <i className="ri-check-double-line me-1"></i>
                              {remainingDeliveries} free pharmacy deliveries remaining
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pharmacy Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-pharmacy-line me-2"></i>Pharmacy Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Pharmacy Name:</strong> 
                    <div className="mt-1 fw-bold text-primary">
                      {state?.vendorDetails?.shopName || state?.vendorName || 'Pharmacy'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Phone:</strong> 
                    <div className="mt-1">{state?.vendorDetails?.phone || 'Not available'}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Address:</strong> 
                    <div className="mt-1 text-muted">
                      {state?.vendorDetails?.address || 'Address not available'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">License:</strong> 
                    <div className="mt-1">{state?.vendorDetails?.licenseNumber || 'Verified Pharmacy'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient/Customer Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-user-line me-2"></i>Customer Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Name:</strong> 
                    <div className="mt-1">{getCustomerName()}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Phone:</strong> 
                    <div className="mt-1">{getCustomerPhone()}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Address:</strong> 
                    <div className="mt-1 p-3 bg-light rounded">
                      {formatAddress(state?.address)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-medicine-bottle-line me-2"></i>Order Items
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Type</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state?.items?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{item.itemName || item.name}</strong>
                          {item.prescriptionRequired && (
                            <div className="text-warning small">
                              <i className="ri-alert-line me-1"></i>Prescription Required
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${item.itemType === 'medicine' ? 'bg-info' : 'bg-secondary'}`}>
                            {item.itemType === 'medicine' ? '💊 Medicine' : '🛍️ Product'}
                          </span>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">₹{(item.unitPrice || item.price || 0).toFixed(2)}</td>
                        <td className="text-end fw-bold">
                          ₹{((item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {state?.orderSummary?.items?.map((item, index) => (
                      <tr key={`summary-${index}`}>
                        <td>
                          <strong>{item.itemName}</strong>
                        </td>
                        <td>
                          <span className="badge bg-info">Item</span>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="text-end fw-bold">₹{item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-truck-line me-2"></i>Delivery Schedule
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Date:</strong> 
                    <div className="mt-1">{state?.dateSlot || 'As soon as possible'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Time Slot:</strong> 
                    <div className="mt-1">{getDeliverySlot()}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Type:</strong> 
                    <div className="mt-1">
                      <span className={`badge ${state?.isRapidDelivery ? 'bg-warning' : 'bg-info'}`}>
                        {getDeliveryType()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {state?.distanceInfo && (
                <div className="alert alert-info mt-3">
                  <h6 className="alert-heading">
                    <i className="ri-map-pin-line me-2"></i>Delivery Distance Info
                  </h6>
                  <div className="row small">
                    <div className="col-md-3">
                      <strong>Distance:</strong> {state.distanceInfo.distance} km
                    </div>
                    <div className="col-md-3">
                      <strong>Free Radius:</strong> {state.distanceInfo.freeRadius} km
                    </div>
                    <div className="col-md-3">
                      <strong>Extra Distance:</strong> {state.distanceInfo.extraDistance} km
                    </div>
                    <div className="col-md-3">
                      <strong>Extra Charges:</strong> ₹{state.distanceInfo.extraCharges}
                    </div>
                  </div>
                  
                  {/* ✅ Membership Delivery Info */}
                  {membershipApplied && (
                    <div className="mt-2 pt-2 border-top">
                      <div className="d-flex align-items-center text-success">
                        <FaMedal className="me-2" />
                        <strong>Membership Delivery Applied:</strong>
                        <span className="ms-2">
                          Base delivery charge waived ({membershipDiscount > 0 ? `Saved ₹${membershipDiscount.toFixed(2)}` : 'Free'})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Membership Benefits Card (Only if membership was applied) */}
          {membershipApplied && (
            <div className="card shadow-sm border-0 mb-4 border-success">
              <div className="card-header bg-success text-white py-3 border-bottom">
                <h5 className="card-title mb-0 fw-bold d-flex align-items-center">
                  <FaMedal className="me-2" /> Pharmacy Membership Benefits
                </h5>
              </div>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h6 className="fw-bold text-success">Free Pharmacy Delivery Applied!</h6>
                    <p className="mb-2">
                      Your active pharmacy membership has been applied to this order, providing you with free delivery benefits.
                    </p>
                    <div className="row">
                      <div className="col-6">
                        <div className="d-flex align-items-center mb-2">
                          <i className="ri-checkbox-circle-fill text-success me-2"></i>
                          <span>Delivery Savings:</span>
                          <strong className="ms-2 text-success">₹{membershipDiscount.toFixed(2)}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center mb-2">
                          <i className="ri-medal-fill text-warning me-2"></i>
                          <span>Remaining Deliveries:</span>
                          <strong className="ms-2">{remainingDeliveries}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div className="bg-success bg-opacity-10 p-4 rounded">
                      <FaMedal className="text-success mb-2" size={48} />
                      <p className="mb-0 fw-bold text-success">Membership Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-information-line me-2"></i>What Happens Next?
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-checkbox-circle-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Order Confirmed</h6>
                  <p className="small text-muted">Your order is confirmed and being processed</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-package-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Order Packed</h6>
                  <p className="small text-muted">Pharmacy prepares your medicines</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-truck-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Out for Delivery</h6>
                  <p className="small text-muted">Delivery partner picks up your order</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-home-heart-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Delivered</h6>
                  <p className="small text-muted">Order delivered at your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="alert alert-warning">
            <h6 className="alert-heading fw-bold">
              <i className="ri-alert-line me-2"></i>Important Information
            </h6>
            <ul className="mb-0">
              <li>Please keep your prescription ready for verification at the time of delivery (if applicable)</li>
              <li>For Cash on Delivery orders, please keep exact change ready</li>
              <li>Our delivery executive will call you before arrival</li>
              <li>Check all items at the time of delivery</li>
              {membershipApplied && (
                <li className="text-success fw-bold">
                  <FaMedal className="me-1" /> Membership Benefit: Free delivery applied to this order
                </li>
              )}
              {state?.isRapidDelivery && (
                <li className="text-danger fw-bold">Rapid Delivery: Expected within 1-2 hours</li>
              )}
            </ul>
          </div>

          {/* Support Information */}
          <div className="alert alert-light border text-center">
            <h6 className="alert-heading fw-bold">Need Help?</h6>
            <p className="mb-3">If you have any questions about your order, contact our support team.</p>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <a href="tel:+911234567890" className="btn btn-outline-primary btn-sm">
                <i className="ri-phone-line me-1"></i> Call Support
              </a>
              <a href="mailto:support@example.com" className="btn btn-outline-secondary btn-sm">
                <i className="ri-mail-line me-1"></i> Email Support
              </a>
              <button className="btn btn-outline-info btn-sm" onClick={handleDownloadReceipt}>
                <i className="ri-printer-line me-1"></i> Print Receipt
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
            <button 
              className="btn btn-primary me-md-2 px-4 py-2"
              onClick={handleViewOrders}
            >
              <i className="ri-list-check me-2"></i>View All Orders
            </button>
            <button 
              className="btn btn-outline-secondary px-4 py-2"
              onClick={handleContinueShopping}
            >
              <i className="ri-medicine-bottle-line me-2"></i>Shop More Medicines
            </button>
            {membershipApplied && remainingDeliveries > 0 && (
              <button 
                className="btn btn-outline-success px-4 py-2"
                onClick={() => navigate('/user-membership/benefits')}
              >
                <FaMedal className="me-2" />View Membership
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOrderSuccess;