import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesCards = ({ Data }) => {
  return (
    <>
      {/* <Link 
        to='/shop/FoodAndNurition/Products' 
        className="card py-2 pt-1 w-100 rounded-5 CustomShadow1 border-0 w-95 mx-auto" 
      > */}
        <div className="position-relative w-100 text-center">
          <img 
            src={Data?.image} // Use Data.image to ensure the image URL is properly passed
            className="card-img-top mx-auto object-fit-contain object-position-center FoodAndNurtiImg" 
            alt={Data?.CateTitle || "Category"} 
          />
          {Data?.discountSet === 1 && (
            <div className="ribbon ribbonTopRight smalll fs-small">
              <span>Sale {Data?.discount} OFF</span>
            </div>
          )}
        </div>
        <div className="card-body px-2">
          <h6 className="text-center ShopCateTittle" style={{ height: "14px" }}>
            {Data?.CateTitle}
          </h6>
        </div>
      {/* </Link>    */}
    </>
  );
};

export default CategoriesCards;
