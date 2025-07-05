import React, { useCallback, useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { Link } from "react-router-dom";

const Users1 = () => {

  const {getallusers,userLength,users,vendorStatus} = useContext(MyContext)
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
    setPage(page < userLength ? page + 1 : page);
  };

  useEffect(() => {
    getallusers(page, LIMIT);
  }, [page]);

  // let debounceSearch = (fx, delay) => {
  //   let id = null;
  //   return (e) => {
  //     if (id) {
  //       clearTimeout(id);
  //     }
  //     id = setTimeout(() => {
  //       fx(e);
  //     }, delay);
  //   };
  // };

  // const debouncedSearch = useCallback(
  //   debounceSearch(() => searchVendor(valueChange, page, LIMIT), 600),
  //   [valueChange, page]
  // );

  // useEffect(() => {
  //   debouncedSearch();
  // }, [debouncedSearch]);

  // const flattenedSearchData = searchData.flat();
  // const isSearchDataValid =
  //   Array.isArray(flattenedSearchData) &&
  //   flattenedSearchData.length > 0 &&
  //   flattenedSearchData.some((item) => item !== null && item !== undefined);

  // const vendorDataLists = isSearchDataValid ? flattenedSearchData : vendorLists;

  const handleChange1 = async (id, isDisable) => {
    try {
      const confirmation = window.confirm(
        isDisable
          ? "Are you sure you want to disable the user?"
          : "Are you sure you want to enable the user?"
      );
  
     
      if (confirmation) {
        await vendorStatus(id);
  
        // Show alert after successful action
        alert(
          isDisable
            ? "User has been successfully disabled."
            : "User has been successfully enabled."
        );
  
       
        getallusers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      } else {
        console.log("Action cancelled.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <>

{getallusers && getallusers.length >0 ? (
      <div className="p-3">
        <div style={{ marginBottom: "3rem" }} className="">
          <h1 className="text-center" style={{}}>
            All  Users
          </h1>
        </div>
        <div className="" style={{ width: "auto", overflowX: "auto" }}>
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
               
                {/* <th scope="col">ACTION</th> */}
              </tr>
            </thead>
            <tbody>
              {users?.map((d, i) => (
                <>
                  <tr key={d._id}>
                    <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                    <td>
                      <img
                        src={d.image ? `${URL}/${d.image}`:"https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"}
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
      {d.isActive ? 'Disable' : 'Enable'}
    </button>
  </div>
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
                className={`page-item ${page >= userLength ? "disabled" : ""}`}
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
):( <h2 className="text-center">No user found</h2>)}
 </>
  );
};

export default Users1;


