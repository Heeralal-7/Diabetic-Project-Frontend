import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../../../Context/Context'
import { Link } from 'react-router-dom';

const Userpharmacy = () => {
    const LIMIT = process.env.REACT_APP_LIMIT;
    const URL = process.env.REACT_APP_API_URL;

    const [page, setPage] = useState(1);
    const [valueChange, setValueChange] = useState("");
    const [localLoading, setLocalLoading] = useState(false);

    const { 
        getPharmacist, 
        vendorStatus, 
        pharmacyLength, 
        pharmacy,
        // ✅ Global filters add karein
        globalFilters,
        loadingFilters
    } = useContext(MyContext)

    const totalPages = Math.ceil(pharmacyLength / LIMIT);

    // ✅ Component mount pe data fetch with global filters
    useEffect(() => {
        console.log("💊 Pharmacy Component mounted with global filters:", globalFilters);
        fetchPharmacyData();
    }, []);

    // ✅ Global filters change hone pe automatically refresh
    useEffect(() => {
        console.log("🔄 Pharmacy Component: Global filters changed", globalFilters);
        setPage(1); // Reset to first page when filters change
        fetchPharmacyData();
    }, [globalFilters.country, globalFilters.state, globalFilters.city]);

    // ✅ Current page change pe data fetch
    useEffect(() => {
        if (page > 1) {
            fetchPharmacyData();
        }
    }, [page]);

    const fetchPharmacyData = async () => {
        setLocalLoading(true);
        try {
            console.log("📡 Pharmacy Component: Fetching data with filters", globalFilters, "Page:", page);
            await getPharmacist(globalFilters, page, LIMIT);
        } catch (error) {
            console.error("❌ Pharmacy Component: Error fetching data", error);
        } finally {
            setLocalLoading(false);
        }
    };

    const handlePrevious = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handleChange1 = async (id, isDisable) => {
        try {
            const confirmation = window.confirm(
                isDisable
                    ? "Are you sure you want to disable this user?"
                    : "Are you sure you want to enable this user?"
            );
            if (confirmation) {
                await vendorStatus(id);
                alert(
                    isDisable
                        ? "User has been successfully disabled."
                        : "User has been successfully enabled."
                );
                // ✅ Refresh data with current filters after status change
                await fetchPharmacyData();
            } else {
                console.log("Action cancelled");
            }
        } catch (error) {
            console.log(error);
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
                    <p className="mt-2">Loading pharmacy vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {pharmacy && pharmacy.length > 0 ? (
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

                    <div style={{ marginBottom: "3rem" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div style={{ transform: "translateY(2.5rem)" }}>
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
                                onClick={fetchPharmacyData}
                                disabled={localLoading}
                            >
                                <i className="fas fa-sync-alt me-1"></i>
                                Refresh
                            </button>
                        </div>
                        <h1 className="text-center">
                            All Pharmacy Users
                        </h1>
                    </div>
                    
                    <div style={{ width: "auto", overflowX: "auto" }}>
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
                                {pharmacy
                                    ?.filter((item) =>
                                        valueChange
                                            ? item.name?.toLowerCase().includes(valueChange.toLowerCase()) ||
                                            item.email?.toLowerCase().includes(valueChange.toLowerCase()) ||
                                            item.city?.toLowerCase().includes(valueChange.toLowerCase())
                                            : true
                                    )
                                    .map((d, i) => (
                                        <tr key={d._id}>
                                            <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                                            <td>
                                                <img
                                                    src={`${URL}/${d.image}`}
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
                                                    <Link to={`/dashboard/pharmacy/viewuser/${d._id}`}>
                                                        <button className="btn btn-secondary bg-opacity-25 bg-gradient" type="button">
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
                            <ul className="pagination d-flex justify-content-between" style={{ paddingRight: "5rem", paddingLeft: "5rem" }}>
                                <li
                                    className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                                    style={{ cursor: "pointer" }}
                                    onClick={handlePrevious}
                                >
                                    <a className="page-link">Previous</a>
                                </li>
                                
                                <span className="px-4 py-2">
                                    Page {page} of {totalPages}
                                </span>
                                
                                <li
                                    className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={handleNext}
                                >
                                    <a className="page-link">Next</a>
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
                            <h2>No Pharmacy Users Found</h2>
                            <p className="text-muted">
                                {globalFilters.country || valueChange ? 
                                    `No pharmacy users found for the selected filters.` : 
                                    `No pharmacy users available.`
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

export default Userpharmacy;