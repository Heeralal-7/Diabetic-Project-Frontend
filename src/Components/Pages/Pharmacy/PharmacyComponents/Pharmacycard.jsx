import React from 'react';
import { Link } from 'react-router-dom';

const Pharmacycard = ({ Data ,index }) => {

return (
<>
    <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ width: "100%" }} key={index}>
        <div className="position-relative">
            <img src={Data.image || "default-image-url.jpg" } className="card-img-top rounded-top-4" style={{
                height: "200px" , }} alt={Data.name} />
            <span className="end-0 position-absolute top-0">
                <button className="btn  border shadow bg-light m-2 rounded-circle p-0" style={{ width: "41px" ,
                    height: "41px" }}>
                    <i className="ri-heart-2-line fs-2"></i>
                </button>
            </span>
            <div className="position-absolute start-0 ps-2 text-white bottom-0 w-100 pb-2" style={{background:"linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1644136235955056) 72%, rgba(0,0,0,0.0773349719101124) 84%)"}}>
                <p className="card-text fs-small">
                    <i className="bi bi-star-fill text-warning" />
                    4.4
                </p>
            </div>
        </div>
        <div className="card-body text-start">
            <div className="d-flex flex-nowrap justify-content-between">
                <div className="w-auto">
                    <Link to="/shop/BuyMedicine/Product"
                        className="h5 card-title d-flex justify-content-between align-items-center" style={{ maxWidth:180 }}>
                    <span className="text-truncate">{Data.name}</span>
                    </Link>
                    <p className="card-text multiLineTrunc lh-sm mb-2" style={{ height: "45px" }}>
                        <i class="ri-map-pin-2-fill text-danger fs-5"></i> <span>{Data.addr}</span>
                    </p>
                </div>
            </div>
        </div>
        <div className="d-flex text-nowrap align-items-center text-center justify-content-between g-0">
            {/* <div style={{ width: "90px" }} className="ps-2">
                <h5>${prize}</h5>
            </div> */}
            <div style={{ width: "100%" }}>
                <Link to="/Pharmacy/shop-details" className="btn bg-mainRed w-100 p-2 rounded-0 text-light">
                View Shop
                </Link>
            </div>
        </div>
    </div>
</>
);
}

export default Pharmacycard;