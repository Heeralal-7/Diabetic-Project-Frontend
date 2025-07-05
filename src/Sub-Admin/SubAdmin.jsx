// import React, { useEffect } from "react";
// import Sidebar from "./includes/Sidebar";
// import '../Admin/Assests/css/theme.css'
// import '../Admin/Assests/css/Admin.css'
// import PageContent from "./includes/PageContent";
// import Header from "./includes/Header";
// // import $ from "jquery"; 
// import "../Admin/Assests/css/simplebar.min.css";
// import "../Admin/Assests/css/Admin.css";

// const Admin = ({children}) => {
//   useEffect(() => {
//     const navToggleBtn = document.querySelector('.nav-toggleBtn');
//     const mainWrapper = document.querySelector('.main-wrapper');

//     if (navToggleBtn) {
//       const handleToggle = (e) => {
//         e.preventDefault();
//         if (mainWrapper) {
//           mainWrapper.classList.toggle('toggled');
//         }
//       };

//       navToggleBtn.addEventListener('click', handleToggle);

//       // Clean up the event listener on component unmount
//       return () => {
//         navToggleBtn.removeEventListener('click', handleToggle);
//       };
//     }
//   }, []);
//   return (
//     <>
//        <style dangerouslySetInnerHTML={{__html: `
//         .simplebar-content-wrapper {
//            direction: inherit; 
//            position: relative;
//            display: block;
//            height: 100%;
//            width: auto;
//            max-width: 100%;
//            max-height: 100%;
//            scrollbar-width: none;    
           
//           }    

//        ` }} />
//       <main className="mainWrapper main-wrapper position-relative">
//         <Header />
//         <Sidebar/>
//         {/* <div className="" style={{border:"1px solid red"}}>
//         {children}

//         </div> */}
//         <PageContent>
//           {children}
//         </PageContent>
//       </main>
//     </>
//   );
// };

// export default Admin;


import React, { useEffect } from "react";
import '../Admin/Assests/css/theme.css';
import '../Admin/Assests/css/Admin.css';
import {PageContentSA} from "./includes/PageContent";
import Header from "./includes/Header";
import "../Admin/Assests/css/simplebar.min.css";
import "../Admin/Assests/css/Admin.css";
import {SidebarSA} from "./includes/Sidebar";

const SubAdmin = ({children}) => {
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
      <style dangerouslySetInnerHTML={{__html: `
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
        <Header />
        <SidebarSA/>
        <PageContentSA>
          {children}
        </PageContentSA>
      </main>
    </>
  );  
};

export default SubAdmin;

