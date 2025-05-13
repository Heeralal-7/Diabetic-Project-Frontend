import React from 'react'
import FoodAndNurtImg from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png'
import FoodAndNurtImg1 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png'
import FoodAndNurtImg2 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png'
import FoodAndNurtImg3 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png'
import FoodAndNurtImg4 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png'
import categorieImg from '../../Assets/img/FoodAndNutrition/Categorie.png'
import categorieImg1 from '../../Assets/img/FoodAndNutrition/Categorie1.png'
import categorieImg2 from '../../Assets/img/FoodAndNutrition/Categorie2.png'
import categorieImg3 from '../../Assets/img/FoodAndNutrition/Categorie3.png'
import categorieImg4 from '../../Assets/img/FoodAndNutrition/Categorie4.png'
import categorieImg5 from '../../Assets/img/FoodAndNutrition/Categorie5.png'
import categorieImg6 from '../../Assets/img/FoodAndNutrition/Categorie6.png'
import categorieImg7 from '../../Assets/img/FoodAndNutrition/Categorie7.png'
import mealsImg from '../../Assets/img/FoodAndNutrition/mealsImg.png'
import mealsImg1 from '../../Assets/img/FoodAndNutrition/mealsImg1.png'
import mealsImg2 from '../../Assets/img/FoodAndNutrition/mealsImg2.png'
import mealsImg3 from '../../Assets/img/FoodAndNutrition/mealsImg3.png'
import mealsImg4 from '../../Assets/img/FoodAndNutrition/mealsImg4.png'
import mealsImg5 from '../../Assets/img/FoodAndNutrition/mealsImg5.png'
import mealsImg6 from '../../Assets/img/FoodAndNutrition/mealsImg6.png'
import mealsImg7 from '../../Assets/img/FoodAndNutrition/mealsImg7.png'
import ordersPkg from '../../Assets/img/FoodAndNutrition/ordersPkg.png'
import ordersPkg1 from '../../Assets/img/FoodAndNutrition/ordersPkg1.png'
import ordersPkg2 from '../../Assets/img/FoodAndNutrition/ordersPkg2.png'
import ProductCardImg from '../../Assets/img/FoodAndNutrition/ProductCardImg.png'
import ProductCardImg1 from '../../Assets/img/FoodAndNutrition/ProductCardImg1.png'
import ProductCardImg2 from '../../Assets/img/FoodAndNutrition/ProductCardImg2.png'
import ProductCardImg3 from '../../Assets/img/FoodAndNutrition/ProductCardImg3.png'
import ProductCardImg4 from '../../Assets/img/FoodAndNutrition/ProductCardImg4.png'
import ProductCardImg5 from '../../Assets/img/FoodAndNutrition/ProductCardImg5.png'
import ProductCardImg6 from '../../Assets/img/FoodAndNutrition/ProductCardImg6.png'
import ProductCardImg7 from '../../Assets/img/FoodAndNutrition/ProductCardImg7.png'


import Sliders from './FAndNComponents/Sliders'
import Carousel from './FAndNComponents/Carousel'
import OfferImg from '../../Assets/img/FoodAndNutrition/OfferImg.png'
import OfferSlider from './FAndNComponents/OfferSlider'
import CategoriesSlider from './FAndNComponents/CategoriesSlider'
import CategoriesCards from './FAndNComponents/CategoriesCards'
import BulkOrderCards from './FAndNComponents/BulkOrderCards'
import FilterOffcanvas from './FAndNComponents/FilterOffcanvas'
import ProductCard from './FAndNComponents/ProductCard'

import { useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';


const HomeFoodAndNurtion = () => {
  const { foodCategory, getFoodCategory } = useContext(MyContext);
console.log("Food Category:", foodCategory);
  useEffect(() => {
    getFoodCategory();
  }, []);

  useEffect(() => {
    console.log("Fetched Food Categories home:", foodCategory);
  }, [foodCategory]);

  const transformedMealsData = foodCategory?.map((category) => ({
    id: category._id,
    CateTitle: category.name,
    image: category.foodImage,
    discount: category.discount ? `${category.discount}% off` : "",
    discountSet: category.discount ? 1 : 0,
  })) || [];


   // Helper function to assign images based on index
   function getImageForCategory(index) {
    const mealImages = [
      mealsImg,
      mealsImg1,
      mealsImg2,
      mealsImg3,
      mealsImg4,
      mealsImg5,
      mealsImg6,
      mealsImg7
    ];
    return mealImages[index % mealImages.length];
  }


const TopSlidesData = [
{
title: 'Breakfast Subscription For Week!',
description: 'Enjoy Healthy Breakfasts All Week',
image: FoodAndNurtImg3,
buttonLabel: 'Order Now'
},
{
title: 'Delicious Lunch Plans!',
description: 'Nutritious and Tasty Lunches Delivered',
image: FoodAndNurtImg2,
buttonLabel: 'Subscribe Now'
},
{
title: 'Dinner Delights!',
description: 'Healthy Dinners for a Balanced Diet',
image: FoodAndNurtImg4,
buttonLabel: 'Order Now'
},
{
title: 'Snack Attack!',
description: 'Healthy Snacks for Every Craving',
image: FoodAndNurtImg,
buttonLabel: 'Get Snacks'
},
{
title: 'Smoothie Subscriptions!',
description: 'Refreshing Smoothies for Any Time of Day',
image: FoodAndNurtImg1,
buttonLabel: 'Order Now'
}
];
const CarouselData = [
{
image: FoodAndNurtImg1,
captionTitle: "Healthy food for you",
captionText: "Etiam in ex nec lobortis food luctus. Etiam iaculis healthy.",
buttonText: "Order Now",
},
{
image: FoodAndNurtImg2,
captionTitle: "Nutritious Meals",
captionText: "Aliquam euismod bibendum laoreet. Pellentesque ac bibendum.",
buttonText: "Discover More",
},
{
image: FoodAndNurtImg3,
captionTitle: "Fresh and Organic",
captionText: "Curabitur consequat orci vitae arcu interdum, vel tincidunt.",
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
captionText: "Suspendisse potenti. Praesent et risus non quam condimentum.",
buttonText: "Learn More",
}
];
const offerCardsData = [
{
image: OfferImg,
title: "Fresh Fruits Offer",
discount: "20% off",
orderValue: "Above ₹199",
minTime: 25,
maxTime: 30
},
{
image: OfferImg,
title: "Organic Vegetables",
discount: "15% off",
orderValue: "Above ₹249",
minTime: 30,
maxTime: 35
},
{
image: OfferImg,
title: "Whole Grains Discount",
discount: "10% off",
orderValue: "Above ₹299",
minTime: 20,
maxTime: 25
},
{
image: OfferImg,
title: "Nuts and Seeds",
discount: "25% off",
orderValue: "Above ₹349",
minTime: 15,
maxTime: 20
},
{
image: OfferImg,
title: "Organic Vegetables",
discount: "15% off",
orderValue: "Above ₹249",
minTime: 30,
maxTime: 35
},
{
image: OfferImg,
title: "Whole Grains Discount",
discount: "10% off",
orderValue: "Above ₹299",
minTime: 20,
maxTime: 25
},
{
image: OfferImg,
title: "Nuts and Seeds",
discount: "25% off",
orderValue: "Above ₹349",
minTime: 15,
maxTime: 20
},
{
image: OfferImg,
title: "Protein-Packed Legumes",
discount: "20% off",
orderValue: "Above ₹199",
minTime: 10,
maxTime: 15
},
{
image: OfferImg,
title: "Dairy Products",
discount: "10% off",
orderValue: "Above ₹249",
minTime: 5,
maxTime: 10
},
{
image: OfferImg,
title: "Healthy Snacks",
discount: "15% off",
orderValue: "Above ₹199",
minTime: 20,
maxTime: 25
}
];
const CategoriesData = [
{
id: 1,
CateTitle: "Thali",
image: categorieImg1,
discount: "",
discountSet: 0,
},
{
CateTitle: "Dosa",
id: 2,
image: categorieImg,
discount: 2000 ,
discountSet: 1,
},
{
id: 3,
CateTitle: "Paratha",
image: categorieImg2,
discount: "",
discountSet: 0,
},
{
id: 4,
CateTitle: "Idli",
image: categorieImg6,
discount: "",
discountSet: 0,
},
{
id: 5,
CateTitle: "Beverages",
image: categorieImg3,
discount: 50 ,
discountSet: 1,
},
{
id: 6,
CateTitle: "Sandwich",
image: categorieImg4,
discount: 30 ,
discountSet: 1,
},
{
id: 7,
CateTitle: "Fried Rice",
image: categorieImg5,
discount: "",
discountSet: 0,
},
{
id: 8,
CateTitle: "Soup",
image: categorieImg7,
discount: "",
discountSet: 0,
},

];

const bulkOrdersData =[
{
id: 1,
Title: "Food Packets",
image: ordersPkg,
},
{
id: 2,
Title: "Snacks",
image: ordersPkg1,
},
{
id: 3,
Title: "Meal Boxes",
image: ordersPkg2,
},
]
const ProductCards = [
{
image: ProductCardImg,
title: "Quinoa Salad with Roasted Vegetables",
rating: "5.9",
time: "36 min",
distance: "2.5km",
veg: true,
delivery_time: "40-45 min",
price: "₹250 for one",
offer: "Flat ₹150 OFF + ₹25 Cashback",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg1,
title: "Spicy Tofu Stir Fry",
rating: "4.8",
time: "25 min",
distance: "1.8km",
veg: true,
delivery_time: "30-35 min",
price: "₹200 for one",
offer: "Flat ₹100 OFF",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg2,
title: "Grilled Chicken Sandwich",
rating: "4.5",
time: "45 min",
distance: "3.0km",
veg: false,
delivery_time: "50-55 min",
price: "₹150 for one",
offer: "Flat ₹50 OFF",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg3,
title: "Pasta Alfredo",
rating: "5.2",
time: "30 min",
distance: "2.0km",
veg: false,
delivery_time: "35-40 min",
price: "₹300 for one",
offer: "Flat ₹200 OFF + ₹50 Cashback",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg4,
title: "Vegan Buddha Bowl",
rating: "5.0",
time: "40 min",
distance: "2.2km",
veg: true,
delivery_time: "45-50 min",
price: "₹275 for one",
offer: "Flat ₹100 OFF",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg5,
title: "Avocado Toast",
rating: "4.7",
time: "20 min",
distance: "1.5km",
veg: true,
delivery_time: "25-30 min",
price: "₹150 for one",
offer: "Flat ₹75 OFF",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg6,
title: "BBQ Chicken Pizza",
rating: "5.3",
time: "50 min",
distance: "3.5km",
veg: false,
delivery_time: "55-60 min",
price: "₹350 for one",
offer: "Flat ₹200 OFF",
delivery: "FREE DELIVERY"
},
{
image: ProductCardImg7,
title: "Berry Smoothie Bowl",
rating: "4.9",
time: "15 min",
distance: "1.2km",
veg: true,
delivery_time: "20-25 min",
price: "₹120 for one",
offer: "Flat ₹50 OFF + ₹20 Cashback",
delivery: "FREE DELIVERY"
}
]
// const CategoriesCards = ({ Data, id }) => {
//   // ... rest of the component
//   // Use id where needed
// };


return (
<>
  <div className="container-xl comtainer-fluid">
    <div className="row">
      <div className="col-12 mt-4">
      {/* <div className="mb-5">
      <h1 className="display-6 mb-4 fw-semibold">What's on your mind?</h1>
      <div className="oferrsWrapper d-flex flex-wrap gap-3">
        {transformedMealsData.map((category) => (
          <CategoriesCards 
            Data={category} 
            key={category.id} 
          />
        ))}
      </div>
    </div> */}
        <div className="mb-3">
          <OfferSlider autoplay={true} loop={true} mainTittle="Enjoy Your Welcome Offer!" initialSlide={0}
            slideData={offerCardsData} noOfSlides={[8,7,5,4,3,2]} />
        </div>



       <div className="mb-5">
        <h1 className="display-6 mb-4 fw-semibold">What's on your mind?</h1>
        <div className="oferrsWrapper">
          {transformedMealsData.map((category) => (
            <CategoriesCards 
              Data={category} 
              key={category.id} 
            />
          ))}
        </div>
      </div>




        <div className="mb-5">
          <Sliders mainTittle="Meal Subscriptions" slideData={TopSlidesData} autoplay={true} />
        </div>
        <div className="mb-3">
          <CategoriesSlider autoplay={false} loop={false} mainTittle="Craving something Healthier?" initialSlide={0}
            slideData={CategoriesData} noOfSlides={[8,7,6,4,3,2]} />
        </div>
        <div className="mb-5">
          <h1 className="display-6 mb-4 fw-semibold">
            Order in Bulk?
          </h1>
          <div className="bulkCardsWrapper">
            {bulkOrdersData.map((offer, index) => (
            <BulkOrderCards Data={offer} key={index} />
            ))}

          </div>
        </div>
        <div className="w-100 mb-4">
          <div className="d-flex flex-wrap gap-1 gap-md-3" role="group" aria-label="Basic example">
            <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
              data-bs-toggle="offcanvas" data-bs-target="#Filter" aria-controls="Filter">
              Filter <i className="ri-equalizer-2-line fw-lighter"></i>
            </button>
            <FilterOffcanvas mainTitle="Filter" />
            <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap" data-bs-toggle="dropdown"
              data-bs-auto-close="outside" aria-expanded="false">
              Sort By <i className="ri-arrow-down-s-line fw-lighter"></i>
            </button>
            <ul className="dropdown-menu activeRedColor px-3" style={{minWidth:"180px"}}>
              <div className="form-check mt-2">
                <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio1" />
                <label className="form-check-label" htmlFor="filterRadio1">
                  Relevance(Default)
                </label>
              </div>
              <div className="form-check mt-2">
                <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio2" />
                <label className="form-check-label" htmlFor="filterRadio2">
                  Rating
                </label>
              </div>
              <div className="form-check mt-2">
                <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio3" />
                <label className="form-check-label" htmlFor="filterRadio3">
                  Cost:LowtoHigh
                </label>
              </div>
              <div className="form-check mt-2">
                <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio4" />
                <label className="form-check-label" htmlFor="filterRadio4">
                  Cost:HightoLow
                </label>
              </div>
            </ul>
            <div className="w-auto text-nowrap">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" />
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
              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
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
              <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
              <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio3">
                Fast Delivery
              </label>
            </div>

          </div>

        </div>
        <div className="mb-5">
          <h1 className="display-6 mb-4 fw-semibold">
            Top 1830 Meals to explore
          </h1>
          <div className="ProductCardsWrapper">
            {ProductCards.map((product, index) => (
            <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</>
)
}

export default HomeFoodAndNurtion