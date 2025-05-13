import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { createpackages } from "../../../Redux/labtestSlice";

const AddPackages = () => {
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [testType, setTestType] = useState("");
  const [sampleRequired, setSampleRequired] = useState("");
  const [otherSampleRequired, setOtherSampleRequired] = useState("");
  const [sampleCollectedIn, setSampleCollectedIn] = useState("");
  const [otherSampleCollectedIn, setOtherSampleCollectedIn] = useState("");
  const [amount, setAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
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
    getTestNames(activeCategory);
  }, [activeCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      packageName,
      description,
      precautions,
      testType,
      sampleRequired:
        sampleRequired === "Others" ? otherSampleRequired : sampleRequired,
      sampleCollected:
        sampleCollectedIn === "Others"
          ? otherSampleCollectedIn
          : sampleCollectedIn,
      addTest: selectedTests,
      amount,
      discountPercentage,
    };

    dispatch(createpackages(formData))
      .then(() => {
        setPackageName("");
        setDescription("");
        setPrecautions("");
        setTestType("");
        setSampleRequired([]);
        setSampleCollectedIn([]);
        setOtherSampleRequired("");
        setOtherSampleCollectedIn("");
        setSelectedTests([]);
        setAmount("");
        setDiscountPercentage("");
      })
      .catch((error) => {
        console.error("Error creating test:", error);
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

            {/* Test Type */}
            <div className="mb-3">
              <label className="form-label">Test Type</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    id="walkIn"
                    value="Walk In"
                    checked={testType === "Walk In"}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="walkIn">
                    Walk In
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    id="homeCollection"
                    value="Home Collection"
                    checked={testType === "Home Collection"}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="homeCollection">
                    Home Collection
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    id="both"
                    value="Both"
                    checked={testType === "Both"}
                    onChange={(e) => setTestType(e.target.value)}
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
                      onChange={(e) => {
                        const selected = [...sampleRequired];
                        if (selected.includes(e.target.value)) {
                          // Remove item if it's already selected
                          setSampleRequired(
                            selected.filter((s) => s !== e.target.value)
                          );
                        } else {
                          // Add item if it's not selected
                          setSampleRequired([...selected, e.target.value]);
                        }
                      }}
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
                    placeholder="Please specify"
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
                        onChange={(e) => {
                          const selected = [...sampleCollectedIn];
                          if (selected.includes(e.target.value)) {
                            // Remove item from the array if it's already selected
                            setSampleCollectedIn(
                              selected.filter((v) => v !== e.target.value)
                            );
                          } else {
                            // Add item to the array if it's not already selected
                            setSampleCollectedIn([...selected, e.target.value]);
                          }
                        }}
                        checked={sampleCollectedIn.includes(vial)}
                      />
                      <label className="form-check-label">{vial}</label>
                    </div>
                  )
                )}
              </div>

              {/* Conditional input for "Others" */}
              {sampleCollectedIn.includes("Others") && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Please specify"
                    value={otherSampleCollectedIn}
                    onChange={(e) => setOtherSampleCollectedIn(e.target.value)}
                    required
                  />
                </div>
              )}
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
                    setTempSelectedTests(selectedTests);
                    setShowTestSelection(true);
                  }}
                >
                  <i className="bi bi-plus-circle"></i> Add Tests
                </button>
              )}

              {showTestSelection && (
                <div className="card p-3 mb-3">
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
                        getTestNames("Pathology");
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
                        getTestNames("Radiology");
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
                          value={test}
                          checked={tempSelectedTests.includes(test)}
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
                placeholder="Enter Discount Percentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
              />
            </div>

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
