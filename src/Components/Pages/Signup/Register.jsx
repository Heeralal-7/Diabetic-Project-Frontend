import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser, verifypromo } from "../../../Redux/signupSlice";
import RegisterImg from "../../Assets/img/Account/Register.png";
import maleImg from "../../Assets/img/Account/male.png";
import femaleImg from "../../Assets/img/Account/female.png";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userData = { name, gender, dob };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    navigate("/DiabeticType", { state: { userData, userName: name } });
    setIsSubmitting(false);
  };

  return (
    <div className="container-fluid login-container bg-white">
      <div className="row w-md-90 align-items-center">
        <div className="col-md-6 login-image">
          <img src={RegisterImg} alt="Illustration" className="img-fluid" />
        </div>
        <div className="col-md-6 col-12">
          <div className="w-95 mx-auto">
            <h3 className="text-dark text-center">
              Welcome to <strong className="text-mainBlue">Diabeteswala</strong> Family
            </h3>
            <h5 className="text-center">Let's set up your profile</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Year of birth</label>
                <select
                  className="form-select"
                  value={dob}
                  required
                  onChange={(e) => setDob(e.target.value)}
                >
                  <option>Select year of birth</option>
                  {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (
                    <option key={i} value={currentYear - i}>
                      {currentYear - i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Gender</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    className="btn-check"
                    name="gender"
                    id="male"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={() => setGender("Male")}
                  />
                  <label className="btn customRadioDarkBlue" htmlFor="male">
                    <img src={maleImg} className="smallImg" alt="" /> Male
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="gender"
                    id="female"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={() => setGender("Female")}
                  />
                  <label className="btn customRadioDarkBlue" htmlFor="female">
                    <img src={femaleImg} className="smallImg" alt="" /> Female
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-mainBlue w-100 icon-box btn border-0 btn-outline-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
              <p className="mt-3 text-muted text-center small">
                We'll never sell or inappropriately share your personal data.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterStep2 = () => {
  const [diabteticType, setDiabteticType] = useState("");
  const [familyHistory, setFamilyHistory] = useState(false);
  const [hasCaregiver, setHasCaregiver] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [familyMembers, setFamilyMembers] = useState({
    mother: false,
    sister: false,
    grandmother: false,
    grandfather: false,
    other: false,
  });
  const [otherFamilyMember, setOtherFamilyMember] = useState("");
  const [showPartnerInput, setShowPartnerInput] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const dispatch = useDispatch();
  const location = useLocation();

  const { userData, userName } = location.state || {};

  const handleDiabeticTypeChange = (e) => {
    const selectedType = e.target.value;
    setDiabteticType(selectedType);

    if (selectedType === "Non Diabetic") {
      setDay("");
      setMonth("");
      setYear("");
    }
  };

  const diabeticDuration =
    diabteticType !== "Non Diabetic" && day && month && year
      ? `${day}/${month}/${year}`
      : "";

  const handleFamilyMemberChange = (member) => {
    setFamilyMembers((prevState) => ({
      ...prevState,
      [member]: !prevState[member],
    }));

    if (member === "other" && familyMembers.other) {
      setOtherFamilyMember("");
    }
  };

  const handlePartnerCodeClick = () => {
    setShowPartnerInput(!showPartnerInput);
  };

  const handleVerifyPartnerCode = async () => {
    try {
      setIsSubmitting(true);
      const response = await dispatch(verifypromo({ partnerCode })).unwrap();
      if (response.success === 1) {
        toast.success("Verified successfully");
      } else {
        toast.error("Enter correct referral Code");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Build the array of family members with diabetes
      let familyhistorydiabetic = Object.entries(familyMembers)
        .filter(([member, hasDiabetes]) => hasDiabetes)
        .map(([member]) =>
          member === "other" && otherFamilyMember ? otherFamilyMember : member
        );

      const fullDetails = {
        ...userData,
        diabteticType,
        diabeticduration: diabeticDuration,
        familyhistorydiabetic,
        hasCaregiver,
        partnerCode: showPartnerInput ? partnerCode : ""
      };

      const formData = new FormData();
      Object.entries(fullDetails).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await dispatch(updateUser(formData)).unwrap();

      if (response.success) {
        toast.success("Details updated successfully");
        if (hasCaregiver) {
          navigate("/CaregiverDetails", { state: { fullDetails, userName } });
        } else {
          navigate("/");
        }
      } else {
        toast.error(response.message || "Failed to update details");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid login-container bg-white py-5">
      <div className="row w-lg-90 align-items-center">
        <div className="col-md-6 login-image">
          <img src={RegisterImg} alt="Illustration" className="img-fluid" />
        </div>

        <div className="col-md-6 col-12">
          <div className="w-95 mx-auto">
            <div className="float-start">
              <Link
                to="/Register"
                className="btn btn-hoverBlue btn-light rounded-circle shadow me-3"
              >
                <i className="ri-arrow-go-back-line fs-5 text-current fw-bold"></i>
              </Link>
            </div>
            <h3 className="text-dark text-center mb-4">
              Welcome to <strong className="text-mainBlue">Diabeteswala</strong> Family
            </h3>
            <h5 className="text-center mb-4">
              Hey <span className="text-mainBlue fw-bold">{userName}</span> Let's set up your profile
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Your Diabetic Type</label>
                <select
                  className="form-select"
                  value={diabteticType}
                  onChange={handleDiabeticTypeChange}
                  required
                >
                  <option value="">Select Diabetic Type</option>
                  <option value="Type 1 Diabetic">Type 1 Diabetic</option>
                  <option value="Type 2 Diabetic">Type 2 Diabetic</option>
                  <option value="Non Diabetic">Non Diabetic</option>
                  <option value="Pre-Diabetic">Pre-Diabetic</option>
                  <option value="Don't Know">Don't Know</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Since how long</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    disabled={diabteticType === "Non Diabetic"}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    disabled={diabteticType === "Non Diabetic"}
                  >
                    <option value="">Month</option>
                    {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ].map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={diabteticType === "Non Diabetic"}
                  >
                    <option value="">Year</option>
                    {Array.from(
                      { length: currentYear - 1950 + 1 },
                      (_, i) => currentYear - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Any Family History of Diabetes?</label>
                <div className="d-flex gap-2">
                  <input
                    type="radio"
                    className="btn-check"
                    name="family-history"
                    id="familyYes"
                    checked={familyHistory}
                    onChange={() => setFamilyHistory(true)}
                  />
                  <label className="btn customRadioDarkBlue" htmlFor="familyYes">
                    Yes
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="family-history"
                    id="familyNo"
                    checked={!familyHistory}
                    onChange={() => setFamilyHistory(false)}
                  />
                  <label className="btn customRadioDarkBlue" htmlFor="familyNo">
                    No
                  </label>
                </div>
              </div>

              {familyHistory && (
                <div className="mb-3">
                  <label className="form-label">Which family members have diabetes?</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.keys(familyMembers).map((member) => (
                      <div key={member} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={member}
                          checked={familyMembers[member]}
                          onChange={() => handleFamilyMemberChange(member)}
                        />
                        <label className="form-check-label" htmlFor={member}>
                          {member.charAt(0).toUpperCase() + member.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>

                  {familyMembers.other && (
                    <div className="mt-3">
                      <label className="form-label">Specify other family member</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otherFamilyMember}
                        onChange={(e) => setOtherFamilyMember(e.target.value)}
                        placeholder="Enter relationship"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="caregiverCheck"
                  checked={hasCaregiver}
                  onChange={() => setHasCaregiver(!hasCaregiver)}
                />
                <label className="form-check-label" htmlFor="caregiverCheck">
                  Have a caregiver? <small>(Access to all your health data)</small>
                  <p className="fs-small w-md-60 text-muted">
                    Caregiver may be family members or friends who will have
                    access to all your health data
                  </p>
                </label>
              </div>

              <div className="mb-2">
                <span
                  className="fw-bold link-danger text-mainRed cursor-pointer"
                  onClick={handlePartnerCodeClick}
                >
                  Partner Code
                </span>

                {showPartnerInput && (
                  <div className="input-group mt-2 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={partnerCode}
                      onChange={(e) => setPartnerCode(e.target.value)}
                      placeholder="Enter Partner Code"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleVerifyPartnerCode}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-outline-secondary w-100 icon-box btn border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>

              <p className="mt-3 text-muted text-center small">
                We'll never sell or inappropriately share your personal data.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CaregiverDetails = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { fullDetails, userName } = location.state || {};

  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverMobile, setCaregiverMobile] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      if (!caregiverName || !caregiverMobile || !relationship) {
        throw new Error("Please fill out all caregiver information.");
      }

      const updatedDetails = {
        ...fullDetails,
        caregiversname: caregiverName,
        caregiversnumber: caregiverMobile,
        relationship,
      };

      const formData = new FormData();
      Object.entries(updatedDetails).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      setIsSubmitting(true);
      const response = await dispatch(updateUser(formData)).unwrap();

      if (response.success) {
        toast.success("Caregiver details added successfully");
        navigate("/dashboard");
      } else {
        throw new Error(response.message || "Failed to add caregiver details");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid login-container bg-white py-5">
      <div className="row w-md-90 align-items-center">
        <div className="col-md-6 login-image d-none d-md-block">
          <img src={RegisterImg} alt="Illustration" className="img-fluid" />
        </div>

        <div className="col-md-6 col-12">
          <div className="w-95 mx-auto">
            <h3 className="text-dark text-center mb-4">
              Hi <strong className="text-mainBlue">{userName}</strong>
            </h3>
            <h5 className="text-center mb-4">Enter Caregiver Information</h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name of your Caregiver</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="How can we call your caregiver?"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter mobile number"
                  value={caregiverMobile}
                  onChange={(e) => setCaregiverMobile(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Relationship</label>
                <select
                  className="form-select"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-outline-secondary w-100 icon-box btn border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>

              <p className="mt-3 text-muted text-center small">
                We'll never sell or inappropriately share your personal data.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Register, RegisterStep2, CaregiverDetails };