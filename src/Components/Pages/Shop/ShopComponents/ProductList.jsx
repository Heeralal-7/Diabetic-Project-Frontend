import React, { useState, useEffect } from "react";

const ProductList = ({limit}) => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {medicines.slice(0, limit).map((medicine)  => {
        const { id, name, image, oldPrize, prize } = medicine;
        return (
          <article className="ShopProductCard" key={id}>
            <div className="ShopProductCard__img text-center">
              <img
                className="img-fluid"
                src={image || "default-image-url.jpg"}
                alt={name}
              />
            </div>
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

export default ProductList;
