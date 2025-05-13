import React, { useEffect } from "react";
import "../../Assets/Css/Clinic.css";
import { Link } from "react-router-dom";
import Aos from "aos";
import ImgSlide1 from "../../Assets/img/ClinicSlideImg1.jpg";
import ImgSlide2 from "../../Assets/img/ClinicSlideImg2.jpg";
import ImgSlide3 from "../../Assets/img/ClinicSlideImg3.jpg";

const ClinicPage1 = () => {
  useEffect(() => {
    Aos.init();
  });
  return (
    <>
      <section className="pb-5">
      
        <div className="container-fluid shadow-lg g-0">
          <div className="row g-0">
            <div className="col-md-12 ">
              <div
                id="carouselExampleIndicators"
                className="carousel slide"
                data-bs-ride="true"
              >
                <div className="carousel-indicators pb-4">
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to={0}
                    className="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  />
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to={1}
                    aria-label="Slide 2"
                  />
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to={2}
                    aria-label="Slide 3"
                  />
                </div>
                <div className="carousel-inner">
                  <div
                    className="carousel-item active ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide1})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                      {/* <div className="jhuh text-center">
                      <button className="px-4 border   fw-semibold py-3 ">
                        VIEW DEPARTMENT
                      </button>
                      <button className="px-4 border  text-dark fw-semibold py-3 bg-transparent mx-2 text-white">
                        VIEW DEPARTMENT
                      </button>
                    </div> */}
                    </div>
                  </div>
                  <div
                    className="carousel-item ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide2})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                      {/* <div className="jhuh text-center">
                      <button className="px-4 border   fw-semibold py-3 ">
                        VIEW DEPARTMENT
                      </button>
                      <button className="px-4 border  text-dark fw-semibold py-3 bg-transparent mx-2 text-white">
                        VIEW DEPARTMENT
                      </button>
                    </div> */}
                    </div>
                  </div>
                  <div
                    className="carousel-item ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide3})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                      {/* <div className="jhuh text-center">
                      <button className="px-4 border   fw-semibold py-3 ">
                        VIEW DEPARTMENT
                      </button>
                      <button className="px-4 border  text-dark fw-semibold py-3 bg-transparent mx-2 text-white">
                        VIEW DEPARTMENT
                      </button>
                    </div> */}
                    </div>
                  </div>
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-4 rounded-top pb-5 " style={{   marginTop: "-50px",   borderBottom: "4px solid var(--lightBlue-color)", }}
        >
          <div className="row justify-content-around px-3 bg-white rounded-2 py-md-3">
            <div className="col-md-4 mt-3 mt-md-0">
              <h3 className=" fw-semibold pt-3 ">Opening Hours</h3>
              <div className="hah d-flex  pt-3 justify-content-between">
                <h6
                  className="text-dark fw-semibold "
                  style={{ fontSize: "15px" }}
                >
                  Monday – Friday
                </h6>
                <h6 className=" fw-semibold " style={{ fontSize: "15px" }}>
                  8.00 – 18.00
                </h6>
              </div>
              <div className="hah d-flex  pt-3 justify-content-between">
                <h6
                  className="text-dark fw-semibold "
                  style={{ fontSize: "15px" }}
                >
                  Monday – Friday
                </h6>
                <h6 className=" fw-semibold " style={{ fontSize: "15px" }}>
                  8.00 – 18.00
                </h6>
              </div>
              <div className="hah d-flex  pt-3 justify-content-between">
                <h6
                  className="text-dark fw-semibold "
                  style={{ fontSize: "15px" }}
                >
                  Monday – Friday
                </h6>
                <h6 className=" fw-semibold " style={{ fontSize: "15px" }}>
                  8.00 – 18.00
                </h6>
              </div>
            </div>

            <div className="col-md-6 mt-3 mt-md-0">
              <h3 className=" fw-semibold pt-3 ">Emergency Cases</h3>
              <p className="fw-semibold fs-3">
                <i className="fa-solid fa-phone-volume me-2" />
                <span>0000000000</span>
              </p>
              <p
                className="text-medium text-muted pt-2"
                style={{ fontSize: "15px !important" }}
              >
                Your treatment plan is designed for steady progress, with every
                phase promptly implemented.
              </p>
            </div>
          </div>
        </div>
        <div className="container my-5  ">
          <div className="row d-flex justify-content-center ">
            <h1 className="text-center pb-5 display-5">Service</h1>
            <div
              className="CardContainerrr mx-auto"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              <div className="card cardhoverr-translate border-0">
                <div className="card-body py-3">
                  <img
                    src="	https://ld-wp73.template-help.com/wordpress/prod_13983/v3/wp-content/uploads/2019/10/icon-img-1.png"
                    width="25%"
                    height="50px"
                    alt=""
                  />
                  <h5 className="card-title  pt-2" style={{ fontSize: "17px" }}>
                    Experienced Physicians
                  </h5>
                  <p
                    className="card-text fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    Your health is your most important asset. You should entrust
                    it only to the best professionals.
                  </p>
                </div>
              </div>
              <div className="card cardhoverr-translate border-0">
                <div className="card-body py-3">
                  <img
                    src="		https://ld-wp73.template-help.com/wordpress/prod_13983/v3/wp-content/uploads/2019/10/icon-img-2.png"
                    width="25%"
                    height="50px"
                    alt=""
                  />
                  <h5 className="card-title  pt-2" style={{ fontSize: "17px" }}>
                    Personalized Treatment
                  </h5>
                  <p
                    className="card-text fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    Treatment choices perfectly match your goals of treatment
                    complications with early intervention.
                  </p>
                </div>
              </div>
              <div className="card cardhoverr-translate border-0">
                <div className="card-body py-3">
                  <img
                    src="https://ld-wp73.template-help.com/wordpress/prod_13983/v3/wp-content/uploads/2019/10/icon-img-3.png"
                    width="25%"
                    height="50px"
                    alt=""
                  />
                  <h5 className="card-title  pt-2" style={{ fontSize: "17px" }}>
                    Quality and Safety
                  </h5>
                  <p
                    className="card-text fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    All team members at Medical Center have been trained
                    thoroughly to assist in any situation.
                  </p>
                </div>
              </div>
              <div className="card cardhoverr-translate border-0">
                <div className="card-body py-3">
                  <img
                    src="https://ld-wp73.template-help.com/wordpress/prod_13983/v3/wp-content/uploads/2019/10/icon-img-4.png"
                    width="25%"
                    height="50px"
                    alt=""
                  />
                  <h5 className="card-title  pt-2" style={{ fontSize: "17px" }}>
                    Immediate Service
                  </h5>
                  <p
                    className="card-text fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    Your treatment plan is designed <br />
                    for steady progress, with every phase promptly implemented.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid hghg-bg-image ">
          <div className="row h-100">
            <div className="ghyyhgh g-0 p-0 m-0 d-flex align-items-center">
              <div className="col-md-9 d-flex px-3 px-md-4 flex-column ">
                <h1 className="pt-5 ps-4 text-danger">
                  Welcome To Our Clinic!
                </h1>
                <h1 className="text-white fw-normal ps-4">
                  We offer extensive medical procedures to outbound <br /> and
                  inbound patients.
                </h1>
                <p className="text-white ps-4">
                  Our major areas of specialization include oncology,
                  orthopedics, cardiology, IVF Treatment, urology, neurosurgery,{" "}
                  <br />
                  gastroenterology, plastic surgery and many other departments.
                </p>
                <div className="jhyjh">
                  <Link to='ContactUs' className="px-4 icon-box btn border-0 btn-outline-secondary rounded-2   mt-3 ms-4 py-2   ">
                    Get in touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container bg-light mt-3">
          <div className="row">
            <h1 className="py-5 ">Medical Specialists</h1>
            <div
              className="CardContainerrr"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              }}
            >
              <Link
                className="Customcard1"
                data-aos="fade-up"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="2000"
                to="/Clinic/DoctorProfile"
              >
                <div
                  className="img"
                  style={{
                    backgroundImage:
                      "url(https://img.freepik.com/premium-photo/beautiful-doctor-pointing-fingers_1258-16474.jpg?w=740)",
                  }}
                />
                <div className="text">
                  <p className="fs-6 fw-bold mb-0"> Dr HoorPari. </p>
                  <p className="fs-6 fw-semibold mb-0">The best Cardiologist</p>
                  <p className="fst-italic fw-medium mb-1">6 Video - 40 min</p>
                  <div className="icon-box btn border-0 rounded-2 btn-outline-secondary">
                    <p className="span text-nowrap mb-0">
                      <i className="fa-regular mx-2 text-current fa-clock fa-spin"></i>
                      Book Appointment
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                className="Customcard1"
                data-aos="fade-up"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="2000"
                to="/Clinic/DoctorProfile"
              >
                <div
                  className="img"
                  style={{
                    backgroundImage:
                      "url(https://img.freepik.com/premium-photo/beautiful-doctor-pointing-fingers_1258-16474.jpg?w=740)",
                  }}
                />
                <div className="text">
                  <p className="fs-6 fw-bold mb-0"> Dr HoorPari. </p>
                  <p className="fs-6 fw-semibold mb-0">The best Cardiologist</p>
                  <p className="fst-italic fw-medium mb-1">6 Video - 40 min</p>
                  <div className="icon-box btn border-0 rounded-2 btn-outline-secondary">
                    <p className="span text-nowrap mb-0">
                      <i className="fa-regular mx-2 text-current fa-clock fa-spin"></i>
                      Book Appointment
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                className="Customcard1"
                data-aos="fade-up"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="2000"
                to="/Clinic/DoctorProfile"
              >
                <div
                  className="img"
                  style={{
                    backgroundImage:
                      "url(https://img.freepik.com/premium-photo/beautiful-doctor-pointing-fingers_1258-16474.jpg?w=740)",
                  }}
                />
                <div className="text">
                  <p className="fs-6 fw-bold mb-0"> Dr HoorPari. </p>
                  <p className="fs-6 fw-semibold mb-0">The best Cardiologist</p>
                  <p className="fst-italic fw-medium mb-1">6 Video - 40 min</p>
                  <div className="icon-box btn border-0 rounded-2 btn-outline-secondary">
                    <p className="span text-nowrap mb-0">
                      <i className="fa-regular mx-2 text-current fa-clock fa-spin"></i>
                      Book Appointment
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                className="Customcard1"
                data-aos="fade-up"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="2000"
                to="/Clinic/DoctorProfile"
              >
                <div
                  className="img"
                  style={{
                    backgroundImage:
                      "url(https://img.freepik.com/premium-photo/beautiful-doctor-pointing-fingers_1258-16474.jpg?w=740)",
                  }}
                />
                <div className="text">
                  <p className="fs-6 fw-bold mb-0"> Dr HoorPari. </p>
                  <p className="fs-6 fw-semibold mb-0">The best Cardiologist</p>
                  <p className="fst-italic fw-medium mb-1">6 Video - 40 min</p>
                  <div className="icon-box btn border-0 rounded-2 btn-outline-secondary">
                    <p className="span text-nowrap mb-0">
                      <i className="fa-regular mx-2 text-current fa-clock fa-spin"></i>
                      Book Appointment
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClinicPage1;
