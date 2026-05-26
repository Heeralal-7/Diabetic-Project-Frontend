import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PharmacyItemCard from "./PharmacyItemCard";
import { Link } from "react-router-dom";

const CardsCarousel = ({ 
  mainTittle, 
  items = [], 
  autoplay = false, 
  loop = false, 
  initialSlide = 0,
  noOfSlides = [4, 3, 2, 2, 1, 1],
  isMedicine = false,
  showSeeAll = true
}) => {
  if (!Array.isArray(items)) {
    console.warn('CardsCarousel: items prop is not an array', items);
    return null;
  }

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: noOfSlides[0],
    slidesToScroll: 1,
    speed: 500,
    cssEase: "linear",
    pauseOnHover: true,
    initialSlide: initialSlide,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: noOfSlides[3],
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: noOfSlides[2],
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: noOfSlides[3],
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: noOfSlides[4],
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: noOfSlides[5],
          slidesToScroll: 1
        }
      }
    ]
  };

  // Determine the "See All" link based on content
  const getSeeAllLink = () => {
    if (mainTittle.includes("Popular Medicines")) {
      return "/pharmacy/popular-medicines";
    } else if (mainTittle.includes("Popular Products")) {
      return "/pharmacy/popular-products";
    }
    return isMedicine ? "/pharmacy/medicines" : "/pharmacy/products";
  };

  return (
    <div className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{mainTittle}</h2>
        {showSeeAll && items.length > 0 && (
          <Link to={getSeeAllLink()} className="btn btn-outline-primary rounded-pill px-4 shadow-sm hover-elevate">
            See All <i className="ri-arrow-right-line ms-1"></i>
          </Link>
         
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="alert alert-info">No items to display</div>
      ) : (
        <Slider {...settings}>
          {items.map((item) => (
            <div key={item._id} className="px-1">
              <div className="mx-1">
                <PharmacyItemCard item={item} isMedicine={isMedicine} />
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default React.memo(CardsCarousel);