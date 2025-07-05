import React from 'react'

const FilterOffcanvas = ({ mainTitle }) => {
  return (
    <div 
      className="noBackdrop offcanvas OfcanvasH-80 CustomOffcan-lg-end offcanHeightFull" 
      tabIndex="-1" 
      id="Filter"
      aria-labelledby="FilterLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title gap-3" id="FilterLabel">
          <button 
            className="btn p-0 me-2 d-lg-none" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
          >
            <i className="ri-arrow-go-back-line fs-4"></i>
          </button>
          <span>{mainTitle}</span>
        </h5>
        <button 
          type="button" 
          className="btn-close d-none d-lg-block" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close" 
        />
      </div>
      
      <div className="offcanvas-body pb-0">
        <div 
          className="w-100 px-2 OfferOfcanvasHeight h-100" 
          style={{ maxHeight: "calc(100vh - 182px)" }}
        >
          <div className="p-2">
            <div className="mb-3">
              <h5>Sort By:-</h5>
              <div className="activeRedColor">
                <div className="form-check mt-2">
                  <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio1" />
                  <label className="form-check-label" htmlFor="filterRadio1">
                    Relevance(Default)
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio2" />
                  <label className="form-check-label" htmlFor="filterRadio2">
                    Rating
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio3" />
                  <label className="form-check-label" htmlFor="filterRadio3">
                    Cost:LowtoHigh
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input className="form-check-input" type="radio" name="filterRadio" id="filterRadio4" />
                  <label className="form-check-label" htmlFor="filterRadio4">
                    Cost:HightoLow
                  </label>
                </div>
              </div>
            </div>
            
            {/* Add more filter sections as needed */}
            <div className="mb-3">
              <h5>Food Type:-</h5>
              <div className="activeRedColor">
                <div className="form-check mt-2">
                  <input className="form-check-input" type="checkbox" id="filterCheck1" />
                  <label className="form-check-label" htmlFor="filterCheck1">
                    Veg
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input className="form-check-input" type="checkbox" id="filterCheck2" />
                  <label className="form-check-label" htmlFor="filterCheck2">
                    Non-Veg
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-2 bg-light w-100 sticky-bottom">
          <button 
            type="submit" 
            className="btn w-100 py-3 bg-mainRed fs-5 my-1 text-light fw-semibold rounded-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterOffcanvas;