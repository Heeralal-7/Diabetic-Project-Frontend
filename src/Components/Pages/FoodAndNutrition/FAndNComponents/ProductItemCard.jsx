import React from 'react'

const ProductItemCard = ({Data,id,setLists}) => {
    // const [clicked,setClicked] = useState(false)
return (
<>

    {/* <div className="card ProductCard rounded-3 w-100 mx-auto">
        <div className="card-body d-flex justify-content-between py-2">
            <div className="text-start align-middle">
                <svg width="14" className='me-2' height="14" viewBox="0 0 14 14" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                    <circle cx="7" cy="7" r="3.5" fill="#199339" />
                </svg>
                <span className="fs-Xsmall text-light bg-mainRed px-1  rounded-pill">
                    Bestseller
                </span>
                <h6 className="card-tittle fw-semibold mb-1">
                    Standard Thali - Trail
                </h6>
                <span className="text-light bg-success p-1  fw-semibold fs-Xsmall rounded-1">
                    3.6
                    <i className="fa-solid ms-1 fa-star" />
                </span>
                <p className="card-text text-secondary fs-7 mb-0">
                    <strike>
                        <i className="fa-solid fa-indian-rupee-sign fs-8" />
                        136.00
                    </strike>
                    <span className='text-mainRed fw-semibold ms-2'>
                        ₹ 119
                    </span>
                </p>
                <p className="lh-sm fs-7 mb-0 multiLineTrunc text-secondary">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo officiis, iusto
                    corporis in similique atque quae dolorem, fugiat velit voluptates rerum aliquid
                    voluptatem facilis qui! Similique aut quisquam nulla illum?
                </p>
            </div>
            <div style={{minWidth: '120px' , width: '0%' }}>
                <img src="https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg?t=st=1713965310~exp=1713968910~hmac=d6073e9948c98d6fd60c0fdffbd0d6aead5150f5628b33ad2f7565e7d879a340&w=740"
                    className="rounded-4" width="100%" style={{minWidth: '120px' , width: '80%' }} alt="" />
                <div className="w-50 mx-auto position-relative">
                    <button
                        className="btn translate-middle-y position-absolute btn-sm btn-mainLightRed border-RedLight border shadow-lg rounded-2 px-3"
                        data-bs-toggle="offcanvas" data-bs-target="#AddProduct" aria-controls="AddProduct">Add</button>
                </div>
            </div>
        </div>
    </div> */}
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