import { useState } from "react";

import { Link } from "react-router-dom";

const FoodIdSA = () => {
  // State management

  const [page, setPage] = useState(1);

  const [editingIndex, setEditingIndex] = useState(null);

  const [valueChange, setValueChange] = useState(null);

  const [activeTab, setActiveTab] = useState("Tests");

  const [isDisable, setIsDisable] = useState(true);

  const [verificationStatus, setVerificationStatus] = useState({});

  // Dummy data state

  const [test] = useState([
    {
      _id: "test1",

      testCategory: "Blood Test",

      testName: "Complete Blood Count",

      testType: "Diagnostic",

      sampleRequired: "Blood Sample",

      description: "Measures various components in your blood",

      amount: "$35",
    },
  ]);

  const [coupon] = useState([
    {
      _id: "coupon1",

      couponCode: "HEALTH25",

      description: "25% discount on all blood tests",

      startDate: "01/05/2025",

      expireDate: "30/05/2025",

      percentageDiscount: "25%",

      limitRedeem: "100",
    },
  ]);

  const [packages] = useState([
    {
      _id: "pkg1",

      packageName: "Executive Health Check",

      description: "Complete health assessment for executives",

      precautions: "Fasting required for 8-10 hours",

      testType: ["Blood Chemistry", "ECG", "Ultrasound"],

      sampleRequired: ["Blood", "Urine"],

      amount: "$199",
    },
  ]);

  const [documents] = useState([
    {
      _id: "doc1",

      AadharCard: ["aadharimage"],

      panCard: ["panimage"],

      registrationNo: "regimage",

      licenceNo: "licenceimage",

      accreditation: "accredimage",

      drivingLicence: ["drivingimage"],
    },
  ]);

  const LIMIT = 10;

  // Edit and save handlers

  const handleEditClick = (index) => {
    setEditingIndex(index);
  };

  const handleSaveClick = () => {
    setEditingIndex(null);
  };

  const handleChange = (index, event) => {
    // This would update the test data in a real application
    // Omitted for dummy implementation
  };

  const handleClickValue = (value) => {
    console.log(value);
  };

  // Handle verification status

  const handleApprove = (docId, documentType) => {
    setVerificationStatus({
      ...verificationStatus,

      [`${docId}-${documentType}`]: "approved",
    });
  };

  const handleReject = (docId, documentType) => {
    setVerificationStatus({
      ...verificationStatus,

      [`${docId}-${documentType}`]: "rejected",
    });
  };

  // Handle approve all documents

  const handleApproveAll = () => {
    const newStatus = {};

    documents.forEach((doc) => {
      newStatus[`${doc._id}-aadhar`] = "approved";

      newStatus[`${doc._id}-pan`] = "approved";

      newStatus[`${doc._id}-registration`] = "approved";

      newStatus[`${doc._id}-licence`] = "approved";

      newStatus[`${doc._id}-accreditation`] = "approved";

      newStatus[`${doc._id}-driving`] = "approved";
    });

    setVerificationStatus(newStatus);
  };

  // Handle reject all documents

  const handleRejectAll = () => {
    const newStatus = {};

    documents.forEach((doc) => {
      newStatus[`${doc._id}-aadhar`] = "rejected";

      newStatus[`${doc._id}-pan`] = "rejected";

      newStatus[`${doc._id}-registration`] = "rejected";

      newStatus[`${doc._id}-licence`] = "rejected";

      newStatus[`${doc._id}-accreditation`] = "rejected";

      newStatus[`${doc._id}-driving`] = "rejected";
    });

    setVerificationStatus(newStatus);
  };

  return (
    <div className="container-fluid px-0">
      <ul
        className="nav nav-pills flex-column flex-sm-row gap-2 navAndTabs1 mb-3"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Tests" ? "active" : ""}`}
            id="userTests-tab"
            data-bs-toggle="pill"
            data-bs-target="#userTests"
            type="button"
            role="tab"
            aria-controls="userTests"
            aria-selected={activeTab === "Tests"}
            onClick={() => setActiveTab("Tests")}
          >
            Test
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Coupons" ? "active" : ""}`}
            id="userCoupons-tab"
            data-bs-toggle="pill"
            data-bs-target="#userCoupons"
            type="button"
            role="tab"
            aria-controls="userCoupons"
            aria-selected={activeTab === "Coupons"}
            onClick={() => setActiveTab("Coupons")}
          >
            Coupons
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Packages" ? "active" : ""}`}
            id="userPackage-tab"
            data-bs-toggle="pill"
            data-bs-target="#userPackage"
            type="button"
            role="tab"
            aria-controls="userPackage"
            aria-selected={activeTab === "Packages"}
            onClick={() => setActiveTab("Packages")}
          >
            Packages
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Documents" ? "active" : ""}`}
            id="userDocument-tab"
            data-bs-toggle="pill"
            data-bs-target="#userDocument"
            type="button"
            role="tab"
            aria-controls="userDocument"
            aria-selected={activeTab === "Documents"}
            onClick={() => setActiveTab("Documents")}
          >
            Documents
          </button>
        </li>
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {/* Tests Tab */}

        <div
          className={`tab-pane fade ${
            activeTab === "Tests" ? "show active" : ""
          }`}
          id="userTests"
          role="tabpanel"
          aria-labelledby="userTests-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                  onChange={(e) => setValueChange(e.target.value)}
                />
              </div>
            </div>

            <h1 className="text-center flex-grow-1 fs-2 my-4 fs-lg-1">
              Food Tests
            </h1>

            <div className="table-responsive">
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

                    <th scope="col">Verification</th>
                  </tr>
                </thead>

                <tbody>
                  {test.map((d, i) => (
                    <tr key={d._id || i}>
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

                      <td>
                        <div className="d-flex gap-2">
                          {editingIndex === i ? (
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={handleSaveClick}
                            >
                              Save
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                type="button"
                              >
                                Approve
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coupons Tab */}

        <div
          className={`tab-pane fade ${
            activeTab === "Coupons" ? "show active" : ""
          }`}
          id="userCoupons"
          role="tabpanel"
          aria-labelledby="userCoupons-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <h1 className="text-center flex-grow-1 my-4 fs-2 fs-lg-1">
              Food Coupons
            </h1>

            <div className="table-responsive">
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

                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {coupon.map((d, i) => (
                    <tr key={d._id || i}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packages Tab */}

        <div
          className={`tab-pane fade ${
            activeTab === "Packages" ? "show active" : ""
          }`}
          id="userPackage"
          role="tabpanel"
          aria-labelledby="userPackage-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <h1 className="text-center flex-grow-1 fs-2 my-4 fs-lg-1">
              Doctor Package
            </h1>

            <div className="table-responsive">
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

                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {packages.map((d, i) => (
                    <tr key={d._id || i}>
                      <th scope="row">{(page - 1) * LIMIT + i + 1}</th>

                      <td>{d.packageName}</td>

                      <td>{d.description}</td>

                      <td>{d.precautions}</td>

                      <td>
                        {d.testType && d.testType.length > 0 ? (
                          <ul className="list-unstyled mb-0">
                            {d.testType.map((type, index) => (
                              <li key={index}>{type}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>No test types</span>
                        )}
                      </td>

                      <td>
                        {d.sampleRequired && d.sampleRequired.length > 0 ? (
                          <ul className="list-unstyled mb-0">
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
                          <Link to={`/view-package/${d._id}`}>
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
          </div>
        </div>

        {/* Documents Tab - IMPROVED */}

        <div
          className={`tab-pane fade ${
            activeTab === "Documents" ? "show active" : ""
          }`}
          id="userDocument"
          role="tabpanel"
          aria-labelledby="userDocument-tab"
          tabIndex="0"
        >
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-5 mb-4">
              <div className="w-25 w-md-auto">
                <input
                  type="search"
                  placeholder="Search Here..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <div>
              <h1 className=" flex-grow-1 fs-2 fs-lg-1 text-center my-4">
                Food Documents
              </h1>
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr className="text-center">
                    <th scope="col">S.No</th>

                    <th scope="col">Document Name</th>

                    <th scope="col" className="text-center">
                      Document Image
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((d, i) => (
                    <tr
                      key={`${d._id || i}-aadhar`}
                      className="align-middle text-center"
                    >
                      <th scope="row">{(page - 1) * LIMIT + 1}</th>

                      <td className="text-center">Aadhar Card</td>

                      <td>
                        <div className="d-flex justify-content-center">
                          <img
                            src={`${
                              d.AadharCard && d.AadharCard.length > 0
                                ? `https://images.pexels.com/photos/675920/pexels-photo-675920.jpeg?${d.AadharCard[0]}`
                                : "/placeholder.jpg"
                            }`}
                            alt="Aadhar Card"
                            className=""
                            style={{
                              height: "50px",
                              width: "50px",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Added Approve and Reject buttons below the table */}

            <div className="d-flex justify-content-start mt-4 gap-3">
              <button
                className="btn btn-success px-4 py-2"
                type="button"
                onClick={handleApproveAll}
              >
                Approve
              </button>

              <button
                className="btn btn-danger px-4 py-2"
                type="button"
                onClick={handleRejectAll}
              >
                Reject
              </button>
            </div>

            {/* Modal */}

            <div
              className="modal fade"
              id="exampleModal"
              tabIndex={-1}
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Why you want to reject?
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
                      className="form-control p-2 w-100"
                      placeholder="Enter reason for rejection"
                      rows="5"
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
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodIdSA;
