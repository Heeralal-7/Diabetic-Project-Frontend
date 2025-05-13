import React from "react";
// import { Link } from "react-router-dom";
import Slider from "react-slick";


const AboutUs = () => {
var settings = {
className: "center customSlider1 ",
dots: false,
infinite: true,
slidesToShow: 1,
slidesToScroll: 1,
autoplay: true,
speed:800,
autoplaySpeed: 3000,
cssEase: "linear",
pauseOnHover: true,
};
return (
<>

  {/* ...............We Provide Finnest.................... */}
  <div className="container-fluid container-xl mt-2 bg-light">
    <div className="">
      <h1 className="display-5 mb-4">About Us :-</h1>
    </div>
    <div className="row justify-content-evenly">
      <div className="col-md-6  mt-3 ">
        <div className="text-center position-relative mx-auto" style={{maxWidth:'450px'}}>
          <img className="img-fluid" src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/about.png"
            width="100%" alt="" />
          <div className="mmhgjkhbblji">
            <h1 className="fw-bolder text-center pt-2 text-muted m-0 text-info">5k+</h1>
            <h6 className="pt-1 fw-semibold  text-center text-muted">PATIENT'S <br />
              REVIEWS</h6>
          </div>
          <div className="hhhkiuol">
            <h1 className="fw-bolder text-center pt-2 text-muted m-0 text-info">5k+</h1>
            <h6 className="pt-1 fw-semibold  text-center text-muted">PATIENT'S <br />
              REVIEWS</h6>
          </div>
        </div>

      </div>
      <div className="col-md-6 mt-2">
        <div className="row">
          <h6 className="text-info fw-bold">ABOUT DiabetesWala</h6>
          <div className="col-md-12 ">
            <h1 className="fw-medium py-1">We Provide Finnest Patient's <span className="fw-bold">Care &amp;
                Amenities</span></h1>
            <p className="text-muted ">Embrace a world of comprehensive healthcare where your well-being <br /> takes
              center stage. At Meca, we're dedicated to providing you with <br /> personalized and compassionate medical
              services.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 col-6">
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Seamless Care</h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Warm and Welcoming <span
                className="">Environment</span> </h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Comprehensive Care</h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Expert Doctors</h6>
          </div>
          <div className="col-md-6 col-6">
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Patient-Centered Care</h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Personalized Approach</h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Cutting-Edge Technology</h6>
            <h6 className="pt-2 text-muted" style={{fontSize: '14px' }}><i
                className="fa-solid fa-check-double text-info fs-6 mx-2" />Positive Reviews</h6>
          </div>
          <div className="col-md-12">
            <p className=" pt-2 text-muted" style={{fontSize: '14px' , fontWeight: 600}}>
              Ut wisi enim ad minim veniam, quis laore nostrud exerci tation ulm hedi corper turet suscipit lobortis
              nisl ut aliquip erat volutpat autem vel eum iriure dolor in hendrerit in vulputate velit.
              lorem
            </p>
            <h5>YOUR HEALTH IS OUR TOP PRIORITY</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="container-fluid container-xl mt-5 bg-light">
    <div className="row justify-content-center">
      <div className="col-md-11  py-5 ">
        <h6 className="text-info">YOUR HEALTH IS OUR TOP PRIORITY</h6>
        <h1 className="display-5 fw-semibold">Our track record speaks for itself. Many individuals have chosen <span
            className="text-muted fw-bold">our medical center and have had positive, transformative <br />
            experiences.</span></h1>
      </div>
    </div>
  </div>
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="hdjkhnj">
          <img className="mt-3 rounded-5"
            src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/testimonial1.jpg" width="100%"
            height="300px;" alt="" />
        </div>
        <div className="slider-container mx-auto mt-5" style={{ maxWidth: "100%" }}>
          <Slider {...settings}>
            <div className="text-center px-3">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
            <div className="text-center px-3 ">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
            <div className="text-center px-3 ">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
            <div className="text-center px-3 ">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
            <div className="text-center px-3 ">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
            <div className="text-center px-3 ">
              <div className="SliderCard rounded-4">
                <figure className="testimonalCard hover">
                  <blockquote>
                    Thank you. before I begin, I'd like everyone to notice
                    that my report is in a professional, clear plastic
                    binder...When a report looks this good, you know it'll
                    get an A. That's a tip kids. Write it down.
                  </blockquote>
                </figure>
              </div>
            </div>
          </Slider>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="row my-2">
          <div className="col-md-6 text-center bg-success-subtle  py-3 rounded-5">
            <h6 className="text-info text-center">AVERAGE GOOGLE RATINGS</h6>
            <span className="text-info fw-bold fs-3 "><i className="fa-solid fa-star text-info mx-1" />4.9</span>
          </div>
          <div className="col-md-12">
            <img className="mt-3 rounded-5"
              src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/testimonial2.jpg" width="100%"
              height="300px;" alt="" />
          </div>
        </div>
        <div className="row mt-3 bg-secondary-subtle rounded-5 py-4">
          <div className="col-3  text-end">
            <img className="bg-info rounded-5"
              src="https://as1.ftcdn.net/v2/jpg/02/95/99/54/1000_F_295995499_YYr5btZEG7hYzE3sn35fLpib5VGRpg8E.jpg"
              width="90%" alt="" />
          </div>
          <div className="col-8 py-2   ">
            <h6>Hospa provides award-winning <br /> quality care</h6>
            {/*
            <Link className="text-decoration-none fw-semibold"><i
              className="fa-solid fa-arrow-right t/ext-mainBlue mx-2" />Learn More </Link> */}
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* ..............We Are A Clinic, Provide................ */}
  <div className="container-fluid container-xl mt-5  bg-light">
    <div className="row py-4">
      <div className="col-md-5 d-flex justify-content-end">
        <img className="rounded-5" src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/about4.jpg"
          width="90%" height="550px" alt="" />

      </div>
      <div className="col-md-7">
        <div className="row">
          <div className="col-md-12">
            <h6 className="text-info fw-bold py-4">MORE ABOUT US</h6>
            <h1 className="text-black fw-bold py-4">We Are A Clinic, <span className=" fw-bold">Provide
                Excellence</span> In Personalized Care</h1>
            <p className=" pt-4 text-muted ps-3" style={{fontSize: '16px' , borderLeft: '6px solid skyblue' }}>We are a
              private, independent practice constantly striving to provide excellence in personalized, compassionate
              care that is consistent, quality-driven and choice-conscious for all of our patients.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-5">
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/about6.jpg" width="100%"
              height="200px" alt="" />
          </div>
          <div className="col-md-7">
            <p className="text-muted">We welcome advances in learning and technology in an effort to achieve efficient
              and quality-driven patient care.
              Together our team of doctors bring a broad spectrum of experience and professional expertise and
              continually undertake professional development education to remain up to date with the latest in medical
              treatment options.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* ............We Are Different To Protect Your Health............ */}
  <div className="container-fluid container-xl bg-light">
    <h1 className="text-center fw-semibold pt-5">We Are Different To <span className="fw-bold">Protect <br /> Your
        Health</span></h1>
    <div className="cardsCont my-5">
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' }}>
        <div className="card-body">
          <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/img1.png" width="20%" alt="" />
          <h3 className="card-title pt-3">Not Just Better Care, But <br /> A Better Experience</h3>
          <p className="card-text pt-2 text-muted">At our medical center, we believe in providing not just better care
            but a better experience overall. We understand that your journey to health.</p>
          {/*
          <Link className="card-link pt-5 text-decoration-none">Learn More</Link> */}
        </div>
      </div>
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' }}>
        <div className="card-body">
          <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/img2.png" width="20%" alt="" />
          <h3 className="card-title pt-3">Serving All People Through Exemplary Care</h3>
          <p className="card-text pt-2 text-muted">At our medical center, we believe in providing not just better care
            but a better experience overall. We understand that your journey to health.</p>
          {/*
          <Link className="card-link pt-5 text-decoration-none">Learn More</Link> */}
        </div>
      </div>
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' }}>
        <div className="card-body">
          <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/img3.png" width="20%" alt="" />
          <h3 className="card-title pt-3">Specialty Medicine with Compassion and Care</h3>
          <p className="card-text pt-2 text-muted">At our medical center, we believe in providing not just better care
            but a better experience overall. We understand that your journey to health.</p>
          {/*
          <Link className="card-link pt-5 text-decoration-none">Learn More</Link> */}
        </div>
      </div>
    </div>
  </div>
  {/* ..............Your Health Is Our Top Priority.......... */}
  <div className="container-fluid container-xl my-5 ">
    <div className="row ">
      <div className="col-md-12 bg-image-healthkghujyg p-0    ">
        <div className="ghughyuh p-0">
          <h6 className="pt-5 text-mainBlue fw-bold">HEALTHCARE SOLUTION</h6>
          <h1 className="text-white fw-bold">
            Your Health Is Our <br /> Top Priority</h1>
          {/* <div className="btn-group rounded-pill mt-3" aria-label="Basic outlined example">
            <button type="button" className="btn btn-outline-primary text-white bg-primary"><i
                className="fa-solid fa-circle-right text-text-white" /></button>
            <button type="button" className="btn btn-outline-primary text-white bg-primary">Learn more</button>.
          </div> */}
        </div>
      </div>
    </div>
  </div>
  <div className="container-fluid container-xl bg-light">
    <div className="cardsCont my-5">
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' , backgroundColor: '#9d99b6' }}>
        <div className="card-body">
          <div className="lightimage d-flex justify-content-end position-absolute  " style={{right: '20px' , top: '15px'
            }}>
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/shape-4.png" alt="" />
          </div>
          <i className="fa-solid fa-shield text-mainBlue fs-3" />
          <h4 className="card-title pt-3 text-white fw-bold">OUR MISSION</h4>
          <p className="card-text text-white vh-100" style={{maxHeight:"150px"}}>Our mission is to care for our <br />
            patients and their families when <br /> it matters most.</p>
        </div>
      </div>
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' , backgroundColor: '#68cca6' }}>
        <div className="card-body">
          <div className="lightimage d-flex justify-content-end position-absolute  " style={{right: '20px' , top: '15px'
            }}>
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/shape-4.png" alt="" />
          </div>
          <i className="fa-solid fa-eye text-mainBlue fs-3" />
          <h4 className="card-title pt-3 text-white fw-bold">OUR VISION</h4>
          <p className="card-text text-white vh-100" style={{maxHeight:"150px"}}>At our medical center, we believe in
            providing not just better care but a better experience overall. We understand that your journey to health.
          </p>
        </div>
      </div>
      <div className="card border-0 rounded-5 shadow" style={{width: '100%' , backgroundColor: '#9fcbf3' }}>
        <div className="card-body">
          <div className="lightimage d-flex justify-content-end position-absolute  " style={{right: '20px' , top: '15px'
            }}>
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/shape-4.png" alt="" />
          </div>
          <i className="fa-solid fa-heart text-mainBlue fs-3" />
          <h5 className="card-title pt-3 text-white fw-bold">OUR VALUES</h5>
          <p className="card-text text-white vh-100" style={{maxHeight:"150px"}}>Our values are: excellence, <br />
            collaboration, accountability, <br /> respect and engagement.</p>
        </div>
      </div>

    </div>
  </div>
  {/* .......INSURANCE..... */}
  <div className="container-fluid container-xl py-5">
    <div className="row">
      <h6 className="text-black fw-bold">INSURANCE</h6>
      <div className="col-md-4">
        <h1 className="text-black fw-semibold">Our Accepted <span className="fw-bold text-black">Insurance</span></h1>
      </div>
      <div className="col-md-8 bg-light">
        <div className="row">
          <div className="col-md-3">
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/partner1.png" width="80%"
              alt="" />
          </div>
          <div className="col-md-3">
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/partner3.png" width="80%"
              alt="" />
          </div>
          <div className="col-md-3">
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/partner6.png" width="80%"
              alt="" />
          </div>
          <div className="col-md-3">
            <img src="https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/partner4.png" width="80%"
              alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</>
);
};

export default AboutUs;