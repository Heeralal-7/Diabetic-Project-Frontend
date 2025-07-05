import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';

const AssignedOrders = ({ refreshKey, onRefresh }) => {
  const { 
    getVendorOrdersByStatus,
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
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAssignedOrders = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      const result = await getVendorOrdersByStatus('2');
      
      if (result.success === 1) {
        const processedOrders = await Promise.all(result.details.map(async (order) => {
          const populatedOrder = {
            ...order,
            userId: order.userId && typeof order.userId === 'object' 
              ? order.userId 
              : { _id: order.userId, name: 'Loading...', number: 'N/A' },
            driverId: order.driverId && typeof order.driverId === 'object'
              ? order.driverId
              : { _id: order.driverId, name: 'Loading...' },
            items: order.items ? await Promise.all(order.items.map(async (item) => ({
              ...item,
              FoodItem: item.FoodItem && typeof item.FoodItem === 'object'
                ? item.FoodItem
                : { _id: item.foodId, foodName: 'Loading...', foodSubCategory: '' },
              extraItems: item.extraItems || []
            }))) : []
          };
          return populatedOrder;
        }));

        setOrders(processedOrders);
      }
    } catch (err) {
      setApiError(err.message);
      console.error("Error fetching assigned orders:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchOnlineDrivers = async () => {
    try {
      const result = await getOnlineDriversForVendor();
      if (result.success === 1) {
        setDrivers(result.details);
      }
    } catch (err) {
      console.error("Error fetching online drivers:", err);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchAssignedOrders(), fetchOnlineDrivers()]);
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => {
    fetchData();
    if (onRefresh) onRefresh();
  };

  const handleReassignDriver = (order) => {
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

  const confirmReassignDriver = async () => {
    try {
      if (!selectedDriver) {
        setApiError("Please select a driver");
        return;
      }

      setLocalLoading(true);
      const result = await assignDriverToOrder(selectedOrder._id, selectedDriver);
      
      if (result.success === 1) {
        setSuccessMessage("Driver reassigned successfully!");
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === selectedOrder._id
              ? { 
                  ...order, 
                  driverId: drivers.find(d => d._id === selectedDriver) || { _id: selectedDriver, name: 'New Driver' },
                  status: "2"
                }
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
      console.error("Error reassigning driver:", error);
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
        <h4>Assigned Orders</h4>
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
        <Alert variant="info">No assigned orders found</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Driver</th>
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
                  key={order._id}
                  onClick={() => handleRowClick(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{order.orderId || order._id.substring(0, 8)}...</td>
                  <td>{order.userId?.name || 'N/A'}</td>
                  <td>{order.driverId?.name || 'Not assigned'}</td>
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
                    <Badge bg="info">Driver Assigned</Badge>
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
                      <Button 
                        variant="warning" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReassignDriver(order);
                        }}
                        disabled={localLoading}
                      >
                        Reassign Driver
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reassign Driver to Order #{selectedOrder?._id.substring(0, 8)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Current Driver: {selectedOrder?.driverId?.name || 'None'}</label>
                <select 
                  className="form-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose a new driver</option>
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
                onClick={confirmReassignDriver}
                disabled={!selectedDriver || loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : 'Reassign Driver'}
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
        </>
      )}
    </div>
  );
};

export default AssignedOrders;