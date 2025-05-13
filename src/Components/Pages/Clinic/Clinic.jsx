import React, { useEffect } from "react";
import "../../Assets/Css/Clinic.css";
import { Link } from "react-router-dom";
import Aos from "aos";

const Clinic = () => {
  useEffect(()=>{
    Aos.init();
  })
  return (
    <>
      <div className="container-fluid container-xl py-5">
        <div className="mb-5">
          {/* <Link to='/Doctors' className="btn btn-hoverBlue float-end rounded-circle shadow me-3" >
                <i className="ri-arrow-go-back-line fs-5 text-current fw-bold "></i>
                </Link> */}
          <h1 className="display-5 my-3 px-3">Our Clinics :-</h1>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="ClinicWrapper">
              <Link to='/Clinic/International'  data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000" className="ClinicCards text-current text-decoration-none">
                <div className="ClinicCards-banner">
                  <p className="ClinicCardsCategory-tag purpleText">
                    International
                  </p>
                  <img
                    className="ClinicCardsBanner-img"
                    src="https://img.freepik.com/free-photo/doctor-getting-patient-ready-ct-scan_23-2149367402.jpg?t=st=1716800551~exp=1716804151~hmac=efe66e8ed548aa1f725fe618da4d558bf963c0c8a530398b826ee3917f78bed3&w=360"
                    alt=""
                  />
                </div>
                <div className="ClinicCards-body">
                  <h2 className="blog-title">
                    Which city is famous for biryani in India?
                  </h2>
                  <p className="blog-description">
                    Looking to upgrade your gear? Here is the list of the best
                    photography tools for this year
                  </p>
                </div>
              </Link>
              <Link to='/Clinic/National'  data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000" className="ClinicCards text-current text-decoration-none">
                <div className="ClinicCards-banner">
                  <p className="ClinicCardsCategory-tag pinkText">National</p>
                  <img
                    className="ClinicCardsBanner-img"
                    src="https://img.freepik.com/free-photo/medical-team-doing-checkup-visit-aged-patient-with-disease-hospital-ward-bed-doctor-nurse-consulting-senior-woman-with-oximeter-oxygen-saturation-iv-drip-bag_482257-38570.jpg?t=st=1716800650~exp=1716804250~hmac=a36fc396a6e7b9c768ebb8dba9ce902b8cefa5ee94240bad47d4f168a2e972a9&w=360"
                    alt=""
                  />
                </div>
                <div className="ClinicCards-body">
                  <h2 className="blog-title">
                    What is the tastiest pizza in Pizza Hut?
                  </h2>
                  <p className="blog-description">
                    My thoughts on the future of front end web development
                  </p>
                </div>
              </Link>
              <Link to='/Clinic/State'  data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000" className="ClinicCards text-current text-decoration-none">
                <div className="ClinicCards-banner">
                  <p className="ClinicCardsCategory-tag orangeText">State</p>
                  <img
                    className="ClinicCardsBanner-img"
                    src="https://img.freepik.com/premium-photo/generative-ai-illustration-hospital-room-equipped-with-latest-medical-technology_58460-12011.jpg?w=360"
                    alt=""
                  />
                </div>
                <div className="ClinicCards-body">
                  <h2 className="blog-title">
                    What is the most pinkText burger?
                  </h2>
                  <p className="blog-description">
                    Mediation has transformed my life. These are the best
                    practices to get into the habit
                  </p>
                </div>
              </Link>
              <Link to='/Clinic/City'  data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000" className="ClinicCards text-current text-decoration-none">
                <div className="ClinicCards-banner">
                  <p className="ClinicCardsCategory-tag blueText">city</p>
                  <img
                    className="ClinicCardsBanner-img"
                    src="https://img.freepik.com/premium-photo/doctors-nurses-smiling-camera_13339-145651.jpg?w=360"
                    alt=""
                  />
                </div>
                <div className="ClinicCards-body">
                  <h2 className="blog-title">
                    What is the most pinkText burger?
                  </h2>
                  <p className="blog-description">
                    Mediation has transformed my life. These are the best
                    practices to get into the habit
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Clinic;
