import React, { useContext } from "react";
import { MyContext } from "../../../Context/Context";
 
function ContactUs() {
  const { fetchContactData, contactData } = useContext(MyContext);
 
  return (
    <div className="container py-5">
      <div
        className="p-4 p-md-5 shadow rounded bg-white"
        style={{ maxWidth: "700px", margin: "0 auto" }}
      >
        <h3 className="fw-bold mb-4 text-primary-emphasis">Contact Us</h3>
 
        {/* Email */}
        {contactData && (
          <div className="d-flex align-items-start mb-3">
            <i className="fa-solid fa-envelope fs-4 text-primary me-3"></i>
            <div>
              <strong>Mail us at:</strong> <br />
              <span className="text-secondary">{contactData.email}</span>
            </div>
          </div>
        )}
 
        {/* Phone */}
        {contactData && (
          <div className="d-flex align-items-start mb-3">
            <i className="fa-solid fa-phone fs-4 text-success me-3"></i>
            <div>
              <strong>Phone:</strong> <br />
              <span className="text-secondary">{contactData.phone}</span>
            </div>
          </div>
        )}
 
        {/* Location */}
        {contactData && (
          <div className="d-flex align-items-start mb-3">
            <i className="fa-solid fa-location-dot fs-4 text-warning me-3"></i>
            <div>
              <strong>Our Location:</strong>
 
              <p className="text-secondary mb-1">
                <strong>Registered Address:</strong> <br />
                {contactData.registeredAddress}
              </p>
 
              <p className="text-secondary mb-0">
                <strong>Postal Address / Corporate Address:</strong> <br />
                {contactData.postalAddress}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
export default ContactUs;
 
 