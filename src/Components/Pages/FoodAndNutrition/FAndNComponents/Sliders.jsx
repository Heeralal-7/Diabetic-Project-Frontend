import React from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'
import 'animate.css';
const Sliders = ({slideData,autoplay,mainTittle}) => {
    
    const setting = {
      className: "center FoodAndNutritionSlider",
      dots: true,
      infinite: true,
      centerPadding: "60px",
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: autoplay,
      speed: 800,
      autoplaySpeed: 3000,
      cssEase: "linear",
      pauseOnHover: true,
    };
return (
<>
    <h1 className="display-6 mb-0 fw-semibold">{mainTittle}</h1>
    <div className="slider-container py-4">
        <Slider {...setting} style={{ maxHeight: "400px" }}>
            {slideData.map((slide, index) => (
            <div key={index} className="text-center mx-auto px-3">
                <div className="Slide rounded-3" style={{height: "350px" , background: `linear-gradient(267deg,
                    rgba(255,255,255,0.1307057584269663) 33%, rgba(0,0,0,1) 100%), url(${slide.image})`,
                    backgroundSize: 'cover' , backgroundPosition: 'center' }}>
                    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                        <div className="text-start text-light w-70">
                            <h3 className="mb-1 display-5 w-70 fw-bold">
                                {slide.title}
                            </h3>
                            <p className="text-small text-white-50 fw-bold">
                                {slide.description}
                            </p>
                            <button className="btn bg-mainRed text-light btn-lg">
                                {slide.buttonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </Slider>
    </div>
    
</>
);
};

export default Sliders;