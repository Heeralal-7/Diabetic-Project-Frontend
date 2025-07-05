import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaMotorcycle, FaHome, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrderHistory = () => {
  const { getOrder, orderLoading, orderError } = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    const result = await getOrder(page, 10);
    if (result.success === 1) {
      setOrders(prev => [...prev, ...result.details]);
      setHasMore(result.details.length >= 10);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

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

  const viewOrderDetails = (orderId) => {
    navigate(`/shop/FoodAndNurition/order-details/${orderId}`);
  };

  const getTotalItems = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Orders</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/shop/FoodAndNurition')}
        >
          <i className="ri-restaurant-line me-2"></i>Order Food
        </button>
      </div>
      
      {orderLoading && orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : orderError ? (
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <i className="ri-error-warning-line me-2 fs-4"></i>
            <div>
              <h5 className="mb-1">Error loading orders</h5>
              <p className="mb-0">{orderError}</p>
            </div>
          </div>
          <div className="mt-3 text-end">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={fetchOrders}
            >
              <i className="ri-refresh-line me-1"></i>Retry
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-order-img mb-4">
            <i className="ri-file-list-3-line" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
          </div>
          <h5>No orders found</h5>
          <p className="text-muted mb-4">You haven't placed any food orders yet</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/shop/FoodAndNurition')}
          >
            <i className="ri-restaurant-line me-2"></i>Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className="order-list">
            {orders.map((order) => (
              <div key={order._id} className="card mb-4 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-2">Order #{order._id.substring(order._id.length - 6)}</h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-3">{getStatusBadge(order.status)}</span>
                        <span className="badge bg-light text-dark">
                          {order.orderType || 'Single'} Order
                        </span>
                      </div>
                      <small className="text-muted">{formatDate(order.createdAt)}</small>
                    </div>
                    <div className="text-end">
                      <h4 className="text-primary">₹{parseFloat(order.price || 0).toFixed(2)}</h4>
                      <small>{getTotalItems(order.items)} items</small>
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="d-flex align-items-center mb-2">
                          <i className="ri-user-line me-2 text-primary"></i>
                          Customer Details
                        </h6>
                        {order.patient && (
                          <>
                            <p className="mb-1"><strong>{order.patient.name}</strong></p>
                            <p className="mb-1 small text-muted">{order.patient.phone}</p>
                            <p className="mb-0 small text-muted">{getAddressString(order.patient)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="d-flex align-items-center mb-2">
                          <i className="ri-time-line me-2 text-primary"></i>
                          Delivery Info
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {order.items[0]?.foodTime && (
                            <span className="badge bg-white text-dark border">
                              {order.items[0].foodTime.charAt(0).toUpperCase() + order.items[0].foodTime.slice(1)}
                            </span>
                          )}
                          {order.items[0]?.foodSlot && (
                            <span className="badge bg-white text-dark border">
                              {order.items[0].foodSlot}
                            </span>
                          )}
                          {order.rapid && (
                            <span className="badge bg-warning text-dark">Rapid Delivery</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.status === '2' && order.rejectionReason && (
                    <div className="alert alert-danger p-3 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ri-alert-line me-2"></i>
                        <strong>Rejection Reason:</strong> {order.rejectionReason}
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => viewOrderDetails(order._id)}
                    >
                      <i className="ri-eye-line me-2"></i>View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button 
                className="btn btn-primary px-4"
                onClick={loadMore}
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  'Load More Orders'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;