import React from 'react'

const ProductItemCard = ({Data,id,setLists}) => {
    // const [clicked,setClicked] = useState(false)
return (
<>

 
    <div className="card ProductCard rounded-3 w-100 mx-auto" key={id}>
        <div className="card-body d-flex justify-content-between py-2">
            <div className="text-start align-middle">
                {Data.veg ?
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
                {Data.isBestseller && (
                <span className="fs-Xsmall text-light bg-mainRed px-1 rounded-pill">
                    Bestseller
                </span>
                )}
                <h6 className="card-tittle fw-semibold mb-1" style={{height:"30px"}}>
                    {Data.title}
                </h6>
                <span className="text-light bg-success p-1 fw-semibold fs-Xsmall rounded-1">
                    {Data.rating}
                    <i className="fa-solid ms-1 fa-star" />
                </span>
                <p className="card-text text-secondary fs-7 mb-0">
                    <strike>
                        <i className="fa-solid fa-indian-rupee-sign fs-8" />
                        {Data.originalPrice.toFixed(2)}
                    </strike>
                    <span className='text-mainRed fw-semibold ms-2'>
                        ₹ {Data.discountedPrice}
                    </span>
                </p>
                <p className="lh-sm fs-7 mb-0 multiLineTrunc text-secondary" style={{height:"50px"}}>
                    {Data.description}
                </p>
            </div>
            <div style={{ minWidth: '120px' , width: '0%' }}>
                <img src={Data.imageUrl} className="rounded-4" width="100%" style={{ minWidth: '120px' , height:"117px",
                    width: '80%' }} alt={Data.title} />
                <div className="w-50 mx-auto position-relative">
                    <button
                        className="btn translate-middle-y position-absolute btn-sm btn-mainLightRed border-RedLight text-danger border shadow-lg rounded-2 px-3"
                        data-bs-toggle="offcanvas" data-bs-target="#AddProduct" aria-controls="AddProduct" onClick={() => {
                            setLists(Data)
                            // setClicked(true)
                          }}>Add</button>
                </div>
            </div>
        </div>
    </div>
</>
)
}

export default ProductItemCard