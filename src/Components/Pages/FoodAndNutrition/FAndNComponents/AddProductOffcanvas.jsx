import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const AddProductOffcanvas = () => {
    // console.log(data)
    // const {title,imageUrl} = data;
    const [count,setCount] = useState(1)

  return (
    <>
      <div className="noBackdrop offcanvas OfcanvasH-80 CustomOffcan-lg-end offcanHeightFull" tabIndex={-1} id="AddProduct" aria-labelledby="AddProductLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title gap-3" id="AddProductLabel">
            <button className="btn p-0 me-2 d-lg-none" data-bs-dismiss="offcanvas" aria-label="Close">
              <i className="ri-arrow-go-back-line fs-4" />
            </button>
            <span>
              <span className="rounded-5">
                <img src="https://img.freepik.com/free-photo/tasty-cheesy-pizza-blue-with-fresh-vegetables_114579-15580.jpg" className='rounded' style={{width: '60px',height:"60px" }} alt="titleee" />
                </span>
                {/* <img src={data.imageUrl} className='rounded' style={{width: '60px',height:"60px" }} alt="" /> */}

              <span className='ms-2'>
                {/* {data.title} */}
                product Title
              </span>
            </span>
          </h5>
          <button type="button" className="btn-close d-none d-lg-block" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body bg-light pb-0">
          <div className="w-100 px-2 OfferOfcanvasHeight h-100" style={{maxHeight: 'calc(100vh - 182px)'}}>
            <div className='activeRedColor'>
                <div className="bg-white px-2">
                    <h5 className="m-0">Customize</h5>
                    <p className="fs-Xsmall text-muted fw-medium">Required: select any 1 option</p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2">Medium pizza</h6>
                    <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="radio" name="size" id="mediumPizza" />
                        <label className="form-check-label fw-semibold fs-7" htmlFor="mediumPizza">
                        Rs 499
                        </label>
                    </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-1">
                    <h6 className="fs-7 pt-2">Upgrade to cheeseburst Medium Pizza</h6>
                    <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="radio" name="size" id="cheeseburstPizza" />
                        <label className="form-check-label fw-semibold fs-7" htmlFor="cheeseburstPizza">
                        Rs 699
                        </label>
                    </div>
                    </div>
                </div>
                <div className="mt-3 px-2 bg-white">
                    <h6 className="pt-1">Topping</h6>
                    <p className="fs-Xsmall text-muted text-dark fw-semibold">Select up to 5 options</p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2 fs-7 fw-semibold">
                        <svg width={14} className="me-1" height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'green'}}>
                        <rect x="0.5" y="0.5" width={13} height={13} fill="white" stroke="#EB3239" />
                        <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                        </svg> Fresh Tomato
                    </h6>
                    <span className="fw-semibold fs-7">
                        <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="checkbox" id="toppingTomato" />
                        <label className="form-check-label" htmlFor="toppingTomato">
                            Rs 39
                        </label>
                        </div>
                    </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2 fs-7 fw-semibold">
                        <svg width={14} className="me-1" height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'green'}}>
                        <rect x="0.5" y="0.5" width={13} height={13} fill="white" stroke="#EB3239" />
                        <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                        </svg> Fresh Tomato
                    </h6>
                    <span className="fw-semibold fs-7">
                        <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="checkbox" id="toppingTomato1" />
                        <label className="form-check-label" htmlFor="toppingTomato1">
                            Rs 39
                        </label>
                        </div>
                    </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2 fs-7 fw-semibold">
                        <svg width={14} className="me-1" height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'green'}}>
                        <rect x="0.5" y="0.5" width={13} height={13} fill="white" stroke="#EB3239" />
                        <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                        </svg> Black Olive
                    </h6>
                    <span className="fw-semibold fs-7">
                        <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="checkbox" id="toppingOlive" />
                        <label className="form-check-label" htmlFor="toppingOlive">
                            Rs 39
                        </label>
                        </div>
                    </span>
                    </div>
                </div>
                <div className="mt-3 px-2 bg-white">
                    <h6 className="pt-1">Add your Desserts</h6>
                    <p className="fs-Xsmall text-muted text-dark fw-semibold">Select up to 5 options</p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2 fs-7 fw-semibold">
                        <svg width={14} className="me-1" height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'green'}}>
                        <rect x="0.5" y="0.5" width={13} height={13} fill="white" stroke="#EB3239" />
                        <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                        </svg> Fresh Tomato
                    </h6>
                    <span className="fw-semibold fs-7">
                        <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="checkbox" id="dessertTomato" />
                        <label className="form-check-label" htmlFor="dessertTomato">
                            Rs 39
                        </label>
                        </div>
                    </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="pt-2 fs-7 fw-semibold">
                        <svg width={14} className="me-1" height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'green'}}>
                        <rect x="0.5" y="0.5" width={13} height={13} fill="white" stroke="#EB3239" />
                        <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                        </svg> Black Olive
                    </h6>
                    <span className="fw-semibold fs-7">
                        <div className="form-check form-check-reverse">
                        <input className="form-check-input" type="checkbox" id="dessertOlive" />
                        <label className="form-check-label" htmlFor="dessertOlive">
                            Rs 39
                        </label>
                        </div>
                    </span>
                    </div>
                </div>
            </div>
          </div>
          <div className=" mt-4 bg-white w-100 sticky-bottom d-flex gap-3 align-items-center">
            <div className="d-flex text-danger align-items-center gap-1 fw-bold bg-mainLightRed border rounded-3 border-RedLight">
              <button className="btn fw-bold text-danger border-0 shadow-none" onClick={()=>setCount(count > 1 ? count - 1 : 1)}>-</button>
              {count} 
              <button className="btn fw-bold text-danger border-0 shadow-none" onClick={()=>setCount(count + 1)}>+</button>
            </div>
            <Link to="/shop/FoodAndNurition/Cart" type="submit" data-bs-dismis="modal" className="btn w-100 py-2 bg-mainRed fs-5 my-1 text-light fw-semibold rounded-2">
              Add items
            </Link>
          </div>
        </div>
      </div>   
    </>
  )
}

export default AddProductOffcanvas