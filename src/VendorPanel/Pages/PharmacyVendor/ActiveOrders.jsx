import React, { useContext, useEffect } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const ActiveOrders = () => {
  const {
    activeOrders,
    loading,
    fetchActiveOrders
  } = useContext(MyContext);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 2: return <Badge bg="primary">Driver Assigned</Badge>;
      case 3: return <Badge bg="secondary">Driver Accepted</Badge>;
      case 4: return <Badge bg="info">Dispatched</Badge>;
      default: return <Badge bg="secondary">Processing</Badge>;
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        <h5 className="card-title mb-4">Active Orders</h5>
        
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/pharmacy/orders/${order._id}`} className="text-primary">
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>{order.patientDetails?.name || 'N/A'}</td>
                    <td>₹{order.totalPrice?.toFixed(2) || '0.00'}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      {order.driver ? (
                        <span>{order.driver.name} ({order.driver.phoneNumber})</span>
                      ) : 'N/A'}
                    </td>
                    <td>{new Date(order.updatedAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="mt-2 mb-0">No active orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ActiveOrders;