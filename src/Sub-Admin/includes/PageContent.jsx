import React from 'react'

const PageContentSA = ({children}) => {
  return (
    <>
       {/* Page content */}
       <div className='appContent'>
        {/* Container fluid */}
        <div className="app-content-area">
        {children}
        </div>
      </div>
    </>
  )
};
const VendorPageContent = ({children}) => {
  return (
    <>
       {/* Page content */}
       <div className='appContent'>
        {/* Container fluid */}
        <div className="app-content-area">
        {children}
        </div>
      </div>
    </>
  )
};

export  {PageContentSA, VendorPageContent}