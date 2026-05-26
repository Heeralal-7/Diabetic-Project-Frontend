import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../../Context/Context";

const UserManagementSubadmin = () => {
  const {
    users,
    usersLoading,
    usersError,
    getUsersSubadmin,
    updateUserStatusSubadmin,
    clearUsersError
  } = useContext(MyContext);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState({
    country: "",
    state: "",
    city: ""
  });

  const LIMIT = 10;
  const URL = process.env.REACT_APP_API_URL;

  // Fetch users with filters
  useEffect(() => {
    const fetchUsers = async () => {
      await getUsersSubadmin({
        page,
        limit: LIMIT,
        search: searchTerm,
        status: statusFilter,
        country: locationFilter.country,
        state: locationFilter.state,
        city: locationFilter.city
      });
    };

    fetchUsers();
  }, [page, searchTerm, statusFilter, locationFilter]);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    // Since we don't have pagination info, just increment page
    setPage(page + 1);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const confirmation = window.confirm(
        currentStatus
          ? "Are you sure you want to disable this user?"
          : "Are you sure you want to enable this user?"
      );

      if (confirmation) {
        const result = await updateUserStatusSubadmin(userId, !currentStatus);
        
        if (result.success) {
          alert(
            currentStatus
              ? "User has been successfully disabled."
              : "User has been successfully enabled."
          );
          // Refresh the users list
          await getUsersSubadmin({
            page,
            limit: LIMIT,
            search: searchTerm,
            status: statusFilter
          });
        } else {
          alert(result.message || "Failed to update user status.");
        }
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleLocationFilterChange = (field, value) => {
    setLocationFilter(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setLocationFilter({
      country: "",
      state: "",
      city: ""
    });
    setPage(1);
  };

  // FIX: Check if users is an array directly or nested in data property
  const displayUsers = Array.isArray(users) 
    ? users 
    : users?.users || users?.data?.users || [];

  console.log("Final display users:", displayUsers);

  if (usersLoading && page === 1) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center mb-0">All Users</h1>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Filters Section */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Country"
            value={locationFilter.country}
            onChange={(e) => handleLocationFilterChange('country', e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="State"
            value={locationFilter.state}
            onChange={(e) => handleLocationFilterChange('state', e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="City"
            value={locationFilter.city}
            onChange={(e) => handleLocationFilterChange('city', e.target.value)}
          />
        </div>
      </div>

    

      {usersError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {usersError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearUsersError}
          ></button>
        </div>
      )}

      {/* FIX: Use displayUsers directly */}
      {displayUsers.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table">
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Image</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Country</th>
                  <th scope="col">State</th>
                  <th scope="col">City</th>
                  <th scope="col">Status</th>
                  <th scope="col">Registered</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user, index) => (
                  <tr key={user._id}>
                    <th scope="row">{(page - 1) * LIMIT + index + 1}</th>
                    <td>
                      <img
                        src={
                          user.image 
                            ? `${URL}/${user.image}`
                            : "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"
                        }
                        className="rounded-circle"
                        style={{
                          height: "50px",
                          width: "50px",
                          objectFit: "cover"
                        }}
                        alt={user.name}
                      />
                    </td>
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.number || "N/A"}</td>
                    <td>{user.country || "N/A"}</td>
                    <td>{user.state || "N/A"}</td>
                    <td>{user.city || "N/A"}</td>
                    <td>
                      <span 
                        className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : "N/A"
                      }
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          disabled={usersLoading}
                        >
                          {usersLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : user.isActive ? (
                            "Disable"
                          ) : (
                            "Enable"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination - Since we don't have pagination info */}
          <nav aria-label="Page navigation" className="mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {((page - 1) * LIMIT) + 1} to {Math.min(page * LIMIT, displayUsers.length)} of users
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={handlePrevious}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{page}</span>
                </li>
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </>
      ) : (
        !usersLoading && (
          <div className="text-center py-5">
            <h2 className="text-muted">No users found</h2>
            <p className="text-muted">Try adjusting your search or filters</p>
          </div>
        )
      )}

      {usersLoading && page > 1 && (
        <div className="text-center py-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading more users...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementSubadmin;