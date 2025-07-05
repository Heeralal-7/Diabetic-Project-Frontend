// import React, { useContext, useEffect, useState } from "react";
// import { MyContext } from "../../Context/Context";

// const Edit = () => {
//   const URL = process.env.REACT_APP_API_URL;
//   const { getAdmin, admin, updateAdmin } = useContext(MyContext);
//   const [details, setDetails] = useState({
//     name: "",
//     email: "",
//     image: null,
//   });

//   useEffect(() => {
//     getAdmin();
//   }, []);
  
//   useEffect(() => {
//     if (admin) {
//       setDetails({
//         name: admin.name || "",
//         email: admin.email || "",
//         image: null,
//       });
//       console.log('Admin details updated:', admin);
//     }
//   }, [admin]);
  
//   const handleChange = (e) => {
//     const { value, name, type, files } = e.target;
//     if (type === "file") {
//       setDetails({ ...details, image: files[0] });
//     } else {
//       setDetails({ ...details, [name]: value });
//     }
//     console.log("Details updated: ", details);
//   };
  



//   return (
//     <div>
//       <div className="container">
//         <div className="row">
//           <div className="col-md-8">
//             <form >
//               <div className="text-center">
//                 <div
//                   className="rounded-circle mb-4 mx-auto position-relative"
//                   style={{ width: "100px", height: "100px" }}
//                 >
//                   <img
//                     className="w-100 h-100 rounded-circle"
//                     src={ `${URL}/${admin?.image}`}
//                     alt="Profile"
//                   />
//                   <div className="position-absolute end-0 mx-auto">
//                     <label htmlFor="file-input" className="badge bg-primary translate-middle-y">
//                       <i className="fa fa-edit" aria-hidden="true"></i>
//                     </label>
//                   </div>
//                   <input
//                     type="file"
//                     id="file-input"
//                     style={{ display: "none" }}
//                     onChange={handleChange}
//                     name="image"
//                   />
//                 </div>
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="name" className="form-label">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   name="name"
//                   value={details.name}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="email" className="form-label">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   id="email"
//                   name="email"
//                   value={details.email}
//                   onChange={handleChange}
//                 />
//               </div>
//               <button type="submit" className="btn btn-primary">
//                 Save Changes
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Edit;

import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const EditSA = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
 
  const { getAdmin, admin, updateAdmin } = useContext(MyContext);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    image: null,
  });

  // Fetch the admin data when the component mounts
  useEffect(() => {
    getAdmin();
  }, []);

  // Map the fetched admin data to the local state when admin is first fetched
  useEffect(() => {
    if (admin && !details.name && !details.email) {
      setDetails({
        name: admin.name || "",
        email: admin.email || "",
        image: admin.image || null, // Use the admin image or a placeholder
      });
    }
  }, [admin]);

  // Handle changes to the input fields
  const handleChange = (e) => {
    const { value, name, type, files } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "file" ? files[0] : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append each field to the FormData object
    data.append("name", details.name);
    data.append("email", details.email);

    // Append the image file only if it's a File object
    if (details.image instanceof File) {
      data.append("image", details.image);
    }

    // Call the updateAdmin function with the form data
    updateAdmin(data);

    // Navigate to /profile after 1 second
  setTimeout(() => {
    navigate("/dashboard");
  }, 1000);
  };
  // Conditional rendering: wait until admin data is fetched


  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <form onSubmit={handleSubmit}>
              <div className="text-center">
                <div
                  className="rounded-circle mb-4 mx-auto position-relative"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
  className="w-100 h-100 rounded-circle"
  src={
    details.image instanceof File
      ? URL.createObjectURL(details.image)
      : `${API_URL}/${details.image}`
  }
  alt="Profile"
/>

                  <div className="position-absolute end-0 mx-auto">
                    <label htmlFor="file-input" className="badge bg-primary translate-middle-y">
                      <i className="fa fa-edit" aria-hidden="true"></i>
                    </label>
                  </div>
                  <input
                    type="file"
                    id="file-input"
                    style={{ display: "none" }}
                    onChange={handleChange}
                    name="image"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={details.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={details.email}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSA;
