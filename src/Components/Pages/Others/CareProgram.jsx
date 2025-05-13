import React, { useEffect } from "react";
import $ from "jquery";
import { Link } from "react-router-dom";
import banner1 from "../../Assets/img/CareProgramBanner.gif";
import CareImg1 from "../../Assets/img/CareImg1.png";
import CareImg2 from "../../Assets/img/CareImg2.png";
import CareImg3 from "../../Assets/img/CareImg3.png";
import CareImg4 from "../../Assets/img/CareImg4.jpg";
import CareImg5 from "../../Assets/img/CareImg5.jpg";
import CareImg6 from "../../Assets/img/CareImg6.jpg";
import Aos from "aos";

const CareProgram = () => {
  useEffect(() => {
    Aos.init();
    const cards = $(".pricing-card");
    cards.on("mouseover", function () {
      cards.removeClass("active");
      $(this).addClass("active");
    });
  }, []);
  return (
    <>
      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-md-12 pt-4">
            <h3 className="display-5 text-md-center mb-0 px-4">
              Treat, Control & Reverse* <br className="d-lg-none" /> Diabetes
              with our Doctor-led Program
            </h3>
          </div>
          <div className="w-100">
            <img src={banner1} alt="" />
          </div>
        </div>
      </div>
      <div className="container-fluid container-xl">
      <div className="row">
          <div className="w-100 text-center mb-3">
            <h2 className="mb-1 display-4">
              Choose a program that suits your condition
            </h2>
            <h5 className="mb-1">
              Discover a program that helps you reach your HbA1c, sugar & health
              goals
            </h5>
          </div>

          <section className="pricingCardsSection">
            <div className="pricing-Wrapper">
              <div className="pricing-card">
                <div className>
                  <h3 className="card-titlee fw-bold fs-3">Basic</h3>
                  <hr className="first" />
                  <p className="card-price mt-0">
                    <span>$</span>9.99
                  </p>
                  <ul className="features p-0 m-0">
                    <li>Doctor Consultation / 45 days</li>
                    <li>Diet Health Coach on WhatsApp and call</li>
                    <li>Prescribed Medicines included</li>
                    <li>HbA1c Lab Test included</li>
                  </ul>

                  <hr className="second" />
                  <Link className="card-btn btn btn-outline-">i want it</Link>
                </div>
              </div>
              <div className="pricing-card active">
                <div className>
                  <div className="ribbon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>best</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="card-titlee fw-bold fs-3">Pro</h3>
                  <hr className="first" />
                  <p className="card-price mt-0">
                    <span>$</span>19.99
                  </p>
                  <ul className="features p-0 m-0">
                    <li>Doctor Consultation / 45 days</li>
                    <li>Diet Health Coach on WhatsApp and call</li>
                    <li>Prescribed Medicines included</li>
                    <li>HbA1c Lab Test included</li>
                  </ul>

                  <hr className="second" />
                  <Link className="card-btn btn btn-outline-">i want it</Link>
                </div>
              </div>
              <div className="pricing-card">
                <div className>
                  <h3 className="card-titlee fw-bold fs-3">Ultra</h3>
                  <hr className="first" />
                  <p className="card-price mt-0">
                    <span>$</span>49.99
                  </p>
                  <ul className="features p-0 m-0">
                    <li>Doctor Consultation / 45 days</li>
                    <li>Diet Health Coach on WhatsApp and call</li>
                    <li>Prescribed Medicines included</li>
                    <li>HbA1c Lab Test included</li>
                  </ul>

                  <hr className="second" />
                  <Link className="card-btn btn btn-outline-">i want it</Link>
                </div>
              </div>
            </div>
          </section>
          <div className="w-100">
            <h1 className="text-center mb-4 ">
              <span className="pb-1">
                What do DiabetesWala Care programs include?
              </span>
            </h1>
            <h5 className="text-center w-75 mx-auto fw-normal">
              Scientific programs designed by doctors and experts to Reverse*
              Your Diabetes through our expert-led programs and reduce your
              expenses.
            </h5>
          </div>
          <div className="col-md-12">
            <div className="container-fluid">
                <div className="row py-3 mt-2 align-items-center">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg1} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>1. Medical advice from top Diabetologists</h3>
                            <p className="fs-5 fst-italic">Get Convenient, Virtual Medical Care. Our leading doctors guide you periodically during the program and assess your progress</p>
                        </div>
                    </div>
                </div>
                <div className="row py-3 mt-2 align-items-center flex-md-row-reverse">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg2} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>2. A team of Expert Dietitians and Coaches</h3>
                            <p className="fs-5 fst-italic">Get personalized coaching support from our care team of diabetes educators, dieticians, chefs, yoga therapists & fitness instructors.</p>
                        </div>
                    </div>
                </div>
                <div className="row py-3 mt-2 align-items-center">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg3} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>3. Yoga & Fitness for Diabetes</h3>
                            <p className="fs-5 fst-italic">Exclusive video course by DiabetesWala's expert Yoga therapist and Breath work coach- Ruchi Khosla (Trained at Yoga Alliance, New York) with over 10 years of experience.</p>
                        </div>
                    </div>
                </div>
                <div className="row py-3 mt-2 align-items-center flex-md-row-reverse">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg4} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>4. Lab Tests from NABL certified labs</h3>
                            <p className="fs-5 fst-italic">Regular health check ups and tests included in your program from NABL certified labs with hassle-free home sample collection. Get reports directly on your phone and track your progress with our doctor.</p>
                        </div>
                    </div>
                </div>
                <div className="row py-3 mt-2 align-items-center">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg5} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>5. Exclusive Recipes from the DiabetesWala Food Lab</h3>
                            <p className="fs-5 fst-italic">Get access to healthy and delicious recipes by Masterchef finalist Mirvaan Vinayak & expert nutritionists at DiabetesWala. Recipes from all of India, designed with local ingredients to suit your culture, taste and budget.</p>
                        </div>
                    </div>
                </div>
                <div className="row py-3 mt-2 align-items-center flex-md-row-reverse">
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2000">
                        <div className="p-3">
                            <img className="img-fluid rounded-3 shadow object-fit-cover w-100" style={{maxHeight:"300px",maxWidth:"600px"}} src={CareImg6} alt="" />
                        </div>
                    </div>
                    <div className="col-md-6" data-aos="fade-right" data-aos-duration="2500">
                        <div className="px-3 px-md-4">
                            <h3>6. Prescribed Medicines included in the program</h3>
                            <p className="fs-5 fst-italic">Prescribed medicines for Diabetes, BP and Cholesterol are included in the cost of the program and delivered to your doorstep for free.</p>
                        </div>
                    </div>
                </div>
               
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareProgram;
