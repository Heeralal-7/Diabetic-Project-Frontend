import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (item) => {
    const originalAmount = parseFloat(item.FoodItem?.amount || '0');
    const discountPercentage = parseFloat(item.FoodItem?.discountPercentage || '0');
    
    if (discountPercentage > 0 && originalAmount > 0) {
      const discountedAmount = originalAmount * (1 - discountPercentage / 100);
      return discountedAmount.toFixed(2); // Format to 2 decimal places
    }
    return originalAmount.toFixed(2); // No discount or invalid values, return original
  };

  const fetchData = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      
      const [ordersRes, driversRes] = await Promise.all([
        getVendorAcceptedOrders(),
        getOnlineDriversForVendor()
      ]);
      
      if (ordersRes.success === 1) {
        // Process orders to calculate discounted prices for each item
        const processedOrders = ordersRes.details.map(order => {
          const processedItems = order.items.map(item => ({
            ...item,
            displayPrice: calculateDiscountedPrice(item) // Add calculated price for display
          }));
          return { ...order, items: processedItems };
        });
        setOrders(processedOrders || []);
      } else {
        setApiError(ordersRes.message || "Failed to fetch accepted orders.");
      }
      
      if (driversRes.success === 1) {
        setDrivers(driversRes.details || []);
      } else {
        console.error("Failed to fetch online drivers:", driversRes.message);
      }
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred while fetching data.");
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

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setSelectedDriver(order.driverId || '');
    setApiError(null);
    setSuccessMessage(null);
    setShowDetailsModal(true);
  };

  const handleDetailsClick = (e, order) => {
    e.stopPropagation();
    handleRowClick(order);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
    setSelectedDriver('');
  };

  const confirmAssignDriver = async () => {
    if (!selectedOrder) return;

    if (!selectedDriver) {
      setApiError("Please select a driver to assign.");
      return;
    }

    try {
      setLocalLoading(true);
      setApiError(null);
      
      const result = await assignDriverToOrder(selectedOrder._id, selectedDriver);
      
      if (result.success === 1) {
        setSuccessMessage("Driver assigned successfully!");
        
        // Update the specific order in the state with the new driver and status
        setOrders(prev => 
          prev.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, driverId: selectedDriver, status: "2" }
              : order
          )
        );
        setSelectedOrder(prev => ({ ...prev, driverId: selectedDriver, status: "2" }));

        // No longer closing the modal immediately to allow user to see success message
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setApiError(result.message || "Failed to assign driver.");
      }
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred during driver assignment.");
      console.error("Error assigning driver:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  if (localLoading && orders.length === 0) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p>Loading accepted orders...</p>
      </div>
    );
  }

  return (
    <>
    <style>
      {`
        .medicine-detail-modal { max-width: 1140px !important; width: 100% !important; margin: auto; }
        .medicine-detail-modal .modal-content { max-width: 1140px !important; width: 100% !important; flex: 1 1 auto; }
        .carousel-item img { height: 300px; object-fit: contain; width: 100%; }
      `}
      </style>
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
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Type</th>
              <th>Delivery Type</th>
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
                  {/* --- MODIFIED CODE START for AcceptedOrders --- */}
                  {order.items.length > 0 ? (
                    <>
                      <div>
                        <strong>{order.items[0].FoodItem?.foodName || 'Unknown Item'} {order.items[0].FoodItem?.foodSubCategory || ''}</strong> (x{order.items[0].quantity})
                      </div>
                      {order.items.length > 1 && (
                        <Badge bg="secondary" className="mt-1">
                          +{order.items.length - 1} more items
                        </Badge>
                      )}
                    </>
                  ) : (
                    'No items'
                  )}
                  {/* --- MODIFIED CODE END for AcceptedOrders --- */}
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
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={(e) => handleDetailsClick(e, order)}
                    >
                      View Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Order Details and Assign Driver Modal (merged functionality) */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="xl" dialogClassName="medicine-detail-modal">
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?._id?.substring(0, 8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
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

              <div className="mb-4">
                <h5>Customer Information</h5>
                <p><strong>Name:</strong> {selectedOrder.userId?.name || 'N/A'}</p>
                <p><strong>Contact:</strong> {selectedOrder.userId?.number || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress || selectedOrder.items?.[0]?.address?.join(', ') || 'N/A'}</p>
              </div>

              <div className="mb-4">
                <h5>Order Items</h5>
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>MRP</th>
                      <th>Discount (%)</th>
                      <th>Price</th>
                      <th>Extras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={`detail-${index}`}>
                        <td>
                          <div>{item.FoodItem?.foodName || 'Unknown Item'} {item.FoodItem?.foodSubCategory || ''}</div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.FoodItem?.amount || '0').toFixed(2)}</td>
                        <td>{item.FoodItem?.discountPercentage || '0'}%</td>
                        <td>₹{item.displayPrice}</td> {/* Display calculated price */}
                        <td>
                          {item.extraItems?.length > 0 ? (
                            <ul className="list-unstyled mb-0">
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
                </Table>
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

              {/* Assign Driver Controls */}
              {!selectedOrder.driverId && (
                <>
                  <hr className="my-4" />
                  <div className="mb-3">
                    <h5>Assign Driver</h5>
                  </div>
                  <Form.Group className="mb-3" controlId="selectDriver">
                    <Form.Label>Select an Available Driver</Form.Label>
                    <Form.Select 
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      disabled={localLoading}
                    >
                      <option value="">Choose a driver</option>
                      {drivers.length > 0 ? (
                        drivers.map(driver => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name} {driver.isBusy ? '(Busy)' : '(Available)'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No drivers available</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                  <div className="d-grid mt-3">
                    <Button 
                      variant="primary" 
                      onClick={confirmAssignDriver}
                      disabled={!selectedDriver || localLoading}
                    >
                      {localLoading ? <Spinner size="sm" /> : 'Assign Driver'}
                    </Button>
                  </div>
                </>
              )}
              {selectedOrder.driverId && (
                <Alert variant="info" className="mt-4">
                  Driver already assigned: <strong>{drivers.find(d => d._id === selectedOrder.driverId)?.name || 'Unknown Driver'}</strong>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </>
  );
};

export default AcceptedOrders;