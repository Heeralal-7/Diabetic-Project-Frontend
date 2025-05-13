import React from 'react';

const AddMedicine = () => {
  return (
    <div>
      <h2>Add New Medicine</h2>
      <p>Here you can add a new medicine to your inventory. Provide all the required details like medicine name, dosage, price, and quantity. Make sure to check for the expiration date and stock availability before adding the item to the system.</p>
      <form>
        <label>Medicine Name:</label>
        <input type="text" placeholder="Enter medicine name" />
        
        <label>Dosage:</label>
        <input type="text" placeholder="Enter dosage" />
        
        <label>Price:</label>
        <input type="number" placeholder="Enter price" />
        
        <label>Stock Quantity:</label>
        <input type="number" placeholder="Enter quantity" />
        
        <label>Expiration Date:</label>
        <input type="date" />
        
        <button type="submit">Add Medicine</button>
      </form>
    </div>
  );
};

export default AddMedicine;
