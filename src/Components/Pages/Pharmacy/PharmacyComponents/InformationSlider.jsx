import React from "react";
import Slider from "react-slick";

const InformationSlider = () => {
  var settings = {
    className: "center customSlider1 ",
    dots: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 800,
    autoplaySpeed: 3000,
    cssEase: "linear",
    pauseOnHover: true,
  };
  return (
    <>
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
    </>
  );
};

export default InformationSlider;
