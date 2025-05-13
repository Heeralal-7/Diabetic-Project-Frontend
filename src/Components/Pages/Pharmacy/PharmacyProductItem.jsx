import React, { useState } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import CardsCarousel from './PharmacyComponents/CardsCarousel';

const PharmacyProductItem = () => {
    const img = [
        'https://react-slick.neostack.com/img/react-slick/abstract01.jpg',
        'https://react-slick.neostack.com/img/react-slick/abstract03.jpg',
        'https://react-slick.neostack.com/img/react-slick/abstract02.jpg',
        'https://react-slick.neostack.com/img/react-slick/abstract04.jpg',
    ];
      
    const settings = {
        className: "",
        customPaging: function (i) {
          return (
            <span key={i}>
              <img src={img[i]} alt={`custom-paging-${i}`} />
            </span>
          );
        },
        dots: true,
        dotsClass: "slick-dots slick-thumb SlickImgDots mx-auto",
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    const [qty, setQty] = useState(1);
    const Medicines1 = [
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "Allen Nutraceutical Vitamin D3 (Cholecalciferol) 1000 I.U for Bone Metabolism & ...",
          medQty: "box of 30 tabs",
          avgRating: 3.7,
          oldPrice: 20.0,
          price: 10.99,
          badge: "Bestseller",
          delivery: 60,
          offer: 15,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "BioPharm Multivitamin Complex - Boost Immunity & Energy",
          medQty: "bottle of 60 capsules",
          avgRating: 4.5,
          oldPrice: 25.0,
          price: 19.99,
          badge: "New",
          delivery: 45,
          offer: 20,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "GreenLeaf Organic Herbal Supplement for Detoxification",
          medQty: "pack of 20 teabags",
          avgRating: 4.2,
          oldPrice: 15.0,
          price: 12.50,
          badge: "Organic",
          delivery: 30,
          offer: 10,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "HeartCare Omega-3 Fish Oil for Cardiovascular Health",
          medQty: "bottle of 90 softgels",
          avgRating: 4.7,
          oldPrice: 40.0,
          price: 32.99,
          badge: "Top Rated",
          delivery: 50,
          offer: 25,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "SleepWell Melatonin Gummies - Improve Sleep Quality",
          medQty: "jar of 60 gummies",
          avgRating: 3.9,
          oldPrice: 18.0,
          price: 14.99,
          badge: "Popular",
          delivery: 20,
          offer: 5,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "ProHealth Probiotics for Digestive Health",
          medQty: "bottle of 30 capsules",
          avgRating: 4.8,
          oldPrice: 22.0,
          price: 17.50,
          badge: "Recommended",
          delivery: 25,
          offer: 15,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "JointFlex Glucosamine & Chondroitin for Joint Support",
          medQty: "bottle of 120 tablets",
          avgRating: 4.1,
          oldPrice: 35.0,
          price: 28.99,
          badge: "Best Value",
          delivery: 35,
          offer: 20,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "HairGrow Biotin Supplement for Hair Growth",
          medQty: "bottle of 90 tablets",
          avgRating: 3.6,
          oldPrice: 30.0,
          price: 24.99,
          badge: "Editor's Choice",
          delivery: 40,
          offer: 10,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "ImmuneBoost Vitamin C with Zinc for Immune Support",
          medQty: "pack of 100 tablets",
          avgRating: 4.3,
          oldPrice: 15.0,
          price: 11.99,
          badge: "Customer Favorite",
          delivery: 15,
          offer: 5,
        },
        {
          image: "https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1721041732~exp=1721045332~hmac=fc9e6f348d658b0ff321bb9c3db74cac9f52bcaa0ca407fa6fe91dace1b5131e&w=740",
          medName: "CalmMind Ashwagandha for Stress Relief",
          medQty: "bottle of 60 capsules",
          avgRating: 4.0,
          oldPrice: 20.0,
          price: 16.50,
          badge: "Best Seller",
          delivery: 20,
          offer: 15,
        }
      ];
    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                            .SlickImgDots{
                                display:grid !important; 
                                grid-template-columns:repeat(auto-fill, minmax(90px, 1fr));
                                max-width:400px;
                                position: unset !important;
                                margin-top:20px !important;
                                
                            }
                            .SlickImgDots li a img{
                                height:100%;
                                width:100% !important;
                            }
                            .SlickImgDots li {
                                height:65px;
                                min-width:90px;
                            }
                            ..slick-list{
                                max-height:500px;
                            }
                            .SlickImgDots li.slick-active img {
                                border:2px solid red;
                            }
                            .SlickImgDots.slick-dots{
                                bottom: -60px !important;
                            }        
                            .lavbel_clas {
                                padding: 8px 12px;
                                border: 1px solid lightgrey;
                                border-radius: 3px;
                                margin: 6px;
                            }

                            input[type="radio"] {
                                display: none;
                            }

                            input[type="radio"]:checked+label.lavbel_clas {
                                border: 2px solid red;
                                background:var(--main-red-color-light);
                            }
                            
                            .slick-prev {
                            z-index: 5;
                            left: 5px !important;
                            }

                            .slick-next {
                            z-index: 5;
                            right:26px !important;
                            }
                            
                            .addtocartbtnproductpagelist {
                                height: 50px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                color: #fff;
                                margin: 20px 0px 0px 0px;
                            }

                            .buyitnowbtnproductpagelist {
                                height: 50px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                margin: 20px 0px 0px 0px;
                            }


                            .rating-box {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                                padding: 20px;
                                width: 150px;
                                text-align: center;
                            }
                            .stars {
                                display: flex;
                                justify-content: center;
                                margin: 10px 0;
                            }
                            .stars i {
                                color: #ffcc00;
                                margin: 0 2px;
                            }
                            .rating-value {
                                font-size: 2em;
                                margin-bottom: 5px;
                            }
                            .rating-count {
                                color: #777;
                            }
                            .progress-container {
                                margin-top: 20px;
                                width: calc(100% - 150px);
                            }
                            .progress-bar {
                                width: 100%;
                                background-color: #f3f3f3;
                                border-radius: 5px;
                                overflow: hidden;
                                margin-bottom: 5px;
                            }
                            .progress.ProgressHeight {
                                height: 20px;
                                border-radius: 5px;
                            }
                            .five-stars { background-color: #28a745; width: 36%; }
                            .four-stars { background-color: #28a745; width: 24%; }
                            .three-stars { background-color: #fd7e14; width: 17%; }
                            .two-stars { background-color: #fd7e14; width: 13%; }
                            .one-star { background-color: #dc3545; width: 10%; }
                            .progress-label {
                                display: flex;
                                justify-content: space-between;
                            }

                            @media only screen and (min-width: 992.5px) {
                                .reviews-section{
                                    max-height:220px;
                                    overflow-y: scroll;
                                }
                            }
                            .reviews-section h2 {
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 10px;
                            }
                            .review {
                                border-bottom: 1px solid #ddd;
                                padding: 10px 0;
                            }
                            .review:last-child {
                                border-bottom: none;
                            }
                            .review .starsss {
                                color: #ffcc00;
                                margin-bottom: 10px;
                            }
                            .review .content {
                                margin-bottom: 10px;
                            }
                            .review .date {
                                color: #777;
                            }

                            `,
                }}
            />
            <div className="container-fluid container-xl px-lg-4 py-4">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="slider-container">
                            <Slider {...settings}>
                                {
                                    img.map((item, i) => {
                                        return (
                                            <div key={i}>
                                                <img src={item} className='mx-auto' alt="xnasjbx" />
                                            </div>
                                        );
                                    })
                                }
                            </Slider>
                        </div>
                    </div>

                    <div className="col-lg-6 mt-5 mt-lg-0  pe-md-5">
                        <h2>Allen Nutraceutical Vitamin D3 (Cholecalciferol) 1000 I.U for Bone Metabolism &</h2>
                        <div className="row">
                            <p className="mt-3 mb-4">
                                <span className="fs-4" style={{ color: 'var(--main-red-color)' }}>Rs. 699.00</span>
                                <del className="fs-6 mx-2" style={{ color: 'var(--active-color) !important' }}>Rs. 1699.00</del>
                                <span className="productpage-offsave">SAVE RS. 1000</span>
                            </p>
                            <hr />
                            <div className="col-12">
                                <p className="fs-5 fw-medium">Strips/Lancets: 25 Strips &amp; 25 Lancets</p>
                                <form>
                                    <input type="radio" name="stipslabel" id="fristt" />
                                    <label className="lavbel_clas" htmlFor="fristt">10 Strips &amp; 10 Lancets</label>
                                    <input type="radio" name="stipslabel" id="scndfe" />
                                    <label className="lavbel_clas" htmlFor="scndfe">10 Strips &amp; 10 Lancets</label>
                                    <input type="radio" name="stipslabel" id="rtjrfthird" />
                                    <label className="lavbel_clas" htmlFor="rtjrfthird">10 Strips &amp; 10 Lancets</label>
                                    <input type="radio" name="stipslabel" id="frthfjds" />
                                    <label className="lavbel_clas" htmlFor="frthfjds">10 Strips &amp; 10 Lancets</label>
                                </form>
                            </div>
                            <div className="col-12">
                                <p className="fs-5 fw-medium mt-3">Quantity :</p>
                                <div className="d-flex text-danger align-items-center justify-content-center py-2 gap-1 fw-bold bg-mainLightRed border rounded-3 border-RedLight" style={{width:"100px"}}>
                                    <span onClick={() => setQty(qty > 1 ? qty - 1 : 1)}><i className="ri-subtract-line" /></span>
                                    <span className='px-2'>{qty}</span>
                                    <span onClick={() => setQty(qty + 1)}><i className="ri-add-fill" /></span>
                                </div>
                            </div>
                            <div className="w-100 d-flex align-items-center gap-3">
                                <Link to='/Pharmacy/shop/Cart' className="btn w-100 fw-bold bg-mainLightRed border-current text-danger buyitnowbtnproductpagelist">
                                    ADD TO CART
                                </Link>
                                <Link to='/Pharmacy/shop/Cart' className="btn w-100 btn-hoverBlue fw-bold border-current text-mainBlue btn-outline-secondary addtocartbtnproductpagelist">
                                    BUY IT NOW
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-md-6">
                        <div className="row">
                            <div className="rating-box">
                                <div className="rating-value">3.6/5</div>
                                <div className="stars">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star-half-alt"></i>
                                </div>
                                <div className="rating-count">(173 Ratings)</div>
                            </div>

                            <div className="progress-container">
                                <div className="progress-label">
                                    <span>5 stars</span>
                                    <span>36%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress five-stars"></div>
                                </div>

                                <div className="progress-label">
                                    <span>4 stars</span>
                                    <span>24%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress four-stars"></div>
                                </div>

                                <div className="progress-label">
                                    <span>3 stars</span>
                                    <span>17%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress three-stars"></div>
                                </div>

                                <div className="progress-label">
                                    <span>2 stars</span>
                                    <span>13%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress two-stars"></div>
                                </div>

                                <div className="progress-label">
                                    <span>1 star</span>
                                    <span>10%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress one-star"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 ps-4 mt-4 mt-md-0">
                        <h2>Recent Reviews</h2>
                        <div className="reviews-section HoverScrol CustomScrollBar">
                            <div className="review">
                                <h5>Dilip Mayekar</h5>
                                <div className="starsss">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="content">
                                    "Nice"
                                </div>
                                <div className="date">
                                    1 week ago
                                </div>
                            </div>

                            <div className="review">
                                <h5>Chandan Rock</h5>
                                <div className="starsss">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="content">
                                    "one of best strength and endurance gaining I am using this and I feel very great changes in my performance"
                                </div>
                                <div className="date">
                                    1 week ago
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-100 mx-auto mt-5">
                <CardsCarousel autoplay={true} loop={true} mainTittle="Best Selling Products" initialSlide={0}
            slideData={Medicines1} noOfSlides={[5,4,3,2,2,1]} />
                </div>
            </div>
        </>
    );
}

export default PharmacyProductItem;
