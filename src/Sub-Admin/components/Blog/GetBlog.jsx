import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../../Context/Context";
import { Link } from "react-router-dom";

const GetBlogSA = () => {
  const {
    blog,
    adminBlog,
    blogLength,
    deletemainform
  } = useContext(MyContext);

  const [page, setPage] = useState(1);
  const [valueChange, setValueChange] = useState("");

  const LIMIT = process.env.REACT_APP_LIMIT;
  const URL = process.env.REACT_APP_API_URL;

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < Math.ceil(blogLength / LIMIT)) setPage(page + 1);
  };

  const handleremove = async (id) => {
    await deletemainform(id);
    await adminBlog(page, LIMIT);
  };

  useEffect(() => {
    adminBlog(page, LIMIT);
  }, [page]);

  // Filter blogs based on search input
  const filteredBlogs = blog.filter((item) => {
    const searchTerm = valueChange.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.type?.toLowerCase().includes(searchTerm) ||
      item.created_by?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <>
      {blog && blog.length > 0 ? (
        <div className="p-3">
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ transform: "translateY(2.5rem)" }}>
              <input
                type="text"
                placeholder="Search Here..."
                value={valueChange}
                onChange={(e) => setValueChange(e.target.value)}
              />
            </div>
            <h1 className="text-center">All Blogs</h1>
          </div>
          <div style={{ width: "auto", overflowX: "auto" }}>
            {filteredBlogs.length > 0 ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Type</th>
                    <th scope="col">Blog Image</th>
                    <th scope="col">Conclusion</th>
                    <th scope="col">Created By</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((d, i) => (
                    <tr key={d._id}>
                      <th scope="row">{(page - 1) * LIMIT + i + 1}</th>
                      <td title={d?.title}>{d.title}</td>
                      <td title={d?.description}>
                        {d.description.slice(0, 20)}{d.description.length > 20 ? "..." : ""}
                      </td>
                      <td title={d?.type}>{d.type}</td>
                      <td>
  <img
    src={`${URL}/${d.blogimage}`}
    alt="Blog"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "https://placehold.co/50x50?text=No+Image&font=roboto";
    }}
    style={{
      borderRadius: "50%",
      height: "50px",
      width: "50px",
      objectFit: "cover"
    }}
  />
</td>
                      <td title={d?.conclusion}>
                        {d.conclusion.slice(0, 20)}{d.conclusion.length > 20 ? "..." : ""}
                      </td>
                      <td>{d.created_by}</td>
                      <td>
                        <div className="btn-group">
                          <Link
                            to={`/dashboard/getblogs/${d._id}`}
                            className="btn btn-secondary bg-opacity-25 bg-gradient"
                            type="button"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleremove(d._id)}
                            className="btn btn-secondary bg-opacity-25 bg-gradient mx-2"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No blogs match your search.</p>
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
                  className={`page-item ${page >= blogLength ? "disabled" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={handleNext}
                >
                  <a className="page-link">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <h2 className="text-center">No blogs found</h2>
      )}
    </>
  );
};

export default GetBlogSA;
