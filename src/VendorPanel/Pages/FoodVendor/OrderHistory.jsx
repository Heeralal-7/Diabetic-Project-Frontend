import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Badge, Alert, Spinner, Button, Modal } from 'react-bootstrap';

const OrderHistory = ({ refreshKey, onRefresh }) => {
  const { getVendorOrderHistory, loading, error } = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrderHistory = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      const result = await getVendorOrderHistory();
      if (result.success === 1) {
        setOrders(result.details);
      } else {
        setApiError(result.message || "Failed to fetch order history");
      }
    } catch (error) {
      setApiError(error.message);
      console.error("Failed to fetch order history:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [refreshKey]);

  const handleRefresh = () => {
    fetchOrderHistory();
    if (onRefresh) onRefresh();
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDetailsClick = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'Accepted':
        return 'primary';
      case 'Driver Assigned':
        return 'info';
      default:
        return 'warning';
    }
  };

  if (localLoading && orders.length === 0) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p>Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order History</h2>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={handleRefresh}
          disabled={localLoading}
        >
          {localLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {apiError && (
        <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}
            
      {orders.length === 0 && !localLoading ? (
        <Alert variant="info">No order history found</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="thead-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Type</th>
                <th>Delivery Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={order._id}
                  onClick={() => handleRowClick(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{order._id?.substring(0, 8)}...</td>
                  <td>
                    {order.userId?.name || 'N/A'}
                    {order.userId?.phone && <div className="text-muted small">{order.userId.phone}</div>}
                  </td>
                  <td>
                    {order.items?.map((item, index) => (
                      <div key={`${order._id}-item-${index}`} className="mb-2">
                        <div>
                          <strong>{item.FoodItem?.foodName || 'Unknown Item'}</strong> (x{item.quantity})
                        </div>
                        {item.extraItems?.length > 0 && (
                          <div className="text-muted small">
                            Extras: {item.extraItems.map(extra => `${extra.name} (₹${extra.price})`).join(', ')}
                          </div>
                        )}
                        {item.request && (
                          <div className="text-muted small">
                            Note: {item.request}
                          </div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>₹{order.price || '0.00'}</td>
                  <td>
                    <Badge bg={order.orderType === 'Bulk' ? 'primary' : 'info'}>
                      {order.orderType === 'Bulk' ? 'Bulk' : 'Single'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={order.rapid ? 'danger' : 'secondary'}>
                      {order.rapid ? 'Rapid' : 'Normal'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                    {order.driverId && (
                      <div className="text-muted small mt-1">
                        Driver: {order.driverId?.name || 'N/A'}
                      </div>
                    )}
                    {order.rejectionReason && (
                      <div className="text-danger small mt-1">
                        Reason: {order.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={(e) => handleDetailsClick(e, order)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?._id.substring(0, 8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-4">
                <h5>Customer Information</h5>
                <p><strong>Name:</strong> {selectedOrder.userId?.name || 'N/A'}</p>
                <p><strong>Contact:</strong> {selectedOrder.userId?.number || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress || selectedOrder.items?.[0]?.address?.join(', ') || 'N/A'}</p>
              </div>

              <div className="mb-4">
                <h5>Order Items</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Extras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={`detail-${index}`}>
                        <td>
                          <div>{item.FoodItem?.foodName || 'Unknown Item'}</div>
                          <small className="text-muted">{item.FoodItem?.foodSubCategory || ''}</small>
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{item.finalprice || item.price || '0.00'}</td>
                        <td>
                          {item.extraItems?.length > 0 ? (
                            <ul className="list-unstyled">
                              {item.extraItems.map((extra, i) => (
                                <li key={`extra-${i}`}>
                                  {extra.name} (₹{extra.price || '0.00'})
                                </li>
                              ))}
                            </ul>
                          ) : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Delivery Information</h5>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Time Slot:</strong> {selectedOrder.items?.[0]?.foodSlot || 'N/A'}</p>
                  <p><strong>Assigned Driver:</strong> {selectedOrder.driverId?.name || 'Not assigned'}</p>
                  <p><strong>Delivery Type:</strong> {selectedOrder.rapid ? 'Rapid' : 'Normal'}</p>
                </div>
                <div className="col-md-6">
                  <h5>Order Summary</h5>
                  <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount || selectedOrder.price || '0.00'}</p>
                  <p><strong>Order Type:</strong> {selectedOrder.orderType === 'Bulk' ? 'Bulk Order' : 'Single'}</p>
                  {selectedOrder.items?.[0]?.request && (
                    <p><strong>Special Request:</strong> {selectedOrder.items[0].request}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;