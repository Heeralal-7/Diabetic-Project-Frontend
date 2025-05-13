import React, { useState } from 'react'

const CartCard = ({data,id ,setLists}) => {
   const [count,setCount] = useState(1);
    

    return (
    <>
     
     <div className="card border-0 border-bottom productCard rounded-3 w-100 mx-auto" key={id}>
        <div className="card-body d-flex justify-content-between py-2">
            <div className="text-start align-middle">
                {data.veg ?
                <svg width="14" className='me-2' height="14" viewBox="0 0 14 14" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                    <circle cx="7" cy="7" r="3.5" fill="#199339" />
                </svg>
                :
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                    <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                </svg>

                }
                {data.isBestseller && (
                <span className="fs-Xsmall text-light bg-mainRed px-1 rounded-pill">
                    Bestseller
                </span>
                )}
                <h6 className="card-tittle fw-semibold mb-1" style={{height:"30px"}}>
                    {data.title}
                </h6>
                <span className="text-light bg-success p-1 fw-semibold fs-Xsmall rounded-1">
                    {data.rating}
                    <i className="fa-solid ms-1 fa-star" />
                </span>
                <p className="card-text text-secondary fs-7 mb-0">
                    <strike>
                        <i className="fa-solid fa-indian-rupee-sign fs-8" />
                        {data.originalPrice.toFixed(2)}
                    </strike>
                    <span className='text-mainRed fw-semibold ms-2'>
                        ₹ {data.discountedPrice}
                    </span>
                </p>
                <p className="lh-sm fs-7 mb-0 multiLineTrunc text-secondary" style={{height:"30px"}}>
                    {data.description}
                </p>
                <div className="w-100 text-start">
                    <span data-bs-toggle="offcanvas" data-bs-target="#AddProduct" aria-controls="AddProduct"  className="text-danger CustomShadow2 btn btn-sm fw-bold fs-small">
                    View Addon's
                    </span>
                </div>
            </div>
            <div style={{ minWidth: '120px' , width: '0%' }}>
                <img src={data.imageUrl} className="rounded-4" width="100%" style={{ minWidth: '120px' , height:"117px",
                    width: '80%' }} alt={data.title} />
                <div className="w-70 mx-auto position-relative">
                    <span className="btn translate-middle-y d-flex align-items-center position-absolute btn-sm btn-mainLightRed border-RedLight  border shadow-lg rounded-2 px-3" >
                    <span className='px-2 py-1' onClick={()=>setCount(count > 1 ? count - 1 : 1)}>-</span>
                    {count} 
                    <span className='px-2 py-1' onClick={()=>setCount(count + 1)}>+</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
    </>
    )
}

export default CartCard