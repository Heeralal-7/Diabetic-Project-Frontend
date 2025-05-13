import React from 'react';

const PharTodayOrders = () => {
  return (
    <div>
      <h2>Today's Orders</h2>
      <p>Here you can view all the orders placed today. This section helps you keep track of the day's orders and their processing status.</p>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#1001</td>
            <td>John Doe</td>
            <td>Completed</td>
            <td><button>View</button></td>
          </tr>
          <tr>
            <td>#1002</td>
            <td>Jane Smith</td>
            <td>Processing</td>
            <td><button>View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PharTodayOrders;
