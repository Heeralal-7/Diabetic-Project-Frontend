// CategoriesCards.js (Keep as is, no changes needed)
import React from 'react';
 
const CategoriesCards = ({ Data }) => {
  return (
   <div className="card p-0 w-100 rounded-4 CustomShadow1 border-0 mx-auto overflow-hidden">
 
  {/* IMAGE */}
  <div style={{ height: "130px", overflow: "hidden" }}>
    <img
      src={Data?.image}
      alt={Data?.CateTitle || "Category"}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </div>
 
  {/* SALE RIBBON */}
  {Data?.discountSet === 1 && (
    <div className="ribbon ribbonTopRight smalll fs-small">
      <span>Sale {Data?.discount} OFF</span>
    </div>
  )}
 
  {/* TITLE (BLUE PART) */}
  <div
    className="d-flex align-items-center justify-content-center"
    style={{
      padding: "10px",
      background: "linear-gradient(135deg, #1b68d4ff, #9db8f3ff)",
      borderRadius: "0 0 16px 16px", // 🔥 ONLY bottom
    }}
  >
    <h6
      className="m-0 text-center"
      style={{
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "#fff",
        letterSpacing: "0.5px",
      }}
    >
      {Data?.CateTitle}
    </h6>
  </div>
 
</div>
 
  );
};
 
export default CategoriesCards;
 