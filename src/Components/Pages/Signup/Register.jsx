import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser, verifypromo } from "../../../Redux/signupSlice";
import RegisterImg from "../../Assets/img/Account/Register.png";
import maleImg from "../../Assets/img/Account/male.png";
import femaleImg from "../../Assets/img/Account/female.png";
import { toast } from "react-toastify";

// Button ke liye common style jo hover par bhi change nahi hogi
const solidBtnStyle = {
  backgroundColor: "#0d6efd", // Aapka mainBlue color hex yahan daal sakte hain
  color: "white",
  border: "none",
  transition: "none", // Hover effect band karne ke liye
};

// --- STEP 1: REGISTER ---
const Register = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const userData = { name, gender, birthyear: dob, dob: dob };
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
                  className="form-control shadow-none"
                  placeholder="Enter your full name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Year of birth</label>
                <select
                  className="form-select shadow-none"
                  value={dob}
                  required
                  onChange={(e) => setDob(e.target.value)}
                >
                  <option value="">Select year of birth</option>
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
                  <input type="radio" className="btn-check" name="gender" id="male" value="Male" checked={gender === "Male"} onChange={() => setGender("Male")} />
                  <label className="btn customRadioDarkBlue" htmlFor="male">
                    <img src={maleImg} className="smallImg" alt="" /> Male
                  </label>
                  <input type="radio" className="btn-check" name="gender" id="female" value="Female" checked={gender === "Female"} onChange={() => setGender("Female")} />
                  <label className="btn customRadioDarkBlue" htmlFor="female">
                    <img src={femaleImg} className="smallImg" alt="" /> Female
                  </label>
                </div>
              </div>
              {/* FIXED BUTTON: No Hover Effect */}
              <button
                type="submit"
                className="btn w-100 py-2 fw-bold shadow-sm"
                style={solidBtnStyle}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STEP 2: REGISTER STEP 2 ---
const RegisterStep2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const { userData, userName } = location.state || {};

  const [diabteticType, setDiabteticType] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bloodgroup, setBloodgroup] = useState("");
  const [dailyactivity, setDailyactivity] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [familyHistory, setFamilyHistory] = useState(false);
  const [familyMembers, setFamilyMembers] = useState({ mother: false, sister: false, grandmother: false, grandfather: false, other: false });
  const [otherFamilyMember, setOtherFamilyMember] = useState("");
  
  const [showPartnerInput, setShowPartnerInput] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");
  const [hasCaregiver, setHasCaregiver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyPartnerCode = async () => {
    if(!partnerCode) return toast.warn("Please enter code");
    setIsSubmitting(true);
    try {
      const response = await dispatch(verifypromo({ partnerCode })).unwrap();
      if (response.success === 1) toast.success("Verified successfully");
      else toast.error("Invalid Partner Code");
    } catch (error) { toast.error("Verification failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      let historyArr = Object.entries(familyMembers)
        .filter(([_, checked]) => checked)
        .map(([name]) => (name === "other" ? otherFamilyMember : name));

      const duration = (day && month && year) ? `${day}/${month}/${year}` : "";

      const fullDetails = {
        ...userData,
        diabteticType,
        diabeticduration: duration,
        familyhistorydiabetic: historyArr,
        occupation, bloodgroup, dailyactivity, weight, height,
        partnerCode: partnerCode,
        hasCaregiver
      };

      const formData = new FormData();
      Object.entries(fullDetails).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach(item => formData.append(key, item));
        else formData.append(key, value);
      });

      const response = await dispatch(updateUser(formData)).unwrap();

      if (response.success) {
        toast.success("Details updated successfully");
        if (hasCaregiver) {
          navigate("/CaregiverDetails", { state: { fullDetails: response.details || fullDetails, userName } });
        } else {
          navigate("/"); 
        }
      }
    } catch (error) { toast.error("Update failed"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-fluid login-container bg-white py-5">
      <div className="row w-lg-90 align-items-start">
        <div className="col-md-5 d-none d-md-block">
          <img src={RegisterImg} alt="img" className="img-fluid" />
        </div>

        <div className="col-md-7 col-12">
          <div className="w-95 mx-auto p-4 shadow rounded border">
            <div className="float-start">
              <Link to="/Register" className="btn btn-light rounded-circle shadow-sm me-3">
                <i className="ri-arrow-go-back-line fs-5 text-dark"></i>
              </Link>
            </div>
            <h3 className="text-center mb-4">Hey <span className="text-mainBlue">{userName}</span>, Setup Profile</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Diabetic Type</label>
                  <select className="form-select shadow-none" value={diabteticType} onChange={(e) => setDiabteticType(e.target.value)} required>
                    <option value="">Select Type</option>
                    <option value="Type 1 Diabetic">Type 1 Diabetic</option>
                    <option value="Type 2 Diabetic">Type 2 Diabetic</option>
                    <option value="Non Diabetic">Non Diabetic</option>
                    <option value="Pre-Diabetic">Pre-Diabetic</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Occupation</label>
                  <input type="text" className="form-control shadow-none" placeholder="Your profession" onChange={(e)=>setOccupation(e.target.value)} />
                </div>
              </div>

              {/* ORIGINAL DROPDOWNS RESTORED */}
              <div className="mb-3">
                <label className="form-label">Since how long (Duration)</label>
                <div className="d-flex gap-2">
                  <select className="form-select shadow-none" value={day} onChange={(e) => setDay(e.target.value)} disabled={diabteticType === "Non Diabetic"}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="form-select shadow-none" value={month} onChange={(e) => setMonth(e.target.value)} disabled={diabteticType === "Non Diabetic"}>
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                      <option key={i+1} value={i+1}>{m}</option>
                    ))}
                  </select>
                  <select className="form-select shadow-none" value={year} onChange={(e) => setYear(e.target.value)} disabled={diabteticType === "Non Diabetic"}>
                    <option value="">Year</option>
                    {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select shadow-none" onChange={(e)=>setBloodgroup(e.target.value)}>
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="col-md-4"><label className="form-label">Weight (kg)</label><input type="number" className="form-control shadow-none" onChange={(e)=>setWeight(e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">Height (cm)</label><input type="number" className="form-control shadow-none" onChange={(e)=>setHeight(e.target.value)} /></div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Any Family History of Diabetes?</label>
                <div className="d-flex gap-2">
                  <input type="radio" className="btn-check" name="fh" id="fy" checked={familyHistory} onChange={()=>setFamilyHistory(true)} />
                  <label className="btn customRadioDarkBlue" htmlFor="fy">Yes</label>
                  <input type="radio" className="btn-check" name="fh" id="fn" checked={!familyHistory} onChange={()=>setFamilyHistory(false)} />
                  <label className="btn customRadioDarkBlue" htmlFor="fn">No</label>
                </div>
              </div>

              {familyHistory && (
                <div className="mb-3 p-3 bg-light rounded border">
                  <div className="d-flex flex-wrap gap-3">
                    {Object.keys(familyMembers).map(m => (
                      <div className="form-check" key={m}>
                        <input className="form-check-input" type="checkbox" checked={familyMembers[m]} onChange={() => setFamilyMembers((p) => ({ ...p, [m]: !p[m] }))} id={m}/>
                        <label className="form-check-label" htmlFor={m}>{m}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3 form-check"><input type="checkbox" className="form-check-input" id="c" checked={hasCaregiver} onChange={()=>setHasCaregiver(!hasCaregiver)} /><label className="form-check-label" htmlFor="c">I have a Caregiver</label></div>

              <div className="mb-4">
                <span className="text-danger fw-bold cursor-pointer" onClick={()=>setShowPartnerInput(!showPartnerInput)}>+ Partner Code</span>
                {showPartnerInput && (
                  <div className="input-group mt-2">
                    <input type="text" className="form-control shadow-none" placeholder="Enter Code" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} />
                    <button type="button" className="btn btn-outline-dark" onClick={handleVerifyPartnerCode}>Verify</button>
                  </div>
                )}
              </div>

              {/* FIXED BUTTON: No Hover Effect */}
              <button type="submit" className="btn w-100 py-2 fw-bold shadow-sm" style={solidBtnStyle} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STEP 3: CAREGIVER DETAILS ---
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
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(fullDetails).forEach(([key, value]) => {
        if(Array.isArray(value)) value.forEach(v => formData.append(key, v));
        else formData.append(key, value);
      });
      formData.append("caregiversname", caregiverName);
      formData.append("caregiversnumber", caregiverMobile);
      formData.append("relationship", relationship);

      const response = await dispatch(updateUser(formData)).unwrap();
      if (response.success) {
        toast.success("Profile registration complete!");
        navigate("/");
      }
    } catch (err) { toast.error("Error saving data"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="container py-5">
      <div className="col-md-6 mx-auto shadow p-4 rounded border bg-white">
        <h4 className="text-center mb-4">Caregiver Details</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3"><label>Name</label><input type="text" className="form-control shadow-none" required onChange={(e)=>setCaregiverName(e.target.value)}/></div>
          <div className="mb-3"><label>Mobile</label><input type="text" className="form-control shadow-none" required onChange={(e)=>setCaregiverMobile(e.target.value)}/></div>
          <div className="mb-3">
             <label>Relationship</label>
             <select className="form-select shadow-none" required onChange={(e)=>setRelationship(e.target.value)}>
                <option value="">Select</option>
                <option value="Son">Son</option><option value="Daughter">Daughter</option><option value="Spouse">Spouse</option><option value="Friend">Friend</option>
             </select>
          </div>
          {/* FIXED BUTTON: No Hover Effect */}
          <button type="submit" className="btn w-100 py-2 fw-bold shadow-sm" style={solidBtnStyle} disabled={isSubmitting}>Finish Registration</button>
        </form>
      </div>
    </div>
  );
};

export { Register, RegisterStep2, CaregiverDetails };