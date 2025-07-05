// import React from "react";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import OfferCards from "./OfferCards";

// const OfferSlider = ({ Data}) => {
//   const setting = {
//     className: "FoodAndNutritionOfferSlider whiteNav",
//     dots: true,
//     infinite: loop,
//     centerPadding: "60px",
//     slidesToShow: noOfSlides[0],
//     slidesToScroll: 2,
//     autoplay: autoplay,
//     speed: 500,
//     autoplaySpeed: 3000,
//     cssEase: "linear",
//     pauseOnHover: true,
//     initialSlide: initialSlide,
//     responsive: [
//       {
//         breakpoint: 1200,
//         settings: {
//           slidesToShow: noOfSlides[1],
//         },
//       },
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: noOfSlides[2],
//         },
//       },
//       {
//         breakpoint: 600,
//         settings: {
//           slidesToShow: noOfSlides[3],
//         },
//       },
//       {
//         breakpoint: 480,
//         settings: {
//           slidesToShow: noOfSlides[4],
//           slidesToScroll: 1,
//         },
//       },
//       {
//         breakpoint: 380,
//         settings: {
//           slidesToShow: noOfSlides[5],
//           slidesToScroll: 1,
//         },
//       },
//     ],
//   };
//   return (
//     <>
//       <h1 className="display-6 mb-0 fw-semibold">
//         {mainTittle}
//       </h1>
//       <div className="slider-container py-4">
//         <Slider {...setting} style={{ maxHeight: "400px" }}>
//           {slideData.map((offer, index) => (
//             <OfferCards offersData={offer} key={index} />
//           ))}
//         </Slider>
//       </div>
//     </>
//   );
// };

// export default OfferSlider;
