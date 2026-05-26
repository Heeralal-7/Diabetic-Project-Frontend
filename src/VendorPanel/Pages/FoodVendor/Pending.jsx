import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Alert, Spinner, Tabs, Tab, Modal } from 'react-bootstrap';

const PendingOrders = ({ refreshKey, onRefresh }) => {

  const { 
    getFoodOrdersForVendor, 
    getBulkFoodOrdersForVendor,
    updateFoodOrderStatus
  } = useContext(MyContext);
  
  const [orders, setOrders] = useState({ single: [], bulk: [] });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const calculateDiscountedPrice = (item) => {
    const originalAmount = parseFloat(item.FoodItem?.amount || '0');
    const discountPercentage = parseFloat(item.FoodItem?.discountPercentage || '0');
    
    if (discountPercentage > 0 && originalAmount > 0) {
      const discountedAmount = originalAmount * (1 - discountPercentage / 100);
      return discountedAmount.toFixed(2);
    }
    return originalAmount.toFixed(2);
  };

  const fetchPendingOrders = async () => {

    try {

      setLocalLoading(true);
      setApiError(null);

      const [singleRes, bulkRes] = await Promise.all([
        getFoodOrdersForVendor('Single'),
        getBulkFoodOrdersForVendor()
      ]);

      if (singleRes.success === 1 && bulkRes.success === 1) {

        const processOrders = (orderList) => {
          return orderList.map(order => {

            const processedItems = order.items.map(item => ({
              ...item,
              displayPrice: calculateDiscountedPrice(item)
            }));

            return { ...order, items: processedItems };
          });
        };

        setOrders({
          single: processOrders(singleRes.details || []),
          bulk: processOrders(bulkRes.details || [])
        });

      } else {

        setApiError(singleRes.message || bulkRes.message || "Failed to fetch orders");

      }

    } catch (err) {

      setApiError(err.message);

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

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setApiError(null);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const acceptOrder = async (e, order) => {

    e.stopPropagation();

    const confirm = window.confirm("Accept this order?");
    if (!confirm) return;

    try {

      setLocalLoading(true);

      const result = await updateFoodOrderStatus(order._id, "1");

      if (result.success === 1) {

        setSuccessMessage("Order accepted successfully!");

        setOrders(prev => ({
          single: prev.single.filter(o => o._id !== order._id),
          bulk: prev.bulk.filter(o => o._id !== order._id)
        }));

      } else {

        setApiError(result.message || "Failed to accept order");

      }

    } catch (err) {

      setApiError(err.message);

    } finally {

      setLocalLoading(false);

    }

  };

  const rejectOrder = async (e, order) => {

    e.stopPropagation();

    const reason = prompt("Enter rejection reason");

    if (!reason || !reason.trim()) {
      alert("Rejection reason required");
      return;
    }

    try {

      setLocalLoading(true);

      const result = await updateFoodOrderStatus(order._id, "2", reason);

      if (result.success === 1) {

        setSuccessMessage("Order rejected successfully!");

        setOrders(prev => ({
          single: prev.single.filter(o => o._id !== order._id),
          bulk: prev.bulk.filter(o => o._id !== order._id)
        }));

      } else {

        setApiError(result.message || "Failed to reject order");

      }

    } catch (err) {

      setApiError(err.message);

    } finally {

      setLocalLoading(false);

    }

  };

  const renderOrderTable = (orderList) => {

    if (orderList.length === 0) {
      return <Alert variant="info">No orders found</Alert>;
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

              <td>{order.orderId || order._id.substring(0,8)}...</td>

              <td>{order.userId?.name || 'N/A'}</td>

              <td>

  {order.items.length > 0 ? (

    order.items.map((item, index) => (

      <div key={index}>

        <strong>
          {item.FoodItem?.foodName} {item.FoodItem?.foodSubCategory || ''}
        </strong> (x{item.quantity})

      </div>

    ))

  ) : (
    "No items"
  )}

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

              <td onClick={(e)=>e.stopPropagation()}>

                <div className="d-flex gap-2">

                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e)=>acceptOrder(e,order)}
                  >
                    Accept
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e)=>rejectOrder(e,order)}
                  >
                    Reject
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
        <Spinner animation="border"/>
        <p>Loading orders...</p>
      </div>
    );

  }

  return (

    <>
    
    <div className="pending-orders-container">

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h4>Pending Orders</h4>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleRefresh}
        >
          Refresh
        </Button>

      </div>

      {apiError && (
        <Alert variant="danger">{apiError}</Alert>
      )}

      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k)=>setActiveTab(k)}
        className="mb-3"
      >

        <Tab eventKey="single" title={`Single (${orders.single.length})`}>
          {renderOrderTable(orders.single)}
        </Tab>

        <Tab eventKey="bulk" title={`Bulk (${orders.bulk.length})`}>
          {renderOrderTable(orders.bulk)}
        </Tab>

      </Tabs>

      <Modal
        show={showDetailsModal}
        onHide={handleCloseDetailsModal}
        size="xl"
      >

        <Modal.Header closeButton>
          <Modal.Title>
            Order Details #{selectedOrder?._id?.substring(0,8)}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedOrder && (

            <>
            
            <h5>Customer Info</h5>

            <p><strong>Name:</strong> {selectedOrder.userId?.name}</p>

            <p><strong>Phone:</strong> {selectedOrder.userId?.number}</p>

            <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>

            <hr/>

            <h5>Items</h5>

            <Table bordered>

  <thead>
    <tr>
      <th>Item</th>
      <th>Qty</th>
      <th>MRP</th>
      <th>Discount</th>
      <th>Price</th>
    </tr>
  </thead>

  <tbody>

    {selectedOrder.items.map((item,i)=>(

      <tr key={i}>

        <td>
          {item.FoodItem?.foodSubCategory} {item.FoodItem?.foodName}
        </td>

        <td>{item.quantity}</td>

        <td>₹{item.FoodItem?.amount}</td>

        <td>{item.FoodItem?.discountPercentage}%</td>

        <td>₹{item.displayPrice}</td>

      </tr>

    ))}

  </tbody>

</Table>

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

export default PendingOrders;