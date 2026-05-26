import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';
import CategoriesCards from './FAndNComponents/CategoriesCards';
 
const AllMindCategories = () => {
  const {
    Mealcategory,
    yourmind
  } = useContext(MyContext);
 
  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;
 
  useEffect(() => {
    yourmind();
  }, []);
 
  const transformedMealData1 = Mealcategory?.map(meal => ({
    id: meal._id,
    CateTitle: meal.name,
    image: `${imageUrl}${meal.MealImage}`,
    discount: "",
    discountSet: 0,
  })) || [];
 
  const handleCardClick1 = (item) => {
    navigate(`/shop/FoodAndNurition/meal/${item.id}`);
  };
 
  return (
    <div className="container-xl container-fluid">
      <div className="row">
        <div className="col-12 mt-4">
         
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="display-5 fw-bold text-dark mb-2">What's on your mind?</h1>
            <p className="text-muted fs-6">
              Explore all meal categories and discover delicious options
            </p>
          </div>
 
          {/* All Mind Categories Grid */}
          <div className="mb-5">
            <div className="oferrsWrapper">
              {transformedMealData1.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => handleCardClick1(meal)}
                  style={{ cursor: 'pointer' }}
                >
                  <CategoriesCards Data={meal} />
                </div>
              ))}
            </div>
          </div>
 
          {/* Empty State */}
          {transformedMealData1.length === 0 && (
            <div className="text-center py-5">
              <h4 className="text-muted">No meal categories available at the moment</h4>
              <p className="text-muted">Please check back later for meal options</p>
            </div>
          )}
 
        </div>
      </div>
    </div>
  );
};
 
export default AllMindCategories;
 