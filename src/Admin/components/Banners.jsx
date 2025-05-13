
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import axios from "axios";

const URL = process.env.REACT_APP_API_URL;
const tokenS = JSON.parse(sessionStorage.getItem("admin"));

const BannerUploader = ({ type }) => {
  const [Selectfile, setSelectfile] = useState([]);
  const [Preview, setPreview] = useState(null);
  const [Banner, setBanner] = useState([]);
  const [childBoxes, setChildBoxes] = useState(new Array(6).fill(null));
  const [childPreviews, setChildPreviews] = useState(new Array(6).fill(null));

  const handleFilechange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      return alert("You can only upload a maximum of 6 banners.");
    }
    setSelectfile(files);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    if (files[0]) {
      reader.readAsDataURL(files[0]);
    } else {
      setPreview(null);
    }
  };

  const moveToChildBoxes = () => {
    if (Selectfile.length === 0) {
      return alert("No banners to move!");
    }

    const updatedBoxes = [...childBoxes];
    const updatedPreviews = [...childPreviews];
    let index = 0;

    for (let i = 0; i < updatedBoxes.length; i++) {
      if (!updatedBoxes[i] && index < Selectfile.length) {
        updatedBoxes[i] = Selectfile[index];
        const reader = new FileReader();
        reader.onloadend = () => {
          updatedPreviews[i] = reader.result;
          setChildPreviews([...updatedPreviews]);
        };
        reader.readAsDataURL(Selectfile[index]);
        index++;
      }
    }

    setChildBoxes(updatedBoxes);
    setSelectfile([]);
    setPreview(null);
  };

  const handleUpdateBanner = async () => {
    if (!tokenS || !tokenS.token) {
      alert("You must be logged in!");
      return;
    }

    const formData = new FormData();

    childBoxes.forEach((file, index) => {
      if (file) {
        formData.append(`image${index + 1}`, file);
      }
    });

    formData.append("type", type.toString());

    try {
      const { data } = await axios.patch(
        `${URL}/banner-image/updated-banner`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: tokenS.token,
          },
        }
      );

      if (data.success) {
        alert(data.message || "Banners updated successfully!");
        setBanner(data.details || []);
        setChildBoxes(new Array(6).fill(null));
        setChildPreviews(new Array(6).fill(null));
      } else {
        alert(data.message || "Error updating banners.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error updating banners.");
    }
  };

  return (
    <div>
      <h4>
           {type === 0 || type === 1
          ? `Lab ${type}`
          : type === 2
          ? "Home 2"
          : `Pharmacy ${type}`}
      </h4>
      <div className="row gap-3">
        <div className="col-4 px-0">
          <div className="card rounded-4" style={{ height: "400px" }}>
            <div className="card-body">
              <img
                src={Preview || "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"}
                className="card-img-top object-fit-contain"
                style={{ height: "300px" }}
                alt="Preview"
              />
              <div className="mt-3">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFilechange}
                  multiple
                  accept="image/*"
                />
              </div>
              <div className="text-end">
                <button className="ms-auto btn btn-primary" onClick={moveToChildBoxes}>
                  Move to Child
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 border rounded-4 p-3">
          <div className="d-grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {Array.isArray(Banner) && Banner.map((banner, index) => (
              <div key={index} className="p-2 rounded-4 border d-flex flex-column gap-2">
                <img
                  src={banner.image_url}
                  className="rounded-3 object-fit-contain"
                  style={{ height: "200px", width: "200px" }}
                  alt={`Banner ${index + 1}`}
                />
                <button className="btn btn-danger">Remove</button>
              </div>
            ))}
          </div>
          <div className="text-end">
            <button className="ms-auto btn btn-primary" onClick={handleUpdateBanner}>Update Banner</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
        {childBoxes.map((box, index) => (
          <div
            key={index}
            style={{
              width: "150px",
              height: "150px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f9fa",
              position: "relative",
            }}
          >
            {childPreviews[index] ? (
              <img
                src={childPreviews[index]}
                alt={`Child Box ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "5px",
                }}
              />
            ) : (
              <span style={{ color: "#888" }}>Empty</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Banners = () => {
  return (
    <div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((type) => (
        <BannerUploader key={type} type={type} />
      ))}
    </div>
  );
};

export default Banners;
