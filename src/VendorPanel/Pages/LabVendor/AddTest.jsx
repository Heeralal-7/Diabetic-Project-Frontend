import axios from "axios";
import React, { useState ,useContext,useEffect} from "react";
import { useDispatch } from "react-redux";
import {createtest} from "../../../Redux/labtestSlice"
import { MyContext } from "../../../Context/Context";

const AddTest = () => {
  const [testType, setTestType] = useState("");
  const [sampleRequired, setSampleRequired] = useState("");
  const [sampleCollectedIn, setSampleCollectedIn] = useState("");
  const [needPrescription, setNeedPrescription] = useState(false);
  const [getTest, setGetTest] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [otherSampleRequired, setOtherSampleRequired] = useState("");
  const [otherSampleCollectedIn, setOtherSampleCollectedIn] = useState("");
  const [amount, setAmount] = useState("");
  const [vendorType, setVendorType] = useState("Lab");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [selectedTestName, setSelectedTestName] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");
 const [selectedTestOrgan,setSelectedTestOrgan] = useState("")
  const URL = process.env.REACT_APP_API_URL;
  const dispatch = useDispatch();

  const {organs, getAllOrgans} = React.useContext(MyContext);
 
  useEffect(() => {
    getAllOrgans();
    console.log("organs",organs);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalSampleRequired =
    sampleRequired === "Others" ? otherSampleRequired : sampleRequired;
  const finalSampleCollectedIn =
    sampleCollectedIn === "Others" ? otherSampleCollectedIn : sampleCollectedIn;

    const formData = {
      testCategory: selectedCategory,
      testName: selectedTestName,
      organ: selectedTestOrgan,
      description,
      precautions,
      amount,
      discountPercentage,
      vendorType,
      testType: testType,
      sampleRequired: finalSampleRequired,
      sampleCollected: finalSampleCollectedIn,
      prescription: needPrescription,
    };

    dispatch(createtest(formData))
    .then(() => {

      setSelectedCategory("");
      setSelectedTestName("");
      setSelectedTestOrgan("");
      setDescription("");
      setPrecautions("");
      setAmount("");
      setDiscountPercentage("");
      setVendorType("Lab"); 
      setTestType("");
      setSampleRequired("");
      setSampleCollectedIn("");
      setOtherSampleRequired("");
      setOtherSampleCollectedIn("");
      setNeedPrescription(false);
    })
    .catch((error) => {
      // Handle the error if needed
      console.error("Error creating test:", error);
    });
    
  };

  const getTestNames = async (category) => {
    try {
      const { data } = await axios.get(`${URL}/test/${category}`);
      if (data.success) {
        setGetTest(data.report);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category); 
    if (category) {
      getTestNames(category); 
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Form Container */}
        <div className="col-lg-12">
          <h1 className="text-start mb-4">Add Test</h1>

          <form onSubmit={handleSubmit}>
            {/* Test Category */}
            <div className="mb-3">
              <label className="form-label">Test Category</label>
              <select
                className="form-select"
                required
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                <option value="Pathology">Pathology</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>

            {/* Test Name */}
            <div className="mb-3">
              <label className="form-label">Test Name</label>
              <select
                className="form-select"
                required
                value={selectedTestName} 
                onChange={(e) => setSelectedTestName(e.target.value)}
              >
                <option value="">Select Name</option>
                {getTest.length > 0 &&
                  getTest.map((test, index) => (
                    <option key={index} value={test.name}>
                      {test.name}
                    </option>
                  ))}
              </select>
            </div>

                  {/* Test Organs */}
            <div className="mb-3">
              <label className="form-label">Test Name</label>
              <select
                className="form-select"
                required
                value={selectedTestOrgan}
                onChange={(e) => setSelectedTestOrgan(e.target.value)}
              >
                <option value="">Select Organs</option>
                {organs.length > 0 &&
                  organs.map((org, index) => (
                    <option key={index} value={org.name}>
                      {org.organName}
                    </option>
                  ))}
              </select>
            </div>
 

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Enter Description"
                rows="3"
                required
                value={description} // Bind the state to the textarea value
                onChange={(e) => setDescription(e.target.value)} // Handle
              ></textarea>
            </div>

            {/* Precautions */}
            <div className="mb-3">
              <label className="form-label">Precautions</label>
              <textarea
                className="form-control"
                placeholder="Enter Precautions"
                rows="2"
                value={precautions} // Bind the state to the textarea value
                onChange={(e) => setPrecautions(e.target.value)}
              ></textarea>
            </div>

            {/* Test Type */}
            <div className="mb-3">
              <label className="form-label">Test Type</label>
              <div className="d-flex flex-wrap">
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    value="Walk In"
                    id="walkIn"
                    checked={testType === "Walk In"}
                    onChange={() => setTestType("Walk In")}
                  />
                  <label className="form-check-label" htmlFor="walkIn">
                    Walk In
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    value="Home Collection"
                    id="homeCollection"
                    checked={testType === "Home Collection"}
                    onChange={() => setTestType("Home Collection")}
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
                    value="Both"
                    id="both"
                    checked={testType === "Both"}
                    onChange={() => setTestType("Both")}
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
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Blood"
                    id="blood"
                    checked={sampleRequired === "Blood"}
                    onChange={() => setSampleRequired("Blood")}
                  />
                  <label className="form-check-label" htmlFor="blood">
                    Blood
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Urine"
                    id="urine"
                    checked={sampleRequired === "Urine"}
                    onChange={() => setSampleRequired("Urine")}
                  />
                  <label className="form-check-label" htmlFor="urine">
                    Urine
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Stool"
                    id="stool"
                    checked={sampleRequired === "Stool"}
                    onChange={() => setSampleRequired("Stool")}
                  />
                  <label className="form-check-label" htmlFor="stool">
                    Stool
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Others"
                    id="others"
                    onChange={() => setSampleRequired("Others")}
                  />
                  <label className="form-check-label" htmlFor="others">
                    Others
                  </label>
                </div>
              </div>

              {/* Show input if "Others" is selected */}
              {sampleRequired === "Others" && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Please specify"
                  value={otherSampleRequired}
                  checked={sampleRequired === "Others"}
                  onChange={(e) => setOtherSampleRequired(e.target.value)}
                />
              )}
            </div>

            {/* Sample Collected In */}
            <div className="mb-3">
              <label className="form-label">Sample Collected In</label>
              <div className="d-flex flex-wrap">
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Plain vial"
                    id="plainVial"
                    checked={sampleCollectedIn === "Plain vial"}
                    onChange={() => setSampleCollectedIn("Plain vial")}
                  />
                  <label className="form-check-label" htmlFor="plainVial">
                    Plain vial
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Fluoride vial"
                    id="fluorideVial"
                    checked={sampleCollectedIn === "Fluoride vial"}
                    onChange={() => setSampleCollectedIn("Fluoride vial")}
                  />
                  <label className="form-check-label" htmlFor="fluorideVial">
                    Fluoride vial
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="EDTA vial"
                    id="edtaVial"
                    checked={sampleCollectedIn === "EDTA vial"}
                    onChange={() => setSampleCollectedIn("EDTA vial")}
                  />
                  <label className="form-check-label" htmlFor="edtaVial">
                    EDTA vial
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Others"
                    id="sampleOthers"
                    checked={sampleCollectedIn === "Others"}
                    onChange={() => setSampleCollectedIn("Others")}
                  />
                  <label className="form-check-label" htmlFor="sampleOthers">
                    Others
                  </label>
                </div>
              </div>

              {/* Show input if "Others" is selected */}
              {sampleCollectedIn === "Others" && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Please specify"
                  value={otherSampleCollectedIn}
                  onChange={(e) => setOtherSampleCollectedIn(e.target.value)}
                />
              )}
            </div>

            {/* Need Prescription */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="needPrescription"
                onChange={() => setNeedPrescription(!needPrescription)}
              />
              <label className="form-check-label" htmlFor="needPrescription">
                Need Prescription
              </label>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="₹ Enter amount"
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
                placeholder="% Enter percentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary me-auto">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditTest = () => {
  const [testType, setTestType] = useState("");
  const [sampleRequired, setSampleRequired] = useState("");
  const [sampleCollectedIn, setSampleCollectedIn] = useState("");
  const [needPrescription, setNeedPrescription] = useState(false);
  const [getTest, setGetTest] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [otherSampleRequired, setOtherSampleRequired] = useState("");
  const [otherSampleCollectedIn, setOtherSampleCollectedIn] = useState("");
  const [amount, setAmount] = useState("");
  const [vendorType, setVendorType] = useState("Lab");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [selectedTestName, setSelectedTestName] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");

  const URL = process.env.REACT_APP_API_URL;
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalSampleRequired =
      sampleRequired === "Others" ? otherSampleRequired : sampleRequired;
    const finalSampleCollectedIn =
      sampleCollectedIn === "Others" ? otherSampleCollectedIn : sampleCollectedIn;

    const formData = {
      testCategory: selectedCategory,
      testName: selectedTestName,
      description,
      precautions,
      amount,
      discountPercentage,
      vendorType,
      testType: testType,
      sampleRequired: finalSampleRequired,
      sampleCollected: finalSampleCollectedIn,
      prescription: needPrescription,
    };

    dispatch(createtest(formData))
      .then(() => {
        // Clear form fields after successful submission
        setSelectedCategory("");
        setSelectedTestName("");
        setDescription("");
        setPrecautions("");
        setAmount("");
        setDiscountPercentage("");
        setVendorType("Lab"); // Default value as "Lab"
        setTestType("");
        setSampleRequired("");
        setSampleCollectedIn("");
        setOtherSampleRequired("");
        setOtherSampleCollectedIn("");
        setNeedPrescription(false);
      })
      .catch((error) => {
        // Handle the error if needed
        console.error("Error creating test:", error);
      });

  };

  const getTestNames = async (category) => {
    try {
      const { data } = await axios.get(`${URL}/test/${category}`);
      if (data.success) {
        setGetTest(data.report);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category); // Update selected category
    if (category) {
      getTestNames(category); // Fetch test names for the selected category
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Form Container */}
        <div className="col-lg-12">
          <h1 className="text-start mb-4">Add Test</h1>

          <form onSubmit={handleSubmit}>
            {/* Test Category */}
            <div className="mb-3">
              <label className="form-label">Test Category</label>
              <select
                className="form-select"
                required
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                <option value="Pathology">Pathology</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>

            {/* Test Name */}
            <div className="mb-3">
              <label className="form-label">Test Name</label>
              <select
                className="form-select"
                required
                value={selectedTestName}
                onChange={(e) => setSelectedTestName(e.target.value)}
              >
                <option value="">Select Name</option>
                {getTest.length > 0 &&
                  getTest.map((test, index) => (
                    <option key={index} value={test.name}>
                      {test.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Enter Description"
                rows="3"
                required
                value={description} // Bind the state to the textarea value
                onChange={(e) => setDescription(e.target.value)} // Handle
              ></textarea>
            </div>

            {/* Precautions */}
            <div className="mb-3">
              <label className="form-label">Precautions</label>
              <textarea
                className="form-control"
                placeholder="Enter Precautions"
                rows="2"
                value={precautions} // Bind the state to the textarea value
                onChange={(e) => setPrecautions(e.target.value)}
              ></textarea>
            </div>

            {/* Test Type */}
            <div className="mb-3">
              <label className="form-label">Test Type</label>
              <div className="d-flex flex-wrap">
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    value="Walk In"
                    id="walkIn"
                    checked={testType === "Walk In"}
                    onChange={() => setTestType("Walk In")}
                  />
                  <label className="form-check-label" htmlFor="walkIn">
                    Walk In
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testType"
                    value="Home Collection"
                    id="homeCollection"
                    checked={testType === "Home Collection"}
                    onChange={() => setTestType("Home Collection")}
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
                    value="Both"
                    id="both"
                    checked={testType === "Both"}
                    onChange={() => setTestType("Both")}
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
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Blood"
                    id="blood"
                    checked={sampleRequired === "Blood"}
                    onChange={() => setSampleRequired("Blood")}
                  />
                  <label className="form-check-label" htmlFor="blood">
                    Blood
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Urine"
                    id="urine"
                    checked={sampleRequired === "Urine"}
                    onChange={() => setSampleRequired("Urine")}
                  />
                  <label className="form-check-label" htmlFor="urine">
                    Urine
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Stool"
                    id="stool"
                    checked={sampleRequired === "Stool"}
                    onChange={() => setSampleRequired("Stool")}
                  />
                  <label className="form-check-label" htmlFor="stool">
                    Stool
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleRequired"
                    value="Others"
                    id="others"
                    onChange={() => setSampleRequired("Others")}
                  />
                  <label className="form-check-label" htmlFor="others">
                    Others
                  </label>
                </div>
              </div>

              {/* Show input if "Others" is selected */}
              {sampleRequired === "Others" && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Please specify"
                  value={otherSampleRequired}
                  checked={sampleRequired === "Others"}
                  onChange={(e) => setOtherSampleRequired(e.target.value)}
                />
              )}
            </div>

            {/* Sample Collected In */}
            <div className="mb-3">
              <label className="form-label">Sample Collected In</label>
              <div className="d-flex flex-wrap">
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Plain vial"
                    id="plainVial"
                    checked={sampleCollectedIn === "Plain vial"}
                    onChange={() => setSampleCollectedIn("Plain vial")}
                  />
                  <label className="form-check-label" htmlFor="plainVial">
                    Plain vial
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Fluoride vial"
                    id="fluorideVial"
                    checked={sampleCollectedIn === "Fluoride vial"}
                    onChange={() => setSampleCollectedIn("Fluoride vial")}
                  />
                  <label className="form-check-label" htmlFor="fluorideVial">
                    Fluoride vial
                  </label>
                </div>

                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="EDTA vial"
                    id="edtaVial"
                    checked={sampleCollectedIn === "EDTA vial"}
                    onChange={() => setSampleCollectedIn("EDTA vial")}
                  />
                  <label className="form-check-label" htmlFor="edtaVial">
                    EDTA vial
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sampleCollectedIn"
                    value="Others"
                    id="sampleOthers"
                    checked={sampleCollectedIn === "Others"}
                    onChange={() => setSampleCollectedIn("Others")}
                  />
                  <label className="form-check-label" htmlFor="sampleOthers">
                    Others
                  </label>
                </div>
              </div>

              {/* Show input if "Others" is selected */}
              {sampleCollectedIn === "Others" && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Please specify"
                  value={otherSampleCollectedIn}
                  onChange={(e) => setOtherSampleCollectedIn(e.target.value)}
                />
              )}
            </div>

            {/* Need Prescription */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="needPrescription"
                onChange={() => setNeedPrescription(!needPrescription)}
              />
              <label className="form-check-label" htmlFor="needPrescription">
                Need Prescription
              </label>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="₹ Enter amount"
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
                placeholder="% Enter percentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary me-auto">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export  {AddTest, EditTest};
