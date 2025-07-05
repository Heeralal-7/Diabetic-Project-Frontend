import React from "react";

const Carousel = ({ slideData, autoplay, id }) => {
  return (
    <div id={`${id}`} className="carousel slide carousel-fade" data-bs-ride={autoplay}>
      {/* Indicators */}
      <div className="carousel-indicators customIndicators1">
        {slideData.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target={`#${id}`}
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : 'false'}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Wrapper for Slides */}
      <div className="carousel-inner FoodAndNutrition CarouselHeight rounded-4">
        {slideData.map((slide, index) => (
          <div 
            key={index} 
            className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} 
            data-bs-interval="4000"
          >
            <div 
              className="FoodAndNutriCarouselBg" 
              style={{ 
                backgroundImage: `linear-gradient(267deg, rgba(255,255,255,0.1307057584269663) 33%, rgba(0,0,1,1) 100%), url(${slide.image})` 
              }}
            ></div>
            <div className="carousel-caption FoodAndNutriCarouselCaption">
              <h2 className="animated-2 hdding display-5 fw-bold">{slide.captionTitle}</h2>
              <p className="animated-2 mb-3 text-white-50 desss fadeInUp">{slide.captionText}</p>
              <button className="btn text-light btn-lg bg-mainRed animated-2 mb-1 fadeInUp">
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <button 
        className="foodNNutrCarouselBtn carousel-control-prev rounded-4" 
        type="button" 
        data-bs-target={`#${id}`} 
        data-bs-slide="prev"
      >
        <i className="ri-arrow-left-double-line display-5"></i>
        <span className="visually-hidden">Previous</span>
      </button>
      <button 
        className="foodNNutrCarouselBtn carousel-control-next rounded-4" 
        type="button" 
        data-bs-target={`#${id}`} 
        data-bs-slide="next"
      >
        <i className="ri-arrow-right-double-line display-5"></i>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;