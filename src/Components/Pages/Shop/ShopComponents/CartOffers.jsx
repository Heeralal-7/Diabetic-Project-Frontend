import React, { useState } from "react";

const CartOffers = ({ mainTitle,submitBtn }) => {
  const coupons = [
    { discount: 600, minOrder: 1799, expiresIn: 209, code: '600SPECIAL' },
    { discount: 500, minOrder: 1500, expiresIn: 180, code: '500OFFER' },
    { discount: 700, minOrder: 2000, expiresIn: 190, code: '700DISCOUNT' },
    { discount: 300, minOrder: 1200, expiresIn: 150, code: '300DEAL' },
    { discount: 800, minOrder: 2500, expiresIn: 220, code: '800PROMO' },
    { discount: 200, minOrder: 1000, expiresIn: 100, code: '200SAVE' },
    { discount: 450, minOrder: 1300, expiresIn: 175, code: '450FLAT' },
    { discount: 750, minOrder: 2200, expiresIn: 200, code: '750OFF' },
    { discount: 650, minOrder: 1800, expiresIn: 210, code: '650DEAL' },
    { discount: 550, minOrder: 1600, expiresIn: 195, code: '550BARGAIN' },
    { discount: 350, minOrder: 1100, expiresIn: 140, code: '350SPECIAL' },
    { discount: 1000, minOrder: 3000, expiresIn: 240, code: '1000MEGA' },
    { discount: 900, minOrder: 2700, expiresIn: 230, code: '900EXTRA' },
    { discount: 250, minOrder: 1050, expiresIn: 130, code: '250BONUS' },
    { discount: 400, minOrder: 1250, expiresIn: 160, code: '400OFFER' },
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your search logic here
    console.log('Search term:', searchTerm);
  };
  
return (
<>

  <div className="offcanvas CustomOffcan-lg-end offcanHeightFull noBackdrop" tabIndex={-1} id="CartOffers"
    aria-labelledby="LaCartOffersLabel">
    <div className="offcanvas-header">
      <h5 className="offcanvas-title" id="CartOffersLabel">
        <button className="btn p-0 d-lg-none" data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="ri-arrow-go-back-line fs-4"></i>
        </button> {mainTitle}
      </h5>
      <button type="button" className="btn-close d-none d-lg-block" data-bs-dismiss="offcanvas" aria-label="Close" />
    </div>
    <div className="offcanvas-body ">
    <form className="d-flex border rounded-2" role="search" onSubmit={handleSubmit}>
      <input className="form-control shadow-none border-0 me-2" type="search" placeholder="Search" aria-label="Search" value={searchTerm} onChange={handleInputChange} />
      <button className="btn btn-sm fw-bold border-0" type="submit">
        Apply
      </button>
    </form>

      <div className="w-100 px-2 OfferOfcanvasHeight">
        {/* <div className="LabCartCoupon">
          <div className="cGdqwG pb-1">
            <div className=" ghwhll">
              <div className=" bQyHpZ">
                <div className="bg-mainBlue text-light fw-bolder fs-small d-flex justify-content-center align-items-center flex-column" style={{ width: "60px" , height: "60px" , lineHeight: "17px" , }}>
                  <span className="fw-lighter">FLAT</span>
                  <span className="fs-5">₹600 </span>
                </div>
              </div>
              <p className="mb-0 lh-sm text-danger fs-small py-2">
                Expires In 209 days
              </p>
            </div>
            <div className=" hbjjAe">
              <h3 className=" jHjnaH">
                Get FLAT Rs.600 OFF on Lab Test bookings above Rs 1799.
              </h3>
              <p className=" ivEqJR">
                Get FLAT Rs.600 OFF on orders above Rs 1799.
              </p>
            </div>
          </div>
          <div className=" iUzfBX">
            <p className="mb-0">
              Code: <strong>600SPECIAL</strong>
            </p>
            <button className="btn icon-box btn-outline-secondary rounded-2 btn-sm py-1 ms-auto">
              Apply
            </button>
          </div>
        </div> */}
        {coupons.map((coupon, index) => (
        <div className="LabCartCoupon" key={index}>
          <div className="cGdqwG pb-1">
            <div className="ghwhll">
              <div className="bQyHpZ">
                <div className={ `${submitBtn} fw-bolder fs-small d-flex justify-content-center align-items-center flex-column`} style={{ width: "60px", height: "60px", lineHeight: "17px" }}>
                  <span className="fw-lighter">FLAT</span>
                  <span className="fs-5">₹{coupon.discount}</span>
                </div>
              </div>
              <p className="mb-0 lh-sm text-danger fs-small py-2">
                Expires In {coupon.expiresIn} days
              </p>
            </div>
            <div className="hbjjAe">
              <h3 className="jHjnaH">
                Get FLAT Rs.{coupon.discount} OFF on Lab Test bookings above Rs {coupon.minOrder}.
              </h3>
              <p className="ivEqJR">
                Get FLAT Rs.{coupon.discount} OFF on orders above Rs {coupon.minOrder}.
              </p>
            </div>
          </div>
          <div className="iUzfBX">
            <p className="mb-0">
              Code: <strong>{coupon.code}</strong>
            </p>
            <button className={`btn rounded-2 btn-sm py-1 ms-auto ${submitBtn}`}>
              Apply
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  </div>
</>
);
};

export default CartOffers;