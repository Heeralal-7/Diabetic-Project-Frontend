import React, { useEffect } from 'react'
import FoodHeader from './FoodHeader.jsx'
import {VendorPageContent} from '../../../Admin/includes/PageContent'
import { FoodSidebar } from '../../../Admin/includes/Sidebar'
const IndexFood = ({ children }) => {
  useEffect(() => {
    const navToggleBtn = document.querySelector('.nav-toggleBtn');
    const mainWrapper = document.querySelector('.main-wrapper');

    if (navToggleBtn && mainWrapper) {
      const handleToggle = (e) => {
        e.preventDefault();
        mainWrapper.classList.toggle('toggled');
      };

      navToggleBtn.addEventListener('click', handleToggle);

      // Clean up the event listener on component unmount
      return () => {
        navToggleBtn.removeEventListener('click', handleToggle);
      };
    } else {
      console.error("Elements not found:", { navToggleBtn, mainWrapper });
    }
  }, []);
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .simplebar-content-wrapper {
           direction: inherit; 
           position: relative;
           display: block;
           height: 100%;
           width: auto;
           max-width: 100%;
           max-height: 100%;
           scrollbar-width: none;    
          }    
      ` }} />
      <main className="mainWrapper main-wrapper position-relative">
        <FoodHeader/>
        <FoodSidebar />
        <VendorPageContent>
          {children}
        </VendorPageContent>
      </main>
    </>
  )
}

export default IndexFood;
