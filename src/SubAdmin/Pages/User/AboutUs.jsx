import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../../Context/Context";

const SubadminAboutUsEditor = () => {
  const {
    subAdminAboutUsData,
    loading,
    error,
    getSubAdminAboutUs,
    updateSubAdminAboutUs,
    uploadSubAdminAboutUsImage,
    clearError,
  } = useContext(MyContext);

  const [formData, setFormData] = useState({
    heroTitle: "",
    heroDescription: "",
    heroImage: "",
    mainTitle: "",
    mainDescription: "",
    mainImage: "",
    leftFeatures: [],
    rightFeatures: [],
    additionalContent: "",
    priorityStatement: "",
    moreAboutTitle: "",
    moreAboutDescription: "",
    moreAboutImage: "",
    moreAboutSideImage: "",
    moreAboutSideDescription: "",
    stats: {
      patientReviews: "",
      googleRating: "",
    },
    cards: [],
    missionVision: [],
    insuranceTitle: "",
    insuranceLogos: [],
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSubAdminAboutUs();
  }, []);

  useEffect(() => {
    if (subAdminAboutUsData) setFormData(subAdminAboutUsData);
  }, [subAdminAboutUsData]);

  const input = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nestedInput = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: { ...formData[parent], [field]: value },
    });
  };

  const arrayInput = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const objectArrayInput = (field, index, key, value) => {
    const updated = [...formData[field]];
    updated[index][key] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addItem = (field, defaultValue) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultValue] });
  };

  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const uploadImage = async (file, field) => {
    const res = await uploadSubAdminAboutUsImage(file);
    if (res.success) {
      setFormData({ ...formData, [field]: res.data.imageUrl });
    }
  };

  const uploadArrayImage = async (file, field, index) => {
    const res = await uploadSubAdminAboutUsImage(file);
    if (res.success) {
      const updated = [...formData[field]];
      updated[index] = res.data.imageUrl;
      setFormData({ ...formData, [field]: updated });
    }
  };

  const uploadCardImage = async (file, index) => {
    const res = await uploadSubAdminAboutUsImage(file);
    if (res.success) {
      const updated = [...formData.cards];
      updated[index].image = res.data.imageUrl;
      setFormData({ ...formData, cards: updated });
    }
  };

  const saveData = async () => {
    setSaving(true);
    await updateSubAdminAboutUs(formData);
    setSaving(false);
  };

  if (loading && !formData.heroTitle) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Subadmin — Edit About Us</h2>
        <button className="btn btn-primary" onClick={saveData} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* {error && (
        <div className="alert alert-danger">
          {error}{" "}
          <button onClick={clearError} className="btn-close float-end"></button>
        </div>
      )} */}

      {/* -------------------------------------------- */}
      {/*               HERO SECTION                   */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>Hero Section</h4>

        <label className="mt-3">Hero Title</label>
        <input
          className="form-control"
          name="heroTitle"
          value={formData.heroTitle}
          onChange={input}
        />

        <label className="mt-3">Hero Description</label>
        <textarea
          className="form-control"
          name="heroDescription"
          value={formData.heroDescription}
          onChange={input}
        />

        <label className="mt-3">Hero Image</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => uploadImage(e.target.files[0], "heroImage")}
        />

        {formData.heroImage && (
          <img
            src={formData.heroImage}
            className="img-fluid mt-3 rounded"
            width="250"
            alt=""
          />
        )}
      </div>

      {/* -------------------------------------------- */}
      {/*                MAIN SECTION                   */}
      {/* -------------------------------------------- */}

      <div className="card p-4 mb-4">
        <h4>Main Section</h4>

        <label className="mt-3">Main Title</label>
        <input
          className="form-control"
          name="mainTitle"
          value={formData.mainTitle}
          onChange={input}
        />

        <label className="mt-3">Main Description</label>
        <textarea
          className="form-control"
          name="mainDescription"
          value={formData.mainDescription}
          onChange={input}
        />

        <label className="mt-3">Main Image</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => uploadImage(e.target.files[0], "mainImage")}
        />

        {formData.mainImage && (
          <img
            src={formData.mainImage}
            className="img-fluid mt-3 rounded"
            width="250"
            alt=""
          />
        )}

        {/* Left features */}
        <h5 className="mt-4">Left Features</h5>
        {formData.leftFeatures.map((item, i) => (
          <div key={i} className="d-flex gap-2 mb-2">
            <input
              className="form-control"
              value={item}
              onChange={(e) =>
                arrayInput("leftFeatures", i, e.target.value)
              }
            />
            <button
              className="btn btn-danger"
              onClick={() => removeItem("leftFeatures", i)}
            >
              X
            </button>
          </div>
        ))}
        <button
          className="btn btn-secondary mt-2"
          onClick={() => addItem("leftFeatures", "")}
        >
          + Add Left Feature
        </button>

        {/* Right features */}
        <h5 className="mt-4">Right Features</h5>
        {formData.rightFeatures.map((item, i) => (
          <div key={i} className="d-flex gap-2 mb-2">
            <input
              className="form-control"
              value={item}
              onChange={(e) =>
                arrayInput("rightFeatures", i, e.target.value)
              }
            />
            <button
              className="btn btn-danger"
              onClick={() => removeItem("rightFeatures", i)}
            >
              X
            </button>
          </div>
        ))}
        <button
          className="btn btn-secondary mt-2"
          onClick={() => addItem("rightFeatures", "")}
        >
          + Add Right Feature
        </button>
      </div>

      {/* -------------------------------------------- */}
      {/*                STATISTICS                     */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>Statistics</h4>

        <label className="mt-3">Patient Reviews</label>
        <input
          className="form-control"
          value={formData.stats.patientReviews}
          onChange={(e) =>
            nestedInput("stats", "patientReviews", e.target.value)
          }
        />

        <label className="mt-3">Google Rating</label>
        <input
          className="form-control"
          value={formData.stats.googleRating}
          onChange={(e) =>
            nestedInput("stats", "googleRating", e.target.value)
          }
        />
      </div>

      {/* -------------------------------------------- */}
      {/*                 CARDS SECTION                 */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>Cards</h4>

        {formData.cards.map((card, i) => (
          <div key={i} className="border p-3 rounded mb-3">

            <label>Title</label>
            <input
              className="form-control"
              value={card.title}
              onChange={(e) =>
                objectArrayInput("cards", i, "title", e.target.value)
              }
            />

            <label className="mt-2">Description</label>
            <textarea
              className="form-control"
              value={card.description}
              onChange={(e) =>
                objectArrayInput("cards", i, "description", e.target.value)
              }
            />

            <label className="mt-2">Image</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => uploadCardImage(e.target.files[0], i)}
            />

            {card.image && (
              <img
                src={card.image}
                width="180"
                className="mt-2 rounded"
                alt=""
              />
            )}

            <button
              className="btn btn-danger mt-2"
              onClick={() => removeItem("cards", i)}
            >
              Delete Card
            </button>
          </div>
        ))}

        <button
          className="btn btn-secondary"
          onClick={() =>
            addItem("cards", {
              title: "",
              description: "",
              image: "",
            })
          }
        >
          + Add Card
        </button>
      </div>

      {/* -------------------------------------------- */}
      {/*              MISSION / VISION                 */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>Mission / Vision Section</h4>

        {formData.missionVision.map((mv, i) => (
          <div key={i} className="border rounded p-3 mt-3">

            <label>Title</label>
            <input
              className="form-control"
              value={mv.title}
              onChange={(e) =>
                objectArrayInput("missionVision", i, "title", e.target.value)
              }
            />

            <label className="mt-2">Description</label>
            <textarea
              className="form-control"
              value={mv.description}
              onChange={(e) =>
                objectArrayInput("missionVision", i, "description", e.target.value)
              }
            />

            <button
              className="btn btn-danger mt-3"
              onClick={() => removeItem("missionVision", i)}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          className="btn btn-secondary mt-2"
          onClick={() =>
            addItem("missionVision", { title: "", description: "" })
          }
        >
          + Add Mission/Vision
        </button>
      </div>

      {/* -------------------------------------------- */}
      {/*              MORE ABOUT US                   */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>More About Us</h4>

        <label className="mt-3">Title</label>
        <input
          className="form-control"
          name="moreAboutTitle"
          value={formData.moreAboutTitle}
          onChange={input}
        />

        <label className="mt-3">Description</label>
        <textarea
          className="form-control"
          name="moreAboutDescription"
          value={formData.moreAboutDescription}
          onChange={input}
        />

        {/* Images */}
        <div className="row mt-3">
          <div className="col-md-6">
            <label>Image</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                uploadImage(e.target.files[0], "moreAboutImage")
              }
            />

            {formData.moreAboutImage && (
              <img
                src={formData.moreAboutImage}
                width="200"
                className="mt-3"
                alt=""
              />
            )}
          </div>

          <div className="col-md-6">
            <label>Side Image</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                uploadImage(e.target.files[0], "moreAboutSideImage")
              }
            />

            {formData.moreAboutSideImage && (
              <img
                src={formData.moreAboutSideImage}
                width="200"
                className="mt-3"
                alt=""
              />
            )}
          </div>
        </div>

        <label className="mt-3">Side Description</label>
        <textarea
          className="form-control"
          name="moreAboutSideDescription"
          value={formData.moreAboutSideDescription}
          onChange={input}
        />
      </div>

      {/* -------------------------------------------- */}
      {/*              INSURANCE SECTION                */}
      {/* -------------------------------------------- */}
      <div className="card p-4 mb-4">
        <h4>Insurance Section</h4>

        <label>Insurance Title</label>
        <input
          className="form-control"
          name="insuranceTitle"
          value={formData.insuranceTitle}
          onChange={input}
        />

        <h5 className="mt-4">Insurance Logos</h5>

        {formData.insuranceLogos.map((logo, i) => (
          <div className="d-flex gap-3 mt-2" key={i}>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                uploadArrayImage(e.target.files[0], "insuranceLogos", i)
              }
            />

            {logo && <img src={logo} width="120" alt="" />}

            <button
              className="btn btn-danger"
              onClick={() => removeItem("insuranceLogos", i)}
            >
              X
            </button>
          </div>
        ))}

        <button
          className="btn btn-secondary mt-3"
          onClick={() => addItem("insuranceLogos", "")}
        >
          + Add Insurance Logo
        </button>
      </div>
    </div>
  );
};

export default SubadminAboutUsEditor;
