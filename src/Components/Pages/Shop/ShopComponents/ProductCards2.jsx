import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProductCard2 = ({ product,limit }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch(
          "https://666304cb62966e20ef0aff40.mockapi.io/medicine"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const med = await response.json();
        setMedicines(med); // Store the fetched data in the medicines state
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
      
           {/* custom data */}
      {product.map((product) => (
        <article className="ShopProductCard" key={product.id}>
          <Link to="/shop/BuyMedicine/Product" className="ShopProductCard__img">
            <img className="img-fluid" src={product.image} alt={product.title} />
          </Link>
          <div className="ShopProductCard__name">
            <p>{product.title}</p>
          </div>
          <div className="ShopProductCard__precis">
            <span className="ShopProductCard__icon">
              <i className="ri-heart-add-line"></i>
            </span>
            <div>
              <span className="ShopProductCard__preci ShopProductCard__preci--before">
                {product.oldPrice}
              </span>
              <span className="ShopProductCard__preci ShopProductCard__preci--now">
                {product.newPrice}
              </span>
            </div>
            <Link to="/shop/BuyMedicine/ProductCart" className="ShopProductCard__icon">
              <i className="ri-shopping-cart-2-line"></i>
            </Link>
          </div>
        </article>
      ))}
 
      {medicines.slice(0, limit).map((medicine)  => {
        const { id, name, image, oldPrize, prize } = medicine;
        return (
          <article className="ShopProductCard" key={id}>
            <Link to="/shop/BuyMedicine/Product" className="ShopProductCard__img text-center">
              <img
                className="img-fluid"
                src={image || "default-image-url.jpg"}
                alt={name}
              />
            </Link>
            <div className="ShopProductCard__name">
              <p>{name}</p>
            </div>
            <div className="ShopProductCard__precis">
              <span className="ShopProductCard__icon">
                <i className="ri-heart-add-line"></i>
              </span>
              <div>
                <span className="ShopProductCard__preci ShopProductCard__preci--before">
                  {oldPrize ? `$${oldPrize}` : ""}
                </span>
                <span className="ShopProductCard__preci ShopProductCard__preci--now">
                  {prize ? `$${prize}` : "Price not available"}
                </span>
              </div>
              <span className="ShopProductCard__icon">
                <i className="ri-shopping-cart-2-line"></i>
              </span>
            </div>
          </article>
        );
      })}
    </>
  );
};

export default ProductCard2;
