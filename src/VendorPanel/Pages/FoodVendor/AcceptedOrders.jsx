import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';

const AcceptedOrders = ({ refreshKey, onRefresh }) => {
  const { 
    getVendorAcceptedOrders, 
    getOnlineDriversForVendor, 
    assignDriverToOrder,
    loading,
    error
  } = useContext(MyContext);
  
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [uniqueOrders, setUniqueOrders] = useState(new Set());
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchData = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      const [ordersRes, driversRes] = await Promise.all([
        getVendorAcceptedOrders(),
        getOnlineDriversForVendor()
      ]);
      
      if (ordersRes.success === 1) {
        const uniqueOrdersArray = ordersRes.details.filter(order => {
          if (!uniqueOrders.has(order._id)) {
            uniqueOrders.add(order._id);
            return true;
          }
          return false;
        });
        
        setOrders(uniqueOrdersArray);
        setUniqueOrders(uniqueOrders);
      }
      
      if (driversRes.success === 1) setDrivers(driversRes.details);
    } catch (err) {
      setApiError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => {
    fetchData();
    if (onRefresh) onRefresh();
  };

  const handleAssignDriver = (order) => {
    setSelectedOrder(order);
    setSelectedDriver('');
    setShowModal(true);
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

  const confirmAssignDriver = async () => {
    try {
      if (!selectedDriver) {
        setApiError("Please select a driver");
        return;
      }

      setLocalLoading(true);
      const result = await assignDriverToOrder(selectedOrder._id, selectedDriver);
      
      if (result.success === 1) {
        setSuccessMessage("Driver assigned successfully!");
        setOrders(prev => 
          prev.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, driverId: selectedDriver, status: "2" } 
              : order
          )
        );
        setShowModal(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setApiError(result.message || "Action failed");
      }
    } catch (error) {
      setApiError(error.message);
      console.error("Error assigning driver:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  if (localLoading && orders.length === 0) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Accepted Orders</h4>
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
      
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Alert variant="info">No accepted orders found</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Type</th>
                <th>Delivery Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={`${order._id}-${order.updatedAt}`}
                  onClick={() => handleRowClick(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{order.orderId || order._id.substring(0, 8)}...</td>
                  <td>{order.userId?.name || 'N/A'}</td>
                  <td>
                    {order.items.map((item, index) => (
                      <div key={`${order._id}-item-${index}`}>
                        <strong>{item.FoodItem?.foodName || 'Unknown Item'}</strong> (x{item.quantity})
                        {item.extraItems?.length > 0 && (
                          <div className="text-muted small">
                            Extras: {item.extraItems.map(extra => extra.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>₹{order.totalAmount || order.price || '0.00'}</td>
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
                    <Badge bg="success">Accepted</Badge>
                    {order.driverId && <Badge bg="info" className="ms-1">Driver Assigned</Badge>}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="info" 
                        size="sm"
                        onClick={(e) => handleDetailsClick(e, order)}
                      >
                        Details
                      </Button>
                      {!order.driverId && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignDriver(order);
                          }}
                          disabled={localLoading}
                        >
                          Assign Driver
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Assign Driver to Order #{selectedOrder?._id.substring(0, 8)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Select Driver</label>
                <select 
                  className="form-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose a driver</option>
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} ({driver.isBusy ? 'Busy' : 'Available'})
                    </option>
                  ))}
                </select>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmAssignDriver}
                disabled={!selectedDriver || loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : 'Assign Driver'}
              </Button>
            </Modal.Footer>
          </Modal>

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
        </>
      )}
    </div>
  );
};

export default AcceptedOrders;