import React, { useCallback, useContext, useEffect, useState } from "react";
import { MyContext } from "../../../../Context/Context";
import { Link } from "react-router-dom";
import Loading from "../../../../Components/Loading";

const User = () => {
  const {
    vendorLists,
    vendorStatus,
    getAllVendorList,
    vendorstats, 
    setVendorstatus,
    lengthD,
    searchVendor,
    searchData,
    isLoading,
    // ✅ Global filters add karein
    globalFilters,
    loadingFilters
  } = useContext(MyContext);
  
  const [page, setPage] = useState(1);
  const [valueChange, setValueChange] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const LIMIT = process.env.REACT_APP_LIMIT;
  const URL = process.env.REACT_APP_API_URL;

  // ✅ Component mount pe data fetch with global filters
  useEffect(() => {
    console.log("🔬 Lab Component mounted with global filters:", globalFilters);
    fetchLabData();
  }, []);

  // ✅ Global filters change hone pe automatically refresh
  useEffect(() => {
    console.log("🔄 Lab Component: Global filters changed", globalFilters);
    setPage(1); // Reset to first page when filters change
    fetchLabData();
  }, [globalFilters.country, globalFilters.state, globalFilters.city]);

  // ✅ Current page change pe data fetch
  useEffect(() => {
    if (page > 1) {
      fetchLabData();
    }
  }, [page]);

  const fetchLabData = async () => {
    setLocalLoading(true);
    try {
      console.log("📡 Lab Component: Fetching data with filters", globalFilters, "Page:", page);
      await getAllVendorList(globalFilters, page, LIMIT);
    } catch (error) {
      console.error("❌ Lab Component: Error fetching data", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page < lengthD ? page + 1 : page);
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
    debounceSearch(() => searchVendor(valueChange, page, LIMIT), 400),
    [valueChange, page]
  );

  useEffect(() => {
    debouncedSearch();
    vendorStatus();
  }, [debouncedSearch]);

  const flattenedSearchData = searchData.flat();
  const isSearchDataValid =
    Array.isArray(flattenedSearchData) &&
    flattenedSearchData.length > 0 &&
    flattenedSearchData.some((item) => item !== null && item !== undefined);

  const vendorDataLists = isSearchDataValid ? flattenedSearchData : vendorLists;

  const handleChange1 = async(id, isDisable) => {
    try {
      const confirmation = window.confirm(
        isDisable
        ?"Are you sure you want to disable the user?"
        : "Are you sure you want to enable this user?"
      );
      if(confirmation){
        await vendorStatus(id)
        alert(
          isDisable
          ?"User has been successfully disabled"
          :"User has been successfully enabled."
        );
        // ✅ Refresh data with current filters after status change
        await fetchLabData();
      } else{
        console.log("Action cancelled")
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong")
    }
  };

  // ✅ Loading state
  if (localLoading || loadingFilters || isLoading) {
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading lab vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {vendorDataLists && vendorDataLists.length > 0 ? (
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
            <div style={{ transform: "translateY(2.5rem)" }}>
              <input
                type="text"
                placeholder="Search Here..."
                onChange={(e) => setValueChange(e.target.value)}
                className="form-control"
                style={{ width: "300px" }}
              />
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={fetchLabData}
              disabled={localLoading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>
          <h1 className="text-center">
            All Lab Users
          </h1>
        </div>
        
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
                <th scope="col">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {vendorDataLists?.map((d, i) => (
                <tr key={d._id}>
                  <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                  <td>
                    <img
                      src={`${URL}/${d.image}`}
                      className=""
                      style={{
                        borderRadius: "50%",
                        height: "50px",
                        width: "50px",
                      }}
                      alt={d.name}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/50x50?text=No+Image';
                      }}
                    />
                  </td>
                  <td>{d.name}</td>
                  <td>{d.email}</td>
                  <td>{d.country || "-"}</td>
                  <td>{d.state || "-"}</td>
                  <td>{d.city || "-"}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <button 
                        className="btn btn-secondary bg-opacity-25 bg-gradient"
                        type="button"
                        onClick={() => handleChange1(d._id, d.isActive)}
                      >
                        {d.isActive ? 'Disable' : 'Enable'}
                      </button>
                     
                      <Link to={`/dashboard/lab/userview/${d._id}`}>
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
                Page {page} of {lengthD}
              </span>
              
              <li
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
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
            <h2>No Lab Users Found</h2>
            <p className="text-muted">
              {globalFilters.country || valueChange ? 
                `No lab users found for the selected filters.` : 
                `No lab users available.`
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

export default User;