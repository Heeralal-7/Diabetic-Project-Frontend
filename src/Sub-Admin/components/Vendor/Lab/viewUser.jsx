import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../../../Context/Context";
import Modal from "./Modal";

const ViewUserSA = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [valueChange, setValueChange] = useState(null);
  const [activeTab, setActiveTab] = useState("Tests");
  const [isDisable, setIsDisable] = useState(true);

  const {
    getVendortest,
    test,
    getVendorCoupon,
    coupon,
    searchVendorTest,
    searchTest,
    getVendorPackages,
    packages,
    documents,
    vendorDocuments,
    vendorStatus,
   

  } = useContext(MyContext);
  const LIMIT = process.env.REACT_APP_LIMIT;
  const [doc, setDoc] = useState();
  const [updateDoc, setUpdateDOc] = useState({});

  const handleClickValue = (value) => {
    console.log(value);
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
    debounceSearch(() => searchVendorTest(valueChange), 1000),
    [valueChange]
  );

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const flattenedSearchData = searchTest.flat();
  const isSearchDataValid =
    Array.isArray(flattenedSearchData) &&
    flattenedSearchData.length > 0 &&
    flattenedSearchData.some((item) => item !== null && item !== undefined);

  const vendorTest = isSearchDataValid ? flattenedSearchData : test;

  useEffect(() => {
    if (activeTab === "Tests") {
      getVendortest(id);
      console.log(1);
    } else if (activeTab === "Coupons") {
      getVendorCoupon(id);
      console.log(2);
    } else if (activeTab === "Packages") {
      getVendorPackages(id);
      console.log(3);
    } else if (activeTab === "Documents") {
      vendorDocuments(id);
      console.log(4);
    }
  }, [id, activeTab, setActiveTab]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
  };

  const handleSaveClick = () => {
    setEditingIndex(null);
    // Implement save logic here, e.g., call an API to save the changes
  };

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedTests = [...test];
    updatedTests[index][name] = value;
    // You can update the context or a local state if needed
  };

// const handleChange1 = async(id,isDisable)=>{
//   try {
//     const confirmation = window.confirm(
//       isDisable
//       ?"Are you sure you want to disbale the user?"
//       : "Are you sure you want to enable this user?"
//     );
//     if(confirmation){
//       await vendorStatus(id)
    

//     alert(
//       isDisable
//       ?"User has been successfully disable"
//       :"User has been successfully enable."
//     );
//     getAllVendorList((prevLabs)=>prevLabs.filter((Lab)=> Lab._id !==id));
//   } else{
//     console.log("Action cancelled")
//   }
//   } catch (error) {
//     console.log(error);
//     alert("somthing went wrong")
//   }
// };



  return (
    <>
      <ul
        class="nav nav-pills gap-3 navAndTabs1 mb-3"
        id="pills-tab"
        role="tablist"
      >
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="userTests-tab"
            data-bs-toggle="pill"
            data-bs-target="#userTests"
            type="button"
            role="tab"
            aria-controls="userTests"
            aria-selected="true"
            onClick={() => setActiveTab("Tests")}
          >
            Test
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="userCoupons-tab"
            data-bs-toggle="pill"
            data-bs-target="#userCoupons"
            type="button"
            role="tab"
            aria-controls="userCoupons"
            aria-selected="false"
            onClick={() => setActiveTab("Coupons")}
          >
            Coupons
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="userPackage-tab"
            data-bs-toggle="pill"
            data-bs-target="#userPackage"
            type="button"
            role="tab"
            aria-controls="userCoupons"
            aria-selected="false"
            onClick={() => setActiveTab("Packages")}
          >
            Packages
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="userDocument-tab"
            data-bs-toggle="pill"
            data-bs-target="#userDocument"
            type="button"
            role="tab"
            aria-controls="userDocument"
            aria-selected="false"
            onClick={() => setActiveTab("Documents")}
          >
            Documents
          </button>
        </li>
        {/* <li class="nav-item ms-auto me-5 pe-5" role="presentation">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckChecked"
              checked={isDisable}
              onChange={handleChange1}
            />
            <label
              className="form-check-label"
              htmlFor="flexSwitchCheckChecked"
            >
              {isDisable ? "Enable" : "Disable"}
            </label>
          </div>
        </li> */}
      </ul>

      <div class="tab-content" id="pills-tabContent">
        <div
          class="tab-pane fade show active"
          id="userTests"
          role="tabpanel"
          aria-labelledby="userTests-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  onChange={(e) => setValueChange(e.target.value)}
                  //   onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
              <h1 className="text-center w-60" style={{}}>
                Vendor Tests
              </h1>
            </div>
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Test Category</th>
                    <th scope="col">Test Name</th>
                    <th scope="col">Test Type</th>
                    <th scope="col">Sample Required</th>
                    <th scope="col">Description</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "Tests" && (
                    <>
                      {vendorTest?.map((d, i) => (
                        <tr key={d._id}>
                          <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="testCategory"
                                value={d.testCategory}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.testCategory
                            )}
                          </td>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="testName"
                                value={d.testName}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.testName
                            )}
                          </td>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="testType"
                                value={d.testType}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.testType
                            )}
                          </td>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="sampleRequired"
                                value={d.sampleRequired}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.sampleRequired
                            )}
                          </td>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="description"
                                value={d.description}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.description
                            )}
                          </td>
                          <td>
                            {editingIndex === i ? (
                              <input
                                type="text"
                                name="amount"
                                value={d.amount}
                                onChange={(e) => handleChange(i, e)}
                              />
                            ) : (
                              d.amount
                            )}
                          </td>

                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div>
              {/* <nav aria-label="Page navigation">
            <ul
              className="pagination d-flex justify-content-between"
              style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
            >
              <li
                className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                style={{ cursor: "pointer" }}
                // onClick={handlePrevious}
              >
                <a className="page-link">Previous</a>
              </li>
              <li
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
                style={{ cursor: "pointer" }}
                // onClick={handleNext}
              >
                <a className="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav> */}
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="userCoupons"
          role="tabpanel"
          aria-labelledby="userCoupons-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  //   onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
              <h1 className="text-center w-60" style={{}}>
                Vendor Coupons
              </h1>
            </div>
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Coupon Code</th>
                    <th scope="col">Description</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">Expire Date</th>
                    <th scope="col">Percentage Discount</th>
                    <th scope="col">Limit Redeem</th>
                    {/* <th scope="col">ACTION</th> */}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "Coupons" && (
                    <>
                      {coupon?.map((d, i) => (
                        <>
                          <tr key={d._id}>
                            {/* <th scope="row">{(page - 1) * LIMIT + i + 1}</th> */}
                            <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                            <td>{d.couponCode}</td>
                            <td>{d.description}</td>
                            <td>{d.startDate}</td>
                            <td>{d.expireDate}</td>
                            <td>{d.percentageDiscount}</td>
                            <td>{d.limitRedeem}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-secondary bg-opacity-25 bg-gradient"
                                  type="button"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        </>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div>
              {/* <nav aria-label="Page navigation">
            <ul
              className="pagination d-flex justify-content-between"
              style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
            >
              <li
                className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                style={{ cursor: "pointer" }}
                // onClick={handlePrevious}
              >
                <a className="page-link">Previous</a>
              </li>
              <li
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
                style={{ cursor: "pointer" }}
                // onClick={handleNext}
              >
                <a className="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav> */}
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="userPackage"
          role="tabpanel"
          aria-labelledby="userPackage-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  //   onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
              <h1 className="text-center w-60" style={{}}>
                Vendor Package
              </h1>
            </div>
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Package Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Precautions</th>
                    <th scope="col">Test Type</th>
                    <th scope="col">Sample Required</th>
                    <th scope="col">Amount</th>
                    {/* <th scope="col">ACTION</th> */}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "Packages" && (
                    <>
                      {packages?.map((d, i) => (
                        <>
                          <tr key={d._id}>
                            {/* <th scope="row">{(page - 1) * LIMIT + i + 1}</th> */}
                            <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                            <td>{d.packageName}</td>
                            <td>{d.description}</td>
                            <td>{d.precautions}</td>
                            <td>
                              {d.testType && d.testType.length > 0 ? (
                                <ul>
                                  {d.testType.map((type, index) => (
                                    <li key={index}>{type}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>No test types</span>
                              )}
                            </td>
                            <td>
                              {d.sampleRequired &&
                              d.sampleRequired.length > 0 ? (
                                <ul>
                                  {d.sampleRequired.map((type, index) => (
                                    <li key={index}>{type}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>No Sample available</span>
                              )}
                            </td>
                            <td>{d.amount}</td>
                            <td>
                              <div className="btn-group">
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
                        </>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div>
              {/* <nav aria-label="Page navigation">
            <ul
              className="pagination d-flex justify-content-between"
              style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
            >
              <li
                className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                style={{ cursor: "pointer" }}
                // onClick={handlePrevious}
              >
                <a className="page-link">Previous</a>
              </li>
              <li
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
                style={{ cursor: "pointer" }}
                // onClick={handleNext}
              >
                <a className="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav> */}
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="userDocument"
          role="tabpanel"
          aria-labelledby="userDocument-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-5 mb-4">
              <div className="">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  //   onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
              <h1 className="text-center w-60" style={{}}>
                Vendor Documents
              </h1>
            </div>
            <div className="" style={{ width: "auto", overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Name</th>
                    <th scope="col">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "Documents" &&
                    documents?.map((d, i) => (
                      <>
                        {/* Row 1 for AadharCard */}
                        <tr key={d._id + "-aadhar"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                          <td>AadharCard</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${
                                d.AadharCard && d.AadharCard[0]
                              }`}
                              alt="AadharCard"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() =>
                                      handleClickValue("AadharCard")
                                    }
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2 for PanCard */}
                        <tr key={d._id + "-pan"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 2}</th>
                          <td>PanCard</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${
                                d.panCard && d.panCard[0]
                              }`}
                              alt="PanCard"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() => handleClickValue("PanCard")}
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        {/* Row 3 for Registration */}
                        <tr key={d._id + "-registration"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 3}</th>
                          <td>Registration</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${d.registrationNo}`}
                              alt="Registration"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() =>
                                      handleClickValue("Registration")
                                    }
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        {/* Row 4 for Licence */}
                        <tr key={d._id + "-licence"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 4}</th>
                          <td>Licence</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${d.licenceNo}`}
                              alt="Licence"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() => handleClickValue("Licence")}
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        {/* Row 5 for Accreditation */}
                        <tr key={d._id + "-accreditation"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 5}</th>
                          <td>Accreditation</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${d.accreditation}`}
                              alt="Accreditation"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() =>
                                      handleClickValue("Accreditation")
                                    }
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        {/* Row 6 for Driving Licence */}
                        <tr key={d._id + "-drivingLicence"}>
                          <th scope="row">{(page - 1) * LIMIT + i + 6}</th>
                          <td>Driving Licence</td>
                          <td>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${
                                d.drivingLicence && d.drivingLicence[0]
                              }`}
                              alt="DrivingLicence"
                              height={50}
                              width={50}
                            />
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-secondary"
                              >
                                Action
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">
                                  Toggle Dropdown
                                </span>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href="#">
                                    Approve
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() =>
                                      handleClickValue("DrivingLicence")
                                    }
                                  >
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      </>
                    ))}
                </tbody>
              </table>

              {/* Modal */}
              <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
                style={{ marginTop: "8rem" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">
                        Why you want to reject!!
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <textarea
                        className="p-2"
                        name=""
                        id=""
                        cols="48"
                        rows="7"
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button type="button" className="btn btn-primary">
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {/* <nav aria-label="Page navigation">
            <ul
              className="pagination d-flex justify-content-between"
              style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
            >
              <li
                className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
                style={{ cursor: "pointer" }}
                // onClick={handlePrevious}
              >
                <a className="page-link">Previous</a>
              </li>
              <li
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
                style={{ cursor: "pointer" }}
                // onClick={handleNext}
              >
                <a className="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewUserSA;
