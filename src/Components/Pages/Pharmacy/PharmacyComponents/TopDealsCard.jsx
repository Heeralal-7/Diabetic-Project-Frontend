import React from 'react'

const TopDealsCard = ({Data,index}) => {
  return (
    <>
     <div className="card CustomShadow2 rounded-5 overflow-hidden" key={index}>
      <div className="card-body bgcolor flex-column d-flex gap-2 justify-content-center">
        <div className="mx-auto text-center">
          <img src={Data.image} alt={Data.title} className="img-fluid object-fit-contain rounded-2"/>
        </div>
          <h6 className="ms-2 mt-2 fw-bold text-black text-center">{Data.title}</h6>
      </div>
    </div>
    </>
  )
}

export default TopDealsCard