import React, { useContext, useEffect, useState } from "react";
import ProductItemImg from "../../Assets/img/FoodAndNutrition/ProductItemImg.png";
import CartCard from "./FAndNComponents/CartCard";
import AddProductOffcanvas from "./FAndNComponents/AddProductOffcanvas";
import AddAddress from "../Shop/ShopComponents/AddAddress";
import CartOffers from "../Shop/ShopComponents/CartOffers";
import { MyContext } from "../../../Context/Context";

const ProductCart = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [radio, setRadio] = useState("Breakfast");
  const slots = ["Breakfast", "Lunch", "Dinner"];

  const { list, setLists } = useContext(MyContext);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    setCurrentDate(formattedDate);
  }, []);

  const productsItemsData = [
    {
      isBestseller: true,
      veg: true,
      title: "Standard Thali - Trail",
      rating: 3.6,
      originalPrice: 136.0,
      discountedPrice: 119,
      description:
        "A delicious and balanced meal with rice, dal, vegetables, and chapati.",
      imageUrl:
        "https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg",
    },
    {
      isBestseller: false,
      veg: false,
      title: "Chocolate Cake",
      rating: 4.8,
      originalPrice: 100.0,
      discountedPrice: 90,
      description:
        "Rich and moist chocolate cake topped with a creamy chocolate frosting.",
      imageUrl: ProductItemImg,
    },
  ];

  return (
    <>
      <div className="container-fluid container-xl pt-lg-4 pb-3">
        <div className="row">
          {/* Left Cart Section */}
          <div className="col-md-10 mx-auto col-lg-7 pt-lg-2">
            <ul className="list-group FoodCart border rounded-3 list-unstyled pb-3 mt-4 mt-lg-0">
              {/* Cart Header */}
              <div className="d-none d-lg-block">
                <div className="w-100 d-flex px-3 py-3 border-bottom justify-content-between align-items-center">
                  <h4 className="mb-0">2 Items in your Cart</h4>
                  <span className="d-flex align-items-center fw-bold">
                    <i className="ri-heart-line fw-medium fs-4 me-2"></i>
                    <span className="d-none d-sm-block">Saved For Later</span>
                  </span>
                </div>

                <div className="w-100 d-flex px-3 py-3 border-bottom justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="ri-map-pin-range-fill fs-5"></i>
                    <div className="lh-sm fs-6">
                      <span className="fw-semibold">Deliver to Home (400001)</span><br />
                      <span className="fs-small">2 Items in your Cart</span>
                    </div>
                  </div>
                  <span className="fw-bold" data-bs-toggle="offcanvas" data-bs-target="#addAddress">
                    Change Address
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              {productsItemsData.map((product, index) => (
                <li className="my-2" key={index}>
                  <CartCard data={product} id={index} setLists={setLists} />
                </li>
              ))}

              <AddProductOffcanvas data={list} />
            </ul>
          </div>

          {/* Right Sidebar */}
          <div className="col-md-10 mx-auto col-lg-5 mt-lg-0 my-3">
            <div className="px-sm-3 FoodCartBox">
              {/* Coupon Card */}
              <div className="card my-2">
                <span className="text-mainBlue translate-middle-y">
                  <span className="bg-light fs-7 fw-bold ms-2 px-2">The Best Coupon For You</span>
                </span>
                <div className="card-body pt-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-0">EX1200</h6>
                      <p className="mb-0 fs-7">Get FLAT Rs.1200 OFF on booking lab tests above Rs.2998</p>
                    </div>
                    <button className="btn bg-mainRed text-light rounded-2 btn-sm py-1">Apply</button>
                  </div>
                </div>
              </div>

              {/* Cart Total & Actions */}
              <div className="border rounded-3">
                <div className="p-md-4 d-none d-lg-block p-3 py-3 border-bottom">
                  <span className="fw-medium fs-5">
                    Cart total:
                    <span className="fw-semibold fs-4 text-black"> ₹1122.82</span>
                  </span>
                </div>

                <div className="p-md-4 p-3 py-3">
                  <div className="d-none d-lg-block">
                    <button className="btn bg-mainRed text-light w-100 py-2 fs-6 my-2 rounded-2"
                      data-bs-toggle="offcanvas" data-bs-target="#addAddress">
                      Add Delivery Address
                    </button>
                  </div>

                  <h5 className="d-lg-none">Coupons & Offers</h5>
                  <button className="btn d-flex justify-content-between align-items-center fw-semibold rounded-3 fs-5 mb-3 py-1 my-2 w-100 btn-mainLightRed text-danger border-current"
                    data-bs-toggle="offcanvas" data-bs-target="#CartOffers">
                    <span>
                      <i className="ri-discount-percent-line me-2"></i>
                      Apply Coupon
                    </span>
                    <i className="fa fa-chevron-right fs-7"></i>
                  </button>
                </div>
              </div>

              {/* Delivery Date and Slot */}
              <div className="card my-2">
                <div className="card-body px-3 fs-7">
                  <h6 className="fw-bold mb-3">Delivery Date</h6>
                  <input type="date" className="form-control w-40 shadow-none border"
                    value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} />

                  <div className="mb-3 d-flex gap-1 mt-2 flex-wrap">
                    {slots.map((d, i) => (
                      <div key={i} style={{ width: "32.5%" }}>
                        <input type="radio" className="btn-check" name="days" id={`day${i}`}
                          checked={d === radio} onChange={() => setRadio(d)} />
                        <label className="btn w-100 btn-lg customRadioBorderRed"
                          htmlFor={`day${i}`} onClick={() => setRadio(d)}>
                          {d}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex gap-3 mt-3">
                    {slots.map((slot, idx) => (
                      <div key={idx} style={{ width: "32.5%" }}>
                        <button className="btn fs-7 border py-2 dropdown-toggle w-100"
                          data-bs-toggle="dropdown">
                          {slot} Slot
                        </button>
                        <ul className="dropdown-menu">
                          <li className="dropdown-item">9:00 - 10:00 AM</li>
                          <li className="dropdown-item">10:00 - 11:00 AM</li>
                          <li className="dropdown-item">11:00 - 12:00 PM</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Offcanvas Components */}
              <AddAddress />
              <CartOffers />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCart;
