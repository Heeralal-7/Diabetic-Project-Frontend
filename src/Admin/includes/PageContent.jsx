import React from 'react'

const PageContent = ({children}) => {
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

export  {PageContent, VendorPageContent}