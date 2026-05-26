import React from 'react';

const ProductItemCard = ({ Data, onItemClick }) => {
  const {
    foodName,
    foodCategory,
    amount,
    discountPercentage,
    image,
    description,
    calorie,
    foodSubCategory,
    vendorName,
    rating
  } = Data;

  const originalPrice = parseFloat(amount || 0);
  const discount = parseFloat(discountPercentage || 0);
  const discountedPrice = originalPrice - (originalPrice * (discount / 100));

  return (
    <div className="col">
      <div className="card h-100 cursor-pointer product-card shadow-sm border-0" onClick={() => onItemClick(Data)}>
        <div className="position-relative">
          <img
            src={image && Array.isArray(image) && image.length > 0 ? `${process.env.REACT_APP_API_URL}${image[0]}` : 'https://via.placeholder.com/200/cccccc/ffffff?text=No+Image'}
            className="card-img-top object-fit-cover"
            style={{height: "200px", width: "100%"}}
            alt={foodName || "Food Item"}
          />
          {discount > 0 && (
            <span className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded-pill small">
              {discount.toFixed(0)}% OFF
            </span>
          )}
          
          {/* ✅ MODIFIED: SVG for Veg/Non-Veg Indicator */}
          <span className="position-absolute top-0 start-0 m-2 p-1 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" 
                style={{width: '24px', height: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'}}> {/* Added bg-white and shadow for better visibility */}
            {foodCategory === 'Veg' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                <circle cx="7" cy="7" r="3.5" fill="#199339" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
              </svg>
            )}
          </span>
          {/* END MODIFIED */}

        </div>
        <div className="card-body d-flex flex-column p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="card-title mb-0 text-truncate fw-bold"> {foodName} {foodSubCategory} </h6>
            {/*  */}
          </div>
          <div className="mb-0">
            <span className="text-muted small">{vendorName || "Unknown Vendor"}</span>
          </div>
          {/* <p className="card-text small text-muted flex-grow-1 mb-2">{description?.substring(0, 60)}...</p> */}
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <span className="text-success small fw-bold">
              Calorie ({calorie || 'N/A'})
            </span>
            <div className="d-flex flex-column align-items-end">
              {discount > 0 ? (
                <>
                  <span className="text-decoration-line-through text-muted small">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                  <span className="fw-bold text-dark">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="fw-bold text-dark">₹{originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
          <button
            className="btn btn-danger w-100 mt-3 rounded-pill"
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(Data);
            }}
          >
            Add
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-radius: 12px;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ProductItemCard;