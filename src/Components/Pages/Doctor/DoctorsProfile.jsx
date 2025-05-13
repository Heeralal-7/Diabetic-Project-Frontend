import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Aos from "aos";
import { useContext } from "react";
import { MyContext } from "../../../Context/Context";

const DoctorsProfile = () => {
  useEffect(() => {
    Aos.init();
  }, []);

  const { getdoctorProfile, pDoctor } = useContext(MyContext);
  const { id } = useParams();

  useEffect(() => {
    getdoctorProfile(id);
  }, [id]);

  const imageUrl = `${process.env.REACT_APP_API_URL}/`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .jcdvcjhv:has(h1, h2, h3, h4, h5, h6) {
                font-family: "Cormorant Garamond", serif;
                font-weight: 500;
            }
          `,
        }}
      />

      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-md-12">
            <div className="w-100 text-dark">
              <div className="d-flex align-items-center justify-content-between">
                <h1 className="display-5 my-3 px-3">Doctor's Profile</h1>
                <Link
                  to="/Doctors"
                  className="btn btn-hoverBlue btn-light rounded-circle shadow me-3"
                >
                  <i className="ri-arrow-go-back-line fs-5 text-current fw-bold"></i>
                </Link>
              </div>

              {/* Profile Section */}
              <div
                data-aos="zoom-in-down"
                data-aos-easing="linear"
                data-aos-duration="1200"
                className="container-fluid py-5 px-3"
              >
                <div className="row align-items-center g-4">
                  {/* Doctor Image */}
                  <div className="col-md-4 text-center">
                    <img
                      src={`${imageUrl}${pDoctor?.image}`}
                      alt={`Dr. ${pDoctor?.name}`}
                      className="img-fluid border border-primary shadow"
                      style={{
                        width: "350px",
                        height: "350px",
                        objectFit: "cover",
                        borderRadius: "10%",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x600?text=Doctor+Image";
                      }}
                    />
                  </div>

                  {/* Doctor Name & About */}
                  <div className="col-md-8 text-md-start">
                    <h1 className="display-5 fw-bold mt-3 mt-md-0">Dr. {pDoctor?.name}</h1>

                    <p className="text-muted mt-3">
                      <h5>About Dr. {pDoctor?.name}</h5>
                      {pDoctor?.About ||
                        `Dr. ${pDoctor?.name} is a ${
                          pDoctor?.qualification?.qualification || "qualified"
                        } physician with ${
                          pDoctor?.experience || "several years"
                        } of experience in treating diverse conditions.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Education & Contact Info Section - Separate Row */}
              <div className="container-fluid py-4 px-3 px-md-5">
                <div className="row f-flex g-4">
                  {/* Education Left */}
                  <div className="col-md-6">
                    <h2 className="h4 fw-bold mb-3">🎓 Education & Credentials</h2>
                    <ul className="list-unstyled lh-lg border rounded-3 overflow-hidden shadow-sm">
                      {[
                        {
                          label: "Qualification",
                          value: pDoctor?.qualification?.qualification || "Not specified",
                        },
                        {
                          label: "Specialization",
                          value: pDoctor?.specialist?.specialists || "General Medicine",
                        },
                        {
                          label: "Experience",
                          value: pDoctor?.experience || "Not specified",
                        },
                        {
                          label: "Patients Treated",
                          value: pDoctor?.patientstreated || "0",
                        },
                      ].map((item, index) => (
                        <li
                          key={index}
                          className={`px-3 py-2 ${index % 2 === 0 ? "bg-light" : "bg-white"}`}
                          style={{ borderBottom: index < 3 ? "1px solid #dee2e6" : "none" }}
                        >
                          <strong className="text-dark">{item.label}:</strong> {item.value}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact Info Right */}
                  <div className="col-md-6">
                    <h2 className="h4 fw-bold mb-3">📞 Contact Info</h2>
                    <ul className="list-unstyled text-muted lh-lg border rounded-3 shadow-sm p-3">
                      <li><strong>Address:</strong> {pDoctor?.address || "Not specified"}</li>
                      <li><strong>City:</strong> {pDoctor?.city || "Not specified"}</li>
                      <li><strong>State:</strong> {pDoctor?.state || "Not specified"}</li>
                      <li><strong>Country:</strong> {pDoctor?.country || "Not specified"}</li>
                      <li><strong>Phone:</strong> {pDoctor?.phoneNumber || "Not available"}</li>
                      <li><strong>Email:</strong> {pDoctor?.email || "Not available"}</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* End of Education & Contact Section */}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorsProfile;
