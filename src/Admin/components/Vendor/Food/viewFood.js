import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';

const ViewFood = () => {
  const {
    foodVendors,
    foodVendorLength,
    getAllFoodVendors,
    toggleFoodVendorStatus,
    searchFoodVendors
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        await searchFoodVendors(searchTerm, currentPage, itemsPerPage, selectedStatus);
      } else {
        await getAllFoodVendors(currentPage, itemsPerPage, selectedStatus);
      }
    };
    fetchData();
  }, [currentPage, searchTerm, selectedStatus]);

  const handleStatusToggle = async (vendorId) => {
    await toggleFoodVendorStatus(vendorId);
    // Refresh data
    if (searchTerm) {
      await searchFoodVendors(searchTerm, currentPage, itemsPerPage, selectedStatus);
    } else {
      await getAllFoodVendors(currentPage, itemsPerPage, selectedStatus);
    }
  };

  const totalPages = Math.ceil(foodVendorLength / itemsPerPage);

  return (
<div className="p-4">
  <h2 className="text-center mb-6 text-3xl font-semibold">All Food Vendors</h2>

  {/* Search Input */}
  <div className="mb-4">
    <input
      type="text"
      placeholder="Search Here..."
      className="border p-2 rounded w-full sm:w-[300px]"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {/* Table */}
  {foodVendors.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left  table table-striped">
        <thead className="text-xs uppercase bg-gray-100">
          <tr>
            <th className="p-3">S.No</th>
            <th className="p-3">Image</th>
            <th className="p-3">Vendor Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Country</th>
            <th className="p-3">State</th>
            <th className="p-3">City</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
  {foodVendors.map((vendor, index) => (
    <tr
      key={vendor._id}
      className={`border-b ${index % 2 !== 0 ? 'bg-gray-100' : ''}`}
    >
      <td className="p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td className="p-3">
            {vendor.image ? (
  <img
    src={`${process.env.REACT_APP_API_URL}/${vendor.image}`}
    alt={vendor.name}
    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm " style={{width:"50px", height: "50px",borderRadius:"50%"}}
  />
) : (
  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
    <img 
  src="https://placehold.co/64x64?text=No+Image&font=roboto" 
  alt="No Image" 
  className="w-16 h-16 rounded-full object-cover" style={{width:"50px", height: "50px",borderRadius:"50%"}}
/>
  </div>
)}
      </td>
      <td className="p-3">{vendor.name}</td>
      <td className="p-3">{vendor.email}</td>
      <td className="p-3">{vendor.country || "-"}</td>
      <td className="p-3">{vendor.state || "-"}</td>
      <td className="p-3">{vendor.city || "-"}</td>
      <td className="p-3 d-flex gap-2">
      <button
  className="bg-secondary text-white px-2 py-2 rounded"
  onClick={() => toggleFoodVendorStatus(vendor._id)}
  style={{ border: "none" }}
>
  {vendor.isActive ? "Disable" : "Enable"}
</button>

        {/* <button
          className=" bg-secondary text-white px-2 py-2 rounded ml-2"
          style={{ border: "none" }}
        >
          View
        </button> */}
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  ) : (
    <p className="text-center text-gray-500 mt-6">No vendors found</p>
  )}

  {/* Pagination */}
  {foodVendorLength > itemsPerPage && (
    <div className="flex justify-center mt-6 gap-4">
      <button
        className={`px-4 py-2 rounded ${
          currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
        }`}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <button
        className={`px-4 py-2 rounded ${
          currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
        }`}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )}
</div>

  );
};

export default ViewFood;
