import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';
import moment from 'moment';
import { FaUtensils, FaMotorcycle, FaHome, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { getOrder } = useContext(MyContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const result = await getOrder(1, 1, orderId);
        if (result.success === 1 && result.details.length > 0) {
          setOrder(result.details[0]);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMM YYYY, hh:mm A');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      '0': { text: 'Pending', class: 'bg-warning text-dark', icon: <FaUtensils className="me-1" /> },
      '1': { text: 'Accepted', class: 'bg-primary', icon: <FaCheckCircle className="me-1" /> },
      '2': { text: 'Rejected', class: 'bg-danger', icon: <FaTimesCircle className="me-1" /> },
      '3': { text: 'Preparing', class: 'bg-info', icon: <FaUtensils className="me-1" /> },
      '4': { text: 'On the way', class: 'bg-info', icon: <FaMotorcycle className="me-1" /> },
      '5': { text: 'At your door', class: 'bg-secondary', icon: <FaHome className="me-1" /> },
      '6': { text: 'Delivered', class: 'bg-success', icon: <FaCheckCircle className="me-1" /> },
      '7': { text: 'Cancelled', class: 'bg-danger', icon: <FaTimesCircle className="me-1" /> }
    };

    const config = statusConfig[status] || { text: 'Unknown', class: 'bg-secondary' };
    return (
      <span className={`badge ${config.class} d-flex align-items-center`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getAddressString = (patient) => {
    if (!patient) return 'Address not available';
    return `${patient.address}, ${patient.city}, ${patient.state} - ${patient.pinCode}`;
  };

  const calculateItemTotal = (item) => {
    const basePrice = parseFloat(item.Amount || 0);
    const extrasTotal = item.extraItems?.reduce((sum, extra) => sum + (parseFloat(extra.price) || 0), 0) || 0;
    return (basePrice + extrasTotal) * (item.quantity || 1);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <i className="ri-error-warning-line me-2 fs-4"></i>
            <div>
              <h5 className="mb-1">Error loading order</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <div className="mt-3 text-end">
            <button 
              className="btn btn-outline-danger"
              onClick={() => navigate(-1)}
            >
              <i className="ri-arrow-left-line me-1"></i>Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <div className="d-flex align-items-center">
            <i className="ri-alert-line me-2 fs-4"></i>
            <div>
              <h5 className="mb-1">Order not found</h5>
              <p className="mb-0">The requested order could not be found</p>
            </div>
          </div>
          <div className="mt-3 text-end">
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/shop/FoodAndNurition/orders')}
            >
              <i className="ri-list-check me-1"></i>View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="ri-arrow-left-line me-2"></i> Back to Orders
        </button>
        <h2 className="mb-0 text-center flex-grow-1">Order Details</h2>
      </div>

      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-light">
          <h4 className="mb-0 d-flex align-items-center">
            <i className="ri-information-line me-2 text-primary"></i>
            Order Summary
          </h4>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded mb-3">
                <h6 className="d-flex align-items-center mb-3">
                  <i className="ri-store-line me-2 text-primary"></i>
                  Restaurant Details
                </h6>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-3">
                    <div className="bg-light rounded" style={{ width: '60px', height: '60px' }}></div>
                  </div>
                  <div>
                    <h5 className="mb-1">{order.vendorId?.name || 'Restaurant'}</h5>
                    <p className="mb-1 small text-muted">
                      <i className="ri-phone-line me-1"></i>
                      {order.vendorId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded">
                <h6 className="d-flex align-items-center mb-3">
                  <i className="ri-user-line me-2 text-primary"></i>
                  Customer Details
                </h6>
                {order.patient && (
                  <>
                    <p className="mb-2">
                      <strong>Name:</strong> {order.patient.name}
                    </p>
                    <p className="mb-2">
                      <strong>Phone:</strong> {order.patient.phone}
                    </p>
                    <div className="mb-0">
                      <strong>Address:</strong>
                      <p className="mb-1">{getAddressString(order.patient)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-light rounded h-100">
                <h6 className="d-flex align-items-center mb-3">
                  <i className="ri-truck-line me-2 text-primary"></i>
                  Order Information
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <p className="mb-1"><strong>Order ID:</strong></p>
                    <p className="text-muted">{order._id}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-1"><strong>Order Date:</strong></p>
                    <p className="text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-1"><strong>Status:</strong></p>
                    <p>{getStatusBadge(order.status)}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-1"><strong>Order Type:</strong></p>
                    <p className="text-muted">{order.orderType || 'Single'}</p>
                  </div>
                  {order.items[0]?.foodTime && (
                    <div className="col-6">
                      <p className="mb-1"><strong>Meal Time:</strong></p>
                      <p className="text-muted">
                        {order.items[0].foodTime.charAt(0).toUpperCase() + order.items[0].foodTime.slice(1)}
                      </p>
                    </div>
                  )}
                  {order.items[0]?.foodSlot && (
                    <div className="col-6">
                      <p className="mb-1"><strong>Delivery Slot:</strong></p>
                      <p className="text-muted">{order.items[0].foodSlot}</p>
                    </div>
                  )}
                  {order.rapid && (
                    <div className="col-12">
                      <span className="badge bg-warning text-dark">Rapid Delivery</span>
                    </div>
                  )}
                </div>

                {order.status === '2' && order.rejectionReason && (
                  <div className="alert alert-danger p-3">
                    <div className="d-flex align-items-center">
                      <i className="ri-alert-line me-2"></i>
                      <div>
                        <strong>Rejection Reason:</strong> {order.rejectionReason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-light">
          <h4 className="mb-0 d-flex align-items-center">
            <i className="ri-restaurant-line me-2 text-primary"></i>
            Order Items
          </h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50%' }}>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="bg-light rounded" style={{ width: '50px', height: '50px' }}></div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.FoodItem?.name || 'Unknown Item'}</h6>
                          {item.request && (
                            <small className="text-muted d-block">
                              <i className="ri-chat-1-line me-1"></i>Request: {item.request}
                            </small>
                          )}
                          {item.extraItems?.length > 0 && (
                            <small className="text-muted d-block">
                              <i className="ri-add-circle-line me-1"></i>
                              Extras: {item.extraItems.map(e => e.name).join(', ')}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle">{item.quantity}</td>
                    <td className="text-end align-middle">₹{parseFloat(item.Amount || 0).toFixed(2)}</td>
                    <td className="text-end align-middle fw-bold">₹{calculateItemTotal(item).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                  <td className="text-end fw-bold">
                    ₹{order.items?.reduce((sum, item) => sum + calculateItemTotal(item), 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end">Delivery Fee:</td>
                  <td className="text-end">₹0.00</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="text-end fw-bold text-primary">
                    ₹{parseFloat(order.price || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button 
          className="btn btn-primary me-3"
          onClick={() => navigate('/shop/FoodAndNurition')}
        >
          <i className="ri-restaurant-line me-2"></i>Order Again
        </button>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="ri-arrow-left-line me-2"></i>Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;