import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Package.css"; // We'll create this CSS file

const Package = () => {
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [allPackages, setAllPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null); // State to hold the package being edited
  const [editFormData, setEditFormData] = useState({ // State for form inputs
    packageName: "",
    description: "",
    precautions: "",
    testType: [],
    addTest: [],
    amount: 0,
    discountPercentage: 0, // Added for editing
    discountedAmount: 0,   // Added for editing
  });

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080"; // Fallback for URL

  const statusMap = {
    Ongoing: "0",
    OnHold: "0",
    Closed: "1",
  };

  useEffect(() => {
    getallPackages(statusMap[activeTab]);
  }, [activeTab]);

  const getallPackages = async (status) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        console.error("labtoken not found in sessionStorage");
        return;
      }
      const parsedVerify = JSON.parse(verify);

      const { data } = await axios.get(
        `${URL}/package/all-package?status=${status}`,
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );

      if (data.success && data.details) {
        setAllPackages(data.details); // Store all details, filter later if needed for display
      } else {
        setAllPackages([]);
      }
    } catch (error) {
      console.error("Error fetching all packages:", error);
      setAllPackages([]);
    }
  };

  const updatePackageStatus = async (id, newStatus) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        console.error("labtoken not found in sessionStorage for status update");
        return;
      }
      const parsedVerify = JSON.parse(verify);

      const { data } = await axios.patch(
        `${URL}/package/status/${id}`, // Assuming this endpoint exists for status updates
        { status: newStatus },
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );
      if (data.success) {
        alert("Package status updated successfully!");
        getallPackages(statusMap[activeTab]); // Refresh the list after status update
      } else {
        console.error("Failed to update package status:", data.message || "Unknown error");
        alert(`Failed to update package status: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating package status:", error);
      alert("Error updating package status. Please try again.");
    }
  };

  // Helper function to calculate discounted amount
  const calculateDiscountedAmount = (amount, discountPercentage) => {
    if (!amount || !discountPercentage) return 0;
    const amountNum = parseFloat(amount);
    const discountNum = parseFloat(discountPercentage);
    if (isNaN(amountNum) || isNaN(discountNum)) return 0;
    // Ensure discount is not more than 100% and amount is positive
    const validDiscount = Math.min(Math.max(discountNum, 0), 100);
    return (amountNum - (amountNum * validDiscount) / 100).toFixed(2);
  };


  // Function to handle editing a package
  const handleEditClick = (pkg) => {
    setEditingPackage(pkg);
    const initialAmount = pkg.amount ? parseFloat(pkg.amount) : 0;
    const initialDiscountPercentage = pkg.discountPercentage ? parseFloat(pkg.discountPercentage) : 0;
    const initialDiscountedAmount = calculateDiscountedAmount(initialAmount, initialDiscountPercentage);

    setEditFormData({
      packageName: pkg.packageName,
      description: pkg.description,
      precautions: pkg.precautions,
      testType: pkg.testType ? [...pkg.testType] : [],
      addTest: pkg.addTest ? [...pkg.addTest] : [],
      amount: initialAmount,
      discountPercentage: initialDiscountPercentage,
      discountedAmount: initialDiscountedAmount,
    });
  };

  // Function to handle form input changes for editing
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };

      // Recalculate discountedAmount if amount or discountPercentage changes
      if (name === "amount" || name === "discountPercentage") {
        updatedFormData.discountedAmount = calculateDiscountedAmount(
          name === "amount" ? value : prevFormData.amount,
          name === "discountPercentage" ? value : prevFormData.discountPercentage
        );
      }
      return updatedFormData;
    });
  };

  // Function to handle saving edited package
  const handleSaveClick = async (pkgId) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        console.error("labtoken not found in sessionStorage for saving update");
        return;
      }

      let parsedVerify;
      try {
        parsedVerify = JSON.parse(verify);
      } catch (e) {
        console.error("Error parsing labtoken from sessionStorage:", e);
        alert("Invalid session token. Please log in again.");
        sessionStorage.removeItem("labtoken");
        return;
      }

      // Prepare data to send
      const updateData = {
        packageName: editFormData.packageName,
        description: editFormData.description,
        precautions: editFormData.precautions,
        testType: editFormData.testType,
        addTest: editFormData.addTest,
        amount: parseFloat(editFormData.amount),
        discountPercentage: parseFloat(editFormData.discountPercentage),
        // If your backend *expects* discountedAmount to be sent, uncomment the line below.
        // If the backend can calculate it from amount and discountPercentage, it's better not to send it.
        // discountedAmount: parseFloat(editFormData.discountedAmount),
      };

      const { data } = await axios.patch(
        `${URL}/package?packageId=${pkgId}`,
        updateData,
        {
          headers: {
            token: parsedVerify.token,
          },
        }
      );

      if (data.success) {
        alert("Package updated successfully!");
        setEditingPackage(null); // Close the edit form
        getallPackages(statusMap[activeTab]); // Refresh the list
      } else {
        console.error("Failed to update package:", data.message || "Unknown error");
        alert(`Failed to update package: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving package update:", error);
      alert("Error saving package update. Please try again.");
    }
  };

  // Function to cancel editing
  const handleCancelClick = () => {
    setEditingPackage(null);
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
        {[
          { name: "Ongoing", id: "ongoing" },
          { name: "OnHold", id: "onhold" },
          { name: "Closed", id: "closed" },
        ].map((tab) => (
          <div
            key={tab.id}
            className={`tab-pane fade ${activeTab === tab.name ? "show active" : ""}`}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
          >
            <div className="package-grid p-2">
              {allPackages.length > 0 ? (
                allPackages
                  .filter((pkg) => {
                    if (tab.name === "Ongoing" && pkg.status === "0") return true;
                    if (tab.name === "OnHold" && pkg.status === "0") return true; // Assuming '0' can represent both for now
                    if (tab.name === "Closed" && pkg.status === "1") return true;
                    return false;
                  })
                  .map((pkg) => {
                    // Calculate discounted amount for display if not present or to ensure it's up-to-date
                    const currentAmount = pkg.amount ? parseFloat(pkg.amount) : 0;
                    const currentDiscountPercentage = pkg.discountPercentage ? parseFloat(pkg.discountPercentage) : 0;
                    const calculatedDiscountedAmount = calculateDiscountedAmount(currentAmount, currentDiscountPercentage);

                    // Determine which price to display: discounted or original
                    const displayPrice = currentDiscountPercentage > 0 && calculatedDiscountedAmount > 0
                      ? calculatedDiscountedAmount
                      : currentAmount;

                    return (
                      <div className="card package-card" key={pkg._id}>
                        <div className="card-body">
                          <h5
                            className={`card-title fw-bold ${
                              pkg.status === "1" ? "text-danger" : pkg.status === "0" ? "text-primary" : ""
                            }`}
                          >
                            {pkg.packageName}
                          </h5>
                          <p className="card-text mb-1">
                            <span className="fw-semibold">Test Type:</span>{" "}
                            {pkg.testType?.join(", ") || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <span className="fw-semibold">Price:</span> ₹{pkg.amount}
                          </p>
                          {/* Display Discount Percentage if it exists and is greater than 0 */}
                          {pkg.discountPercentage && parseFloat(pkg.discountPercentage) > 0 && (
                            <p className="card-text mb-1">
                              <span className="fw-semibold">Discount:</span>{" "}
                              {pkg.discountPercentage}%
                            </p>
                          )}
                          {/* Display Discounted Price only if discount percentage is greater than 0 */}
                          {pkg.discountPercentage && parseFloat(pkg.discountPercentage) > 0 && (
                            <p className="card-text mb-1">
                              <span className="fw-semibold">Discounted Price:</span> ₹
                              {calculatedDiscountedAmount} {/* Use the calculated value */}
                            </p>
                          )}
                          <p className="card-text mb-1">
                            <span className="fw-semibold">Sample Required:</span>{" "}
                            {pkg.sampleRequired?.join(", ") || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <span className="fw-semibold">Sample Collected In:</span>{" "}
                            {pkg.sampleCollected?.join(", ") || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <span className="fw-semibold">Method:</span> {pkg.method || "N/A"}
                          </p>
                          <hr />
                          <div className="package-description">
                            <p className="fw-semibold mb-1">Description:</p>
                            <p className="text-muted multi-line-truncate">
                              {pkg.description || "No description provided."}
                            </p>
                          </div>
                          <div className="package-precautions mt-2">
                            <p className="fw-semibold mb-1">Precautions:</p>
                            <p className="text-muted multi-line-truncate">
                              {pkg.precautions || "No precautions listed."}
                            </p>
                          </div>

                          <div className="d-flex justify-content-between mt-3 gap-2">
                            {editingPackage?._id === pkg._id ? (
                              <>
                                <button
                                  className="btn btn-outline-success flex-fill"
                                  onClick={() => handleSaveClick(pkg._id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-outline-secondary flex-fill"
                                  onClick={handleCancelClick}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-primary flex-fill"
                                  onClick={() => handleEditClick(pkg)}
                                >
                                  Edit
                                </button>
                                {pkg.status === "0" ? (
                                  <button
                                    className="btn btn-outline-danger flex-fill"
                                    onClick={() => updatePackageStatus(pkg._id, "1")} // Close (status 1)
                                  >
                                    Close Package
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline-success flex-fill"
                                    onClick={() => updatePackageStatus(pkg._id, "0")} // Reactivate (status 0)
                                  >
                                    Activate Package
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-center w-100">No packages found for this status.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal/Form */}
      {editingPackage && (
        <div className="modal show" style={{ display: "block" }} id="editPackageModal">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Package: {editingPackage.packageName}</h5>
                <button type="button" className="btn-close" onClick={handleCancelClick}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="packageName" className="form-label">Package Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="packageName"
                      name="packageName"
                      value={editFormData.packageName}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="precautions" className="form-label">Precautions</label>
                    <textarea
                      className="form-control"
                      id="precautions"
                      name="precautions"
                      rows="3"
                      value={editFormData.precautions}
                      onChange={handleEditFormChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="testType" className="form-label">Test Type (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="testType"
                      name="testType"
                      value={editFormData.testType.join(', ')}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, testType: e.target.value.split(',').map(item => item.trim()).filter(item => item) });
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addTest" className="form-label">Additional Tests (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="addTest"
                      name="addTest"
                      value={editFormData.addTest.join(', ')}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, addTest: e.target.value.split(',').map(item => item.trim()).filter(item => item) });
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="discountPercentage" className="form-label">Discount Percentage</label>
                    <input
                      type="number"
                      className="form-control"
                      id="discountPercentage"
                      name="discountPercentage"
                      value={editFormData.discountPercentage}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="discountedAmount" className="form-label">Discounted Price</label>
                    <input
                      type="text" // Use text for display, calculated value
                      className="form-control"
                      id="discountedAmount"
                      name="discountedAmount"
                      value={`₹${editFormData.discountedAmount}`} // Display with currency
                      readOnly // Make it read-only as it's calculated
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => handleSaveClick(editingPackage._id)}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Package;