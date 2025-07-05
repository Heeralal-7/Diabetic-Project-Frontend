import React from 'react';
import { useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const { state } = useLocation();
  
  // Format delivery address from patient data
  const formatAddress = (patient) => {
    if (!patient) return 'Address not available';
    return `${patient.address}, ${patient.city}, ${patient.state} - ${patient.pinCode}`;
  };

  return (
    <div className="container py-5 text-center">
      <div className="card p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="text-success mb-4">Order Placed Successfully!</h2>
        <div className="mb-4">
          <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <div className="text-start mb-4">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Order ID:</strong> {state?.orderId}</p>
              <p><strong>Total Amount:</strong> ₹{state?.total?.toFixed(2)}</p>
              <p><strong>Order Type:</strong> {state?.orderType || 'Single'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Name:</strong> {state?.patient?.name}</p>
              <p><strong>Phone:</strong> {state?.patient?.phone}</p>
              <p><strong>Delivery Address:</strong> {formatAddress(state?.patient)}</p>
            </div>
          </div>
          <div className="mt-3">
            <p><strong>Delivery Slot:</strong> {state?.deliverySlot?.startTime} - {state?.deliverySlot?.endTime}</p>
            {state?.rapid && (
              <span className="badge bg-warning text-dark">Rapid Delivery</span>
            )}
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/shop/FoodAndNurition/orders'}
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;