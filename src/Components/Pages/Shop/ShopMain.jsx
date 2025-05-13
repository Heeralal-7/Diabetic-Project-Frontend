import React from "react";
import "../../Assets/Css/Shop.css";
import ShopProduct from "../../Assets/img/shopProduct.png";
import ShopProduct1 from "../../Assets/img/shopProduct1.png";
import ShopProduct2 from "../../Assets/img/shopProduct2.png";
import ShopProduct3 from "../../Assets/img/shopProduct3.png";
import ShopTopCarouselBanner from "../../Assets/img/ShopTopCarouselBanner.png";
import ShopTopCarouselBanner1 from "../../Assets/img/ShopTopCarouselBanner1.png";
import ShopTopCarouselBanner2 from "../../Assets/img/ShopTopCarouselBanner2.png";
import cateImg1 from "../../Assets/img/cateImg1.png";
import cateImg2 from "../../Assets/img/cateImg2.png";
import cateImg3 from "../../Assets/img/cateImg3.png";
import cateImg4 from "../../Assets/img/cateImg4.png";
import cateImg5 from "../../Assets/img/cateImg5.png";
import cateImg6 from "../../Assets/img/cateImg6.png";
import ProductSlider from "./ShopComponents/ProductSlider";
import ProductCards2 from "./ShopComponents/ProductCards2";
// import ProductList from "./ProductList";
import ProductCategories from "./ShopComponents/ProductCategories";

const ShopMain = () => {
  const products = [
    {
      id: 1,
      title: "Product 1",
      image: ShopProduct, // Make sure you have imported this image correctly
      oldPrice: "$990.00",
      newPrice: "$749.00",
    },
    {
      id: 2,
      title: "Product 2",
      image: ShopProduct1, // Make sure you have imported this image correctly
      oldPrice: "$890.00",
      newPrice: "$649.00",
    },
    {
      id: 3,
      title: "Product 3",
      image: ShopProduct2, // Make sure you have imported this image correctly
      oldPrice: "$780.00",
      newPrice: "$549.00",
    },
    {
      id: 4,
      title: "Product 4",
      image: ShopProduct3, // Make sure you have imported this image correctly
      oldPrice: "$680.00",
      newPrice: "$449.00",
    }
    // Add more products as needed
  ];



  const ProductCategorie = [
    {
      id: 1,
      CateTitle: "Vitamins & Minerals",
      CateImg: cateImg1,
      discount: "",
      discountSet: 0,
    },
    {
      id: 2,
      CateTitle: "Sexuall Health",
      CateImg: cateImg2,
      discount: 2000 ,
      discountSet: 1,
    },
    {
      id: 3,
      CateTitle: "Energy Drinks",
      CateImg: cateImg3,
      discount: "",
      discountSet: 0,
    },
    {
      id: 4,
      CateTitle: "Health Care Devices",
      CateImg: cateImg4,
      discount: "",
      discountSet: 0,
    },
    {
      id: 5,
      CateTitle: "Diabetic Care",
      CateImg: cateImg5,
      discount: 50 ,
      discountSet: 1,
    },
    {
      id: 6,
      CateTitle: "Ayurvedic Care",
      CateImg: cateImg6,
      discount: 30 ,
      discountSet: 1,
    },
    {
      id: 4,
      CateTitle: "Health Care Devices",
      CateImg: cateImg4,
      discount: "",
      discountSet: 0,
    },
    {
      id: 5,
      CateTitle: "Diabetic Care",
      CateImg: cateImg5,
      discount: "",
      discountSet: 0,
    },
    {
      id: 4,
      CateTitle: "Health Care Devices",
      CateImg: cateImg4,
      discount: "",
      discountSet: 0,
    },
    {
      id: 5,
      CateTitle: "Diabetic Care",
      CateImg: cateImg5,
      discount: "",
      discountSet: 0,
    },
  ];
  

  
  return (
    <>
      <div className="container-xl container-fluid">
        {/* <div className="">
          <h1 className="display-5 mb-4">Shop :-</h1>
        </div> */}
        <div className="row">
          <div className="col-12">
            {/* shop img Carousel section start */}
            <div id="CustomImgCarousel" className="carousel slide my-5" data-bs-ride="carousel" >
              {/* Indicators */}
              <div className="carousel-indicators customIndicators">
                <button type="button" data-bs-target="#CustomImgCarousel" data-bs-slide-to={0} className="active"/>
                <button type="button" data-bs-target="#CustomImgCarousel" data-bs-slide-to={1}/>
                <button type="button" data-bs-target="#CustomImgCarousel" data-bs-slide-to={2}/>
              </div>
              {/* Wrapper for Slides */}
              <div className="carousel-inner carouselHeight rounded-5">
                <div className="carousel-item h-100 active" data-bs-interval="3000" >
                  {/* Set the first background image using inline CSS below. */}
                  <div
                    className="shopCarouselBg"
                    style={{ backgroundImage: `url(${ShopTopCarouselBanner})` }}
                  ></div>
                  <div className="carousel-caption carouselCaption">
                    <h2 className="animated fadeInLeft">Caption Animation</h2>
                    <p className="animated fadeInUp">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit
                    </p>
                    <p className="animated fadeInUp">Learn More</p>
                  </div>
                </div>
                <div className="carousel-item h-100" data-bs-interval="3000">
                  {/* Set the second background image using inline CSS below. */}
                  <div
                    className="shopCarouselBg"
                    style={{
                      backgroundImage: `url(${ShopTopCarouselBanner1})`,
                    }}
                  ></div>
                  <div className="carousel-caption carouselCaption">
                    <h2 className="animated fadeInDown">Caption Animation</h2>
                    <p className="animated fadeInUp">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit
                    </p>
                    <p className="animated fadeInUp">Learn More</p>
                  </div>
                </div>
                <div className="carousel-item h-100" data-bs-interval="3000">
                  {/* Set the third background image using inline CSS below. */}
                  <div
                    className="shopCarouselBg"
                    style={{
                      backgroundImage: `url(${ShopTopCarouselBanner2})`,
                    }}
                  ></div>
                  <div className="carousel-caption carouselCaption">
                    <h2 className="animated fadeInRight">Caption Animation</h2>
                    <p className="animated fadeInRight">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit
                    </p>
                    <p className="animated fadeInRight">Learn More</p>
                  </div>
                </div>
              </div>
              {/* Controls */}
              <a
                className="carousel-control-prev rounded-5"
                href="#CustomImgCarousel"
                data-bs-slide="prev"
              >
                {/* <span className="carousel-control-prev-icon" /> */}
                <i className="ri-arrow-left-double-line display-5"></i>
              </a>
              <a
                className="carousel-control-next rounded-5"
                href="#CustomImgCarousel"
                data-bs-slide="next"
              >
                {/* <span className="carousel-control-next-icon" /> */}
                <i className="ri-arrow-right-double-line display-5"></i>
              </a>
            </div>
            {/* shop img Carousel section end */}
            {/* shop categories section start */}
            <section className="pb-5">
           
                <ProductCategories MainTitle='Categories' categorieProp={ProductCategorie}/>
          
            </section>
            {/* Slider sections start  */}
            {/* first slider */}
            <section className="py-3">
              <ProductSlider MainTitle = "Deals of the Day :" />
            </section>
            {/* first slider */}
            {/* Secdond slider */}
            <section  className="py-3" >
              <ProductSlider MainTitle = "Trending Near You :" MainSubTitle="Popular In Your City" />
            </section>
            {/* Secdond slider */}
            {/* Slider sections end  */}
            {/* data sections */}
            <div className="py-4">
           <h1 className="display-6 mb-4 fw-semibold">BestSellers :</h1>
            <section className="main py-3 bd-grid ShopProductCardsColorTheame">
              <ProductCards2 product={products} limit={4}/>
            </section>
           </div>
           <div className="py-4">
           <h1 className="display-6 mb-4 fw-semibold">You May Also Like :</h1>
            <section className="main py-3 bd-grid ShopProductCardsColorTheame">
              <ProductCards2 product={products} limit={4}/>
            </section>
           </div>
            {/* data sections */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopMain;
