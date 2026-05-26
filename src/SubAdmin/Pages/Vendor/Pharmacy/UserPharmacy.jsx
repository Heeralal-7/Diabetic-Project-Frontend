import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../../../Context/Context'
import { Link } from 'react-router-dom';

const Userpharmacy = () => {
    const LIMIT = process.env.REACT_APP_LIMIT;
    const URL = process.env.REACT_APP_API_URL;

    const [page, setPage] = useState(1);
    const [valueChange, setValueChange] = useState("");

    const { 
        getPharmacyVendorsSubadmin, 
        updateVendorStatusSubadmin,
        vendorsSub,
        vendorsLoadingSub,
        vendorsErrorSub,
        paginationSub,
        subAdmin
    } = useContext(MyContext)

    const totalPages = paginationSub?.totalPages || 1;

    const handlePrevious = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    useEffect(() => {
        getPharmacyVendorsSubadmin({
            page, 
            limit: LIMIT,
            status: 'active'
        })
    }, [page]);

    const handleChange1 = async (id, isActive) => {
        try {
            const confirmation = window.confirm(
                isActive
                    ? "Are you sure you want to disable this pharmacy?"
                    : "Are you sure you want to enable this pharmacy?"
            );
            if (confirmation) {
                await updateVendorStatusSubadmin(id);
                alert(
                    isActive
                        ? "Pharmacy has been successfully disabled."
                        : "Pharmacy has been successfully enabled."
                );
                // Refresh the list
                getPharmacyVendorsSubadmin({
                    page, 
                    limit: LIMIT,
                    status: 'active'
                });
            } else {
                console.log("Action cancelled");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Check if subadmin has permission to view pharmacy vendors
    const canViewVendors = subAdmin?.permissions?.vendors?.pharmacy?.view;
    const canEditVendors = subAdmin?.permissions?.vendors?.pharmacy?.edit;

   

    return (
        <>
            {vendorsLoadingSub ? (
                <div className="d-flex justify-content-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : vendorsErrorSub ? (
                <div className="alert alert-danger m-3">
                    {vendorsErrorSub}
                </div>
            ) : vendorsSub && vendorsSub.length > 0 ? (
                <div className="p-3">
                    <div style={{ marginBottom: "3rem" }}>
                        <div style={{ transform: "translateY(2.5rem)" }}>
                            <input
                                type="text"
                                placeholder="Search Here..."
                                value={valueChange}
                                onChange={(e) => setValueChange(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <h1 className="text-center">
                            All Pharmacy Vendors
                        </h1>
                    </div>
                    <div style={{ width: "auto", overflowX: "auto" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">S.No</th>
                                    <th scope="col">Image</th>
                                    <th scope="col">VENDOR NAME</th>
                                    <th scope="col">BUSINESS</th>
                                    <th scope="col">EMAIL</th>
                                    <th scope="col">PHONE</th>
                                    <th scope="col">COUNTRY</th>
                                    <th scope="col">STATE</th>
                                    <th scope="col">CITY</th>
                                    <th scope="col">STATUS</th>
                                    <th scope="col">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendorsSub
                                    ?.filter((item) =>
                                        valueChange
                                            ? item.name?.toLowerCase().includes(valueChange.toLowerCase()) ||
                                            item.business?.toLowerCase().includes(valueChange.toLowerCase()) ||
                                            item.email?.toLowerCase().includes(valueChange.toLowerCase()) ||
                                            item.city?.toLowerCase().includes(valueChange.toLowerCase())
                                            : true
                                    )
                                    .map((d, i) => (
                                        <tr key={d._id}>
                                            <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                                            <td>
                                                {d.image && (
                                                    <img
                                                        src={`${URL}/${d.image}`}
                                                        style={{
                                                            borderRadius: "50%",
                                                            height: "50px",
                                                            width: "50px",
                                                            objectFit: 'cover'
                                                        }}
                                                        alt={d.name}
                                                    />
                                                )}
                                            </td>
                                            <td>{d.name}</td>
                                            <td>{d.business}</td>
                                            <td>{d.email}</td>
                                            <td>{d.phone}</td>
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
                                                    {canEditVendors && (
                                                        <button
                                                            className="btn btn-secondary bg-opacity-25 bg-gradient"
                                                            type="button"
                                                            onClick={() => handleChange1(d._id, d.isActive)}
                                                            disabled={vendorsLoadingSub}
                                                        >
                                                            {d.isActive ? 'Disable' : 'Enable'}
                                                        </button>
                                                    )}
                                                    <Link to={`/subadmin-dashboard/pharmacy/view/${d._id}`}>
                                                        <button className="btn btn-info bg-opacity-25 bg-gradient" type="button">
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
                                    className={`page-item ${page === 1 ? "disabled" : ""}`}
                                    style={{ cursor: page === 1 ? "not-allowed" : "pointer" }}
                                    onClick={handlePrevious}
                                >
                                    <span className="page-link">Previous</span>
                                </li>
                                <li className="page-item">
                                    <span className="page-link">
                                        Page {page} of {totalPages}
                                    </span>
                                </li>
                                <li
                                    className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                                    style={{ cursor: page >= totalPages ? "not-allowed" : "pointer" }}
                                    onClick={handleNext}
                                >
                                    <span className="page-link">Next</span>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            ) : (
                <div className="p-3">
                    <h2 className="text-center">No pharmacy vendors found</h2>
                </div>
            )}
        </>
    );
};

export default Userpharmacy;