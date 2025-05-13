import React from 'react'

const CategoryCard = ({Data, index}) => {
  return (
    <>
     <div className="card CustomShadow2 bg-light categoriesCRT" key={index}>
      <div className="card-body">
        <div className="bgctrun">
          <h6 className="ms-2 mt-2 fw-bold text-black text-center">{Data.title}</h6>
        </div>
        <div className="ctimgrw mx-auto text-center">
          <img src={Data.image} alt={Data.title} className="img-fluid object-fit-contain "/>
        </div>
      </div>
    </div>
    </>
  )
}

export default CategoryCard