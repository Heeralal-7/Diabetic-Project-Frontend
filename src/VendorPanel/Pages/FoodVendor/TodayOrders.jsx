import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Spinner, Badge } from 'react-bootstrap';

const TodayOrders = () => {
  const { getVendorOrdersByStatus } = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  const fetchTodaysOrders = async () => {
    setLoading(true);
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all orders and filter by today's date
    const result = await getVendorOrdersByStatus('1'); // Accepted orders
    if (result.success === 1) {
      const todaysOrders = result.details.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === today;
      });
      setOrders(todaysOrders);
    }
    setLoading(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container p-4">
      <h2>Today's Orders</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.userId?.name}</td>
              <td>
                {order.items.map(item => (
                  <div key={item._id}>
                    {item.FoodItem?.name} x {item.quantity}
                  </div>
                ))}
              </td>
              <td>₹{order.totalAmount}</td>
              <td>
                {order.status === '0' && <Badge bg="secondary">Pending</Badge>}
                {order.status === '1' && <Badge bg="primary">Accepted</Badge>}
                {order.status === '2' && <Badge bg="info">Driver Assigned</Badge>}
              </td>
              <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TodayOrders;