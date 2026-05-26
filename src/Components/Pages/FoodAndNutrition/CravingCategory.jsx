import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';
import CategoriesCards from './FAndNComponents/CategoriesCards';
 
const AllCravingCategories = () => {
  const {
    foodCategory,
    getFoodCategory
  } = useContext(MyContext);
 
  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;
 
  useEffect(() => {
    getFoodCategory();
  }, []);
 
  const transformedMealsData = foodCategory?.map(category => ({
    id: category._id,
    CateTitle: category.name,
    image: `${imageUrl}${category.foodImage}`,
    discount: category.discount ? `${category.discount}% off` : "",
    discountSet: category.discount ? 1 : 0,
  })) || [];
 
  const handleCardClick = (item) => {
    navigate(`/foodname/${item.CateTitle}`);
  };
 
  return (
    <div className="container-xl container-fluid">
      <div className="row">
        <div className="col-12 mt-4">
         
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="display-5 fw-bold text-dark mb-2">Craving Categories</h1>
            <p className="text-muted fs-6">
              Explore all food categories and satisfy your cravings
            </p>
          </div>
 
          {/* All Craving Categories Grid */}
          <div className="mb-5">
            <div className="oferrsWrapper">
              {transformedMealsData.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCardClick(category)}
                  style={{ cursor: 'pointer' }}
                >
                  <CategoriesCards Data={category} />
                </div>
              ))}
            </div>
          </div>
 
          {/* Empty State */}
          {transformedMealsData.length === 0 && (
            <div className="text-center py-5">
              <h4 className="text-muted">No categories available at the moment</h4>
              <p className="text-muted">Please check back later for food categories</p>
            </div>
          )}
 
        </div>
      </div>
    </div>
  );
};
 
export default AllCravingCategories;
 