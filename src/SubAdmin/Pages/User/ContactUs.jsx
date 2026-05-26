import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Linkedin } from "react-bootstrap-icons";
 
function ContactUs() {
  const {
    getContact,
    addContact,
    updateContact,
    loadingContact,
    errorContact,
    contactDataSub,
  } = useContext(MyContext);
 
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    registeredAddress: "",
    postalAddress: "",
    facebookLink: "",
    instaLink: "",
    youtubeLink: "",
    linkedinLink: "",
    twitterLink: "",
    androidAppLink: "",
    iosAppleLink: "",
  });
 
  const [message, setMessage] = useState("");
 
  // Load existing contact data into form
  useEffect(() => {
    fetchContactData();
  }, []);
 
  useEffect(() => {
    if (contactDataSub) {
      setFormData({
        email: contactDataSub.email || "",
        phone: contactDataSub.phone || "",
        registeredAddress: contactDataSub.registeredAddress || "",
        postalAddress: contactDataSub.postalAddress || "",
        facebookLink: contactDataSub.facebookLink || "",
        instaLink: contactDataSub.instaLink || "",
        linkedinLink: contactDataSub.linkedinLink || "",
        youtubeLink: contactDataSub.youtubeLink || "",
        twitterLink: contactDataSub.twitterLink || "",
        androidAppLink: contactDataSub.androidAppLink || "",
        iosAppleLink: contactDataSub.iosAppleLink || "",
      });
    }
  }, [contactDataSub]);
 
  const fetchContactData = async () => {
    try {
      await getContact();
    } catch (error) {
      console.error('Error fetching contact data:', error);
    }
  };
 
  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // Handle UPDATE or CREATE
  const handleSubmit = async () => {
    setMessage("");
   
    try {
      let response;
      if (contactDataSub?._id) {
        response = await updateContact(formData);
      } else {
        response = await addContact(formData);
      }
 
      if (response.success) {
        setMessage("Contact details saved successfully!");
        await getContact(); // Refresh data
      } else {
        setMessage(response.error || "Failed to save contact details");
      }
    } catch (error) {
      setMessage(errorContact || "An error occurred while saving");
    }
  };
 
  // Field labels mapping
  const fieldLabels = {
    email: "Email",
    phone: "Phone",
    registeredAddress: "Registered Address",
    postalAddress: "Postal Address",
    facebookLink: "Facebook Link",
    instaLink: "Instagram Link",
    youtubeLink: "YouTube Link",
    twitterLink: "Twitter Link",
    linkedinLink: "LinkedIn Link",
    androidAppLink: "Android App Link",
    iosAppleLink: "iOS App Link"
  };
 
  return (
    <div className="container py-4">
      <div className="shadow p-4 bg-white rounded" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 className="fw-bold mb-4 text-primary">Sub-Admin – Contact Settings</h2>
 
        {/* Messages */}
        {loadingContact && <p className="text-info">Loading contact details...</p>}
        {errorContact && <p className="text-danger">{errorContact}</p>}
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
 
        <div className="row g-3">
          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">
              <i className="fas fa-envelope me-2"></i>
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>
 
          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">
              <i className="fas fa-phone me-2"></i>
              Phone
            </label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
 
          {/* Registered Address */}
          <div className="col-12">
            <label className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i>
              Registered Address
            </label>
            <textarea
              name="registeredAddress"
              className="form-control"
              rows="2"
              value={formData.registeredAddress}
              onChange={handleChange}
              placeholder="Enter registered office address"
            ></textarea>
          </div>
 
          {/* Postal Address */}
          <div className="col-12">
            <label className="form-label">
              <i className="fas fa-mail-bulk me-2"></i>
              Postal Address
            </label>
            <textarea
              name="postalAddress"
              className="form-control"
              rows="2"
              value={formData.postalAddress}
              onChange={handleChange}
              placeholder="Enter postal address"
            ></textarea>
          </div>
 
          {/* Social Media Links */}
          <div className="col-12">
            <h5 className="mt-4 mb-3">
              <i className="fas fa-share-alt me-2"></i>
              Social Media & App Links
            </h5>
          </div>
 
          {["facebookLink", "instaLink", "youtubeLink", "twitterLink", "linkedinLink"].map((field) => (
            <div className="col-md-6" key={field}>
              <label className="form-label">
                {field === 'facebookLink' && <i className="fab fa-facebook me-2 text-primary"></i>}
                {field === 'instaLink' && <i className="fab fa-instagram me-2 text-danger"></i>}
                {field === 'youtubeLink' && <i className="fab fa-youtube me-2 text-danger"></i>}
                {field === 'twitterLink' && <i className="fab fa-twitter me-2 text-info"></i>}
                {field === 'linkedinLink' && <i className="fab fa-linkedin me-2 text-primary"></i>}
                {fieldLabels[field]}
              </label>
              <input
                type="text"
                name={field}
                className="form-control"
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Enter ${fieldLabels[field]}`}
              />
            </div>
          ))}
 
          {/* App Links */}
          <div className="col-md-6">
            <label className="form-label">
              <i className="fab fa-android me-2 text-success"></i>
              Android App Link
            </label>
            <input
              type="text"
              name="androidAppLink"
              className="form-control"
              value={formData.androidAppLink}
              onChange={handleChange}
              placeholder="Enter Android app download link"
            />
          </div>
 
          <div className="col-md-6">
            <label className="form-label">
              <i className="fab fa-apple me-2"></i>
              iOS App Link
            </label>
            <input
              type="text"
              name="iosAppleLink"
              className="form-control"
              value={formData.iosAppleLink}
              onChange={handleChange}
              placeholder="Enter iOS app download link"
            />
          </div>
        </div>
 
        {/* Save Button */}
        <div className="mt-4 text-end">
          <button
            className="btn btn-primary px-4 py-2"
            onClick={handleSubmit}
            disabled={loadingContact}
          >
            {loadingContact ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {contactDataSub?._id ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {contactDataSub?._id ? "Update Contact Info" : "Create Contact Info"}
              </>
            )}
          </button>
         
          {contactDataSub && (
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={fetchContactData}
              disabled={loadingContact}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          )}
        </div>
 
        {/* Current Data Preview (for debugging) */}
        {contactDataSub && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="mb-2">
              <i className="fas fa-info-circle me-2 text-info"></i>
              Current Contact Data
            </h6>
            <div className="row small">
              <div className="col-md-4">
                <strong>Email:</strong> {contactDataSub.email || 'Not set'}
              </div>
              <div className="col-md-4">
                <strong>Phone:</strong> {contactDataSub.phone || 'Not set'}
              </div>
              <div className="col-md-4">
                <strong>Last Updated:</strong> {new Date(contactDataSub.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
export default ContactUs;
 
 