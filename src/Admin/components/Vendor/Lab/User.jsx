import React, { useCallback, useContext, useEffect, useState } from "react";
import { MyContext } from "../../../../Context/Context";
import { Link } from "react-router-dom";
import Loading from "../../../../Components/Loading";

const User = () => {
  const {
    vendorLists,
     vendorStatus,
    getAllVendorList,
    vendorstats, 
    setVendorstatus,
    lengthD,
    searchVendor,
    searchData,
    isLoading,
  } = useContext(MyContext);
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
    setPage(page < lengthD ? page + 1 : page);
  };

  useEffect(() => {
    getAllVendorList(page, LIMIT);
  }, [page]);

  let debounceSearch = (fx, delay) => {
    let id = null;
    return (e) => {
      if (id) {
        clearTimeout(id);
      }
      id = setTimeout(() => {
        fx(e);
      }, delay);
    };
  };

  const debouncedSearch = useCallback(
    debounceSearch(() => searchVendor(valueChange, page, LIMIT), 400),
    [valueChange, page]
  );

  useEffect(() => {
    debouncedSearch();
    vendorStatus();
  }, [debouncedSearch]);

  const flattenedSearchData = searchData.flat();
  const isSearchDataValid =
    Array.isArray(flattenedSearchData) &&
    flattenedSearchData.length > 0 &&
    flattenedSearchData.some((item) => item !== null && item !== undefined);

  const vendorDataLists = isSearchDataValid ? flattenedSearchData : vendorLists;

  const handleChange1 = async(id,isDisable)=>{
    try {
      const confirmation = window.confirm(
        isDisable
        ?"Are you sure you want to disbale the user?"
        : "Are you sure you want to enable this user?"
      );
      if(confirmation){
        await vendorStatus(id)
      
  
      alert(
        isDisable
        ?"User has been successfully disable"
        :"User has been successfully enable."
      );
      getAllVendorList((prevLabs)=>prevLabs.filter((Lab)=> Lab._id !==id));
    } else{
      console.log("Action cancelled")
    }
    } catch (error) {
      console.log(error);
      alert("somthing went wrong")
    }
  };
  




  return (
    <>
    {vendorLists && vendorLists.length>0 ? (
      <div className="p-3">
        <div style={{ marginBottom: "3rem" }} className="">
          <div className="" style={{ transform: "translateY(2.5rem)" }}>
            <input
              type="text"
              placeholder="Search Here..."
              onChange={(e) => setValueChange(e.target.value)}
            />
          </div>
          <h1 className="text-center" style={{}}>
            All Lab Users
          </h1>
        </div>
        <div className="" style={{ width: "auto", overflowX: "auto" }}>
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
                {/* <th scope="col">ACTION</th> */}
              </tr>
            </thead>
            <tbody>
              {vendorDataLists?.map((d, i) => (
                <>
                  <tr key={d._id}>
                    <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                    <td>
                      <img
                        src={`${URL}/${d.image}`}
                        className=""
                        style={{
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                        }}
                      />
                    </td>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.country}</td>
                    <td>{d.state}</td>
                    <td>{d.city}</td>
                    <td>


                      <div className="d-flex align-items-center gap-3">
                      
      <button className="btn btn-secondary bg-opacity-25 bg-gradient"
                            type="button"
                            onClick={()=>handleChange1(d._id,d.isActive)} >
    {d.isActive ? 'Disable':'Enable'}
      </button>
     
                        <Link to={`/dashboard/lab/userview/${d._id}`}>
                          {/* <button
                            className="btn btn-secondary bg-opacity-25 bg-gradient"
                            type="button"
                          >
                            View
                          </button> */}
                        </Link>
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
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
                className={`page-item ${page >= lengthD ? "disabled" : ""}`}
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
    ):(<h2 className="text-center">No user found</h2>)}
    </>
  );
};

export default User;
