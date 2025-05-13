  import React, { useCallback, useContext, useEffect, useState } from "react";
  import { MyContext } from "../../Context/Context";
  import { Link } from "react-router-dom";

  const Banned = () => {

    const {getinactiveUser,inactivelength,inactiveUser,vendorStatus,getinactivelabs,inactivelabs,inactivelengths,fetchinactivepharmacy ,
      inActivePharmacy ,
      pharmacyLength,   
      searchVendor,
      searchData,
      getInactiveFoodVendors,
  inactiveFoodVendors,
  inactiveFoodLength,
  toggleFoodVendorStatus
    } = useContext(MyContext)
    const [page, setPage] = useState(1);
    const [valueChange, setValueChange] = useState(null);

  
    const LIMIT = process.env.REACT_APP_LIMIT;
    const URL = process.env.REACT_APP_API_URL;

    // const leftPage =
    const handlePrevious = () => {
      if (page > 1) setPage(page - 1);
    };

    // const rightPage
    const handleNext = () => {
      setPage(page < inactivelength ? page + 1 : page);
    };

    useEffect(() => {
      getinactiveUser(page, LIMIT);
      getinactivelabs(page,LIMIT);
      fetchinactivepharmacy(page,LIMIT);
      getInactiveFoodVendors(page, LIMIT);
    }, [page]);


    const handleChange1 = async (id, isDisable) => {
      try {
        const confirmation = window.confirm(
          isDisable
            ? "Are you sure you want to disable the user?"
            : "Are you sure you want to enable the user?"
        );

        // Proceed only if the user confirms
        if (confirmation) {
        
          await vendorStatus(id);

          getinactiveUser(page, LIMIT);
        } else {
          console.log("Action cancelled.");
        }
      } catch (error) {
        console.log(error);
      }
    };

  const handleChange2 = async(id,isDisable)=>{
    try {
      const confirmation = window.confirm(
        isDisable
        ? "Are you sure you want to disable this user?"
        :"Are you aure you want to enable this user."
      );
      if(confirmation){
        await vendorStatus(id);

        getinactivelabs(page,LIMIT);
      } else{
        console.log("Action cancelled")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange3 = async(id,isDisable)=>{
    try {
      const confirmation =  window.confirm(
        isDisable
        ?"Are you sure you want to disable the user?"
        :"Are you sure you want to enable the user."
      )
      if(confirmation){
      await vendorStatus(id);
      fetchinactivepharmacy(page,LIMIT);
      } else{
        console.log("Action cancelled")
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handleFoodStatusChange = async (id, isDisable) => {
    try {
      const confirmation = window.confirm(
        isDisable
          ? "Are you sure you want to disable this food vendor?"
          : "Are you sure you want to enable this food vendor?"
      );
  
      if (confirmation) {
        await toggleFoodVendorStatus(id); // Corrected function call
        getInactiveFoodVendors(page, LIMIT); // Refresh inactive list
      }
    } catch (error) {
      console.error("Error updating food vendor status:", error);
    }
  };
  
  

    return (
      <>
      {/* <!------------------User part to enable-----------------------!>  */}

  {inactiveUser && inactiveUser.length > 0 ? (
    <>
  <div className="p-3">
    <div style={{ marginBottom: "3rem" }} className="">
      <div className="" style={{ transform: "translateY(2.5rem)" }}>
        <input
          type="text"
          placeholder="Search Here..."
          onChange={(e) => setValueChange(e.target.value)}
        />
      </div>
      <h1 className="text-center"> Users</h1>
    </div>
    <div className="" style={{ width: "auto", overflowX: "auto" }}>
      {inactiveUser && inactiveUser.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Address</th>
              <th scope="col">Country Code</th>
              <th scope="col">Phone</th>
            </tr>
          </thead>
          <tbody>
            {inactiveUser.map((d, i) => (
              <tr key={d._id}>
                <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                <td>
                  <img
                    src={d.image ?  `${URL}/${d.image} `: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png" } 
                    className=""
                    style={{
                      borderRadius: "50%",
                      height: "50px",
                      width: "50px",
                    }}
                    alt="User"
                  />
                </td>
                <td>{d.name}</td>
                <td>{d.email}</td>
                <td>{d.address}</td>
                <td>{d.ctrCode}</td>
                <td>{d.number}</td>
                <td>
                  <div className="btn-group">
                    <div onClick={() => handleChange1(d._id, d.isActive)}>
                      <button
                        className="btn btn-secondary bg-opacity-25 bg-gradient"
                        type="button"
                      >
                        {d.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h2 className="text-center">No user found</h2>
      )}
    </div>
    <div>
      <nav aria-label="Page navigation" style={{ marginTop: "1rem" }}>
        <ul
          className="pagination d-flex justify-content-between"
          style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
        >
          <li
            className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
            style={{ cursor: "pointer" }}
            onClick={handlePrevious}
          >
            <a className="page-link">Previous</a>
          </li>
          <li
            className={`page-item ${page >= inactivelength ? "disabled" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={handleNext}
          >
            <a className="page-link" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
  </>
  ):( <h2 className="text-center">No user found</h2>)}



      {/* <!------------------Labs part to enable-----------------------!>  */}

      <div className="p-3">
    <div style={{ marginBottom: "3rem" }} className="">
      <div className="" style={{ transform: "translateY(2.5rem)" }}>
        <input
          type="text"
          placeholder="Search Here..."
          onChange={(e) => setValueChange(e.target.value)} // Search filter for labs
        />
      </div>
      <h1 className="text-center"> Labs</h1>
    </div>
    <div className="" style={{ width: "auto", overflowX: "auto" }}>
      {inactivelabs && inactivelabs.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Image</th>
              <th scope="col">Vendor Name</th>
              <th scope="col">Email</th>
              <th scope="col">Country</th>
              <th scope="col">State</th>
              <th scope="col">City</th>
            </tr>
          </thead>
          <tbody>
            {inactivelabs.map((lab, i) => (
              <tr key={lab._id}>
                <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                <td>
                  <img
                    src={`${URL}/${lab.image}`}
                    className=""
                    style={{
                      borderRadius: "50%",
                      height: "50px",
                      width: "50px",
                    }}
                    alt="Lab"
                  />
                </td>
                <td>{lab.name}</td>
                <td>{lab.email}</td>
                <td>{lab.country}</td>
                <td>{lab.state}</td>
                <td>{lab.city}</td>
                <td>
                  <div className="btn-group">
                    <div onClick={() => handleChange2(lab._id, lab.isActive)}>
                      <button
                        className="btn btn-secondary bg-opacity-25 bg-gradient"
                        type="button"
                      >
                        {lab.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h2 className="text-center">No lab found</h2>
      )}
    </div>
    <div>
      <nav aria-label="Page navigation" style={{ marginTop: "1rem" }}>
        <ul
          className="pagination d-flex justify-content-between"
          style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
        >
          <li
            className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
            style={{ cursor: "pointer" }}
            onClick={handlePrevious} // Navigate to previous page
          >
            <a className="page-link">Previous</a>
          </li>
          <li
            className={`page-item ${page >= inactivelengths ? "disabled" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={handleNext} // Navigate to next page
          >
            <a className="page-link" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  {/* <!------------------pharmacy part-------------------!> */}


  <div className="p-3">
    <div style={{ marginBottom: "3rem" }} className="">
      <div className="" style={{ transform: "translateY(2.5rem)" }}>
        <input
          type="text"
          placeholder="Search Here..."
          onChange={(e) => setValueChange(e.target.value)} // Search filter for labs
        />
      </div>
      <h1 className="text-center"> Pharmacy</h1>
    </div>
    <div className="" style={{ width: "auto", overflowX: "auto" }}>
      {inActivePharmacy && inActivePharmacy.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
            <th scope="col">S.No</th>
                      <th scope="col">Image</th>
                      <th scope="col">VENDOR NAME</th>
                      <th scope="col">EMAIL</th>
                      <th scope="col">COUNTRY</th>
                      <th scope="col">STATE</th>
                      <th scope="col">CITY</th>
            </tr>
          </thead>
          <tbody>
            {inActivePharmacy.map((Pharmacy, i) => (
              <tr key={Pharmacy._id}>
                <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                <td>
                  <img
                    src={`${URL}/${Pharmacy.image}`}
                    className=""
                    style={{
                      borderRadius: "50%",
                      height: "50px",
                      width: "50px",
                    }}
                    alt="Lab"
                  />
                </td>
                <td>{Pharmacy.name}</td>
                          <td>{Pharmacy.email}</td>
                          <td>{Pharmacy.country}</td>
                          <td>{Pharmacy.state}</td>
                          <td>{Pharmacy.city}</td>
                <td>
                  <div className="btn-group">
                    <div onClick={() => handleChange3(Pharmacy._id, Pharmacy.isActive)}>
                      <button
                        className="btn btn-secondary bg-opacity-25 bg-gradient"
                        type="button"
                      >
                        {Pharmacy.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h2 className="text-center">No Pharmacy found</h2>
      )}
    </div>
    <div>
      <nav aria-label="Page navigation" style={{ marginTop: "1rem" }}>
        <ul
          className="pagination d-flex justify-content-between"
          style={{ paddingRight: "5rem", paddingLeft: "5rem" }}
        >
          <li
            className={`page-item ${page === 1 ? "disabled" : ""} pointer`}
            style={{ cursor: "pointer" }}
            onClick={handlePrevious} // Navigate to previous page
          >
            <a className="page-link">Previous</a>
          </li>
          <li
            className={`page-item ${page >= pharmacyLength ? "disabled" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={handleNext} // Navigate to next page
          >
            <a className="page-link" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

{/* ------------------ Food Vendors ------------------ */}

<div className="p-3">
  <div style={{ marginBottom: "3rem" }} className="">
    <div className="" style={{ transform: "translateY(2.5rem)" }}>
      <input
        type="text"
        placeholder="Search Here..."
        onChange={(e) => setValueChange(e.target.value)} // Optional search filter
      />
    </div>
    <h1 className="text-center">Food Vendors</h1>
  </div>
  <div className="" style={{ width: "auto", overflowX: "auto" }}>
    {inactiveFoodVendors && inactiveFoodVendors.length > 0 ? (
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">S.No</th>
            <th scope="col">Image</th>
            <th scope="col">Vendor Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">City</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {inactiveFoodVendors.map((vendor, i) => (
            <tr key={vendor._id}>
              <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
              <td>
                <img
                  src={
                    vendor.image
                      ? `${URL}/${vendor.image}`
                      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                  }
                  alt="Vendor"
                  style={{ borderRadius: "50%", height: "50px", width: "50px" }}
                />
              </td>
              <td>{vendor.name}</td>
              <td>{vendor.email}</td>
              <td>{vendor.number}</td>
              <td>{vendor.city}</td>
              <td>
                <div className="btn-group">
                <div onClick={() => handleFoodStatusChange(vendor._id, vendor.isActive)}>
                <button className="btn btn-secondary bg-opacity-25 bg-gradient" type="button">
                      {vendor.isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <h2 className="text-center">No Food Vendor Found</h2>
    )}
  </div>

  <div>
    <nav aria-label="Page navigation" style={{ marginTop: "1rem" }}>
      <ul className="pagination d-flex justify-content-between" style={{ paddingRight: "5rem", paddingLeft: "5rem" }}>
        <li
          className={`page-item ${page === 1 ? "disabled" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={handlePrevious}
        >
          <a className="page-link">Previous</a>
        </li>
        <li
          className={`page-item ${page >= inactiveFoodLength ? "disabled" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={handleNext}
        >
          <a className="page-link">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</div>
{/* ------------------ End of Food Vendors ------------------ */}



      </>
    );
  };

  export default Banned;



