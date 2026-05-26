import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Link } from 'react-router-dom';
 
const ViewFood = () => {
  const {
    foodVendors,
    foodVendorLength,
    getAllFoodVendors,
    toggleFoodVendorStatus,
    searchFoodVendors,
    getInactiveFoodVendors,
    globalFilters, // ✅ Global filters access karein
    loadingFilters // ✅ Loading state track karein
  } = useContext(MyContext);
 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localLoading, setLocalLoading] = useState(false);
  const itemsPerPage = 10;

  // ✅ Component mount pe data fetch karein with global filters
  useEffect(() => {
    console.log("🍕 Food Component mounted with global filters:", globalFilters);
    fetchFoodData();
  }, []);

  // ✅ Global filters change hone pe automatically refresh
  useEffect(() => {
    console.log("🔄 Food Component: Global filters changed", globalFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchFoodData();
  }, [globalFilters.country, globalFilters.state, globalFilters.city]);

  // ✅ Current page change pe data fetch
  useEffect(() => {
    if (currentPage > 1) {
      fetchFoodData();
    }
  }, [currentPage]);

  const fetchFoodData = async () => {
    setLocalLoading(true);
    try {
      console.log("📡 Food Component: Fetching data with filters", globalFilters, "Page:", currentPage);
      
      if (searchTerm) {
        await searchFoodVendors(searchTerm, currentPage, itemsPerPage, selectedStatus);
      } else {
        if (selectedStatus === 'inactive') {
          await getInactiveFoodVendors(currentPage, itemsPerPage);
        } else {
          // ✅ IMPORTANT: Global filters pass karein
          await getAllFoodVendors(globalFilters, currentPage, itemsPerPage, selectedStatus);
        }
      }
    } catch (error) {
      console.error("❌ Food Component: Error fetching data", error);
    } finally {
      setLocalLoading(false);
    }
  };
 
  const handleStatusToggle = async (vendorId) => {
    await toggleFoodVendorStatus(vendorId);
    // Refresh data with current filters
    await fetchFoodData();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  // Search effect - debounce add karein
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchFoodData();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Status change effect
  useEffect(() => {
    if (selectedStatus !== 'all') {
      fetchFoodData();
    }
  }, [selectedStatus]);

  const totalPages = Math.ceil(foodVendorLength / itemsPerPage);

  // ✅ Loading state
  if (localLoading || loadingFilters) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading food vendors...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="p-4">
      <h2 className="text-center mb-6 text-3xl font-semibold">All Food Vendors</h2>

      {/* ✅ Active Filters Display */}
      {(globalFilters.country || globalFilters.state || globalFilters.city) && (
        <div className="mb-4 p-3 bg-light rounded">
          <small className="text-muted">
            <i className="fas fa-filter me-1"></i>
            <strong>Active Location Filters:</strong>
            {globalFilters.country && <span className="badge bg-primary ms-2">Country: {globalFilters.country}</span>}
            {globalFilters.state && <span className="badge bg-success ms-2">State: {globalFilters.state}</span>}
            {globalFilters.city && <span className="badge bg-info ms-2">City: {globalFilters.city}</span>}
          </small>
        </div>
      )}
 
      {/* Search and Filter Controls */}
      <div className="mb-4 d-flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search Here..."
          className="border p-2 rounded"
          style={{ width: "300px" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        
        <select
          className="border p-2 rounded"
          value={selectedStatus}
          onChange={handleStatusChange}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button
          className="btn btn-outline-primary"
          onClick={fetchFoodData}
          disabled={localLoading}
        >
          <i className="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
 
      {/* Table */}
      {foodVendors && foodVendors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table table-striped">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th className="p-3">S.No</th>
                <th className="p-3">Image</th>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Country</th>
                <th className="p-3">State</th>
                <th className="p-3">City</th>
                <th className="p-3">Status</th>
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
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <img
                          src="https://placehold.co/64x64?text=No+Image&font=roboto"
                          alt="No Image"
                          className="w-16 h-16 rounded-full object-cover"
                          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="p-3">{vendor.name}</td>
                  <td className="p-3">{vendor.email}</td>
                  <td className="p-3">{vendor.country || "-"}</td>
                  <td className="p-3">{vendor.state || "-"}</td>
                  <td className="p-3">{vendor.city || "-"}</td>
                  <td className="p-3">
                    <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 d-flex gap-2">
                    <button
                      className="bg-secondary text-white px-2 py-2 rounded"
                      onClick={() => handleStatusToggle(vendor._id)}
                      style={{ border: "none" }}
                    >
                      {vendor.isActive ? "Disable" : "Enable"}
                    </button>
                    <Link to={`/dashboard/ViewFood/${vendor._id}`}>
                      <button className="bg-secondary text-white px-2 py-2 rounded ml-2"
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
        <div className="card">
          <div className="card-body text-center py-5">
            <h5>No Food Vendors Found</h5>
            <p className="text-muted">
              {globalFilters.country || searchTerm ? 
                `No food vendors found for the selected filters.` : 
                `No food vendors available.`
              }
            </p>
            {(globalFilters.country || searchTerm) && (
              <button 
                className="btn btn-outline-primary mt-2"
                onClick={() => {
                  setSearchTerm('');
                  // Clear filters function call karein agar available ho
                }}
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        </div>
      )}
 
      {/* Pagination */}
      {foodVendorLength > itemsPerPage && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
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