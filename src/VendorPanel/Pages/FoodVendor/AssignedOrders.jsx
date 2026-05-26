import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

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
  const [showReassignModal, setShowReassignModal] = useState(false); // Renamed for clarity
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

  const fetchAssignedOrders = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      const result = await getVendorOrdersByStatus('2'); // Status '2' for Assigned
      
      if (result.success === 1) {
        const processedOrders = await Promise.all(result.details.map(async (order) => {
          // Ensure userId and driverId are objects if they exist
          const populatedOrder = {
            ...order,
            userId: order.userId && typeof order.userId === 'object' 
              ? order.userId 
              : { _id: order.userId, name: 'Loading...', number: 'N/A' },
            driverId: order.driverId && typeof order.driverId === 'object'
              ? order.driverId
              : { _id: order.driverId, name: 'Loading...' },
          };

          // Process items to calculate discounted prices and ensure FoodItem structure
          if (populatedOrder.items) {
            populatedOrder.items = await Promise.all(populatedOrder.items.map(async (item) => {
              const foodItem = item.FoodItem && typeof item.FoodItem === 'object'
                ? item.FoodItem
                : { _id: item.foodId, foodName: 'Loading...', foodSubCategory: '', amount: '0', discountPercentage: '0' }; // Default values
              
              return {
                ...item,
                FoodItem: foodItem,
                displayPrice: calculateDiscountedPrice({ FoodItem: foodItem }) // Calculate display price
              };
            }));
          } else {
            populatedOrder.items = [];
          }
          return populatedOrder;
        }));

        setOrders(processedOrders);
      } else {
        setApiError(result.message || "Failed to fetch assigned orders.");
      }
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred while fetching assigned orders.");
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
      } else {
        console.error("Failed to fetch online drivers:", result.message);
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
    setSelectedDriver(''); // Clear previously selected driver
    setApiError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages
    setShowReassignModal(true);
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setApiError(null);
    setSuccessMessage(null);
    setShowDetailsModal(true);
  };

  const handleDetailsClick = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setApiError(null);
    setSuccessMessage(null);
    setShowDetailsModal(true);
  };

  const confirmReassignDriver = async () => {
    try {
      if (!selectedOrder) {
        setApiError("No order selected for reassignment.");
        return;
      }
      if (!selectedDriver) {
        setApiError("Please select a driver to reassign.");
        return;
      }

      setLocalLoading(true);
      setApiError(null); // Clear previous errors
      
      const result = await assignDriverToOrder(selectedOrder._id, selectedDriver);
      
      if (result.success === 1) {
        setSuccessMessage("Driver reassigned successfully!");
        // Find the newly assigned driver's full details
        const newDriver = drivers.find(d => d._id === selectedDriver) || { _id: selectedDriver, name: 'Unknown Driver' };
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === selectedOrder._id
              ? { 
                  ...order, 
                  driverId: newDriver, // Update with full driver object
                  status: "2" // Ensure status remains 'Assigned'
                }
              : order
          )
        );
        setSelectedOrder(prev => ({ // Update selectedOrder as well if modal is open
          ...prev, 
          driverId: newDriver, 
          status: "2" 
        }));
        setShowReassignModal(false); // Close reassign modal
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setApiError(result.message || "Reassignment failed.");
      }
    } catch (error) {
      setApiError(error.message || "An unexpected error occurred during driver reassignment.");
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
                    {/* --- MODIFIED CODE START --- */}
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
                    {/* --- MODIFIED CODE END --- */}
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

          {/* Reassign Driver Modal */}
          <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reassign Driver to Order #{selectedOrder?._id.substring(0, 8)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
              <div className="mb-3">
                <label className="form-label">Current Driver: {selectedOrder?.driverId?.name || 'None'}</label>
                <select 
                  className="form-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  disabled={localLoading} // Use localLoading for this modal's actions
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
              <Button variant="secondary" onClick={() => setShowReassignModal(false)} disabled={localLoading}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmReassignDriver}
                disabled={!selectedDriver || localLoading}
              >
                {localLoading ? <Spinner size="sm" animation="border" /> : 'Reassign Driver'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Order Details Modal */}
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
                    <Table striped bordered hover responsive size="sm"> {/* Using react-bootstrap Table */}
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Original Price (each)</th>
                          <th>Discount (%)</th>
                          <th>Final Price (each)</th>
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