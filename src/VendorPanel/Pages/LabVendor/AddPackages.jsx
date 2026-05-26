import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { createpackages } from "../../../Redux/labtestSlice";

const AddPackages = () => {
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [testType, setTestType] = useState([]); // Changed to array for multiple selections
  const [sampleRequired, setSampleRequired] = useState([]); // Already an array, but good to confirm
  const [otherSampleRequired, setOtherSampleRequired] = useState("");
  const [sampleCollected, setSampleCollected] = useState([]); // Renamed from sampleCollectedIn to match schema
  const [otherSampleCollected, setOtherSampleCollected] = useState(""); // Renamed from otherSampleCollectedIn
  const [amount, setAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [method, setMethod] = useState(""); // New state for method
  const [selectedTests, setSelectedTests] = useState([]);
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [tempSelectedTests, setTempSelectedTests] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Pathology");
  const [testsData, setTestsData] = useState({});
  const URL = process.env.REACT_APP_API_URL;
  const dispatch = useDispatch();

  const getTestNames = async (category) => {
    try {
      const { data } = await axios.get(`${URL}/test/${category}`);
      if (data.success) {
        setTestsData((prevData) => ({
          ...prevData,
          [category]: data.report,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch tests for the initial active category
    getTestNames(activeCategory);
  }, [activeCategory]);

  // Calculate discounted amount whenever amount or discountPercentage changes
  const calculateDiscountedAmount = () => {
    const baseAmount = parseFloat(amount);
    const discount = parseFloat(discountPercentage);

    if (!isNaN(baseAmount) && !isNaN(discount) && discount >= 0 && discount <= 100) {
      const discounted = baseAmount - (baseAmount * discount) / 100;
      return discounted.toFixed(2); // Format to 2 decimal places
    }
    return amount; // Return original amount if calculation is not possible
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare sampleRequired array: include "Others" value if selected
    const finalSampleRequired = sampleRequired.includes("Others")
      ? [...sampleRequired.filter(s => s !== "Others"), otherSampleRequired]
      : sampleRequired;

    // Prepare sampleCollected array: include "Others" value if selected
    const finalSampleCollected = sampleCollected.includes("Others")
      ? [...sampleCollected.filter(s => s !== "Others"), otherSampleCollected]
      : sampleCollected;
    
    const discountedAmount = calculateDiscountedAmount();

    const formData = {
      packageName,
      description,
      precautions,
      testType, // testType is now an array
      sampleRequired: finalSampleRequired,
      sampleCollected: finalSampleCollected,
      addTest: selectedTests.map(test => test._id), // Assuming selectedTests contains objects with _id
      amount,
      method, // Added method
      discountPercentage,
      discountedAmount, // Added discounted amount
      status: "0", // Default status for new packages
    };

    dispatch(createpackages(formData))
      .then(() => {
        // Reset form fields
        setPackageName("");
        setDescription("");
        setPrecautions("");
        setTestType([]);
        setSampleRequired([]);
        setSampleCollected([]);
        setOtherSampleRequired("");
        setOtherSampleCollected("");
        setSelectedTests([]);
        setAmount("");
        setDiscountPercentage("");
        setMethod("");
        // Close test selection if open
        setShowTestSelection(false);
        setTempSelectedTests([]);
      })
      .catch((error) => {
        console.error("Error creating package:", error);
      });
  };

  const toggleTestSelection = (test) => {
    setTempSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSaveTests = () => {
    setSelectedTests(tempSelectedTests);
    setShowTestSelection(false);
  };

  const handleTestTypeChange = (e) => {
    const { value, checked } = e.target;
    setTestType((prev) =>
      checked ? [...prev, value] : prev.filter((type) => type !== value)
    );
  };

  const handleSampleRequiredChange = (e) => {
    const { value, checked } = e.target;
    setSampleRequired((prev) =>
      checked ? [...prev, value] : prev.filter((sample) => sample !== value)
    );
  };

  const handleSampleCollectedChange = (e) => {
    const { value, checked } = e.target;
    setSampleCollected((prev) =>
      checked ? [...prev, value] : prev.filter((vial) => vial !== value)
    );
  };


  return (
    <div className="container-fluid mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <h1 className="text-start mb-4">Add Package</h1>
          <form onSubmit={handleSubmit}>
            {/* Package Name */}
            <div className="mb-3">
              <label className="form-label">Package Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Package Name"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Enter Description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Precaution */}
            <div className="mb-3">
              <label className="form-label">Precaution</label>
              <textarea
                className="form-control"
                placeholder="Enter Precaution"
                rows="3"
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Test Type - Now uses checkboxes to match [String] array */}
            <div className="mb-3">
              <label className="form-label">Test Type</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="testType"
                    id="walkIn"
                    value="Walk In"
                    checked={testType.includes("Walk In")}
                    onChange={handleTestTypeChange}
                  />
                  <label className="form-check-label" htmlFor="walkIn">
                    Walk In
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="testType"
                    id="homeCollection"
                    value="Home Collection"
                    checked={testType.includes("Home Collection")}
                    onChange={handleTestTypeChange}
                  />
                  <label className="form-check-label" htmlFor="homeCollection">
                    Home Collection
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="testType"
                    id="both"
                    value="Both"
                    checked={testType.includes("Both")}
                    onChange={handleTestTypeChange}
                  />
                  <label className="form-check-label" htmlFor="both">
                    Both
                  </label>
                </div>
              </div>
            </div>

            {/* Sample Required */}
            <div className="mb-3">
              <label className="form-label">Sample Required</label>
              <div className="d-flex flex-wrap">
                {["Blood", "Urine", "Stool", "Others"].map((sample, index) => (
                  <div key={index} className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={sample}
                      onChange={handleSampleRequiredChange}
                      checked={sampleRequired.includes(sample)}
                    />
                    <label className="form-check-label">{sample}</label>
                  </div>
                ))}
              </div>

              {/* Conditional input for "Others" */}
              {sampleRequired.includes("Others") && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Please specify other sample"
                    value={otherSampleRequired}
                    onChange={(e) => setOtherSampleRequired(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Sample Collected In */}
            <div className="mb-3">
              <label className="form-label">Sample Collected In</label>
              <div className="d-flex flex-wrap">
                {["Plain vial", "Fluoride vial", "EDTA vial", "Others"].map(
                  (vial, index) => (
                    <div key={index} className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={vial}
                        onChange={handleSampleCollectedChange}
                        checked={sampleCollected.includes(vial)}
                      />
                      <label className="form-check-label">{vial}</label>
                    </div>
                  )
                )}
              </div>

              {/* Conditional input for "Others" */}
              {sampleCollected.includes("Others") && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Please specify other collection method"
                    value={otherSampleCollected}
                    onChange={(e) => setOtherSampleCollected(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Method */}
            <div className="mb-3">
              <label className="form-label">Method</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Method (e.g., ELISA, PCR)"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
              />
            </div>

            {/* Add Tests */}
            <div className="mb-3">
              <label className="form-label">Add Tests:</label>
              {selectedTests.length > 0 ? (
                <div>
                  <ul className="list-group mb-3">
                    {selectedTests.map((test, index) => (
                      <li key={index} className="list-group-item">
                        {test.name}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      // Pre-populate tempSelectedTests with current selected tests
                      setTempSelectedTests(selectedTests);
                      setShowTestSelection(true);
                    }}
                  >
                    <i className="bi bi-plus-circle"></i> Add More Tests
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-block"
                  onClick={() => {
                    setTempSelectedTests([]); // Clear temp selections if no tests are added yet
                    setShowTestSelection(true);
                  }}
                >
                  <i className="bi bi-plus-circle"></i> Add Tests
                </button>
              )}

              {showTestSelection && (
                <div className="card p-3 mt-3">
                  <h4>Select Tests</h4>
                  <div className="mb-3">
                    <button
                      className={`btn ${
                        activeCategory === "Pathology"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      } me-2`}
                      onClick={() => {
                        setActiveCategory("Pathology");
                        // Fetch tests if not already in testsData
                        if (!testsData["Pathology"]) getTestNames("Pathology");
                      }}
                      type="button"
                    >
                      Pathology Tests
                    </button>
                    <button
                      className={`btn ${
                        activeCategory === "Radiology"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => {
                        setActiveCategory("Radiology");
                         // Fetch tests if not already in testsData
                        if (!testsData["Radiology"]) getTestNames("Radiology");
                      }}
                      type="button"
                    >
                      Radiology Tests
                    </button>
                  </div>

                  <div className="list-group">
                    {testsData[activeCategory]?.map((test, index) => (
                      <label key={index} className="list-group-item">
                        <input
                          className="form-check-input me-1"
                          type="checkbox"
                          value={test._id} // Assuming test object has an _id
                          checked={tempSelectedTests.some(t => t._id === test._id)}
                          onChange={() => toggleTestSelection(test)}
                        />
                        {test.name}
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={handleSaveTests}
                  >
                    Save Tests
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Discount Percentage */}
            <div className="mb-3">
              <label className="form-label">Discount Percentage</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Discount Percentage (0-100)"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>
            
            {/* Display Discounted Amount */}
            {amount && discountPercentage && (
              <div className="mb-3">
                <label className="form-label">Discounted Amount</label>
                <input
                  type="text"
                  className="form-control"
                  value={`₹${calculateDiscountedAmount()}`}
                  readOnly
                  disabled
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              Submit Package
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPackages;