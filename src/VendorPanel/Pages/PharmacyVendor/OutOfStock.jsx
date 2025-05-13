import React from 'react';

const OutOfStock = () => {
  return (
    <div>
      <h2>Out of Stock Medicines</h2>
      <p>This section lists all the medicines that are currently out of stock. It helps you identify which medicines need to be reordered or restocked immediately to meet customer demand.</p>
      <table>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Last Stocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ibuprofen</td>
            <td>2025-04-10</td>
            <td><button>Reorder</button></td>
          </tr>
          <tr>
            <td>Amoxicillin</td>
            <td>2025-03-25</td>
            <td><button>Reorder</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OutOfStock;
