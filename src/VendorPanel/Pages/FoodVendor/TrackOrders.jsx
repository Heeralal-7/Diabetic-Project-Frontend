import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Spinner, Badge } from 'react-bootstrap';

const TrackOrders = () => {
  const { getOrderWithDriverDetails } = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackedOrders();
  }, []);

  const fetchTrackedOrders = async () => {
    setLoading(true);
    // In a real app, you would fetch specific orders being tracked
    // For demo, we'll simulate getting some orders with driver details
    const orderIds = []; // You would have actual order IDs to track
    const ordersWithDrivers = [];
    
    for (const id of orderIds) {
      const result = await getOrderWithDriverDetails(id);
      if (result.success === 1) {
        ordersWithDrivers.push(result.details);
      }
    }
    
    setOrders(ordersWithDrivers);
    setLoading(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container p-4">
      <h2>Track Orders</h2>
      {orders.length === 0 ? (
        <p>No orders currently being tracked</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.orderId}</td>
                <td>{order.userId?.name}</td>
                <td>
                  {order.driverId?.name} 
                  {order.driverId?.isBusy ? (
                    <Badge bg="warning" className="ms-2">Busy</Badge>
                  ) : (
                    <Badge bg="success" className="ms-2">Available</Badge>
                  )}
                </td>
                <td>
                  {order.status === '0' && <Badge bg="secondary">Pending</Badge>}
                  {order.status === '1' && <Badge bg="primary">Accepted</Badge>}
                  {order.status === '2' && <Badge bg="info">Driver Assigned</Badge>}
                </td>
                <td>Tracking data would go here</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default TrackOrders;