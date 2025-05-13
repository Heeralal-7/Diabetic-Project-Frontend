import React from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategoriesCards from './CategoriesCards';

const CategoriesSlider = ({ mainTittle, slideData, autoplay, loop, initialSlide,noOfSlides}) => {
const setting = {
className: "FoodAndNutritionCategorieSlider topNavSlick",
dots: true,
infinite: loop,
centerPadding: "60px",
slidesToShow: noOfSlides[0],
slidesToScroll: 2,
autoplay: autoplay,
speed: 500,
autoplaySpeed: 3000,
cssEase: "linear",
pauseOnHover: true,
initialSlide: initialSlide,
responsive: [
{
breakpoint: 1200,
settings: {
slidesToShow: noOfSlides[1],
},
},
{
breakpoint: 1024,
settings: {
slidesToShow: noOfSlides[2],
},
},
{
breakpoint: 750,
settings: {
slidesToShow: noOfSlides[3],
},
},
{
breakpoint: 580,
settings: {
slidesToShow: noOfSlides[4],
slidesToScroll: 1,
},
},
{
breakpoint: 380,
settings: {
slidesToShow: noOfSlides[5],
slidesToScroll: 1,
},
},
],
};
return (
<>
    <h1 className="display-6 mb-0 fw-semibold">
        {mainTittle}
    </h1>
    <div className="slider-container py-4">
        <Slider {...setting} style={{ maxHeight: "400px" }}>
            {slideData.map((offer, index) => (
            <CategoriesCards Data={offer} key={index} />
            ))}
        </Slider>
    </div>
</>
)
}

export default CategoriesSlider