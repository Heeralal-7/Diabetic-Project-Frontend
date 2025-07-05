//AddFood.jsx
import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Link } from 'react-router-dom';
 
const ViewFoodSA = () => {
  const {
    foodVendors,
    foodVendorLength,
    getAllFoodVendors,
    toggleFoodVendorStatus,
    searchFoodVendors,
    getInactiveFoodVendors,
    getFoodCategory,
    foodCategory,
    yourmind,
    Mealcategory,
    getdiscountfood,
    getTopKitchen,
  } = useContext(MyContext);
 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCategories, setShowCategories] = useState(false);
  const [showMealCategories, setShowMealCategories] = useState(false);
  const itemsPerPage = 10;
 
  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        await searchFoodVendors(searchTerm, currentPage, itemsPerPage, selectedStatus);
      } else {
        if (selectedStatus === 'inactive') {
          await getInactiveFoodVendors(currentPage, itemsPerPage);
        } else {
          await getAllFoodVendors(currentPage, itemsPerPage, selectedStatus);
        }
      }
    };
    fetchData();
  }, [currentPage, searchTerm, selectedStatus]);
 
  // Load food-related data on component mount
  useEffect(() => {
    getFoodCategory();
    yourmind();
    getdiscountfood();
    getTopKitchen();
  }, []);
 
  const handleStatusToggle = async (vendorId) => {
    await toggleFoodVendorStatus(vendorId);
    // Refresh data
    if (searchTerm) {
      await searchFoodVendors(searchTerm, currentPage, itemsPerPage, selectedStatus);
    } else {
      if (selectedStatus === 'inactive') {
        await getInactiveFoodVendors(currentPage, itemsPerPage);
      } else {
        await getAllFoodVendors(currentPage, itemsPerPage, selectedStatus);
      }
    }
  };
 
  const totalPages = Math.ceil(foodVendorLength / itemsPerPage);
 
  return (
    <div className="p-4">
      <h2 className="text-center mb-6 text-3xl font-semibold">All Food Vendors</h2>
 
      {/* Food Management Buttons */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        <button
          className="bg-primary text-white px-3 py-2 rounded"
          onClick={() => setShowCategories(!showCategories)}
          style={{ border: "none" }}
        >
          {showCategories ? 'Hide' : 'Show'} Food Categories ({foodCategory?.length || 0})
        </button>
        <button
          className="bg-info text-white px-3 py-2 rounded"
          onClick={() => setShowMealCategories(!showMealCategories)}
          style={{ border: "none" }}
        >
          {showMealCategories ? 'Hide' : 'Show'} Meal Categories ({Mealcategory?.length || 0})
        </button>
      </div>
 
      {/* Food Categories Display */}
      {showCategories && (
        <div className="mb-4 p-3 border rounded">
          <h4>Food Categories</h4>
          <div className="row">
            {foodCategory?.map((category, index) => (
              <div key={index} className="col-md-3 mb-2">
                <div className="card">
                  <div className="card-body p-2">
                    {category.image && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${category.image}`}
                        alt={category.name}
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        className="me-2"
                      />
                    )}
                    <span>{category.name || category.categoryName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Meal Categories Display */}
      {showMealCategories && (
        <div className="mb-4 p-3 border rounded">
          <h4>Meal Categories</h4>
          <div className="row">
            {Mealcategory?.map((meal, index) => (
              <div key={index} className="col-md-3 mb-2">
                <div className="card">
                  <div className="card-body p-2">
                    {meal.image && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${meal.image}`}
                        alt={meal.name}
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        className="me-2"
                      />
                    )}
                    <span>{meal.name || meal.mealType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
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
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm " style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <img
                          src="https://placehold.co/64x64?text=No+Image&font=roboto"
                          alt="No Image"
                          className="w-16 h-16 rounded-full object-cover" style={{ width: "50px", height: "50px", borderRadius: "50%" }}
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
                      <button className=" bg-secondary text-white px-2 py-2 rounded ml-2"
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
        <p className="text-center text-gray-500 mt-6">No vendors found</p>
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
 
export default ViewFoodSA;
 