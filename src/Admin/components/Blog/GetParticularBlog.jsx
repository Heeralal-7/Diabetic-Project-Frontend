

import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import { useNavigate } from "react-router-dom";

const GetParticularBlog = () => {
  const navigate = useNavigate();
  const {
    particularBlog,
    partBlog,
    updateSub,
    addSubheadingUpdate,
    deleteSub,
    mainform,
  } = useContext(MyContext);
  const { id } = useParams();
  const URL = process.env.REACT_APP_API_URL;

  const [formData2, setFormData2] = useState({
    title: "",
    description: "",
    conclusion: "",
    created_by: "",
    type: "",
    blogimage: null,
  });

  const [formData1, setFormData1] = useState({
    title: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [selectedSubheading, setSelectedSubheading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData2({ ...formData2, [name]: files[0] });
    } else {
      setFormData2({ ...formData2, [name]: value });
    }
  };

  const handleFunction = (e) => {
    const { name, value } = e.target;
    if (selectedSubheading) {
      setSelectedSubheading((prev) => ({ ...prev, [name]: value }));
    } else if (isModalOpen) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubheadingChange = (e) => {
    const { name, value } = e.target;
    setFormData1((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSubheading) {
        await updateSub(selectedSubheading, selectedSubheading._id);
        
      } else {
        await addSubheadingUpdate(formData1);
      }
      await partBlog(id);
      setIsModalOpen(false);
      setIsModalOpen1(false);
    } catch (error) {
      console.error("Error updating subheading:", error);
    }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    try {
      await mainform(formData2, id);
      await partBlog(id);
  
      // Navigate after 1 second and replace current route (which has ID)
      setTimeout(() => {
        navigate("/dashboard/getblogs", { replace: true });
      }, 1000);
  
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };
  

  const handleRemove = async (subheadingId) => {
    try {
      const mainFormId = JSON.parse(sessionStorage.getItem("parBlog"));
      if (!mainFormId) {
        return;
      }
      await deleteSub(mainFormId, subheadingId);
      await partBlog(id);
    } catch (error) {
      console.error("Error deleting subheading:", error);
    }
  };

  useEffect(() => {
    partBlog(id);
  }, [id]);

  useEffect(() => {
    if (particularBlog) {
      setFormData2({
        title: particularBlog.title || "",
        description: particularBlog.description || "",
        conclusion: particularBlog.conclusion || "",
        created_by: particularBlog.created_by || "",
        type: particularBlog.type || "",
        blogimage: particularBlog.blogimage || null, // This should be the existing image path
      });
    }
  }, [particularBlog]);
  return (
    <>
      <h1 className="mb-3">Update Blogs</h1>
      {particularBlog && (
        <div className="row g-3 align-items-center">
          <div className="col-md-12">
            <label htmlFor="title" className="form-label fw-semibold fs-5">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData2.title}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-12">
            <label htmlFor="description" className="form-label fw-semibold fs-5">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="3"
              value={formData2.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-md-12">
            <label htmlFor="blogimage" className="form-label fw-semibold fs-5">
              Image
            </label>
            <input
              type="file"
              className="form-control"
              id="blogimage"
              name="blogimage"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData2((prev) => ({
                    ...prev,
                    blogimage: file,
                  }));
                }
              }}
            />

            {(formData2.blogimage && (
              <div className="my-3">
                <img
                  src={
  formData2.blogimage instanceof File
    ? window.URL.createObjectURL(formData2.blogimage)
    : `${URL}/${formData2.blogimage}`
}

                  alt="Blog Preview"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "auto",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    justifyContent: "center",
                  }}
                />
              </div>
            ))}
          </div>

          {particularBlog.subheadingId &&
            particularBlog.subheadingId.map((subheading, index) => (
              <div key={index} className="d-flex col-md-12 align-items-center gap-3">
                <div className="w-75">
                  <label className="form-label fw-semibold fs-5">
                    {`Update Subheading-${index + 1}`}
                  </label>
                  <input
                    className="form-control"
                    name="conclusion"
                    value={`Title - ${subheading.title}`}
                    readOnly
                  />
                </div>
                <div>
                  <button
                    className="btn btn-primary mt-5"
                    onClick={() => {
                      setSelectedSubheading(subheading);
                      setIsModalOpen(true);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-primary mt-5 mx-3"
                    onClick={() => handleRemove(subheading._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

          <div className="col-md-12">
            <label htmlFor="conclusion" className="form-label fw-semibold fs-5">
              Conclusion
            </label>
            <textarea
              className="form-control"
              id="conclusion"
              name="conclusion"
              rows="3"
              value={formData2.conclusion}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-md-6">
            <label htmlFor="created_by" className="form-label fw-semibold fs-5">
              Created By
            </label>
            <input
              type="text"
              className="form-control"
              id="created_by"
              name="created_by"
              value={formData2.created_by}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="type" className="form-label fw-semibold fs-5">
              Type
            </label>
            <select
              className="form-control"
              id="type"
              name="type"
              value={formData2.type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option>Doctor Tips</option>
              <option>Mind &amp; Body</option>
              <option>Monitoring</option>
              <option>Food Lab</option>
              <option>Recipes</option>
              <option>Food &amp; Nutrition</option>
            </select>
          </div>

          <div className="col-auto d-flex align-items-center gap-4">
            <button type="submit" className="btn btn-primary" onClick={handleSubmit1}>
              Update Blog
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFormData1({ title: "", description: "" });
                setIsModalOpen1(true);
              }}
            >
              Add Sub-Heading
            </button>
          </div>
        </div>
      )}

      {/* Subheading Update Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5">Update Subheading</h1>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="col-md-12">
                  <label className="form-label fw-semibold fs-5">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={selectedSubheading?.title || ""}
                    onChange={handleFunction}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold fs-5">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={selectedSubheading?.description || ""}
                    onChange={handleFunction}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subheading Add Modal */}
      {isModalOpen1 && (
        <div className="modal" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5">Add Subheading</h1>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen1(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="col-md-12">
                  <label className="form-label fw-semibold fs-5">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData1.title}
                    onChange={handleAddSubheadingChange}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold fs-5">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={formData1.description}
                    onChange={handleAddSubheadingChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen1(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GetParticularBlog;




