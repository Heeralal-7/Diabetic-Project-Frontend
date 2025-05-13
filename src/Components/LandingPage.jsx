import React, { useEffect, useRef } from "react";
import $ from "jquery";
import img4 from "./Assets/img/DoctorImg.png";
import img9 from "./Assets/img/horizontlBnner1.png";
import img10 from "./Assets/img/horizontlBnner2.png";
import img11 from "./Assets/img/horizontlBnner3.png";
import img12 from "./Assets/img/horizontlBnner4.png";
import vedio1 from "./Assets/vedios/docVedio.mp4";

const LandingPage = () => {
  const horizontalScrollRef = useRef(null);

  useEffect(() => {
    // Scroll event listener
    const handleScroll = () => {
      const scroll = window.scrollY || document.documentElement.scrollTop;
      const nav = document.getElementById("navbar");
      if (scroll > 300) {
        nav.classList.add("bg-nav");
        nav.classList.remove("bg-primary-subtle");
      } else {
        nav.classList.remove("bg-nav");
        nav.classList.add("bg-primary-subtle");
      }
    };

    document.addEventListener("scroll", handleScroll);

    // Box Animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          entry.target.classList.remove("hidden");
          // If you want to observe only once, uncomment the following line
          // observer.unobserve(entry.target);
        } else {
          entry.target.classList.add("hidden");
          entry.target.classList.remove("active");
        }
      });
    });
    const sections = document.querySelectorAll(
      ".boxAnimation .aminationWrapper"
    );
    sections.forEach((section) => {
      observer.observe(section);
    });

    // Attach event listeners
    $(window).on("scroll", handleScroll);

    // Clean up
    return () => {
      document.removeEventListener("scroll", handleScroll);
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      <main>
        <section
          className="position-relative mx-auto"
          style={{ scrollSnapType: "y mandatory" }}
        >
          <section style={{ zIndex: 4 }} className="sectionssss bgBanner1">
            <div className="overflow-x-hidden overflow-y-auto">
              <div className="section__content">
                <h5
                  className="H1-Heading"
                  style={{ width: "100% !important", overflow: "hidden" }}
                >
                  <span>We Have</span>
                  <span className="text-light fw-bold">The Best Doctors</span>
                  <p
                    style={{
                      fontSize: "clamp(20px,4vw,50px)",
                      maxWidth: "500px",
                      marginInline: "auto",
                    }}
                  >
                    Working at our place
                  </p>
                </h5>
              </div>
            </div>
          </section>
          <section
            style={{ zIndex: 3 }}
            className="sectionssss bgBanner2 text-light"
          >
            <div className="overflow-x-hidden overflow-y-auto">
              <div className="section__content">
                <h2 className="H2-Heading">
                  <span>
                    Built with Care
                    <br /> Where compassion meets excellence
                  </span>
                </h2>
              </div>
            </div>
          </section>
          <section style={{ zIndex: "auto" }} className="sectionssss">
            <video
              src={vedio1}
              autoPlay
              playsInline
              muted
              loop
              className="bgVedioooo overflow-x-hidden overflow-y-scroll"
            />
            {/* <div className="overflow-x-hidden overflow-y-auto"> */}
            <div className="section__content">
              <p className="movingPara">
                <span>Empowerment through Knowledge. Explore Insights.</span>
                <span>Navigate with Ease. Clear Guidance.</span>
                <span>Simplifying Diabetes Management. No Jargon.</span>
                <span>&nbsp;Transforming Lives, One Step at a Time.</span>
                <span>Just Solutions.</span>
              </p>
            </div>
            {/*
        </div> */}
          </section>
          <section style={{ zIndex: "auto" }} className="sectionssss bgBanner3">
            <div className="overflow-x-hidden overflow-y-auto">
              <div className="section__content">
                <div className="overflow-x-hidden overflow-y-auto"></div>
                <div className="section__content">
                  <div className="foooter">
                    <span>we Care people With love ❤</span>
                    <span className="text-light fw-bold">DiabetesWala</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="container-fluid bg-primary-subtle">
            <div className="row align-items-center flex-md-row-reverse">
              <div className="col-md-6">
                <img src={img4} className="img-fluid w-100" alt="" />
              </div>
              <div className="col-md-6 d-grid align-content-center py-4">
                <div className="ms-md-4 px-3 px-md-0">
                  <h1 className=" fw-bold display-5">
                    Control Diabetes With Experts
                  </h1>
                  <p
                    className="text-muted"
                    style={{ maxHeight: "150px", overflowY: "auto" }}
                  >
                    No more uncontrolled diabetes with DiabetesWala Diabetes
                    Care Programs. Treat, control, and reverse* diabetes under
                    the guidance of India's best diabetes doctors and healthcare
                    experts led by national award-winning diabetologists from
                    the comfort of your home.
                  </p>
                  <div className="text-start">
                    <button className=" btn btn-light border-0 px-3 py-2 rounded-3 fw-semibold w-auto">
                      Explore Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* BOX ANIMATION START */}
        <section className="boxAnimation" id="section1">
          <div className="container">
            <div className="aminationWrapper">
              <div className="row">
                <div className="item col-md-6 col-sm-12 col-12">
                  <div className="item_wrap">
                    <div className="head">
                      <h4>
                        <span>ResiCreative</span>
                      </h4>
                      <a href="/resicreative">
                        <img
                          src="themes/custom/resibario/images/dark_arrow_right.svg"
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="text">
                      <p>
                        ResiCreative is the powerhouse engine that generates all
                        ResiBrands franchise marketing activity. Our franchisees
                        rely on ResiCreative to manage their outreach
                        advertising and provide them with detailed monthly
                        reporting.&nbsp;
                        <br />
                        <br />
                        As a team, ResiCreative works tirelessly to produce
                        engaging, interactive content that speaks directly to
                        consumers, often leveraging multiple campaigns to target
                        as many customers as possible.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item col-md-6 col-sm-12 col-12">
                  <div className="item_wrap">
                    <div className="head">
                      <h4>
                        <span>ResiCreative</span>
                      </h4>
                      <a href="/resicreative">
                        <img
                          src="themes/custom/resibario/images/dark_arrow_right.svg"
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="text">
                      <p>
                        ResiCreative is the powerhouse engine that generates all
                        ResiBrands franchise marketing activity. Our franchisees
                        rely on ResiCreative to manage their outreach
                        advertising and provide them with detailed monthly
                        reporting.&nbsp;
                        <br />
                        <br />
                        As a team, ResiCreative works tirelessly to produce
                        engaging, interactive content that speaks directly to
                        consumers, often leveraging multiple campaigns to target
                        as many customers as possible.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item col-md-6 col-sm-12 col-12">
                  <div className="item_wrap">
                    <div className="head">
                      <h4>
                        <span>ResiCreative</span>
                      </h4>
                      <a href="/resicreative">
                        <img
                          src="themes/custom/resibario/images/dark_arrow_right.svg"
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="text">
                      <p>
                        ResiCreative is the powerhouse engine that generates all
                        ResiBrands franchise marketing activity. Our franchisees
                        rely on ResiCreative to manage their outreach
                        advertising and provide them with detailed monthly
                        reporting.&nbsp;
                        <br />
                        <br />
                        As a team, ResiCreative works tirelessly to produce
                        engaging, interactive content that speaks directly to
                        consumers, often leveraging multiple campaigns to target
                        as many customers as possible.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item col-md-6 col-sm-12 col-12">
                  <div className="item_wrap">
                    <div className="head">
                      <h4>
                        <span>ResiCreative</span>
                      </h4>
                      <a href="/resicreative">
                        <img
                          src="themes/custom/resibario/images/dark_arrow_right.svg"
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="text">
                      <p>
                        ResiCreative is the powerhouse engine that generates all
                        ResiBrands franchise marketing activity. Our franchisees
                        rely on ResiCreative to manage their outreach
                        advertising and provide them with detailed monthly
                        reporting.&nbsp;
                        <br />
                        <br />
                        As a team, ResiCreative works tirelessly to produce
                        engaging, interactive content that speaks directly to
                        consumers, often leveraging multiple campaigns to target
                        as many customers as possible.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Add more items as needed */}
              </div>
            </div>
          </div>
        </section>
        {/* BOX ANIMATION END */}
        {/* horizontal scroll section start */}
        <section className="horizontalScrolllll" ref={horizontalScrollRef}>
          <div className="wrapper">
            <div className="horizontal-scroll-section">
              <div className="scene">
                <div className="horizontal-scroll-section__content-wrapper wrapper">
                  <div
                    className="trigger trigger--one horizontal-scroll-section--animation-one"
                    // data-className="horizontal-scroll-section--animation-one"
                    data-offset="0.7"
                  ></div>
                  <div className="col-5 d-md-flex d-block align-items-center px-0">
                    <div style={{ width: "500px", height: "100%" }}></div>
                  </div>
                  <div className="col-12 d-md-flex d-block align-items-center px-0">
                    <div className="col-md-6 col-12 px-3 px-md-4 text-center">
                      <h4
                        className="fw-bold display-5 text-start"
                        style={{ color: "#141414" }}
                      >
                        Awards and
                        <br className="d-md-block d-none" />
                        Recognitions
                      </h4>
                      <p className="text-muted text-start fst-italic fw-semibold">
                        DiabetesWala was awarded the National Startup Award 2021
                        in the Healthcare category by Prime Minister Narendra
                        Modi for bringing access to healthcare to India.
                        Recently, Dr Navneet Agrawal, our Chief Clinical
                        Officer, was awarded the Diabetologist of the Year
                        (National Winner)-2023.
                      </p>
                    </div>
                    <div className="col-md-6 col-12">
                      <img
                        src={img9}
                        className="mx-auto d-block py-5"
                        loading="lazy"
                        style={{
                          width: "100%!important",
                          height: "100% !important",
                          objectFit: "contain",
                          aspectRatio: "4/4",
                          maxHeight: "85vh",
                        }}
                        alt="DiabetesWala National Startup Award Winner 2021"
                      />
                    </div>
                  </div>
                  <div className="col-12 d-md-flex d-block align-items-center px-0">
                    <div className="col-md-6 col-12 px-3 px-md-4 text-center">
                      <h4
                        className="fw-bold display-5 text-start"
                        style={{ color: "#141414" }}
                      >
                        DiabetesWala
                        <br className="d-md-block d-none" />
                        featured on
                        <br className="d-md-block d-none" /> BBC World
                        <br className="d-md-block d-none" /> News
                      </h4>
                      <p className="text-muted text-start fst-italic fw-semibold">
                        In their exclusive story on diabetes the BBC World News
                        covered a Diabetes Awareness Camp organized by
                        DiabetesWala
                      </p>
                      <div className="text-start">
                        <button className="btn rounded-pill border-0 bg-primary-subtle ">
                          Watch on Youtube
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <img
                        src={img10}
                        className="mx-auto d-block"
                        loading="lazy"
                        style={{
                          width: "100%!important",
                          height: "100% !important",
                          objectFit: "contain",
                          aspectRatio: "4/4",
                          maxHeight: "85vh",
                        }}
                        alt="News Channel"
                      />
                    </div>
                  </div>
                  <div className="col-12 d-md-flex d-block align-items-center px-0">
                    <div className="col-md-6 col-12 px-3 px-md-4 text-center">
                      <h4
                        className="fw-bold display-5 text-start"
                        style={{ color: "#141414" }}
                      >
                        Consult top <br className="d-md-block d-none" />
                        diabetologists
                        <br className="d-md-block d-none" />
                        <br className="d-md-block d-none" />
                      </h4>
                      <p className="text-muted text-start fst-italic fw-semibold">
                        Get access to India's top diabetes doctors. Our medical
                        team is led by National Award winner Diabetologist.
                        Experience high quality care via video consultations.
                        DiabetesWala’s doctors are committed to support you in
                        your treatment for diabetes.
                      </p>
                      <div className="text-start">
                        <button className="btn rounded-pill border-0 bg-primary-subtle ">
                          Watch on Youtube
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <img
                        src={img11}
                        className="mx-auto d-block"
                        loading="lazy"
                        style={{
                          width: "100%!important",
                          height: "100% !important",
                          objectFit: "contain",
                          aspectRatio: "4/4",
                          maxHeight: "85vh",
                        }}
                        alt="News Channel"
                      />
                    </div>
                  </div>
                  <div className="col-12 d-md-flex d-block align-items-center px-0">
                    <div className="col-md-6 col-12 px-3 px-md-4 text-center">
                      <h4
                        className="fw-bold display-5 text-start"
                        style={{ color: "#141414" }}
                      >
                        Complete health <br className="d-md-block d-none" />
                        plans with
                        <br className="d-md-block d-none" />
                        our specialized
                        <br className="d-md-block d-none" /> subscription
                      </h4>
                      <p className="text-muted text-start fst-italic fw-semibold">
                        Get access to India's top diabetes doctors. Our medical
                        team is led by National Award winner Diabetologist.
                        Experience high quality care via video consultations.
                        DiabetesWala’s doctors are committed to support you in
                        your treatment for diabetes.
                      </p>
                      <div className="text-start">
                        <button className="btn rounded-pill border-0 bg-primary-subtle ">
                          Watch on Youtube
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <img
                        src={img12}
                        className="mx-auto d-block"
                        loading="lazy"
                        style={{
                          width: "100%!important",
                          height: "100% !important",
                          objectFit: "contain",
                          aspectRatio: "4/4",
                          maxHeight: "85vh",
                        }}
                        alt="News Channel"
                      />
                    </div>
                  </div>
                  {/* <div className="horizontal-scroll-section__content-section">
                <h2>Content Testing 2</h2>
              </div>
              <div className="horizontal-scroll-section__content-section">
                <img src="https://www.apple.com/v/ipad-pro/t/images/overview/hero__b2q87exx6cfm_medium_2x.jpg" alt="">
              </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* horizontal scroll section end */}
      </main>
    </>
  );
};

export default LandingPage;
