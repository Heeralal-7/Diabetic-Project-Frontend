import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  console.log('OrderSuccess state:', state); // Debug log

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
 // Get Payment ID
 const getPaymentId = () => {
    // 1. Check if we passed the specific "paymentId" in state (from PaymentPage fix)
    // We check if it starts with "pay_" to ensure it's a real Razorpay ID, not a fallback timestamp
    if (state?.paymentId && state.paymentId.toString().startsWith('pay_')) {
      return state.paymentId;
    }

    // 2. Check the Database Object inside orderResult (Matches your DB Dump)
    if (state?.orderResult?.order?.paymentId) {
      return state.orderResult.order.paymentId;
    }

    // 3. Check direct API response properties
    if (state?.orderResult?.paymentId) {
      return state.orderResult.paymentId;
    }

    // 4. Check Razorpay specific field passed in state
    if (state?.razorpayPaymentId) {
      return state.razorpayPaymentId;
    }

    // 5. COD Check
    if (state?.paymentMethod === 'cod' || state?.orderResult?.order?.paymentMethod === 'cod') {
      return 'COD - Pay on Delivery';
    }

    // 6. Final Fallback (If the real ID is missing, show the generated one or Processing)
    return state?.paymentId || 'Processing...';
  };

  // Format delivery address from the address array
  const formatAddress = (addressArray) => {
    if (!addressArray || !Array.isArray(addressArray)) return 'Address not available';
    
    // Address array structure: [name, dob, phone, gender, address, country, state, city, pinCode, pic]
    const addressParts = [
      addressArray[4], // address
      addressArray[7], // city
      addressArray[6], // state
      addressArray[8]  // pinCode
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ') || 'Address not available';
  };

  // Get customer name from address array
  const getCustomerName = (addressArray) => {
    if (!addressArray || !Array.isArray(addressArray)) return 'Customer';
    return addressArray[0] || 'Customer';
  };

  // Get customer phone from address array
  const getCustomerPhone = (addressArray) => {
    if (!addressArray || !Array.isArray(addressArray)) return 'Not available';
    return addressArray[2] || 'Not available';
  };

  // Get delivery slot info
  const getDeliverySlot = () => {
    if (state?.foodSlot) {
      return state.foodSlot;
    }
    if (state?.deliverySlot) {
      return `${state.deliverySlot.startTime} - ${state.deliverySlot.endTime}`;
    }
    return 'N/A';
  };

  // Get estimated delivery time
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Add 1 hour for estimated delivery
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get total amount with safe fallback
  const getTotalAmount = () => {
    return state?.price || state?.total || state?.orderResult?.order?.totalAmount || 0;
  };

  // Get original amount before discount
  const getOriginalAmount = () => {
    return state?.originalTotal || (getTotalAmount() + (state?.discount || 0));
  };

  // Check if COD
  const isCod = state?.paymentMethod === 'cod' || state?.isCod;

  // Get order date
  const getOrderDate = () => {
    if (state?.orderResult?.order?.createdAt) {
      return new Date(state.orderResult.order.createdAt).toLocaleDateString();
    }
    if (state?.orderResult?.createdAt) {
      return new Date(state.orderResult.createdAt).toLocaleDateString();
    }
    if (state?.date) {
      return state.date;
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
    return isCod ? 'pending' : 'completed';
  };

  // Handle navigation
  const handleViewOrders = () => {
    navigate('/shop/FoodAndNurition/orders');
  };

  const handleContinueShopping = () => {
    navigate('/shop/FoodAndNurition');
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'preparing':
        return 'bg-info';
      case 'out_for_delivery':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
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
              {isCod 
                ? "Your COD order has been placed successfully. Pay when you receive your order."
                : "Thank you for your order. We're preparing your food with care."
              }
            </p>
            {isCod && (
              <div className="alert alert-info mt-3 mx-auto" style={{maxWidth: '500px'}}>
                <i className="ri-information-line me-2"></i>
                <strong>Cash on Delivery:</strong> Please keep exact change ready for the delivery executive.
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-receipt-line me-2"></i>Order Summary
              </h5>
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
                    <strong className="text-muted">Order Type:</strong> 
                    <div className="mt-1">{state?.orderType || 'Single'}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Payment Method:</strong> 
                    <div className="mt-1">
                      <span className={`badge ${isCod ? 'bg-warning' : 'bg-success'} fs-6`}>
                        {state?.paymentMethod?.toUpperCase() || 'N/A'}
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
                    {state?.originalTotal && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Items Total:</span>
                        <span>₹{getOriginalAmount().toFixed(2)}</span>
                      </div>
                    )}
                    {(state?.discount || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-₹{(state.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    {(state?.deliveryCharge || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Delivery Charge:</span>
                        <span>₹{(state.deliveryCharge || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {(state?.taxAmount || 0) > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <span>₹{(state.taxAmount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-truck-line me-2"></i>Delivery Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Name:</strong> 
                    <div className="mt-1">{getCustomerName(state?.address)}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Phone:</strong> 
                    <div className="mt-1">{getCustomerPhone(state?.address)}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Date:</strong> 
                    <div className="mt-1">{state?.date || 'N/A'}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Delivery Slot:</strong> 
                    <div className="mt-1">
                      <span className="badge bg-light text-dark border fs-6">
                        {getDeliverySlot()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <strong className="text-muted">Delivery Address:</strong> 
                <div className="mt-1 p-3 bg-light rounded">
                  {formatAddress(state?.address)}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <strong className="text-muted">Estimated Delivery:</strong> 
                  <span className="text-success fw-semibold ms-2">
                    By {getEstimatedDeliveryTime()}
                  </span>
                </div>
                {state?.rapid && (
                  <span className="badge bg-warning text-dark fs-6">
                    <i className="ri-flashlight-line me-1"></i>Rapid Delivery
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-information-line me-2"></i>Order Status
              </h5>
            </div>
            <div className="card-body">
              <div className="alert alert-success">
                <i className="ri-checkbox-circle-line me-2"></i>
                <strong>Order created successfully!</strong>
                {state?.orderResult?.message && (
                  <div className="mt-1">{state.orderResult.message}</div>
                )}
              </div>
              
              <div className="row mt-3">
                <div className="col-md-6">
                  <strong className="text-muted">Order Status:</strong> 
                  <div className="mt-1">
                    <span className={`badge ${getStatusBadgeColor(getOrderStatus())} fs-6`}>
                      {getOrderStatus()?.toUpperCase() || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <strong className="text-muted">Payment Status:</strong> 
                  <div className="mt-1">
                    <span className={`badge ${getPaymentStatusBadgeColor(getPaymentStatus())} fs-6`}>
                      {getPaymentStatus()?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Progress */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-progress-4-line me-2"></i>Order Progress
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center position-relative">
                {/* Progress Line */}
                <div className="position-absolute top-50 start-0 end-0" style={{height: '2px', backgroundColor: '#e9ecef', zIndex: 1}}></div>
                
                {['confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((step, index) => (
                  <div key={step} className="text-center position-relative" style={{zIndex: 2, flex: 1}}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto ${
                      getOrderStatus() === step ? 'bg-success text-white' : 'bg-light border text-muted'
                    }`} style={{width: '50px', height: '50px'}}>
                      {getOrderStatus() === step ? (
                        <i className="ri-check-line fs-5"></i>
                      ) : (
                        <span className="fw-bold">{index + 1}</span>
                      )}
                    </div>
                    <p className={`small mt-2 mb-0 ${getOrderStatus() === step ? 'fw-bold text-success' : 'text-muted'}`}>
                      {step.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
              <button className="btn btn-outline-info btn-sm" onClick={() => window.print()}>
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
              <i className="ri-restaurant-line me-2"></i>Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;