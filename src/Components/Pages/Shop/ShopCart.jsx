import React, { useState } from "react";
import CartOffers from "./ShopComponents/CartOffers";
import AddAddress from "./ShopComponents/AddAddress";
import productCart1 from "../../Assets/img/productCart1.png";

const ShopCart = () => {
const [selectedValue, setSelectedValue] = useState("");
return (
<>
  <div className="container-fluid container-xl pt-lg-4">
    <div className="row">
      <div className="col-md-10 mx-auto col-lg-7 pt-lg-2">
        <div className="w-100">
          {/* <img src={labCartBnner} alt="" /> */}
        </div>
        <ul className="list-group productShopCart border rounded-3 list-unstyled pb-3 mt-4 mt-lg-0">
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
                <span data-bs-toggle="offcanvas" data-bs-target="#addAddress" aria-controls="addAddress">
                  Change Address
                </span>
              </span>
            </div>
          </div>
          <li>
            <div className="card productCartCard border-0 border-bottom">
              <div className="card-body d-flex justify-content-between p-2 p-sm-3">
                <div className="productCardImg">
                  <img src={productCart1} className="img-fluid w-100" alt="" />
                </div>
                <div className="w-90 ps-2">
                  <div className="fw-bold  d-flex justify-content-between align-items-start">
                    <span className="w-auto twoLineTrunc w-80">
                      Everherb (By Pharmeasy) Men'S Formula-Blend Of
                      Powerful Herb-Increase Sperm Count-Bottle Of 60
                    </span>
                    <span>
                      <i className="ri-delete-bin-line fs-5 px-2 "></i>
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-end">
                    <div className="w-90">
                      <div className="w-100 fs-Xsmall fw-bold text-secondary wordSpaceSm">
                        BY NUTRABAY PRO
                      </div>
                      <div className="w-100 fs-Xsmall fw-bold text-secondary mb-2 wordSpaceSm">
                        60 Capsule(s) in Bottle
                      </div>
                      <div className="w-100 fs-Xsmall fw-bold mb-2 text-secondary wordSpaceSm">
                        MRP <strike>₹899.00*</strike>
                        <span className="text-danger ">32% OFF</span>
                      </div>
                      <div className="w-100 fs-small fw-bold wordSpaceSm">
                        ₹899.00
                      </div>
                    </div>
                    <div className="w-auto">
                      <select className="form-select form-select-sm shadow-none border py-sm-2 fw-semibold rounded-3 px-2"
                        style={{ width: "71px" , backgroundPosition: "right 0.25rem center" , }} value={selectedValue}
                        onChange={(event)=> { setSelectedValue(event.target.value); }} name="" id="" >
                        <option defaultChecked hidden>
                          Qty 1
                        </option>
                        <option value="1">Qty 1</option>
                        <option value="2">Qty 2</option>
                        <option value="3">Qty 3</option>
                        <option value="4">Qty 4</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="col-md-10 mx-auto col-lg-5 mt-lg-0 my-3">
        <div className="px-sm-3 ShopCartBox">
          <div className="card my-2">
            <span className="text-mainBlue translate-middle-y">
              <span className="bg-light fs-7 fw-bold ms-2 px-2">
                The Best Coupon For You
              </span>
            </span>
            <div className="card-body pt-0 ">
              <div className="d-flex align-items-center justify-content-between">
                <div className="">
                  <h6 className="mb-0">EX1200</h6>
                  <p className="mb-0 fs-7">
                    Get FLAT Rs.1200 OFF on booking lab tests above Rs.2998
                  </p>
                </div>
                <div className="">
                  <button className="btn icon-box btn-outline-secondary rounded-2 btn-sm py-1 ms-auto">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded-3">
            <div className="p-md-4 d-none d-lg-block p-3 py-3 border-bottom">
              <span className="fw-medium fs-5">
                Cart total:
                <span className="fw-semibold fs-4 text-black">
                  ₹1122.82
                </span>
              </span>
            </div>
            <div className="p-md-4  p-3 py-3">
              <div className="d-none d-lg-block">
                {/* Add Address */}
                <button className="btn icon-box w-100 py-2 fs-6 my-2 btn-outline-secondary rounded-2 "
                  data-bs-toggle="offcanvas" data-bs-target="#addAddress" aria-controls="addAddress">
                  Add Delivery Address
                </button>
              </div>
              {/* apply coupon */}
              <h5 className="d-lg-none">Coupons & Offers</h5>
              <button id="lsdjcsdkcksncskcn"
                className="btn d-flex justify-content-between CustomShadow1 align-items-center fw-semibold rounded-3 fs-5 mb-3 py-1 my-2 w-100 btn-hoverBlue border-current"
                data-bs-toggle="offcanvas" data-bs-target="#CartOffers" aria-controls="CartOffers">
                <span>
                  <i className="ri-discount-percent-line me-2"></i>
                  Apply Coupon
                </span>
                <span className="fs-7">
                  <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </span>
              </button>
            </div>
          </div>
          <div className="card my-4 ">
            <div className="card-body px-3 fs-7">
              <h6 className="fw-bold">Bill Summary</h6>
              <div className="w-100">
                <p className="d-flex justify-content-between text-black fw-bold align-items-center mb-2">
                  <span className="">Sub Total</span>
                  <span>₹4900.00</span>
                </p>
                <p className="d-flex justify-content-between fw-semibold align-items-center mb-2 ">
                  <span className="">Delivery Charges</span>
                  <span className="text-success">₹78.18</span>
                </p>
                <p
                  className="d-flex justify-content-between fw-semibold text-success align-items-center mb-2 pb-2 borderDashedBottom">
                  <span className="">Discount</span>
                  <span className="">-₹600.00</span>
                </p>
              </div>

              <p
                className="d-flex fw-bold text-danger justify-content-between fw-semibold align-items-center mb-2 pb-2">
                <span className="">Total Price</span>
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
        <div
          className="fixed-bottom bg-light custom shadow d-flex justify-content-between align-items-center py-2 px-sm-4 px-2 d-lg-none">
          <span className="d-flex gap-1 align-items-start">
            <span>
              <div className="">
                <i className="ri-shopping-cart-line fs-3 position-relative"></i>
                <span className="badge bg-danger rounded-circle  translate-middle-y" style={{ width: "20px" ,
                  height: "20px" , padding: "4px 0px" , }}>
                  5
                </span>
              </div>
            </span>
            <span className="flex-column justify-content-center d-flex align-items-center lh-sm wordSpaceSm">
              <span className="fs-5 fw-bold">₹4900.00</span>
              <a className="text-mainBlue fs-small fw-bold" href="#lsdjcsdkcksncskcn">
                view Details
              </a>
            </span>
          </span>
          <div className="w-50">
            <button className="btn icon-box w-auto float-end btn-outline-secondary rounded-2 "
              data-bs-toggle="offcanvas" data-bs-target="#addAddress" aria-controls="addAddress">
              Add Delivery Address
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* <AddAddress mainTitle="Add Address" /> */}
  <AddAddress mainTitle="Add Address" radioButton='w-100 btn-lg customRadioBorderBlue' AddAddressBtn="btn-hoverBlue" submitBtn="icon-box btn-outline-secondary" />
  <CartOffers mainTitle="Special Offers" submitBtn="icon-box btn-outline-secondary" />
</>
);
};

export default ShopCart;