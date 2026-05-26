import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Link } from 'react-router-dom';

const ViewFood = () => {
  const {
    // New subadmin context functions
    getFoodVendors,
    foodVendors,
    foodVendorsLoading,
    foodVendorsError,
    updateFoodVendorStatus,
    getInactiveFoodVendorsSubadmin,
    clearFoodVendorsError
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: selectedStatus === 'all' ? '' : selectedStatus
      };

      if (searchTerm) {
        await getFoodVendors(filters);
      } else {
        if (selectedStatus === 'inactive') {
          await getInactiveFoodVendorsSubadmin(filters);
        } else {
          await getFoodVendors(filters);
        }
      }
    };
    fetchData();
  }, [currentPage, searchTerm, selectedStatus]);

  const handleStatusToggle = async (vendorId, currentStatus) => {
    const result = await updateFoodVendorStatus(vendorId, !currentStatus);
    if (result.success) {
      // Refresh data
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: selectedStatus === 'all' ? '' : selectedStatus
      };

      if (searchTerm) {
        await getFoodVendors(filters);
      } else {
        if (selectedStatus === 'inactive') {
          await getInactiveFoodVendorsSubadmin(filters);
        } else {
          await getFoodVendors(filters);
        }
      }
    }
  };

  // Calculate total pages based on the new data structure
  const totalVendors = foodVendors?.vendors?.length || 0;
  const totalPages = foodVendors?.pagination?.totalPages || 1;
  const foodVendorLength = foodVendors?.pagination?.totalFoodVendors || 0;

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearFoodVendorsError();
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-center mb-6 text-3xl font-semibold">All Food Vendors</h2>

      {/* Status Filter */}
      <div className="mb-4 flex gap-4">
        <select
          className="border p-2 rounded"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        
        {/* Search Input */}
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

      {/* Error Display */}
      {foodVendorsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {foodVendorsError}
        </div>
      )}

      {/* Loading State */}
      {foodVendorsLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!foodVendorsLoading && foodVendors?.vendors && foodVendors.vendors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table table-striped">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th className="p-3">S.No</th>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">Business</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Country</th>
                <th className="p-3">State</th>
                <th className="p-3">City</th>
                <th className="p-3">Food Items</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {foodVendors.vendors.map((vendor, index) => (
                <tr
                  key={vendor._id}
                  className={`border-b ${index % 2 !== 0 ? 'bg-gray-100' : ''}`}
                >
                  <td className="p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="p-3 font-medium">{vendor.name}</td>
                  <td className="p-3">{vendor.business}</td>
                  <td className="p-3">{vendor.email}</td>
                  <td className="p-3">{vendor.phone}</td>
                  <td className="p-3">{vendor.country || "-"}</td>
                  <td className="p-3">{vendor.state || "-"}</td>
                  <td className="p-3">{vendor.city || "-"}</td>
                  <td className="p-3">
                    <span className="badge bg-info text-dark">
                      {vendor.foodItemsCount || 0}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 d-flex gap-2">
                    <button
                      className={`px-3 py-1 rounded text-white ${vendor.isActive ? 'bg-danger' : 'bg-success'}`}
                      onClick={() => handleStatusToggle(vendor._id, vendor.isActive)}
                      style={{ border: "none" }}
                      disabled={foodVendorsLoading}
                    >
                      {vendor.isActive ? "Disable" : "Enable"}
                    </button>
                    <Link to={`/subadmin-dashboard/food/${vendor._id}`}>
                      <button className="bg-secondary text-white px-3 py-1 rounded ml-2"
                        style={{ border: "none" }}>
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !foodVendorsLoading && (
          <p className="text-center text-gray-500 mt-6">No vendors found</p>
        )
      )}

      {/* Pagination */}
      {!foodVendorsLoading && foodVendorLength > itemsPerPage && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || foodVendorsLoading}
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || foodVendorsLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewFood;