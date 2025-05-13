import React, { useState } from "react";
import { Link } from "react-router-dom";
import labCartBnner from "../../Assets/img/labCartBnner.jpg";
import CartOffers from "../Shop/ShopComponents/CartOffers";

const LabTestCart = () => {
  const [selectedValue, setSelectedValue] = useState("");
  return (
    <>
      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-md-12">
            <div className="w-100 text-dark">
              <div className="d-flex align-items-center justify-content-between">
                <h1 className="display-5 my-3 px-3">Lab Test Cart :-</h1>
                <Link
                  to="/venders/labs/Lab-details"
                  className="btn btn-hoverBlue btn-light rounded-circle shadow me-3"
                >
                  <i className="ri-arrow-go-back-line fs-5 text-current fw-bold "></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-md-10 mx-auto col-lg-8">
            <div className="w-100">
              <img src={labCartBnner} alt="" />
            </div>
            <ul className="list-group list-unstyled py-3  ">
              <li>
                <div
                  className="labTestCarddd mx-auto px-sm-4 py-4 my-2 "
                  style={{ maxWidth: "95vw" }}
                >
                  <div className="row small-desc">
                    <div
                      className="col-sm-12 px-1 mb-0"
                      style={{ fontSize: "clamp(15px,2vw,20px)" }}
                    >
                      <p className=" d-flex align-items-center justify-content-between fw-semibold">
                        <span>
                          <i className="ri-flask-fill text-info fs-2"></i>
                          H3N2 Plus Influenza Profile
                        </span>
                        <button className="btn text-current border-0 fs-5  px-3 py-0">
                          <i className="ri-delete-bin-line fs-5 "></i>
                        </button>
                      </p>
                      <p className="lh-sm d-flex align-items-center ps-4 mb-1">
                        <span>
                          <span className="text-secondary fs-7">
                            <strike>₹6000</strike>
                            <span className="fw-semibold text-danger text-uppercase">
                              70% off
                            </span>
                          </span>
                          <br />
                          <span className="fs-5 fw-bold">₹4200</span>
                        </span>
                        <select
                          className="form-select py-2 form-select-sm w-auto ms-auto"
                          aria-label="Large select example"
                          value={selectedValue}
                          onChange={(event) => {
                            setSelectedValue(event.target.value);
                          }}
                        >
                          <option value="" disabled hidden>
                            No. of Patients
                          </option>
                          <option value="1">1 Patient</option>
                          <option value="2">2 Patients</option>
                          <option value="3">3 Patients</option>
                        </select>
                      </p>
                    </div>
                    <div className="col-12 border-top border-danger-light pt-3">
                      <p className="mb-1 fw-light gap-2 fs-7 d-flex align-items-center">
                        <i className="fa-solid fa-utensils"></i>
                        <span>
                          Fasting required :
                          <span className="fw-bold">Not Required </span>
                        </span>
                      </p>
                      <p className="mb-1 fw-light gap-2 fs-7 d-flex align-items-center">
                        <i className="ri-timer-line"></i>
                        <span>Report in 24Hrs.</span>
                      </p>
                    </div>
                  </div>
                  <div className="go-corner">
                    <div className="go-arrow">
                      <i className="ri-arrow-right-double-fill"></i>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="col-md-10 mx-auto col-lg-4 ">
            <div className="px-sm-3 LabShopCarttBox pt-lg-5">
              <button
                className="btn d-flex justify-content-between align-items-center fw-semibold rounded-3 fs-5 mb-3 py-2 w-100 btn-hoverBlue border-current"
                data-bs-toggle="offcanvas"
                data-bs-target="#CartOffers"
                aria-controls="CartOffers"
              >
                <span>
                  <i className="ri-discount-percent-line me-2"></i>
                  Apply Coupon
                </span>
                <span className="fs-7">
                  View Offers
                  <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </span>
              </button>

              <div className="card">
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
              <div className="d-none d-lg-block mt-2">
                <button className="btn icon-box w-100 btn-outline-secondary rounded-2 ">
                  Proceed
                </button>
              </div>
              <div className="card border-0">
                <div className="card-body px-0 fs-7">
                  <p className="d-flex justify-content-between fw-semibold align-items-center mb-2 pb-2">
                    <span className="">Cart Value</span>
                    <span>
                      <strike className="text-secondary me-1">₹6000.00</strike>
                      ₹4900.00
                    </span>
                  </p>
                  <p className="d-flex justify-content-between fw-semibold align-items-center mb-2 pb-2 borderDashedBottom">
                    <span className="">Sample Collection Charges</span>
                    <span>
                      <strike className="text-secondary me-1">₹600.00</strike>
                      <span className="text-success">Free</span>
                    </span>
                  </p>
                  <p className="d-flex fw-bold justify-content-between fw-semibold align-items-center mb-2 pb-2 borderDashedBottom">
                    <span className="">Order total</span>
                    <span>₹4900.00</span>
                  </p>
                  <p className="d-flex fw-bold justify-content-between fw-semibold align-items-center mb-2 pb-2">
                    <span className="">Amount Payable</span>
                    <span>₹4900.00</span>
                  </p>
                  <div className="borderDashed border-success p-2 rounded-1 text-success fw-bold">
                    Total Savings of ₹2050.00 on this order
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed-bottom bg-light custom shadow d-flex justify-content-between align-items-center py-2 d-lg-none">
        <span className=" ps-3 flex-column justify-content-center d-flex align-items-center lh-sm wordSpaceSm">
          <span className="fs-5 fw-bold">₹4900.00</span>
          <span className="text-mainBlue fs-small fw-bold">view Details</span>
        </span>
        <div className="w-60">
          <button className="btn icon-box w-100 btn-outline-secondary rounded-2 ">
            Proceed
          </button>
        </div>
      </div>
      <CartOffers
        mainTitle="Special Offers"
        submitBtn="icon-box btn-outline-secondary"
      />
    </>
  );
};

export default LabTestCart;
