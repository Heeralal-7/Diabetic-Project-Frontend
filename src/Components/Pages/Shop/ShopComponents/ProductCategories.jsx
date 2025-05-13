import React from "react";
import { Link } from "react-router-dom";

const ProductCategories = ({ categorieProp, MainTitle }) => {
return (
<>
  <div className="w-100 d-flex justify-content-between">
    <h1 className="display-6 mb-4 fw-semibold">{MainTitle}</h1>
  </div>
  <div className="ShopCategorieWrapper CustomHorizontalScrollBar">
    {categorieProp.map((c) => {
    // const {id, cateImg , CateTitle} = c;
    return (
    <Link className="card py-2 pt-1 w-100 rounded-5 cardShadowww border-0 mx-auto" key={c.id}>
    <div className="position-relative w-100 text-center">
      <img src={c.CateImg} className="card-img-top mx-auto object-fit-contain ShopCateImg" alt="..." />
      {c.discountSet === 1 && (
      <div className="ribbon ribbonTopRight smalll fs-small">
        <span>Sale {c.discount}% OFF </span>
      </div>
      )}

    </div>
    <div className="card-body px-2">
      <h6 className="text-center ShopCateTittle" style={{ height: "14px" }}>
        {/* Vitamins & minerals */}
        {c.CateTitle}
      </h6>
    </div>
    </Link>
    );
    })}
  </div>
    
</>
);
};

export default ProductCategories;