import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { Link } from "react-router-dom";
import Loading from "../../Components/Loading";

const Abc = () => {
  const {
    userS: getallusers,
    userList, // ✅ Correct state name use karein
    userLength,
    vendorStatus,
    // ✅ Global filters add karein
    globalFilters,
    loadingFilters
  } = useContext(MyContext);
  
  const [page, setPage] = useState(1);
  const [valueChange, setValueChange] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const LIMIT = process.env.REACT_APP_LIMIT;
  const URL = process.env.REACT_APP_API_URL;

  // ✅ Component mount pe data fetch with global filters
  useEffect(() => {
    console.log("👥 Users Component mounted with global filters:", globalFilters);
    fetchUsersData();
  }, []);

  // ✅ Global filters change hone pe automatically refresh
  useEffect(() => {
    console.log("🔄 Users Component: Global filters changed", globalFilters);
    setPage(1); // Reset to first page when filters change
    fetchUsersData();
  }, [globalFilters.country, globalFilters.state, globalFilters.city]);

  // ✅ Current page change pe data fetch
  useEffect(() => {
    if (page > 1) {
      fetchUsersData();
    }
  }, [page]);

  const fetchUsersData = async () => {
    setLocalLoading(true);
    try {
      console.log("📡 Users Component: Fetching data with filters", globalFilters, "Page:", page);
      await getallusers(globalFilters, page, LIMIT);
    } catch (error) {
      console.error("❌ Users Component: Error fetching data", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page < userLength ? page + 1 : page);
  };

  const handleChange1 = async (id, isDisable) => {
    try {
      const confirmation = window.confirm(
        isDisable
          ? "Are you sure you want to disable the user?"
          : "Are you sure you want to enable the user?"
      );
  
      if (confirmation) {
        await vendorStatus(id);
  
        // Show alert after successful action
        alert(
          isDisable
            ? "User has been successfully disabled."
            : "User has been successfully enabled."
        );
  
        // ✅ Refresh data with current filters after status change
        await fetchUsersData();
      } else {
        console.log("Action cancelled.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again later.");
    }
  };

  // ✅ Loading state
  if (localLoading || loadingFilters) {
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {userList && userList.length > 0 ? (
        <div className="p-3">
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

          <div style={{ marginBottom: "3rem" }} className="">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Search Here..."
                  value={valueChange}
                  onChange={(e) => setValueChange(e.target.value)}
                  className="form-control"
                  style={{ width: "300px" }}
                />
              </div>
              <button
                className="btn btn-outline-primary"
                onClick={fetchUsersData}
                disabled={localLoading}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
            <h1 className="text-center">
              All Users ({userList.length})
            </h1>
          </div>
          
          <div className="" style={{ width: "auto", overflowX: "auto" }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Image</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Country</th>
                  <th scope="col">State</th>
                  <th scope="col">City</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {userList
                  ?.filter((item) =>
                    valueChange
                      ? item.name?.toLowerCase().includes(valueChange.toLowerCase()) ||
                        item.email?.toLowerCase().includes(valueChange.toLowerCase()) ||
                        item.number?.toLowerCase().includes(valueChange.toLowerCase())
                      : true
                  )
                  ?.map((d, i) => (
                    <tr key={d._id}>
                      <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                      <td>
                        <img
                          src={d.image ? `${URL}/${d.image}` : "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"}
                          className=""
                          style={{
                            borderRadius: "50%",
                            height: "50px",
                            width: "50px",
                          }}
                          alt={d.name}
                          onError={(e) => {
                            e.target.src = "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png";
                          }}
                        />
                      </td>
                      <td>{d.name}</td>
                      <td>{d.email}</td>
                      <td>{d.country || "-"}</td>
                      <td>{d.state || "-"}</td>
                      <td>{d.city || "-"}</td>
                      <td>{d.number}</td>
                      <td>
                        <span className={`badge ${d.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-secondary bg-opacity-25 bg-gradient"
                            type="button"
                            onClick={() => handleChange1(d._id, d.isActive)}
                          >
                            {d.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          <div>
            <nav aria-label="Page navigation" style={{ marginTop: "1rem" }}>
              <ul
                className="pagination d-flex justify-content-between"
                style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
              >
                <li
                  className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                  style={{ cursor: "pointer" }}
                  onClick={handlePrevious}
                >
                  <a className="page-link">Previous</a>
                </li>
                
                <span className="px-4 py-2">
                  Page {page} of {userLength}
                </span>
                
                <li
                  className={`page-item ${page >= userLength ? "disabled" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={handleNext}
                >
                  <a className="page-link" href="#">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <div className="p-3">
          {/* ✅ Active Filters Display even when no data */}
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
          
          <div className="card">
            <div className="card-body text-center py-5">
              <h2>No Users Found</h2>
              <p className="text-muted">
                {globalFilters.country || valueChange ? 
                  `No users found for the selected filters.` : 
                  `No users available.`
                }
              </p>
              {(globalFilters.country || valueChange) && (
                <button 
                  className="btn btn-outline-primary mt-2"
                  onClick={() => {
                    setValueChange('');
                    // Yahan aap clearGlobalFilters function call kar sakte hain agar available ho
                  }}
                >
                  Clear Search & Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Abc;