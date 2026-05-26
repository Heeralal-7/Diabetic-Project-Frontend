// src/components/CartButton/CartButton.js
import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../../../../Context/Context"; // ✅ सही path डालना
import "./CartButton.css";

const CartButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartData1 } = useContext(MyContext);

  // Allowed paths
  const allowedPaths = ["/shop/FoodAndNurition", "/foodname"];
  const showCartButton = allowedPaths.some((path) =>
    location.pathname.includes(path)
  );

  if (!showCartButton) return null;

  const handleGoToCart = () => {
    navigate("/shop/FoodAndNurition/cart");
  };

  return (
    <button className="cart-fixed-button" onClick={handleGoToCart}>
      <i className="ri-shopping-cart-line"></i> View Cart
      {cartData1?.cart > 0 && (
        <span className="cart-item-count">{cartData1.cart}</span>
      )}
    </button>
  );
};

export default CartButton;
