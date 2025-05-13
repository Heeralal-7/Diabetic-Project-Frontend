import React from 'react'
import PharmacyCarouselImg from '../../../Assets/img/Pharmacy/PharmacyCarouselImg.png'
import PharmacyCarouselImg1 from '../../../Assets/img/Pharmacy/PharmacyCarouselImg1.png'
import PharmacyCarouselImg2 from '../../../Assets/img/Pharmacy/PharmacyCarouselImg2.png'

const HowItWorks = () => {
return (
<>
    {/* Modal */}

    <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog mb-0 modal-fullscreen-md-down modal-lg">
            <div className="modal-content customModal-bottom" style={{height:"600px"}}>
                <div className="modal-header">
                    <h1 className="modal-title fs-5" id="staticBackdropLabel">How it works</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal"   aria-label="Close" />
                </div>
                <div className="modal-body">
                    <div id="carouselExampleIndicators" className="carousel slide">
                        <div className="carousel-indicators customIndicators2" style={{bottom:"-35px"}}>
                            <button type="button"  data-bs-target="#carouselExampleIndicators" data-bs-slide-to={0} className="active" aria-current="true" aria-label="Slide 1" />
                            <button type="button"  data-bs-target="#carouselExampleIndicators" data-bs-slide-to={1} aria-label="Slide 2" />
                            <button type="button"  data-bs-target="#carouselExampleIndicators" data-bs-slide-to={2} aria-label="Slide 3" />
                        </div>
                        <div className="carousel-inner">
                            <div className="carousel-item active text-center">
                                <img src={PharmacyCarouselImg} className=" img-fluid" style={{height:"300px"}}  alt="..." />
                                <p className='text-secondary mt-3 w-80 mx-auto'>
                                Upload a clear and complete image of your prescription. If the prescription has multiple pages then upload all of them.
                                </p>
                            </div>
                            <div className="carousel-item text-center">
                                <img src={PharmacyCarouselImg1} className=" img-fluid" style={{height:"300px"}}  alt="..." />
                                <p className='text-secondary mt-3 w-80 mx-auto'>
                                Upload a clear and complete image of your prescription. If the prescription has multiple pages then upload all of them.
                                </p>
                            </div>
                            <div className="carousel-item text-center">
                                <img src={PharmacyCarouselImg2} className=" img-fluid" style={{height:"300px"}}  alt="..." />
                                <p className='text-secondary mt-3 w-80 mx-auto'>
                                Upload a clear and complete image of your prescription. If the prescription has multiple pages then upload all of them.
                                </p>
                            </div>
                        </div>
                        <button className="carousel-control-prev noHover" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <i className="ri-arrow-left-double-line display-5 text-dark"></i>
                        </button>
                        <button className="carousel-control-next noHover" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <i className="ri-arrow-right-double-line display-5 text-dark"></i>
                        </button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn w-100 icon-box rounded-1 btn-outline-secondary" data-bs-dismiss="modal">Understood</button>
                </div>
            </div>
        </div>
    </div>
</>
)
}

export default HowItWorks