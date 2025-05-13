import React from "react";
import style from"../../../Assets/Css/ShopInput.module.css"

const AddAddress = ({ mainTitle,AddAddressBtn,submitBtn ,radioButton}) => {
return (
<>
  <div className=" noBackdrop offcanvas CustomOffcan-lg-end offcanHeightFull" tabIndex={-1} id="addAddress"
    aria-labelledby="addAddressLabel">
    <div className="offcanvas-header">
      <h5 className="offcanvas-title" id="addAddressLabel">
        <button className="btn p-0 d-lg-none" data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="ri-arrow-go-back-line fs-4"></i>
        </button>{" "}
        {mainTitle}
      </h5>
      <button type="button" className="btn-close d-none d-lg-block" data-bs-dismiss="offcanvas" aria-label="Close" />
    </div>
    <div className="offcanvas-body pb-0">
      <div className="w-100 px-2 OfferOfcanvasHeight h-100" style={{maxHeight:"calc(100vh - 182px)"}}>
        <div className="ps-4">
          <div className="customInput1 my-4 ">
            <input className="px-3" type="text" id="input" required />
            <label htmlFor="input" className="customInputLabel1 fw-semibold">
              Deliver to <span className="fs-4 lh-sm text-danger">*</span>
            </label>
            <div className="underline" />
          </div>
          <div className="customInput1 my-4 ">
            <input className="px-3" type="number" maxLength="10" id="input" required />
            <label htmlFor="input" className="customInputLabel1 fw-semibold">
              Mobile Number <span className="fs-4 lh-sm text-danger">*</span>
            </label>
            <div className="underline" />
            <div className="form-text position-absolute">
              For all delivery related communication
            </div>
          </div>
          <div className="customInput1 mt-5 " style={{width:"130px"}}>
            <input className="px-3" type="number" maxLength="10" id="input" required />
            <label htmlFor="input" className="customInputLabel1 fw-semibold">
              Pincode<span className="fs-4 lh-sm text-danger">*</span>
            </label>
            <div className="underline" />
          </div>
          <div className="customInput1 my-4 ">
            <input className="px-3" type="text" maxLength="10" id="input" required />
            <label htmlFor="input" className="customInputLabel1 fw-semibold">
              House Number and Buliding <span className="fs-4 lh-sm text-danger">*</span>
            </label>
            <div className="underline" />
          </div>
          <div className="customInput1 my-4 ">
            <input className="px-3" type="text" maxLength="10" id="input" required />
            <label htmlFor="input" className="customInputLabel1 fw-semibold">
              Street Name <span className="fs-4 lh-sm text-danger">*</span>
            </label>
            <div className="underline" />
          </div>
          <div>
            <label className="form-label text-mainBlue fw-semibold">Address Type <span
                className="fs-4 lh-sm text-danger">*</span></label>
            <div className="d-flex mt-2 gap-3">
              <input type="radio" className="btn-check" name="options" id="option1" autoComplete="off" defaultChecked />
              <label className={`btn rounded-pill  ${radioButton}`} htmlFor="option1">Home</label>
              <input type="radio" className="btn-check" name="options" id="option2" autoComplete="off" />
              <label className={`btn rounded-pill  ${radioButton}`} htmlFor="option2">Work</label>
              <input type="radio" className="btn-check" name="options" id="option3" autoComplete="off" />
              <label className={`btn rounded-pill  ${radioButton}`} htmlFor="option3">Others</label>
            </div>
          </div>
        </div>
      </div>
      {/* change address */}
      <div className="w-100 px-2 OfferOfcanvasHeight h-100" style={{maxHeight:"calc(100vh - 182px)"}}>
        <div className="">
          <div className="sticky-top">
            <button className={`btn border-mainBlue w-100 ${AddAddressBtn}`}>
              Add New Address
            </button>
          </div>
          <div className="mt-5">
            <h6>Deliver To</h6>
              <div className="py-2">
                <div className={style.wrapper}>
                  <div className={style.card}>
                    <input className={style.input} type="radio" name="card" defaultValue="1" />
                    <span className={style.check} />
                    <label className={style.label}>
                    <span className="fw-semibold">Home</span>
                    <div className="fs-small">
                      <p className="text-black mb-0 fw-semibold">Simran Singh</p>
                      <p className="text-muted mb-0">456,Sector 117,Mohali,160055</p>
                      <p className="text-muted mb-0">9638527410</p>
                    </div>   
                    </label>
                    <div className="borderDashedTop mt-3 position-absolute ms-2" style={{width:"95%", bottom:"5px"}}>
                      <div className="d-flex justify-content-between pt-2 px-2 position-relative" style={{zIndex:"20"}}>
                        <span className="text-muted link-dark" >
                        <i className="ri-delete-bin-fill fs-5 text-muted link-dark"></i>
                        </span>

                        <span className="text-muted link-dark fw-smibold" ><i className="ri-edit-line fs-5 text-muted link-dark me-2"></i>Edit</span>
                      </div>
                    </div>                   
                  </div>
                  <div className={style.card}>
                    <input className={style.input} type="radio" name="card" defaultValue="1" />
                    <span className={style.check} />
                    <label className={style.label}>
                    <span className="fw-semibold">Home</span>
                    <div className="fs-small">
                      <p className="text-black mb-0 fw-semibold">Simran Singh</p>
                      <p className="text-muted mb-0">456,Sector 117,Mohali,160055</p>
                      <p className="text-muted mb-0">9638527410</p>
                    </div>   
                    </label>
                    <div className="borderDashedTop mt-3 position-absolute ms-2" style={{width:"95%", bottom:"5px"}}>
                      <div className="d-flex justify-content-between pt-2 px-2 position-relative" style={{zIndex:"20"}}>
                        <span className="text-muted link-dark" >
                        <i className="ri-delete-bin-fill fs-5 text-muted link-dark"></i>
                        </span>

                        <span className="text-muted link-dark fw-smibold" ><i className="ri-edit-line fs-5 text-muted link-dark me-2"></i>Edit</span>
                      </div>
                    </div>                   
                  </div>
                  <div className={style.card}>
                    <input className={style.input} type="radio" name="card" defaultValue="1" />
                    <span className={style.check} />
                    <label className={style.label}>
                    <span className="fw-semibold">Home</span>
                    <div className="fs-small">
                      <p className="text-black mb-0 fw-semibold">Simran Singh</p>
                      <p className="text-muted mb-0">456,Sector 117,Mohali,160055</p>
                      <p className="text-muted mb-0">9638527410</p>
                    </div>   
                    </label>
                    <div className="borderDashedTop mt-3 position-absolute ms-2" style={{width:"95%", bottom:"5px"}}>
                      <div className="d-flex justify-content-between pt-2 px-2 position-relative" style={{zIndex:"20"}}>
                        <span className="text-muted link-dark" >
                        <i className="ri-delete-bin-fill fs-5 text-muted link-dark"></i>
                        </span>

                        <span className="text-muted link-dark fw-smibold" ><i className="ri-edit-line fs-5 text-muted link-dark me-2"></i>Edit</span>
                      </div>
                    </div>                   
                  </div>
                  <div className={style.card}>
                    <input className={style.input} type="radio" name="card" defaultValue="1" />
                    <span className={style.check} />
                    <label className={style.label}>
                    <span className="fw-semibold">Home</span>
                    <div className="fs-small">
                      <p className="text-black mb-0 fw-semibold">Simran Singh</p>
                      <p className="text-muted mb-0">456,Sector 117,Mohali,160055</p>
                      <p className="text-muted mb-0">9638527410</p>
                    </div>   
                    </label>
                    <div className="borderDashedTop mt-3 position-absolute ms-2" style={{width:"95%", bottom:"5px"}}>
                      <div className="d-flex justify-content-between pt-2 px-2 position-relative" style={{zIndex:"20"}}>
                        <span className="text-muted link-dark" >
                        <i className="ri-delete-bin-fill fs-5 text-muted link-dark"></i>
                        </span>

                        <span className="text-muted link-dark fw-smibold" ><i className="ri-edit-line fs-5 text-muted link-dark me-2"></i>Edit</span>
                      </div>
                    </div>                   
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
      <div className="py-2 bg-light w-100 sticky-bottom">
        <button type="submit" data-bs-dismiss='offcanvas' className={`btn w-100 py-3 fs-5 my-1 rounded-2  ${submitBtn}`}>
          Save and Continue
        </button>
      </div>
    </div>
  </div>
</>
);
};

export default AddAddress;