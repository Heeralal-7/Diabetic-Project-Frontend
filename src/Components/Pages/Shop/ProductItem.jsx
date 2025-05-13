import React, { useState } from 'react';
import Slider from 'react-slick';
import ProductSlider from './ShopComponents/ProductSlider';
import { Link } from 'react-router-dom';

const ProductItem = () => {
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
                                background-color: var(--main-red-color);
                                height: 50px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                color: var(--White-color);
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
                            <div className="col-12">
                                <Link to='/shop/BuyMedicine/ProductCart' className="btn btn-mainBlue btn-outline-secondary addtocartbtnproductpagelist">
                                    ADD TO CART
                                </Link>
                                <Link to='/shop/BuyMedicine/ProductCart' className="btn bg-mainRed buyitnowbtnproductpagelist">
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

                <div className="row">
                    <ProductSlider />
                </div>
            </div>
        </>
    );
}

export default ProductItem;
