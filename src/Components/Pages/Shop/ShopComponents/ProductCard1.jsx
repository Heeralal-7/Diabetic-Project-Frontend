import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Link } from "react-router-dom";

const ProductCards = () => {
  const [medProduct, setMedProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch(
          "https://666304cb62966e20ef0aff40.mockapi.io/medicine2"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const med = await response.json();
        setMedProduct(med); // Store the fetched data in the medicines state
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMedicines();
  }, []);

 
  return (
    <>
    {loading ? ( <div>Loading...</div>) : error ? (<div>Error: {error}</div>) : null}
      {medProduct.map((medData) => {
       const { id, name, image, des, prize }= medData;
       return(

      <div
        className="card my-4 shadow border-0 rounded-4 overflow-hidden"
        style={{ width: "100%" }} key={id}
      >
        <div className="position-relative">
          <img
            // src="https://codingyaar.com/wp-content/uploads/bag-scaled.jpg"
            src={image || "default-image-url.jpg"}
            className="card-img-top rounded-top-4 "
            style={{ maxHeight: "200px" }}
            alt="..."
          />
          <span className="end-0 position-absolute top-0">
            <button
              className="btn  border shadow bg-light m-2 rounded-circle p-0"
              style={{ width: "41px", height: "41px" }}
            >
              <i className="ri-heart-2-line fs-2"></i>
            </button>
            {/* <button className="btn  border shadow bg-light rounded-circle p-0" style={{width:"41px",height:"41px"}}>
            <i className="ri-heart-2-fill text-danger fs-2"></i>
            </button> */}
          </span>
        </div>
        <div className="card-body text-start">
          <div className="d-flex flex-nowrap justify-content-between">
            <div className="w-auto">
              <h5 className="card-title d-flex justify-content-between align-items-center">
                {/* <span>Product title </span> */}
                <span>{name}</span>
              </h5>
              <p className="card-text multiLineTrunc lh-sm mb-2">
                {/* Lorem ipsum dolor sit amet cons ec tet ur, ad ipisi cing elit.
                Aperiam quidem molestias ut explicabo nisi obcaecati fugit eius
                repudiandae recusandae harum. Nobis repellat error ut facilis
                placeat repudiandae possimus deleniti minima! */}
                {des}
              </p>
              <p className="card-text fs-small">
                <i className="bi bi-star-fill text-warning" />
                <i className="bi bi-star-fill text-warning" />
                <i className="bi bi-star-fill text-warning" />
                <i className="bi bi-star-fill text-warning" />
                (123)
              </p>
            </div>
            {/* <div className="w-auto">
                <i className="bi bi-bookmark-plus fs-2" />
              </div> */}
          </div>
        </div>
        <div className="d-flex text-nowrap align-items-center text-center justify-content-between g-0">
          <div style={{ width: "90px" }} className="ps-2">
            {/* <h5>$129</h5> */}
            <h5>${prize}</h5>
          </div>
          <div style={{ width: "100%" }} className="ps-2">
            <Link to="/shop/BuyMedicine/ProductCart" className="btn btn-mainBlue btn-secondary w-100 p-2 rounded-0 text-light">
              ADD TO CART
            </Link>
          </div>
        </div>
      </div>
       )
       
      })}
    </>
  );
};

export default ProductCards;
