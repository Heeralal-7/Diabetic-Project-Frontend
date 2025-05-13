import React from 'react'
import { Link } from 'react-router-dom'

const OfferCards = ({offersData ,key}) => {
  return (
    <>
     {/* {offersData.map((offer, index) => ( */}
          <Link to='/shop/FoodAndNurition/Products' className="card border-0 CustomShadow1 rounded-4 w-90 mx-auto" key={key} style={{width:"100%"}}>
           <div className="position-relative">
           <img src={offersData.image} style={{ height: "120px", objectFit: "cover" }} className="card-img-top rounded-top-4" alt={offersData.title} />
           <div className="position-absolute bottom-0 text-light fw-bold py-2 px-3" style={{background:"linear-gradient(267deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.5408181179775281) 33%, rgba(0,0,0,1) 100%)"}}>
            <h6 className="mb-0">
                {offersData.discount}
            </h6>
            <p className="mb-0 lh-sm fs-small">
                {offersData.orderValue}
            </p>
           </div>
           </div>
            <div className="card-body p-2 pt-1">
              <h6 className="card-title fw-bold mb-0 multiLineTrunc lh-sm" style={{height:"50px"}}>{offersData.title}</h6>
              <p className="text-secondary mb-0 fs-Xsmall fw-bold lh-sm">
                {offersData.minTime} - {offersData.maxTime} min
              </p>

            </div>
          </Link>
      {/* // ))} */}
    </>
  )
}

export default OfferCards