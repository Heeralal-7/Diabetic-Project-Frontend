import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../../../Context/Context'
import { Link } from 'react-router-dom';

const Userpharmacy = () => {
    const LIMIT = process.env.REACT_APP_LIMIT;
    const URL = process.env.REACT_APP_API_URL;

    const [page, setPage] = useState(1);
    const [valueChange, setValueChange] = useState("");

    const { getPharmacist, vendorStatus, pharmacyLength, pharmacy } = useContext(MyContext)

    const totalPages = Math.ceil(pharmacyLength / LIMIT);

    const handlePrevious = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    useEffect(() => {
        getPharmacist(page, LIMIT)
    }, [page]);

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
                getPharmacist((prepharmacist) => prepharmacist.filter((Pharmacy) => Pharmacy._id !== id));
            } else {
                console.log("Action cancelled");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {pharmacy && pharmacy.length > 0 ? (
                <div className="p-3">
                    <div style={{ marginBottom: "3rem" }}>
                        <div style={{ transform: "translateY(2.5rem)" }}>
                            <input
                                type="text"
                                placeholder="Search Here..."
                                value={valueChange}
                                onChange={(e) => setValueChange(e.target.value)}
                            />
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
                                                />
                                            </td>
                                            <td>{d.name}</td>
                                            <td>{d.email}</td>
                                            <td>{d.country}</td>
                                            <td>{d.state}</td>
                                            <td>{d.city}</td>
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
                <h2 className="text-center">No user found</h2>
            )}
        </>
    );
};

export default Userpharmacy;
