import React from 'react';

const OngoingMedicines = () => {
  return (
    <div>
      <h2>Ongoing Medicines</h2>
      <p>This section displays all the ongoing medicines in your pharmacy. Here you can monitor the progress of medicines that are being processed or waiting to be added to the inventory.</p>
      <table>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Paracetamol</td>
            <td>In Progress</td>
            <td><button>Update</button></td>
          </tr>
          <tr>
            <td>Aspirin</td>
            <td>In Progress</td>
            <td><button>Update</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OngoingMedicines;
