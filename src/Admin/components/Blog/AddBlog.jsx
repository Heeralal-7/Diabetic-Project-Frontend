import React, { useContext, useState } from "react";
import { MyContext } from "../../../Context/Context";
import { useNavigate } from "react-router-dom";

const AddBlog = () => {
  const { addBlog } = useContext(MyContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    conclusion: "",
    created_by: "",
    type: "",
    blogimage: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    let validationErrors = {};

    if (!formData.title || formData.title.length < 3) {
      validationErrors.title = "Title is required and should be at least 3 characters long.";
    }

    if (!formData.description || formData.description.length < 10) {
      validationErrors.description = "Description is required and should be at least 10 characters long.";
    }

    if (!formData.conclusion || formData.conclusion.length < 5) {
      validationErrors.conclusion = "Conclusion is required and should be at least 5 characters long.";
    }

    if (!formData.created_by || formData.created_by.length < 3) {
      validationErrors.created_by = "Creator's name is required and should be at least 3 characters long.";
    }

    if (!formData.type) {
      validationErrors.type = "Please select a blog type.";
    }

    if (!formData.blogimage) {
      validationErrors.blogimage = "Please upload an image.";
    } else {
      const fileExtension = formData.blogimage.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
        validationErrors.blogimage = "Please upload a valid image (jpg, jpeg, png, gif).";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }

      addBlog(data);
      navigate("/dashboard/addblogSubheading");
    }
  };

  return (
    <>
      <h1>Add Blog</h1>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-12">
          <label htmlFor="title" className="form-label fw-semibold fs-5">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && <p className="text-danger">{errors.title}</p>}
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
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          {errors.description && <p className="text-danger">{errors.description}</p>}
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
            onChange={handleChange}
          />
          {errors.blogimage && <p className="text-danger">{errors.blogimage}</p>}
        </div>

        {imagePreview && (
          <div className="col-md-12">
            <label className="form-label fw-semibold fs-5">Image Preview</label>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "250px",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #ddd",
                  padding: "5px",
                }}
              />
            </div>
          </div>
        )}

        <div className="col-md-12">
          <label htmlFor="conclusion" className="form-label fw-semibold fs-5">
            Conclusion
          </label>
          <textarea
            className="form-control"
            id="conclusion"
            name="conclusion"
            rows="3"
            value={formData.conclusion}
            onChange={handleChange}
          ></textarea>
          {errors.conclusion && <p className="text-danger">{errors.conclusion}</p>}
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
            value={formData.created_by}
            onChange={handleChange}
          />
          {errors.created_by && <p className="text-danger">{errors.created_by}</p>}
        </div>
        <div className="col-md-6">
          <label htmlFor="type" className="form-label fw-semibold fs-5">
            Type
          </label>
          <select
            className="form-control"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="Doctor Tips">Doctor Tips</option>
            <option value="Mind & Body">Mind & Body</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Food Lab">Food Lab</option>
            <option value="Recipes">Recipes</option>
            <option value="Food & Nutrition">Food & Nutrition</option>
          </select>
          {errors.type && <p className="text-danger">{errors.type}</p>}
        </div>
        <div className="col-12 d-flex align-items-center gap-4">
          <button type="submit" className="btn btn-primary">
            Add Blog
          </button>
        </div>
      </form>
    </>
  );
};

export default AddBlog;
