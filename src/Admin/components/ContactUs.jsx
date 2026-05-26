import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { Linkedin } from "react-bootstrap-icons";
 
function ContactAdmin() {
  const {
    contactDataAdmin,
    fetchContactDataAdmin,
    updateContactData,
    createContactData,
    loading,
    error,
  } = useContext(MyContext);
 
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    registeredAddress: "",
    postalAddress: "",
    facebookLink: "",
    instaLink: "",
    youtubeLink: "",
    linkedinLink:"",
    twitterLink: "",
    androidAppLink: "",
    iosAppleLink: "",
  });
 
  // Load existing contact data into form
  useEffect(() => {
    fetchContactDataAdmin();
  }, []);
 
  useEffect(() => {
    if (contactDataAdmin) {
      setFormData({
        email: contactDataAdmin.email || "",
        phone: contactDataAdmin.phone || "",
        registeredAddress: contactDataAdmin.registeredAddress || "",
        postalAddress: contactDataAdmin.postalAddress || "",
        facebookLink: contactDataAdmin.facebookLink || "",
        instaLink: contactDataAdmin.instaLink || "",
        linkedinLink: contactDataAdmin.linkedinLink || "",
        youtubeLink: contactDataAdmin.youtubeLink || "",
        twitterLink: contactDataAdmin.twitterLink || "",
        androidAppLink: contactDataAdmin.androidAppLink || "",
        iosAppleLink: contactDataAdmin.iosAppleLink || "",
      });
    }
  }, [contactDataAdmin]);
 
  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // Handle UPDATE or CREATE
  const handleSubmit = async () => {
    let response;
 
    if (contactDataAdmin?._id) {
      response = await updateContactData(formData);
    } else {
      response = await createContactData(formData);
    }
 
    if (response.success) {
      alert("Contact details saved successfully!");
    } else {
      alert(response.error);
    }
  };
 
  return (
    <div className="container py-4">
      <div className="shadow p-4 bg-white rounded" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 className="fw-bold mb-4 text-primary">Admin – Contact Settings</h2>
 
        {loading && <p className="text-info">Loading...</p>}
        {error && <p className="text-danger">{error}</p>}
 
        <div className="row g-3">
         
          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
 
          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
 
          {/* Registered Address */}
          <div className="col-12">
            <label className="form-label">Registered Address</label>
            <textarea
              name="registeredAddress"
              className="form-control"
              rows="2"
              value={formData.registeredAddress}
              onChange={handleChange}
            ></textarea>
          </div>
 
          {/* Postal Address */}
          <div className="col-12">
            <label className="form-label">Postal Address</label>
            <textarea
              name="postalAddress"
              className="form-control"
              rows="2"
              value={formData.postalAddress}
              onChange={handleChange}
            ></textarea>
          </div>
 
          {/* Social & App Links */}
          {[
            "facebookLink",
            "instaLink",
            "youtubeLink",
            "twitterLink",
            "androidAppLink",
            "linkedinLink",
            "iosAppleLink",
          ].map((field) => (
            <div className="col-12" key={field}>
              <label className="form-label">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                className="form-control"
                value={formData[field]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
 
        {/* Save Button */}
        <div className="mt-4 text-end">
          <button
            className="btn btn-primary px-4"
            onClick={handleSubmit}
            disabled={loading}
          >
            {contactDataAdmin?._id ? "Update Contact Info" : "Create Contact Info"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
export default ContactAdmin;
 
 