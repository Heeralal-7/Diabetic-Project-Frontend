import React from 'react';

const PharTrackOrders = () => {
  return (
    <div>
      <h2>Track Orders</h2>
      <p>This section allows you to track the status of any order placed in the past. You can search for an order using its ID and view its progress, shipping details, and any relevant updates.</p>
      <form>
        <label>Order ID:</label>
        <input type="text" placeholder="Enter order ID" />
        <button type="submit">Track Order</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Shipped Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#1001</td>
            <td>Shipped</td>
            <td>2025-05-02</td>
          </tr>
          <tr>
            <td>#1003</td>
            <td>Pending</td>
            <td>2025-05-03</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PharTrackOrders;
