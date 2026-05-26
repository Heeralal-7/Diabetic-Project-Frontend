import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Test.css";

const Test = () => {
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [activeButton, setActiveButton] = useState({
    Ongoing: "Pathology",
    OnHold: "Pathology",
    Closed: "Pathology",
  });
  const [allTests, setAllTests] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTestForEdit, setSelectedTestForEdit] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const statusMap = {
    Ongoing: 0,
    OnHold: 0,
    Closed: 1,
  };
  const categoryMap = {
    Pathology: "Pathology",
    Radiology: "Radiology",
  };

  useEffect(() => {
    getalltest(statusMap[activeTab], categoryMap[activeButton[activeTab]]);
  }, [activeTab, activeButton]);

  // Recalculate discounted amount when amount or discount percentage changes
  useEffect(() => {
    if (selectedTestForEdit) {
      const amount = selectedTestForEdit.amount || 0;
      const discountPercentage = selectedTestForEdit.discountPercentage || 0;
      
      let discountedAmount = amount;
      if (discountPercentage > 0) {
        discountedAmount = amount - (amount * discountPercentage) / 100;
      }
      
      setSelectedTestForEdit(prev => ({
        ...prev,
        discountedAmount: discountedAmount
      }));
    }
  }, [selectedTestForEdit?.amount, selectedTestForEdit?.discountPercentage]);

  const getalltest = async (status, category) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        console.error("labtoken not found in sessionStorage");
        return;
      }
      const parsedVerify = JSON.parse(verify);

      const { data } = await axios.get(
        `${URL}/addTest?status=${status}&category=${category}`,
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );

      if (data.success) {
        // Ensure discountedAmount is calculated for each test
        const testsWithDiscountedAmount = data.details.map(test => {
          let discountedAmount = test.amount;
          if (test.discountPercentage && test.discountPercentage > 0) {
            discountedAmount = test.amount - (test.amount * test.discountPercentage) / 100;
          }
          return {
            ...test,
            discountedAmount: discountedAmount
          };
        });
        setAllTests(testsWithDiscountedAmount);
      } else {
        setAllTests([]);
      }
    } catch (error) {
      console.error("Error fetching all tests:", error);
      setAllTests([]);
    }
  };

  const updateTestStatus = async (id, newStatus) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        alert("Authentication token not found. Please log in again.");
        return;
      }
      const parsedVerify = JSON.parse(verify);

      const { data } = await axios.patch(
        `${URL}/addTest/update/${id}`,
        { status: newStatus },
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );
      if (data.success) {
        alert("Test status updated successfully!");
        getalltest(statusMap[activeTab], categoryMap[activeButton[activeTab]]);
      } else {
        alert(`Failed to update test status: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating test status:", error);
      alert("Error updating test status. Please try again.");
    }
  };

  const handleEditClick = (test) => {
    setSelectedTestForEdit({ ...test });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTestForEdit(null);
  };

  const handleEditSubmit = async (editedTestData) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        alert("Authentication token not found. Please log in again.");
        return;
      }
      const parsedVerify = JSON.parse(verify);

      // Prepare data to send to the backend
      const dataToSend = {
        ...editedTestData,
      };
      delete dataToSend._id;

      const { data } = await axios.patch(
        `${URL}/addTest/${editedTestData._id}`,
        dataToSend,
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );

      if (data.success) {
        alert("Test updated successfully!");
        handleCloseEditModal();
        getalltest(statusMap[activeTab], categoryMap[activeButton[activeTab]]);
      } else {
        alert(`Failed to update test: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting edit:", error);
      alert("Error updating test. Please try again.");
    }
  };

  const handleButtonClick = (tab, button) => {
    setActiveButton((prev) => ({ ...prev, [tab]: button }));
  };

  return (
    <>
      <ul
        className="nav nav-pills gap-3 navAndTabs1 mb-4"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Ongoing" ? "active" : ""}`}
            id="ongoing-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === "Ongoing"}
            onClick={() => setActiveTab("Ongoing")}
          >
            Ongoing
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "OnHold" ? "active" : ""}`}
            id="onhold-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === "OnHold"}
            onClick={() => setActiveTab("OnHold")}
          >
            On-Hold
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Closed" ? "active" : ""}`}
            id="closed-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === "Closed"}
            onClick={() => setActiveTab("Closed")}
          >
            Closed
          </button>
        </li>
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {/* Ongoing Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "Ongoing" ? "show active" : ""
          }`}
          id="ongoing"
          role="tabpanel"
          aria-labelledby="ongoing-tab"
        >
          <div className="p-2">
            <div className="nav nav-pills gap-3 sub-nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.Ongoing === "Pathology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("Ongoing", "Pathology")}
                >
                  Pathology
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.Ongoing === "Radiology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("Ongoing", "Radiology")}
                >
                  Radiology
                </button>
              </li>
            </div>

            <div className="test-grid p-2">
              {allTests.length > 0 ? (
                allTests.map((test) => (
                  <div className="card test-card" key={test._id}>
                    <div className="card-body">
                      <h5 className="card-title text-primary fw-bold">{test.testName}</h5>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Test Type:</span>{" "}
                        {test.testType || "N/A"}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Price:</span> ₹{test.amount}
                        {test.discountPercentage > 0 && (
                           <span className="text-muted ms-2">
                             (Discount: {test.discountPercentage}%, Final: ₹{test.discountedAmount})
                           </span>
                        )}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Required:</span>{" "}
                        {test.sampleRequired || "N/A"}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Collected In:</span>{" "}
                        {test.sampleCollected || "N/A"}
                      </p>
                      <hr />
                      <div className="test-description">
                        <p className="fw-semibold mb-1">Description:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.description || "No description provided."}
                        </p>
                      </div>
                      <div className="test-precautions mt-2">
                        <p className="fw-semibold mb-1">Precautions:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.precautions || "No precautions listed."}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between mt-3 gap-2">
                        <button
                          className="btn btn-outline-primary flex-fill"
                          onClick={() => handleEditClick(test)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger flex-fill"
                          onClick={() => updateTestStatus(test._id, 1)}
                        >
                          Close Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center w-100">No ongoing tests found for {activeButton.Ongoing}.</p>
              )}
            </div>
          </div>
        </div>

        {/* On-Hold Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "OnHold" ? "show active" : ""
          }`}
          id="onhold"
          role="tabpanel"
          aria-labelledby="onhold-tab"
        >
          <div className="p-2">
            <div className="nav nav-pills gap-3 sub-nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.OnHold === "Pathology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("OnHold", "Pathology")}
                >
                  Pathology
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.OnHold === "Radiology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("OnHold", "Radiology")}
                >
                  Radiology
                </button>
              </li>
            </div>

            <div className="test-grid p-2">
              {allTests.length > 0 ? (
                allTests.map((test) => (
                  <div className="card test-card" key={test._id}>
                    <div className="card-body">
                      <h5 className="card-title text-warning fw-bold">{test.testName}</h5>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Test Type:</span>{" "}
                        {test.testType || "N/A"}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Price:</span> ₹{test.amount}
                        {test.discountPercentage > 0 && (
                           <span className="text-muted ms-2">
                             (Discount: {test.discountPercentage}%, Final: ₹{test.discountedAmount})
                           </span>
                        )}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Required:</span>{" "}
                        {test.sampleRequired || "N/A"}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Collected In:</span>{" "}
                        {test.sampleCollected || "N/A"}
                      </p>
                      <hr />
                      <div className="test-description">
                        <p className="fw-semibold mb-1">Description:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.description || "No description provided."}
                        </p>
                      </div>
                      <div className="test-precautions mt-2">
                        <p className="fw-semibold mb-1">Precautions:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.precautions || "No precautions listed."}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between mt-3 gap-2">
                        <button
                          className="btn btn-outline-primary flex-fill"
                          onClick={() => handleEditClick(test)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger flex-fill"
                          onClick={() => updateTestStatus(test._id, 1)}
                        >
                          Close Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center w-100">No tests on hold found for {activeButton.OnHold}.</p>
              )}
            </div>
          </div>
        </div>

        {/* Closed Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "Closed" ? "show active" : ""
          }`}
          id="closed"
          role="tabpanel"
          aria-labelledby="closed-tab"
        >
          <div className="p-2">
            <div className="nav nav-pills gap-3 sub-nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.Closed === "Pathology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("Closed", "Pathology")}
                >
                  Pathology
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeButton.Closed === "Radiology" ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick("Closed", "Radiology")}
                >
                  Radiology
                </button>
              </li>
            </div>

            <div className="test-grid p-2">
              {allTests.length > 0 ? (
                allTests.map((test) => (
                  <div className="card test-card" key={test._id}>
                    <div className="card-body">
                      <h5 className="card-title text-danger fw-bold">{test.testName}</h5>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Test Type:</span>{" "}
                        {test.testType || "N/A"}
                      </p>
                       <p className="card-text mb-1">
                        <span className="fw-semibold">Price:</span> ₹{test.amount}
                        {test.discountPercentage > 0 && (
                           <span className="text-muted ms-2">
                             (Discount: {test.discountPercentage}%, Final: ₹{test.discountedAmount})
                           </span>
                        )}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Required:</span>{" "}
                        {test.sampleRequired || "N/A"}
                      </p>
                      <p className="card-text mb-1">
                        <span className="fw-semibold">Sample Collected In:</span>{" "}
                        {test.sampleCollected || "N/A"}
                      </p>
                      <hr />
                      <div className="test-description">
                        <p className="fw-semibold mb-1">Description:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.description || "No description provided."}
                        </p>
                      </div>
                      <div className="test-precautions mt-2">
                        <p className="fw-semibold mb-1">Precautions:</p>
                        <p className="text-muted multi-line-truncate">
                          {test.precautions || "No precautions listed."}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between mt-3 gap-2">
                        <button
                          className="btn btn-outline-primary flex-fill"
                          onClick={() => handleEditClick(test)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-success flex-fill"
                          onClick={() => updateTestStatus(test._id, 0)}
                        >
                          Activate Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center w-100">No closed tests found for {activeButton.Closed}.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedTestForEdit && (
        <div className="modal-backdrop fade show"></div>
      )}
      <div
        className={`modal fade ${isEditModalOpen ? "show d-block" : ""}`}
        id="editTestModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="editTestModalLabel"
        aria-hidden={!isEditModalOpen}
        style={{ display: isEditModalOpen ? "block" : "none" }}
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editTestModalLabel">
                Edit Test: {selectedTestForEdit?.testName}
              </h5>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={handleCloseEditModal}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(selectedTestForEdit); }}>
                <div className="form-group mb-3">
                  <label htmlFor="editTestName">Test Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTestName"
                    value={selectedTestForEdit?.testName || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, testName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editTestType">Test Type</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTestType"
                    value={selectedTestForEdit?.testType || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, testType: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editAmount">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="editAmount"
                    value={selectedTestForEdit?.amount || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, amount: Number(e.target.value) })}
                    required
                  />
                </div>
                 <div className="form-group mb-3">
                  <label htmlFor="editDiscountPercentage">Discount Percentage</label>
                  <input
                    type="number"
                    className="form-control"
                    id="editDiscountPercentage"
                    value={selectedTestForEdit?.discountPercentage || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, discountPercentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
                
                {/* Display final price in the modal */}
                <div className="form-group mb-3">
                  <label htmlFor="editFinalPrice">Final Price</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editFinalPrice"
                    value={`₹${selectedTestForEdit?.discountedAmount || selectedTestForEdit?.amount || 0}`}
                    readOnly
                    disabled
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="editSampleRequired">Sample Required</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editSampleRequired"
                    value={selectedTestForEdit?.sampleRequired || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, sampleRequired: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editSampleCollected">Sample Collected In</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editSampleCollected"
                    value={selectedTestForEdit?.sampleCollected || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, sampleCollected: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editDescription">Description</label>
                  <textarea
                    className="form-control"
                    id="editDescription"
                    rows="3"
                    value={selectedTestForEdit?.description || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editPrecautions">Precautions</label>
                  <textarea
                    className="form-control"
                    id="editPrecautions"
                    rows="3"
                    value={selectedTestForEdit?.precautions || ""}
                    onChange={(e) => setSelectedTestForEdit({ ...selectedTestForEdit, precautions: e.target.value })}
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseEditModal}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test;