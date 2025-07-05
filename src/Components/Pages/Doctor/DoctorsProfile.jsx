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
            
            /* New styles from the design */
            :root {
              --bglightgreencolor: #6d32eb36;
              --bgdarkgreencolor: #6D32EB;
              --bgpinklightcolor: #FDEBEC;
              --bgpinkdarkcolor: #eb5f649f;
              --text-greendark: #6D32EB;
              --bg-gray: #F5F5F5;
              --purpleborder-color: #3D3F96;
              --purpletext-color: #3D3F96;
            }
            
            .checkboxxbuttonnn .time-btn {
              background-color: rgb(249, 246, 246);
              color: black !important;
              border: 2px solid lightgray;
              transition: all 0.3s ease;
              border-radius: 8px;
            }
            
            .btn-check:checked+.time-btn {
              background-color: #f48c9056 !important;
              border-color: #EB3239 !important;
              color: white !important;
            }
            
            .purpletext {
              color: var(--purpletext-color) !important;
              font-weight: 600 !important;
            }
            
            .checkboxxbuttonnn .time-btn:hover {
              background-color: #f48c9056 !important;
              border-color: #EB3239 !important;
              color: white !important;
            }
            
            .checkboxxbuttonnn .time-btn:focus {
              outline: none;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
            }
            
            .checkboxxbuttonnn .time-btn:active {
              transform: scale(0.95);
            }
            
            .bgpurple {
              background-color: var(--purpleborder-color) !important;
            }
            
            .purpleborder {
              border: 3px solid var(--purpleborder-color) !important;
              font-weight: 600 !important;
            }
            
            .bglightgreencolor {
              background-color: var(--bglightgreencolor) !important;
            }
            
            .bggray {
              background-color: var(--bg-gray) !important;
            }
            
            .bgdarkgreencolor {
              background-color: var(--bgdarkgreencolor) !important;
            }
            
            .bglightpinkcolor {
              background-color: var(--bgpinklightcolor) !important;
            }
            
            .bgdarkpinkcolor {
              background-color: var(--bgpinkdarkcolor) !important;
            }
            
            .text-darkgreen {
              color: var(--text-greendark) !important;
            }
            
            .siftsnavtabs .nav-item .nav-link {
              background-color: #fff;
              padding: 15px 40px;
              color: black !important;
              font-weight: 600;
            }
            
            .siftsnavtabs .nav-item .nav-link.active {
              background-color: #fff;
              padding: 15px 40px;
              border-bottom: 3px solid #0d6efd;
              border-radius: 0px !important;
              color: rgb(116, 114, 114) !important;
              font-weight: 600;
            }
            
            .slot-heading {
              position: relative;
              display: inline-block;
              padding: 0 1rem;
              font-weight: 500;
            }
            
            .slot-heading::before,
            .slot-heading::after {
              content: "";
              position: absolute;
              top: 50%;
              width: 200px;
              height: 1px;
              background-color: gray;
            }
            
            .slot-heading::before {
              left: -210px;
            }
            
            .slot-heading::after {
              right: -210px;
            }
            
            .cardrapper {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 30px;
            }
            
            .visitedcard {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
              gap: 30px;
            }
            
            @media screen and (max-width: 768px) {
             .width-hundred {
              width: 100% !important;
             }
            }
            
            .date-carousel .date-card {
              width: 120px;
              height: 120px;
              border-radius: 12px;
              border: 1px solid #eee;
              text-align: center;
              padding: 10px;
              margin: 5px;
              transition: 0.3s;
              color: #999;
              background-color: #fff;
            }
            
            .date-carousel .date-card .day {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 4px;
            }
            
            .date-carousel .date-card .date {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
            }
            
            .date-carousel .date-card .month {
              font-size: 12px;
              color: #bbb;
            }
            
            .date-carousel .date-card.active {
              background-color: #fff0f0;
              border: 1px solid #f66;
              color: #000;
            }
            
            .date-carousel .date-card.active .day,
            .date-carousel .date-card.active .date,
            .date-carousel .date-card.active .month {
              color: #000;
            }
            
            .roundedcss {
              border-radius: 250px 20px 20px 0px;
              width: 25%;
              height: 100%;
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

              {/* Education & Contact Info Section */}
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

              {/* Booking Slot Section */}
              <div className="container bg-white overflow-x-hidden my-4">
                <div className="row d-flex px-1 justify-content-center border rounded-3">
                  <div className="col-md-12 d-flex p-0 rounded-3 justify-content-between bglightgreencolor">
                    <div className="flex-column d-flex justify-content-center">
                      <h2 className="ps-3">Digital Consult</h2>
                      <p className="m-0 ps-3">Consult Today</p>
                    </div>
                    <div className="py-5 d-flex justify-content-center align-items-center bgdarkgreencolor d-none d-md-flex roundedcss">
                      <p className="text-white fs-3">₹ 900</p>
                    </div>
                  </div>
                  <div className="col-md-12 p-0">
                    <ul className="nav nav-pills bg-light gap-2 py-1 p-2 mb-2 siftsnavtabs" id="pills-tab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button className="nav-link active fs-3" id="pills-morning-tab" data-bs-toggle="pill"
                          data-bs-target="#pills-morning" type="button" role="tab" aria-controls="pills-morning"
                          aria-selected="true">15 May</button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button className="nav-link fs-3" id="pills-afternoon-tab" data-bs-toggle="pill"
                          data-bs-target="#pills-afternoon" type="button" role="tab" aria-controls="pills-afternoon"
                          aria-selected="false">16 May</button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button className="nav-link fs-3" id="pills-evening-tab" data-bs-toggle="pill" data-bs-target="#pills-evening"
                          type="button" role="tab" aria-controls="pills-evening" aria-selected="false">17 May</button>
                      </li>
                    </ul>
                    <div className="tab-content" id="pills-tabContent">
                      <div className="tab-pane fade show active" id="pills-morning" role="tabpanel" aria-labelledby="pills-morning-tab">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded-3 checkboxxbuttonnn">
                              <input type="radio" className="btn-check" name="time" id="btn-check-1" autoComplete="off" />
                              <label className="btn time-btn px-3 py-2" htmlFor="btn-check-1">
                                <i className="fa-solid fa-cloud-sun me-1 fs-5 text-secondary"></i>
                                <span className="fs-5 fw-semibold text-black">Morning</span>
                              </label>
                              
                              <input type="radio" className="btn-check" name="time" id="btn-check-2" autoComplete="off" />
                              <label className="btn time-btn px-3 py-2" htmlFor="btn-check-2">
                                <i className="fa-solid fa-sun me-1 fs-5 text-secondary"></i>
                                <span className="fs-5 fw-semibold text-black">Afternoon</span>
                              </label>
                              
                              <input type="radio" className="btn-check" name="time" id="btn-check-3" autoComplete="off" />
                              <label className="btn time-btn px-3 py-2" htmlFor="btn-check-3">
                                <i className="fa-solid fa-moon me-1 fs-5 text-secondary"></i>
                                <span className="fs-5 fw-semibold text-black">Evening</span>
                              </label>
                            </div>
                          </div>
                          <div className="col-md-12 py-2">
                            <div className="d-flex flex-wrap justify-content-between align-items-center bglightgreencolor p-4">
                              <div className="flex-column">
                                <h6>Morning Slot are from</h6>
                                <h4>08:45 AM - 09:45 AM</h4>
                              </div>
                              <div className="text-div">
                                <p className="text-darkgreen fs-4">All slot Available</p>
                              </div>
                            </div>
                            <div className="d-flex align-items-center d-none d-md-flex justify-content-center my-4">
                              <h2 className="slot-heading text-center text-secondary">Slot</h2>
                            </div>
                            <div className="carddiv p-2 my-5">
                              <div className="cardrapper">
                                {[1, 2, 3, 4, 5].map((item) => (
                                  <div key={item} className="card p-1 bgdarkpinkcolor rounded-3">
                                    <div className="textttdiv py-3 rounded-4 bglightpinkcolor">
                                      <h6 className="text-center pt-3">8:45 AM</h6>
                                    </div>
                                    <div className="card-body">
                                      <h6 className="text-white">hurry up few sloat left</h6>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="flex-wrap d-flex justify-content-center gap-3">
                              <button className="btn btn-white width-hundred mt-2 purpleborder purpletext fs-3 py-3 px-5" data-bs-toggle="modal" data-bs-target="#view-slotmodal">
                                View all slots
                              </button>
                              <button className="btn btn-white d-none d-md-block mt-2 bgpurple text-white fs-3 py-3 px-5">
                                Booked all slots
                              </button>
                            </div>
                          </div>
                          <div className="col-md-12 sticy-bottom bottom-0 shadow-lg">
                            <button className="btn btn-white d-md-none w-100 mt-2 bgpurple text-white fs-3 py-3 px-5">
                              Booked all slots
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Other tab panes (afternoon, evening) would go here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Slot Modal */}
      <div className="modal fade" id="view-slotmodal" tabIndex="-1" aria-labelledby="view-slotmodalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="view-slotmodalLabel">Select time slot</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-3 p-2" style={{ width: "100%" }}>
                      <div className="row g-0">
                        <div className="col-md-4">
                          <img className="rounded-3" src="https://img.freepik.com/free-photo/doctors-day-handsome-brunette-cute-guy-medical-gown-with-crossed-hands_140725-162942.jpg" className="img-fluid rounded-start" width="100%" alt="..." />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body">
                            <h5 className="card-title">Dr. {pDoctor?.name}</h5>
                            <p className="card-text m-0">{pDoctor?.qualification?.qualification || "Specialist"} with {pDoctor?.experience || "several years"} of experience</p>
                            <div className="flex gap-1">
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star-half-stroke text-warning"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="card p-2 py-5">
                      <h3 className="text-danger">Digital Consultation Schedule</h3>
                      <small className="fw-bold">Morning</small>
                      <h4>15-May-2024 08:45 AM - 09:45AM</h4>
                    </div>
                  </div>
                </div>
                <div className="row py-3">
                  <h3 className="text-secondary text-center">Date</h3>
                  <div className="owl-carousel date-carousel">
                    <div className="date-card rounded-4 active">
                      <div className="day">Mon</div>
                      <div className="date">15</div>
                      <div className="month">MAY</div>
                    </div>
                    <div className="date-card rounded-4 border-light border-3 shadow">
                      <div className="day">Tues</div>
                      <div className="date">16</div>
                      <div className="month">MAY</div>
                    </div>
                    <div className="date-card rounded-4 border-light border-3 shadow">
                      <div className="day">Wed</div>
                      <div className="date">17</div>
                      <div className="month">MAY</div>
                    </div>
                    <div className="date-card rounded-4 border-light border-3 shadow">
                      <div className="day">Thu</div>
                      <div className="date">18</div>
                      <div className="month">MAY</div>
                    </div>
                    <div className="date-card rounded-4 border-light border-3 shadow">
                      <div className="day">Fri</div>
                      <div className="date">19</div>
                      <div className="month">MAY</div>
                    </div>
                    <div className="date-card rounded-4 border-light border-3 shadow">
                      <div className="day">Sat</div>
                      <div className="date">20</div>
                      <div className="month">MAY</div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 checkboxxbuttonnn">
                      <input type="radio" className="btn-check" name="time" id="modal-btn-check-1" autoComplete="off" />
                      <label className="btn time-btn px-3 py-2" htmlFor="modal-btn-check-1">
                        <i className="fa-solid fa-cloud-sun me-1 fs-5 text-secondary"></i>
                        <span className="fs-5 fw-semibold text-black">Morning</span>
                      </label>
                      
                      <input type="radio" className="btn-check" name="time" id="modal-btn-check-2" autoComplete="off" />
                      <label className="btn time-btn px-3 py-2" htmlFor="modal-btn-check-2">
                        <i className="fa-solid fa-sun me-1 fs-5 text-secondary"></i>
                        <span className="fs-5 fw-semibold text-black">Afternoon</span>
                      </label>
                      
                      <input type="radio" className="btn-check" name="time" id="modal-btn-check-3" autoComplete="off" />
                      <label className="btn time-btn px-3 py-2" htmlFor="modal-btn-check-3">
                        <i className="fa-solid fa-moon me-1 fs-5 text-secondary"></i>
                        <span className="fs-5 fw-semibold text-black">Evening</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row my-3">
                  <div className="cardrapper">
                    <div className="card p-1 bgdarkpinkcolor rounded-3">
                      <div className="textttdiv py-3 rounded-4 bglightpinkcolor">
                        <h6 className="text-center pt-3">8:45 AM</h6>
                      </div>
                      <div className="card-body">
                        <h6 className="text-white">hurry up few sloat left</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row my-2 py-3">
                  <div className="col-md-4 text-center fs-3">
                    <i className="fa-regular fa-clock text-primary"></i>
                    <h6>Guaranteed 10 minutes <br /> Consultation</h6>
                  </div>
                  <div className="col-md-4 text-center fs-3">
                    <i className="fa-regular fa-clock text-primary"></i>
                    <h6>Qualified and awarded <br /> Doctors</h6>
                  </div>
                  <div className="col-md-4 text-center fs-3">
                    <i className="fa-regular fa-clock text-primary"></i>
                    <h6>Get valid Prescriptions</h6>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer shadow">
              <button type="button" className="bgpurple px-5 mx-auto rounded-3 py-2 fs-2 text-white" data-bs-toggle="modal" data-bs-target="#order-details">
                Book Consultation offline
              </button>
              <button type="button" className="bgpurple px-5 mx-auto rounded-3 py-2 fs-2 text-white" data-bs-toggle="modal" data-bs-target="#order-details">
                Book Consultation online
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <div className="modal fade" id="order-details" tabIndex="-1" aria-labelledby="order-detailsLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="order-detailsLabel">Select time slot</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-3 p-2" style={{ width: "100%" }}>
                      <div className="row g-0">
                        <div className="col-md-4">
                          <img className="rounded-3" src="https://img.freepik.com/free-photo/doctors-day-handsome-brunette-cute-guy-medical-gown-with-crossed-hands_140725-162942.jpg" className="img-fluid rounded-start" width="100%" alt="..." />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body">
                            <h5 className="card-title">Dr. {pDoctor?.name}</h5>
                            <p className="card-text m-0">{pDoctor?.qualification?.qualification || "Specialist"} with {pDoctor?.experience || "several years"} of experience</p>
                            <div className="flex gap-1">
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star text-warning"></i>
                              <i className="fa-solid fa-star-half-stroke text-warning"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <h5>Patient Information</h5>
                    <div className="d-flex gap-5">
                      <h6>Full Name - Sohib</h6>
                    </div>
                    <div className="d-flex gap-5">
                      <h6>Age - 29 years</h6>
                    </div>
                    <div className="d-flex gap-5">
                      <h6>Mobile - 99999999999</h6>
                    </div>
                  </div>
                  <hr />
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <h5>Date & Time</h5>
                    <div className="d-flex gap-5">
                      <h6>Morning</h6>
                    </div>
                    <div className="d-flex gap-5">
                      <h6>Wednesday, May 15, 2024</h6>
                    </div>
                    <div className="d-flex gap-5">
                      <h6>08:45 AM - 09:45AM</h6>
                    </div>
                  </div>
                  <hr />
                </div>
                <hr />
                <div className="row">
                  <h6>Location</h6>
                  <p className="m-0">{pDoctor?.address || "Not specified"}</p>
                </div>
                <hr />
                <div className="row">
                  <h6>Free Information</h6>
                  <h6 className="text-danger">₹ 900.00</h6>
                </div>
              </div>
            </div>
            <div className="modal-footer shadow">
              <button type="button" className="bgpurple px-5 mx-auto rounded-3 py-2 fs-2 text-white">
                Book Consultation
              </button>a
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorsProfile;
