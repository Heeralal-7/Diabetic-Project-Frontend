import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Tabs, Tab, Modal } from 'react-bootstrap';
import ChangeOrderStatusModal from './ChangeOrderStatusModal';

const PendingOrders = ({ refreshKey, onRefresh }) => {
  const { 
    getFoodOrdersForVendor, 
    getBulkFoodOrdersForVendor,
    updateFoodOrderStatus, 
    loading, 
    error 
  } = useContext(MyContext);
  
  const [orders, setOrders] = useState({ single: [], bulk: [] });
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchPendingOrders = async () => {
    try {
      setLocalLoading(true);
      setApiError(null);
      
      const [singleRes, bulkRes] = await Promise.all([
        getFoodOrdersForVendor('Single'),
        getBulkFoodOrdersForVendor()
      ]);

      if (singleRes.success === 1 && bulkRes.success === 1) {
        setOrders({
          single: singleRes.details || [],
          bulk: bulkRes.details || []
        });
      } else {
        setApiError(singleRes.message || bulkRes.message || "Failed to fetch orders");
      }
    } catch (err) {
      setApiError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, [refreshKey]);

  const handleRefresh = () => {
    fetchPendingOrders();
    if (onRefresh) onRefresh();
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setSuccessMessage(null);
    setApiError(null);
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

  const confirmStatusChange = async (status, reason) => {
    try {
      setLocalLoading(true);
      const result = await updateFoodOrderStatus(selectedOrder._id, status, reason);
      
      if (result.success === 1) {
        setSuccessMessage(
          status === "1" 
            ? "Order accepted successfully!" 
            : "Order rejected successfully!"
        );
        
        setOrders(prev => ({
          single: prev.single.filter(o => o._id !== selectedOrder._id),
          bulk: prev.bulk.filter(o => o._id !== selectedOrder._id)
        }));
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setApiError(result.message || "Action failed");
      }
    } catch (err) {
      setApiError(err.message);
      console.error("Status change error:", err);
    } finally {
      setLocalLoading(false);
      setShowModal(false);
    }
  };

  const renderOrderTable = (orderList) => {
    if (orderList.length === 0) {
      return <Alert variant="info">No {activeTab === 'single' ? 'single' : 'bulk'} orders found</Alert>;
    }

    return (
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
          {orderList.map(order => (
            <tr 
              key={order._id} 
              onClick={() => handleRowClick(order)}
              style={{ cursor: 'pointer' }}
            >
              <td>{order.orderId || order._id.substring(0, 8)}...</td>
              <td>{order.userId?.name || 'N/A'}</td>
              <td>
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <strong>{item.FoodItem?.foodName || 'Item'}</strong> (x{item.quantity})
                    {item.extraItems?.length > 0 && (
                      <div className="text-muted small">
                        Extras: {item.extraItems.map(e => e.name).join(', ')}
                      </div>
                    )}
                    {item.request && (
                      <div className="text-info small">Note: {item.request}</div>
                    )}
                  </div>
                ))}
              </td>
              <td>₹{order.totalAmount || order.price || '0.00'}</td>
              <td>
                <Badge bg={activeTab === 'bulk' ? 'primary' : 'info'}>
                  {activeTab === 'bulk' ? 'Bulk' : 'Single'}
                </Badge>
              </td>
              <td>
                <Badge bg={order.rapid ? 'danger' : 'secondary'}>
                  {order.rapid ? 'Rapid' : 'Normal'}
                </Badge>
              </td>
              <td>
                <Badge bg="warning">Pending</Badge>
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
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order);
                    }}
                    disabled={localLoading}
                  >
                    {localLoading ? 'Processing...' : 'Manage'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  if (localLoading && orders.single.length === 0 && orders.bulk.length === 0) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="pending-orders-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Pending Orders</h4>
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

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="single" title={`Single (${orders.single.length})`}>
          {renderOrderTable(orders.single)}
        </Tab>
        <Tab eventKey="bulk" title={`Bulk (${orders.bulk.length})`}>
          {renderOrderTable(orders.bulk)}
        </Tab>
      </Tabs>

      <ChangeOrderStatusModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={confirmStatusChange}
        order={selectedOrder}
        loading={localLoading}
      />

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
    </div>
  );
};

export default PendingOrders;