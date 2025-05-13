import React from 'react'

const BulkOrderCards = ({Data, id}) => {
return (
<>
    <div className="card bulkCards rounded-3" key={id}>
        <img src={Data.image} className="card-img"  alt="..." />
        <div className="card-img-overlay d-flex align-items-end " style={{background:"linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0) 31%, rgba(0,0,0,1) 100%)"}}>
          <div className="w-100">
          <h5 className="card-title mb-0 text-light fs-6 fw-semibold">{Data.Title}</h5>
          </div>
        </div>
    </div>
</>
)
}

export default BulkOrderCards