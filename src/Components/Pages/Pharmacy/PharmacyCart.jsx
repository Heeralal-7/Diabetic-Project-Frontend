import React, { useState } from "react";
import AddAddress from "../Shop/ShopComponents/AddAddress";
import CartOffers from "../Shop/ShopComponents/CartOffers";
import { Link } from "react-router-dom";

const PharmacyCart = () => {
  const [radio, setRadio] = useState("Breakfast");
  const slots = ["Morning", "Afternoon", "Evening"];
  const [count, setCount] = useState(1);
  const productsItemsData = [
    {
      isBestseller: true,
      veg: true,
      title: "Zingavita Omega 3 + Multivitamin Soft Gelatin",
      rating: 3.6,
      originalPrice: 136.0,
      discountedPrice: 119,
      description:
        "A delicious and balanced meal with rice, dal, vegetables, and chapati.",
      imageUrl:
        "https://m.media-amazon.com/images/I/71uyZePh2FL._SY450_.jpg",
    },
    {
      isBestseller: true,
      veg: true,
      title: "Zingavita Omega 3 + Multivitamin Soft Gelatin",
      rating: 3.6,
      originalPrice: 136.0,
      discountedPrice: 119,
      description:
        "A delicious and balanced meal with rice, dal, vegetables, and chapati.",
      imageUrl:
        "https://m.media-amazon.com/images/I/71uyZePh2FL._SY450_.jpg",
    },
    {
      isBestseller: true,
      veg: true,
      title: "Zingavita Omega 3 + Multivitamin Soft Gelatin",
      rating: 3.6,
      originalPrice: 136.0,
      discountedPrice: 119,
      description:
        "A delicious and balanced meal with rice, dal, vegetables, and chapati.",
      imageUrl:
        "https://m.media-amazon.com/images/I/71uyZePh2FL._SY450_.jpg",
    },
  ];
  return (
    <>
      <div className="container-fluid container-xl pt-lg-4 pb-3">
        <div className="row">
          <div className="col-md-10 mx-auto col-lg-7 pt-lg-2">
            <div className="w-100">
              {/* <img src={labCartBnner} alt="" /> */}
            </div>
            <ul className="list-group FoodCart border rounded-3 list-unstyled pb-3 mt-4 mt-lg-0">
              <div className="d-none d-lg-block">
                <div className="w-100 d-flex px-3 py-3 border-bottom justify-content-between align-items-center">
                  <span>
                    <h4 className="mb-0">2 Items in your Cart</h4>
                  </span>
                  <span className=" d-flex align-items-center fw-bold">
                    <i className="ri-heart-line fw-medium fs-4"></i>
                    <span className="d-none d-sm-block">Saved For Later</span>
                  </span>
                </div>
                <div className="w-100 d-flex px-3 py-3 border-bottom justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-1">
                    <i className="ri-map-pin-range-fill fs-5"></i>
                    <div className="w-auto lh-sm fs-6">
                      <span className="mb-0 fw-semibold">
                        Deliver to Home (400001)
                      </span>
                      <br />
                      <span className="mb-0 fs-small">
                        2 Items in your Cart
                      </span>
                    </div>
                  </span>
                  <span className=" d-flex align-items-center fw-bold">
                    <span
                      data-bs-toggle="offcanvas"
                      data-bs-target="#addAddress"
                      aria-controls="addAddress"
                    >
                      Change Address
                    </span>
                  </span>
                </div>
              </div>
              {productsItemsData.map((product, index) => (
                <li className="my-2 lisssss" key={index}>
                  {/* <CartCard data={product} id={index} setLists={setLists} /> */}
                  <div
                    className="card border-0 border-bottom productCard rounded-3 w-100 mx-auto"
                    key={index}
                  >
                    <div className="card-body d-flex justify-content-between py-2">
                      <div className="text-start align-middle ">
                        {product.isBestseller && (
                          <span className="fs-small text-light bg-mainRed p-2 py-1 rounded-1">
                            Bestseller
                          </span>
                        )}
                        <h6 className="card-tittle fw-semibold mb-1 mt-2 twoLineTrunc">
                          <Link
                            to="/Pharmacy/shop/Product"
                            className="text-black"
                          >
                            {product.title}
                          </Link>
                        </h6>
                        <span className="text-light bg-success p-1 fw-semibold fs-Xsmall rounded-1">
                          {product.rating}
                          <i className="fa-solid ms-1 fa-star" />
                        </span>
                        <p className="card-text text-secondary fs-7 mb-0">
                          <strike>
                            <i className="fa-solid fa-indian-rupee-sign fs-8" />
                            {product.originalPrice.toFixed(2)}
                          </strike>
                          <span className="text-mainRed fw-semibold ms-2">
                            ₹ {product.discountedPrice}
                          </span>
                        </p>
                        <p
                          className="lh-sm fs-7 mb-0 multiLineTrunc text-secondary"
                          style={{ height: "50px" }}
                        >
                          {product.description}
                        </p>
                      </div>
                      <div style={{ minWidth: "120px", width: "0%" }}>
                        <img
                          src={product.imageUrl}
                          className="rounded-4"
                          width="100%"
                          style={{
                            minWidth: "120px",
                            height: "117px",
                            width: "80%",
                          }}
                          alt={product.title}
                        />
                        <div className="w-90 mx-auto position-relative">
                          <div
                            className="btn d-flex justify-content-between align-items-center translate-middle-y  position-absolute btn-sm btn-mainLightRed border-RedLight text-danger border shadow-lg rounded-2 px-3"
                            key={index}
                          >
                            <button
                              className="btn fw-bold text-current border-0 shadow-none"
                              onClick={() =>
                                setCount(count > 1 ? count - 1 : 1)
                              }
                            >
                              -
                            </button>
                            {count}
                            <button
                              className="btn fw-bold text-current border-0 shadow-none"
                              onClick={() => setCount(count + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-10 mx-auto col-lg-5 mt-lg-0 my-3">
            <div className="px-sm-3 FoodCartBox CustomScrollBar HoverScrol">
              <div className="card my-2">
                <span className="text-mainBlue translate-middle-y">
                  <span className="bg-light fs-7 fw-bold ms-2 px-2">
                    The Best Coupon For You
                  </span>
                </span>
                <div className="card-body pt-0 ">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-0">EX1200</h6>
                      <p className="mb-0 fs-7">
                        Get FLAT Rs.1200 OFF on booking lab tests above Rs.2998
                      </p>
                    </div>
                    <div>
                      <button className="btn bg-mainRed text-light rounded-2 btn-sm py-1 ms-auto">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded-3">
                <div className="p-md-3 d-none d-lg-block px-3 border-bottom">
                  <span className="fw-medium">
                    Cart total:
                    <span className="fw-semibold fs-5 ms-2 text-black">
                      ₹1122.82
                    </span>
                  </span>
                </div>
                <div className="p-md-4  p-3 pb-1 pb-md-0">
                  <div className="d-none d-lg-block">
                    {/* Add Address */}
                    <button
                      className="btn bg-mainRed text-light w-100 py-2 fs-6 my-2 rounded-2 "
                      data-bs-toggle="offcanvas"
                      data-bs-target="#addAddress"
                      aria-controls="addAddress"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                  {/* apply coupon */}
                  <h5 className="d-lg-none">Coupons & Offers</h5>
                  <button
                    id="jsdbcdjk"
                    className="btn d-flex justify-content-between CustomShadow1 align-items-center fw-semibold rounded-3 fs-5 mb-3 py-1 my-2 w-100 btn-mainLightRed text-danger border-current"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#CartOffers"
                    aria-controls="CartOffers"
                  >
                    <span>
                      <i className="ri-discount-percent-line me-2"></i>
                      Apply Coupon
                    </span>
                    <span className="fs-7">
                      <i className="fa fa-chevron-right" aria-hidden="true"></i>
                    </span>
                  </button>
                </div>
                <div className="fs-7 p-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      opacity="0.1"
                      d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                      fill="#3D3F96"
                    />
                    <path
                      d="M15.0635 13.0902C14.2294 13.0902 13.5509 13.7427 13.5509 14.5447C13.5509 15.3468 14.2294 15.9993 15.0635 15.9993C15.8977 15.9993 16.5761 15.3468 16.5761 14.5447C16.5761 13.7427 15.8976 13.0902 15.0635 13.0902ZM15.0635 15.272C14.6464 15.272 14.3072 14.9458 14.3072 14.5447C14.3072 14.1437 14.6464 13.8175 15.0635 13.8175C15.4806 13.8175 15.8198 14.1437 15.8198 14.5447C15.8198 14.9458 15.4806 15.272 15.0635 15.272ZM9.89542 13.0902C9.06135 13.0902 8.38281 13.7427 8.38281 14.5447C8.38281 15.3468 9.06135 15.9993 9.89542 15.9993C10.7295 15.9993 11.408 15.3468 11.408 14.5447C11.408 13.7427 10.7295 13.0902 9.89542 13.0902ZM9.89542 15.272C9.47833 15.272 9.13912 14.9458 9.13912 14.5447C9.13912 14.1437 9.47833 13.8175 9.89542 13.8175C10.3124 13.8175 10.6517 14.1437 10.6517 14.5447C10.6517 14.9458 10.3125 15.272 9.89542 15.272ZM16.0821 8.92681C16.0506 8.86661 16.0023 8.816 15.9426 8.78065C15.883 8.74529 15.8142 8.72656 15.7442 8.72656H13.7526V9.45384H15.511L16.5407 11.4233L17.2165 11.0965L16.0821 8.92681Z"
                      fill="#3D3F96"
                    />
                    <path
                      d="M11.0672 14.1939H13.9286V14.9212H11.0672V14.1939ZM8.76049 14.1939H7.44959C7.24071 14.1939 7.07145 14.3567 7.07145 14.5576C7.07145 14.7584 7.24073 14.9212 7.44959 14.9212H8.76052C8.96939 14.9212 9.13866 14.7584 9.13866 14.5576C9.13866 14.3567 8.96937 14.1939 8.76049 14.1939ZM17.9206 11.9709L17.1768 11.0497C17.1415 11.0059 17.0962 10.9705 17.0444 10.9461C16.9927 10.9217 16.9358 10.909 16.8782 10.9091H14.1303V8.36363C14.1303 8.16277 13.961 8 13.7521 8H7.44959C7.24071 8 7.07145 8.16279 7.07145 8.36363C7.07145 8.56446 7.24073 8.72725 7.44959 8.72725H13.374V11.2727C13.374 11.4736 13.5432 11.6363 13.7521 11.6363H16.693L17.2437 12.3185V14.1939H16.1975C15.9886 14.1939 15.8193 14.3567 15.8193 14.5575C15.8193 14.7584 15.9886 14.9212 16.1975 14.9212H17.6218C17.8307 14.9212 18 14.7584 18 14.5575V12.1939C18 12.1132 17.972 12.0347 17.9206 11.9709ZM8.7353 12.3515H6.99579C6.78691 12.3515 6.61765 12.5143 6.61765 12.7151C6.61765 12.916 6.78694 13.0788 6.99579 13.0788H8.73527C8.94415 13.0788 9.11341 12.916 9.11341 12.7151C9.11344 12.5143 8.94415 12.3515 8.7353 12.3515ZM9.60504 10.9212H6.37814C6.16929 10.9212 6 11.084 6 11.2849C6 11.4857 6.16929 11.6485 6.37814 11.6485H9.60504C9.81391 11.6485 9.98318 11.4857 9.98318 11.2849C9.98318 11.084 9.81391 10.9212 9.60504 10.9212Z"
                      fill="#3D3F96"
                    />
                    <path
                      d="M10.2222 9.49219H6.99533C6.78645 9.49219 6.61719 9.65498 6.61719 9.85581C6.61719 10.0567 6.78648 10.2194 6.99533 10.2194H10.2222C10.4311 10.2194 10.6004 10.0566 10.6004 9.85581C10.6004 9.65498 10.4311 9.49219 10.2222 9.49219Z"
                      fill="#3D3F96"
                    />
                  </svg>
                  <span className="fw-bold ms-2 text-muted">
                    Add items worth <span className="text-mainRed">₹91</span>{" "}
                    and get <span className="text-success">free shipping</span>
                  </span>
                </div>
              </div>
              {/* select Slot */}
              <div className="card my-2 ">
                <div className="card-body px-3 fs-7">
                  <h6 className="fw-bold mb-3">Delivery Date</h6>
                  <div className="w-100">
                    <div className="mb-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.1"
                          d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                          fill="#3D3F96"
                        />
                        <path
                          d="M15.0635 13.0902C14.2294 13.0902 13.5509 13.7427 13.5509 14.5447C13.5509 15.3468 14.2294 15.9993 15.0635 15.9993C15.8977 15.9993 16.5761 15.3468 16.5761 14.5447C16.5761 13.7427 15.8976 13.0902 15.0635 13.0902ZM15.0635 15.272C14.6464 15.272 14.3072 14.9458 14.3072 14.5447C14.3072 14.1437 14.6464 13.8175 15.0635 13.8175C15.4806 13.8175 15.8198 14.1437 15.8198 14.5447C15.8198 14.9458 15.4806 15.272 15.0635 15.272ZM9.89542 13.0902C9.06135 13.0902 8.38281 13.7427 8.38281 14.5447C8.38281 15.3468 9.06135 15.9993 9.89542 15.9993C10.7295 15.9993 11.408 15.3468 11.408 14.5447C11.408 13.7427 10.7295 13.0902 9.89542 13.0902ZM9.89542 15.272C9.47833 15.272 9.13912 14.9458 9.13912 14.5447C9.13912 14.1437 9.47833 13.8175 9.89542 13.8175C10.3124 13.8175 10.6517 14.1437 10.6517 14.5447C10.6517 14.9458 10.3125 15.272 9.89542 15.272ZM16.0821 8.92681C16.0506 8.86661 16.0023 8.816 15.9426 8.78065C15.883 8.74529 15.8142 8.72656 15.7442 8.72656H13.7526V9.45384H15.511L16.5407 11.4233L17.2165 11.0965L16.0821 8.92681Z"
                          fill="#3D3F96"
                        />
                        <path
                          d="M11.0672 14.1939H13.9286V14.9212H11.0672V14.1939ZM8.76049 14.1939H7.44959C7.24071 14.1939 7.07145 14.3567 7.07145 14.5576C7.07145 14.7584 7.24073 14.9212 7.44959 14.9212H8.76052C8.96939 14.9212 9.13866 14.7584 9.13866 14.5576C9.13866 14.3567 8.96937 14.1939 8.76049 14.1939ZM17.9206 11.9709L17.1768 11.0497C17.1415 11.0059 17.0962 10.9705 17.0444 10.9461C16.9927 10.9217 16.9358 10.909 16.8782 10.9091H14.1303V8.36363C14.1303 8.16277 13.961 8 13.7521 8H7.44959C7.24071 8 7.07145 8.16279 7.07145 8.36363C7.07145 8.56446 7.24073 8.72725 7.44959 8.72725H13.374V11.2727C13.374 11.4736 13.5432 11.6363 13.7521 11.6363H16.693L17.2437 12.3185V14.1939H16.1975C15.9886 14.1939 15.8193 14.3567 15.8193 14.5575C15.8193 14.7584 15.9886 14.9212 16.1975 14.9212H17.6218C17.8307 14.9212 18 14.7584 18 14.5575V12.1939C18 12.1132 17.972 12.0347 17.9206 11.9709ZM8.7353 12.3515H6.99579C6.78691 12.3515 6.61765 12.5143 6.61765 12.7151C6.61765 12.916 6.78694 13.0788 6.99579 13.0788H8.73527C8.94415 13.0788 9.11341 12.916 9.11341 12.7151C9.11344 12.5143 8.94415 12.3515 8.7353 12.3515ZM9.60504 10.9212H6.37814C6.16929 10.9212 6 11.084 6 11.2849C6 11.4857 6.16929 11.6485 6.37814 11.6485H9.60504C9.81391 11.6485 9.98318 11.4857 9.98318 11.2849C9.98318 11.084 9.81391 10.9212 9.60504 10.9212Z"
                          fill="#3D3F96"
                        />
                        <path
                          d="M10.2222 9.49219H6.99533C6.78645 9.49219 6.61719 9.65498 6.61719 9.85581C6.61719 10.0567 6.78648 10.2194 6.99533 10.2194H10.2222C10.4311 10.2194 10.6004 10.0566 10.6004 9.85581C10.6004 9.65498 10.4311 9.49219 10.2222 9.49219Z"
                          fill="#3D3F96"
                        />
                      </svg>
                      <span className="ms-2 fw-bold">
                        Delivery by Thursday, 23 May
                      </span>
                    </div>
                    <h6 className="fw-bold mb-3">Time Slot</h6>
                    <div className="mb-3 d-flex gap-1 mt-2 flex-wrap">
                      {slots.map((d, i) => (
                        <div key={i} style={{ width: "32.5%" }}>
                          <input
                            type="radio"
                            className="btn-check"
                            name="days"
                            id={`day${i}`}
                            autoComplete="off"
                            checked={d === radio}
                            onChange={() => setRadio(d)}
                          />
                          <label
                            className="btn w-100 btn-lg customRadioBorderRed "
                            htmlFor={`day${i}`}
                            onClick={() => setRadio(d)}
                          >
                            {d}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex flex-column">
                      <div className="d-flex gap-3 mt-1">
                        <button
                          className="btn fs-7 border py-2"
                          type="button"
                          style={{ width: "32.5%" }}
                          data-bs-auto-close="outside"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span>
                            <svg
                              width="14"
                              height="14"
                              className="me-1"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                opacity="0.6"
                                d="M12.9982 7.48837C12.8654 7.48837 12.738 7.4356 12.644 7.34166C12.5501 7.24773 12.4973 7.12032 12.4973 6.98748C12.4973 6.85463 12.5501 6.72723 12.644 6.63329C12.738 6.53936 12.8654 6.48658 12.9982 6.48658H14C13.8774 4.80259 13.1513 3.21938 11.955 2.02777C10.7588 0.83615 9.17283 0.116144 7.48837 0V0.976744C7.48837 1.10959 7.4356 1.23699 7.34166 1.33093C7.24773 1.42487 7.12032 1.47764 6.98748 1.47764C6.85463 1.47764 6.72723 1.42487 6.63329 1.33093C6.53936 1.23699 6.48658 1.10959 6.48658 0.976744V0C4.80658 0.121914 3.22659 0.844464 2.03553 2.03553C0.844464 3.22659 0.121914 4.80658 0 6.48658H1.00179C1.13463 6.48658 1.26204 6.53936 1.35597 6.63329C1.44991 6.72723 1.50268 6.85463 1.50268 6.98748C1.50268 7.12032 1.44991 7.24773 1.35597 7.34166C1.26204 7.4356 1.13463 7.48837 1.00179 7.48837H0C0.116144 9.17283 0.83615 10.7588 2.02777 11.955C3.21938 13.1513 4.80259 13.8774 6.48658 14V12.9732C6.48658 12.8403 6.53936 12.7129 6.63329 12.619C6.72723 12.525 6.85463 12.4723 6.98748 12.4723C7.12032 12.4723 7.24773 12.525 7.34166 12.619C7.4356 12.7129 7.48837 12.8403 7.48837 12.9732C7.48837 12.9732 7.48837 12.9732 7.48837 12.9982V14C9.17682 13.8831 10.766 13.1596 11.9628 11.9628C13.1596 10.766 13.8831 9.17682 14 7.48837H12.9982ZM6.95241 7.63864C6.80771 7.50073 6.69197 7.33533 6.61198 7.15213C6.53199 6.96893 6.48936 6.77162 6.48658 6.57173V3.48122C6.48658 3.34837 6.53936 3.22097 6.63329 3.12703C6.72723 3.03309 6.85463 2.98032 6.98748 2.98032C7.12032 2.98032 7.24773 3.03309 7.34166 3.12703C7.4356 3.22097 7.48837 3.34837 7.48837 3.48122V6.57173C7.48799 6.63766 7.50063 6.703 7.52555 6.76403C7.55048 6.82506 7.58721 6.88057 7.63363 6.92737L9.34669 8.63542C9.39364 8.68199 9.4309 8.73738 9.45633 8.79842C9.48176 8.85946 9.49485 8.92493 9.49485 8.99106C9.49485 9.05718 9.48176 9.12265 9.45633 9.18369C9.4309 9.24473 9.39364 9.30013 9.34669 9.34669C9.30013 9.39364 9.24473 9.4309 9.18369 9.45633C9.12265 9.48176 9.05718 9.49485 8.99106 9.49485C8.92493 9.49485 8.85946 9.48176 8.79842 9.45633C8.73738 9.4309 8.68199 9.39364 8.63542 9.34669L6.95241 7.63864Z"
                                fill="#313638"
                              />
                            </svg>
                          </span>
                          Delivery Slot
                          <i
                            className="fa fa-chevron-down ms-1"
                            aria-hidden="true"
                          ></i>
                        </button>
                        <ul className="dropdown-menu activeRedDrop">
                          <li className="dropdown-item">Action</li>
                          <li className="dropdown-item">Action</li>
                          <li className="dropdown-item">Action</li>
                          <li className="dropdown-item">Action</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* bill summary */}
              <div className="card my-2 ">
                <div className="card-body px-3 fs-7">
                  <h6 className="fw-bold">Receipt</h6>
                  <div className="w-100">
                    <p className="d-flex justify-content-between text-black fw-bold align-items-center mb-2">
                      <span>Sub Total</span>
                      <span>₹4900.00</span>
                    </p>
                    <p className="d-flex justify-content-between fw-semibold align-items-center mb-2 ">
                      <span>Delivery Charges</span>
                      <span className="text-success">₹78.18</span>
                    </p>
                    <p className="d-flex justify-content-between fw-semibold text-success align-items-center mb-2 pb-2 borderDashedBottom">
                      <span>Discount</span>
                      <span>-₹600.00</span>
                    </p>
                  </div>

                  <p className="d-flex fw-bold text-danger justify-content-between fw-semibold align-items-center mb-0 pb-2">
                    <span>Total Price</span>
                    <span>₹4900.00</span>
                  </p>
                </div>
              </div>

              {/* total savings */}
              <div className="borderDashed border-success p-2 rounded-1 text-success fw-bold">
                Total Savings of ₹600.00 on this order
              </div>
            </div>
            {/* bottom fixed section start */}
            <div className="fixed-bottom bg-light custom shadow d-flex justify-content-between align-items-center py-2 px-sm-4 px-2 d-lg-none">
              <span className="d-flex gap-1 align-items-start">
                <span>
                  <div>
                    <i className="ri-shopping-cart-line fs-3 position-relative"></i>
                    <span
                      className="badge bg-danger rounded-circle  translate-middle-y"
                      style={{
                        width: "20px",
                        height: "20px",
                        padding: "4px 0px",
                      }}
                    >
                      5
                    </span>
                  </div>
                </span>
                <span className="flex-column justify-content-center d-flex align-items-center lh-sm wordSpaceSm">
                  <span className="fs-5 fw-bold">₹4900.00</span>
                  <a
                    className="text-mainBlue fs-small fw-bold"
                    href="#jsdbcdjk"
                  >
                    view Details
                  </a>
                </span>
              </span>
              <div className="w-50">
                <button
                  className="btn bg-mainRed text-light w-auto float-end rounded-2 "
                  data-bs-toggle="offcanvas"
                  data-bs-target="#addAddress"
                  aria-controls="addAddress"
                >
                  Add Delivery Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddAddress
        mainTitle="Add Address"
        radioButton="w-100 btn-lg customRadioBorderRed"
        AddAddressBtn="btn-mainLightRed border-RedLight  border"
        submitBtn="bg-mainRed text-light"
      />
      <CartOffers
        mainTitle="Special Offers"
        submitBtn="bg-mainRed text-light"
      />
    </>
  );
};

export default PharmacyCart;
