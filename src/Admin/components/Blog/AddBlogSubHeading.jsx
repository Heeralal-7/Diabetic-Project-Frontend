import React, { useContext, useState } from "react";
import { MyContext } from "../../../Context/Context";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AddBlogSubHeading = () => {
  const navigate = useNavigate();
  const { addSubheading } = useContext(MyContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;


    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <div className="my-4">
        <form
          className="row g-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.title || !formData.description) {
              alert("Both title and description are required!");
              return;
            }
            addSubheading(formData);
            setFormData({ title: "", description: "" });
            // Navigate to /getblogs after submission
              navigate("/dashboard/getblogs");
          }}
        >
          <div className="col-md-12">
            <label htmlFor="title" className="form-label fw-semibold fs-5">
              Sub-Tittle
            </label>
            <input
              type="Tittle"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            
            />
          </div>
          <div className="col-md-12">
            <label
              htmlFor="description"
              className="form-label fw-semibold fs-5"
            >
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
            ></textarea>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <Link
              type="button"
              to={"/dashboard/getblogs"}
              className="btn btn-primary mx-2"
            >
              Skip
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogSubHeading;
