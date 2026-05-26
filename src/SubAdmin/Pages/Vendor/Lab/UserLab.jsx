import React, { useCallback, useContext, useEffect, useState } from "react";
import { MyContext } from "../../../../Context/Context";
import { Link } from "react-router-dom";
import Loading from "../../../../Components/Loading";

const User = () => {
  const {
    // New subadmin context functions
    getLabVendorsSubadmin,
    updateLabVendorStatusSubadmin,
    getLabVendorsStatsSubadmin,
    searchVendorTestSubadmin,
    getInactiveLabsSubadmin,
    
    // State from new context
    labVendors,
    labVendorsLoading,
    labVendorsError,
    labVendorStats,
    
    // Existing functions that might still be needed
    searchVendor,
    searchData,
  } = useContext(MyContext);

  const [page, setPage] = useState(1);
  const [valueChange, setValueChange] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    country: "",
    state: "",
    city: ""
  });

  const LIMIT = process.env.REACT_APP_LIMIT;
  const URL = process.env.REACT_APP_API_URL;

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (labVendors?.pagination?.hasNext) setPage(page + 1);
  };

  useEffect(() => {
    fetchLabVendors();
  }, [page, filters]);

  const fetchLabVendors = async () => {
    await getLabVendorsSubadmin({
      page,
      limit: LIMIT,
      search: valueChange || "",
      ...filters
    });
  };

  let debounceSearch = (fx, delay) => {
    let id = null;
    return (e) => {
      if (id) {
        clearTimeout(id);
      }
      id = setTimeout(() => {
        fx(e);
      }, delay);
    };
  };

  const debouncedSearch = useCallback(
    debounceSearch(() => {
      fetchLabVendors();
    }, 400),
    [valueChange, page, filters]
  );

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const handleStatusToggle = async (id, isCurrentlyActive) => {
    try {
      const confirmation = window.confirm(
        isCurrentlyActive
          ? "Are you sure you want to disable this lab vendor?"
          : "Are you sure you want to enable this lab vendor?"
      );
      
      if (confirmation) {
        const result = await updateLabVendorStatusSubadmin(id);
        
        if (result.success) {
          alert(
            isCurrentlyActive
              ? "Lab vendor has been successfully disabled"
              : "Lab vendor has been successfully enabled"
          );
          // Refresh the list
          fetchLabVendors();
        } else {
          alert(result.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  const vendorDataLists = labVendors?.vendors || [];

  return (
    <>
      {vendorDataLists && vendorDataLists.length > 0 ? (
        <div className="p-3">
          <div style={{ marginBottom: "3rem" }} className="">
            <div className="" style={{ transform: "translateY(2.5rem)" }}>
              <input
                type="text"
                placeholder="Search Here..."
                onChange={(e) => setValueChange(e.target.value)}
              />
            </div>
            <h1 className="text-center" style={{}}>
              All Lab Users
            </h1>
            
            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-3">
                <select 
                  className="form-control"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="State"
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {labVendorsLoading && <Loading />}
          {labVendorsError && (
            <div className="alert alert-danger">{labVendorsError}</div>
          )}

          <div className="" style={{ width: "auto", overflowX: "auto" }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Image</th>
                  <th scope="col">VENDOR NAME</th>
                  <th scope="col">EMAIL</th>
                  <th scope="col">COUNTRY</th>
                  <th scope="col">STATE</th>
                  <th scope="col">CITY</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {vendorDataLists?.map((d, i) => (
                  <tr key={d._id}>
                    <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                    <td>
                      <img
                        src={`${URL}/vendor/avatar/${d.image}`}
                        className=""
                        style={{
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                        }}
                        alt={d.name}
                      />
                    </td>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.country}</td>
                    <td>{d.state}</td>
                    <td>{d.city}</td>
                    <td>
                      <span className={`badge ${d.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <button 
                          className={`btn ${d.isActive ? 'btn-warning' : 'btn-success'}`}
                          type="button"
                          onClick={() => handleStatusToggle(d._id, d.isActive)}
                          disabled={labVendorsLoading}
                        >
                          {d.isActive ? 'Disable' : 'Enable'}
                        </button>
                     
                        <Link to={`/subadmin-dashboard/lab/ViewLab/${d._id}`}>
                          <button
                            className="btn btn-secondary bg-opacity-25 bg-gradient"
                            type="button"
                          >
                            View
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {labVendors?.pagination && (
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
                  <li
                    className={`page-item ${!labVendors.pagination.hasNext ? "disabled" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={handleNext}
                  >
                    <a className="page-link" href="#">
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
              
              <div className="text-center">
                Page {page} of {labVendors.pagination.totalPages} 
                (Total: {labVendors.pagination.totalLabs} labs)
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-5">
          {labVendorsLoading ? (
            <Loading />
          ) : (
            <h2 className="text-center">No lab vendors found</h2>
          )}
        </div>
      )}
    </>
  );
};

export default User;