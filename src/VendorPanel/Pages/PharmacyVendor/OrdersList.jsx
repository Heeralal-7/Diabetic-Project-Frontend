import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const OrdersList = ({ type = 'pending' }) => {
  const { orders, loading, error, fetchOrders, manageOrder, drivers, fetchDrivers } = useContext(MyContext);
  const [selectedDriver, setSelectedDriver] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders(type);
    if (type === 'accepted') {
      fetchDrivers();
    }
  }, [fetchOrders, type]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 0: return <span className="badge bg-warning">Pending</span>;
      case 1: return <span className="badge bg-info">Accepted</span>;
      case 2: return <span className="badge bg-primary">Driver Assigned</span>;
      case 3: return <span className="badge bg-secondary">Driver Accepted</span>;
      case 4: return <span className="badge bg-primary">Dispatched</span>;
      case 5: return <span className="badge bg-success">Delivered</span>;
      case 6: return <span className="badge bg-danger">Cancelled</span>;
      default: return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      await manageOrder(orderId, action);
      if (action === 'assign' && selectedDriver[orderId]) {
        setSelectedDriver(prev => ({ ...prev, [orderId]: '' }));
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {type === 'pending' && 'Pending Orders'}
          {type === 'accepted' && 'Accepted Orders'}
          {type === 'rejected' && 'Rejected Orders'}
          {type === 'active' && 'Active Orders'}
          {type === 'history' && 'Order History'}
        </h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => fetchOrders(type)}>
            <i className="bi bi-arrow-clockwise me-2"></i> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders[type]?.length > 0 ? (
                  orders[type].map(order => (
                    <React.Fragment key={order._id}>
                      <tr>
                        <td>#{order.orderId}</td>
                        <td>{order.userId?.name || 'N/A'}</td>
                        <td>{order.items.length}</td>
                        <td>₹{order.totalAmount}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {type === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleOrderAction(order._id, 'accept')}
                                >
                                  <i className="bi bi-check"></i> Accept
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleOrderAction(order._id, 'reject')}
                                >
                                  <i className="bi bi-x"></i> Reject
                                </button>
                              </>
                            )}
                            {type === 'accepted' && (
                              <>
                                <select
                                  className="form-select form-select-sm"
                                  value={selectedDriver[order._id] || ''}
                                  onChange={(e) => setSelectedDriver(prev => ({
                                    ...prev,
                                    [order._id]: e.target.value
                                  }))}
                                >
                                  <option value="">Select Driver</option>
                                  {drivers.map(driver => (
                                    <option key={driver._id} value={driver._id}>
                                      {driver.name} ({driver.vehicleNumber})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={!selectedDriver[order._id]}
                                  onClick={() => handleOrderAction(order._id, 'assign')}
                                >
                                  <i className="bi bi-truck"></i> Assign
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            >
                              <i className={`bi bi-chevron-${expandedOrder === order._id ? 'up' : 'down'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr>
                          <td colSpan="6">
                            <div className="p-3 bg-light">
                              <h6>Order Details</h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <p><strong>Customer:</strong> {order.userId?.name || 'N/A'}</p>
                                  <p><strong>Phone:</strong> {order.userId?.phone || 'N/A'}</p>
                                  <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                                </div>
                                <div className="col-md-6">
                                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                                  {order.driverAssignedId && (
                                    <p><strong>Driver:</strong> {order.driverAssignedId.name} ({order.driverAssignedId.phone})</p>
                                  )}
                                </div>
                              </div>
                              <h6 className="mt-3">Items</h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>Product</th>
                                      <th>Quantity</th>
                                      <th>Price</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, index) => (
                                      <tr key={index}>
                                        <td>{item.productId?.name || 'N/A'}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td>₹{item.price * item.quantity}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="mt-2 mb-0">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;