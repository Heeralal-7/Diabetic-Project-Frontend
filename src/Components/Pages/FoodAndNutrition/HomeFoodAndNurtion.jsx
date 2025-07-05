import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodAndNurtImg from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png'
import FoodAndNurtImg1 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png'
import FoodAndNurtImg2 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png'
import FoodAndNurtImg3 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png'
import FoodAndNurtImg4 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png'
import mealsImg from '../../Assets/img/FoodAndNutrition/mealsImg.png'
import mealsImg1 from '../../Assets/img/FoodAndNutrition/mealsImg1.png'
import mealsImg2 from '../../Assets/img/FoodAndNutrition/mealsImg2.png'
import mealsImg3 from '../../Assets/img/FoodAndNutrition/mealsImg3.png'
import mealsImg4 from '../../Assets/img/FoodAndNutrition/mealsImg4.png'
import mealsImg5 from '../../Assets/img/FoodAndNutrition/mealsImg5.png'
import mealsImg6 from '../../Assets/img/FoodAndNutrition/mealsImg6.png'
import mealsImg7 from '../../Assets/img/FoodAndNutrition/mealsImg7.png'
import { MyContext } from '../../../Context/Context';

import Sliders from './FAndNComponents/Sliders';
import CategoriesCards from './FAndNComponents/CategoriesCards';
import FilterOffcanvas from './FAndNComponents/FilterOffcanvas';

const HomeFoodAndNutrition = () => {
  const {
    foodCategory, getFoodCategory,
    yourmind, Mealcategory,
    Discount, getdiscountfood,
    kitchen, getTopKitchen
  } = useContext(MyContext);

  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;

  useEffect(() => {
    getFoodCategory();
    yourmind();
    getdiscountfood();
    getTopKitchen();
  }, []);

  useEffect(() => console.log("Fetched Food Categories:", foodCategory), [foodCategory]);
  useEffect(() => console.log("Meal Categories:", Mealcategory), [Mealcategory]);
  useEffect(() => console.log("Discount Items:", Discount), [Discount]);
  useEffect(() => console.log("Top Kitchens:", kitchen), [kitchen]);

  const transformedMealsData = foodCategory?.map(category => ({
    id: category._id,
    CateTitle: category.name,
    image: `${imageUrl}${category.foodImage}`,
    discount: category.discount ? `${category.discount}% off` : "",
    discountSet: category.discount ? 1 : 0,
  })) || [];

  const transformedMealData1 = Mealcategory?.map(meal => ({
    id: meal._id,
    CateTitle: meal.name,
    image: `${imageUrl}${meal.MealImage}`,
    discount: "",
    discountSet: 0,
  })) || [];

  const transformedDiscountData = Discount?.map(item => ({
    id: item._id,
    CateTitle: item.name,
    image: `${imageUrl}${item.image}`,
    discount: item.discount ? `${item.discount}% off` : "",
    discountSet: item.discount ? 1 : 0,
  })) || [];

  const transformedKitchens = kitchen?.map(vendor => ({
    id: vendor._id,
    CateTitle: vendor.name,
    image: `${imageUrl}${vendor.image}`,
  })) || [];

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

  const handleCardClick1 = (item) => {
    navigate(`/shop/FoodAndNurition/meal/${item.id}`);
  };
  const handleCardClick = (item) => {
    navigate(`/foodname/${item.CateTitle}`);
  };

  return (
    <div className="container-xl container-fluid">
      <div className="row">
        <div className="col-12 mt-4">

          {/* Discounted Items */}
          <div className="mb-5">
            <h1 className="display-6 mb-4 fw-semibold">Special Discounted Items</h1>
            <div className="oferrsWrapper">
              {transformedDiscountData.map((item) => (
                <CategoriesCards key={item.id} Data={item} />
              ))}
            </div>
          </div>

          {/* What's on your mind - Meal categories */}
          <div className="mb-5">
            <h1 className="display-6 mb-4 fw-semibold">What's on your mind?</h1>
            <div className="oferrsWrapper">
              {transformedMealData1.map((meal) => (
                <div key={meal.id} onClick={() => handleCardClick1(meal)} style={{ cursor: 'pointer' }}>
                  <CategoriesCards Data={meal} />
                </div>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="mb-5">
            <Sliders mainTittle="Meal Subscriptions" slideData={TopSlidesData} autoplay={true} />
          </div>

          {/* Craving meals */}
<div className="mb-5">
  <h1 className="display-6 mb-4 fw-semibold">Craving something in your mind?</h1>
  <div className="oferrsWrapper">
{transformedMealsData.map((category) => (
  <div key={category.name} onClick={() => handleCardClick(category)} style={{ cursor: 'pointer' }}>
    <CategoriesCards Data={category} />
  </div>
))}
  </div>
</div>

          {/* Filters */}
          <div className="w-100 mb-4">
            <div className="d-flex flex-wrap gap-1 gap-md-3" role="group" aria-label="Filters">
              <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                data-bs-toggle="offcanvas" data-bs-target="#Filter" aria-controls="Filter">
                Filter <i className="ri-equalizer-2-line fw-lighter"></i>
              </button>
              <FilterOffcanvas mainTitle="Filter" />
              <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap" data-bs-toggle="dropdown"
                data-bs-auto-close="outside" aria-expanded="false">
                Sort By <i className="ri-arrow-down-s-line fw-lighter"></i>
              </button>
              <ul className="dropdown-menu activeRedColor px-3" style={{ minWidth: "180px" }}>
                {["Relevance(Default)", "Rating", "Cost:LowtoHigh", "Cost:HightoLow"].map((label, index) => (
                  <div className="form-check mt-2" key={index}>
                    <input className="form-check-input" type="radio" name="filterRadio" id={`filterRadio${index + 1}`} />
                    <label className="form-check-label" htmlFor={`filterRadio${index + 1}`}>
                      {label}
                    </label>
                  </div>
                ))}
              </ul>

              {/* Veg/Non-Veg/Fast Delivery */}
              {[
                { label: "Veg", id: "btnradio1", color: "#199339", shape: <circle cx="7" cy="7" r="3.5" fill="#199339" /> },
                { label: "Non-Veg", id: "btnradio2", color: "#EB3239", shape: <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" /> },
                { label: "Fast Delivery", id: "btnradio3" }
              ].map((btn, i) => (
                <div className="w-auto text-nowrap" key={i}>
                  <input type="radio" className="btn-check" name="btnradio" id={btn.id} autoComplete="off" />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor={btn.id}>
                    {btn.label}
                    {btn.shape && (
                      <svg width="14" className="ms-2" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke={btn.color} />
                        {btn.shape}
                      </svg>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Top Kitchen Vendors */}
          <div className="mb-5">
            <h1 className="display-6 mb-4 fw-semibold">Top 1830 Meals to explore</h1>
            <div className="ProductCardsWrapper">
              {transformedKitchens.map((item) => (
                <CategoriesCards key={item.id} Data={item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeFoodAndNutrition;
