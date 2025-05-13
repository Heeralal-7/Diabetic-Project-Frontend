import React from "react";
import Slider from "react-slick";

const SliderPagination = () => {
  const images = [
    "https://img.freepik.com/premium-photo/full-shot-girl-learning-math-school_23-2150470852.jpg?w=740",
    "https://img.freepik.com/free-photo/medium-shot-girl-learning-math-school_23-2150470867.jpg?t=st=1718258535~exp=1718262135~hmac=8e82d616a30dbe8c63c80dc93e6734d5f181362014bbf441ddac91e4fc75627e&w=740",
    "https://img.freepik.com/premium-photo/focused-young-male-college-student-working-laptop-some-stairs-campus-preparing_1421-4987.jpg?w=740",
    "https://img.freepik.com/premium-photo/full-shot-queer-students-outdoors_23-2150405213.jpg?w=740",
    "https://img.freepik.com/premium-photo/foodie-girl-holding-bowl-grapes-grape-her-mouth-indian-pakistani-modle_561639-1132.jpg?w=740",
  ];

  const settings = {
    customPaging: function (i) {
      return (
        <span>
          <img
            src={images[i]}
            alt={`thumbnail-${i}`}
            style={{ width: "50px", height: "50px" }}
          />
        </span>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb SlickImgDots",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .SlickImgDots li {
        height:20px;
        width:50px;
      }
      .SlickImgDots li.slick-active img {
        border:2px solid red;
      }
      `,
        }}
      />
      <div className="slider-container">
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index}>
              <img src={img} alt={`slide-${index}`} />
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default SliderPagination;
