import React, { useState } from "react";
import Carousel from "./FAndNComponents/Carousel";
import FoodAndNurtImg from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png";
import FoodAndNurtImg1 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png";
import FoodAndNurtImg2 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png";
import FoodAndNurtImg3 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png";
import FoodAndNurtImg4 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png";
import ProductItemImg from "../../Assets/img/FoodAndNutrition/ProductItemImg.png";
import FilterOffcanvas from "./FAndNComponents/FilterOffcanvas";
import ProductItemCard from "./FAndNComponents/ProductItemCard";
import AddProductOffcanvas from "./FAndNComponents/AddProductOffcanvas";



const ProductsItems = () => {
const [list,setLists] = useState([])
const CarouselData = [
{
image: FoodAndNurtImg1,
captionTitle: "Healthy food for you",
captionText:
"Etiam in ex nec lobortis food luctus. Etiam iaculis healthy.",
buttonText: "Order Now",
},
{
image: FoodAndNurtImg2,
captionTitle: "Nutritious Meals",
captionText:
"Aliquam euismod bibendum laoreet. Pellentesque ac bibendum.",
buttonText: "Discover More",
},
{
image: FoodAndNurtImg3,
captionTitle: "Fresh and Organic",
captionText:
"Curabitur consequat orci vitae arcu interdum, vel tincidunt.",
buttonText: "Shop Now",
},
{
image: FoodAndNurtImg4,
captionTitle: "Delicious and Healthy",
captionText: "Vivamus vitae magna vel mauris fermentum scelerisque.",
buttonText: "Get Started",
},
{
image: FoodAndNurtImg,
captionTitle: "Balanced Diet",
captionText:
"Suspendisse potenti. Praesent et risus non quam condimentum.",
buttonText: "Learn More",
},
];
const productsItemsData = [
{
isBestseller: true,
veg: true,
title: "Standard 111 Thali - Trail",
rating: 3.6,
originalPrice: 136.00,
discountedPrice: 119,
description: "A delicious and balanced meal with rice, dal, vegetables, and chapati.",
imageUrl:
"https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg?t=st=1713965310~exp=1713968910~hmac=d6073e9948c98d6fd60c0fdffbd0d6aead5150f5628b33ad2f7565e7d879a340&w=740"
},
{
isBestseller: false,
veg: true,
title: "Deluxe Veggie Pizza",
rating: 4.5,
originalPrice: 299.00,
discountedPrice: 249,
description: "A pizza loaded with fresh vegetables, cheese, and a tangy tomato sauce.",
imageUrl: ProductItemImg
},
{
isBestseller: true,
veg: true,
title: "Paneer Butter Masala",
rating: 4.8,
originalPrice: 200.00,
discountedPrice: 180,
description: "Creamy paneer butter masala served with naan or rice.",
imageUrl:
"https://img.freepik.com/free-photo/indian-food-platter_23-2147759297.jpg?w=740&t=st=1713965314~exp=1713968914~hmac=2c9200bfc2b556e4eb69f6b0039eeb06b8919b267f4c5f3b9e356aa504de3a0e"
},
{
isBestseller: false,
veg: false,
title: "Chicken Biryani",
rating: 4.2,
originalPrice: 250.00,
discountedPrice: 220,
description: "Aromatic chicken biryani cooked with basmati rice and spices.",
imageUrl: ProductItemImg
},
{
isBestseller: true,
veg: true,
title: "Mango Smoothie",
rating: 4.9,
originalPrice: 120.00,
discountedPrice: 100,
description: "Refreshing mango smoothie made with ripe mangoes and yogurt.",
imageUrl:
"https://img.freepik.com/free-photo/mango-smoothie-drink-bottle-with-fresh-mangoes_23-2148043671.jpg?w=740&t=st=1713965318~exp=1713968918~hmac=9d91b4e1387d6e75b2e2063e1722d97c5e2e73029a7b2e5a537e3f1095d96e2d"
},
{
isBestseller: false,
veg: false,
title: "Grilled Cheese Sandwich",
rating: 4.1,
originalPrice: 150.00,
discountedPrice: 130,
description: "Classic grilled cheese sandwich with a golden, crispy crust.",
imageUrl: ProductItemImg
},
{
isBestseller: true,
veg: true,
title: "Veggie Burger",
rating: 4.6,
originalPrice: 180.00,
discountedPrice: 160,
description: "Hearty veggie burger with a patty made from mixed vegetables and spices.",
imageUrl:
"https://img.freepik.com/free-photo/front-view-veggie-burger-with-green-vegetables-dark-surface_179666-43603.jpg?w=740&t=st=1713965322~exp=1713968922~hmac=2eb2cc0dc58e35d06c2e06ab7d5298eeb658ad9118bc71e07b7fa2d4100dbb20"
},
{
isBestseller: false,
veg: false,
title: "Pasta Primavera",
rating: 4.3,
originalPrice: 220.00,
discountedPrice: 200,
description: "Pasta tossed with fresh vegetables and a light, flavorful sauce.",
imageUrl: ProductItemImg
},
{
isBestseller: true,
veg: true,
title: "Caesar Salad",
rating: 4.7,
originalPrice: 150.00,
discountedPrice: 130,
description: "Classic Caesar salad with crisp romaine lettuce, croutons, and Caesar dressing.",
imageUrl:
"https://img.freepik.com/free-photo/caesar-salad-with-chicken-breast_144627-40552.jpg?w=740&t=st=1713965326~exp=1713968926~hmac=d920f49764b3fcd4b9e2ed55615f0b351b9b6f6e5af527a7601f3188880bb0e7"
},
{
isBestseller: false,
veg: false,
title: "Chocolate Cake",
rating: 4.8,
originalPrice: 100.00,
discountedPrice: 90,
description: "Rich and moist chocolate cake topped with a creamy chocolate frosting.",
imageUrl:
"https://img.freepik.com/free-photo/chocolate-cake-with-chocolate-sauce-wooden-board_1150-20170.jpg?w=740&t=st=1713965328~exp=1713968928~hmac=1b10a512b2d17c8d2fd5246e368b8d194d9496c972e0b7f2a70ab313e2bc7f6b"
}
];

const [radio,setRadio]= useState("Sun")
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

return (
<>
    <style dangerouslySetInnerHTML={{__html: ` ` }} />
    <div className="container-xl container-fluid">
        <div className="row">
            <div className="col-12 mt-4">
                <div className="mb-5">
                    <Carousel slideData={CarouselData}  id='carousel3' autoplay="carousel" />
                </div>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                    {daysOfWeek.map((d, i) => (
                    <div key={i}>
                        <input type="radio" className="btn-check" name="days" id={`day${i}`} autoComplete="off"
                            checked={d===radio} onChange={()=> setRadio(d)} />
                        <label className="btn customRadioBorderRed" htmlFor={`day${i}`} onClick={()=> setRadio(d)}
                            >{d}</label>
                    </div>
                    ))}
                </div>
                <div className="w-100 mb-4">
                    <div className="d-flex flex-wrap gap-1 gap-md-3" role="group" aria-label="Basic example">
                        <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                            data-bs-toggle="offcanvas" data-bs-target="#Filter" aria-controls="Filter">
                            Filter <i className="ri-equalizer-2-line fw-lighter"></i>
                        </button>
                        <FilterOffcanvas mainTitle="Filter" />
                        <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                            data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                            Sort By <i className="ri-arrow-down-s-line fw-lighter"></i>
                        </button>
                        <ul className="dropdown-menu activeRedColor px-3" style={{minWidth:"180px"}}>
                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="Sorting" id="Radio1" />
                                <label className="form-check-label" htmlFor="Radio1">
                                    Relevance(Default)
                                </label>
                            </div>
                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="Sorting" id="Radio2" />
                                <label className="form-check-label" htmlFor="Radio2">
                                    Rating
                                </label>
                            </div>
                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="Sorting" id="Radio3" />
                                <label className="form-check-label" htmlFor="Radio3">
                                    Cost:LowtoHigh
                                </label>
                            </div>
                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="Sorting" id="Radio4" />
                                <label className="form-check-label" htmlFor="Radio4">
                                    Cost:HightoLow
                                </label>
                            </div>
                        </ul>
                        <div className="w-auto text-nowrap">
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio1"
                                autoComplete="off" />
                            <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio1">
                                Veg
                                <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                                    <circle cx="7" cy="7" r="3.5" fill="#199339" />
                                </svg>
                            </label>
                        </div>
                        <div className="w-auto text-nowrap">
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio2"
                                autoComplete="off" />
                            <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio2">
                                Non-Veg
                                <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                                    <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                                </svg>
                            </label>
                        </div>
                        <div className="w-auto text-nowrap">
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio3"
                                autoComplete="off" />
                            <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio3">
                                Fast Delivery
                            </label>
                        </div>

                    </div>

                </div>
                <div className="w-100 mb-4">
                    <div className="ProductCardItemsWrapper">

                        {productsItemsData.map((product, index) => (
                        <ProductItemCard Data={product} id={index} setLists={setLists} />
                        ))}
                        <AddProductOffcanvas data={list} />
                    </div>
                </div>
            </div>
        </div>
    </div>
</>
);
};

export default ProductsItems;