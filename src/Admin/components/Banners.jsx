import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../Context/Context";

const BannerUploader = ({ type }) => {
  const {
    banners,
    loading,
    error,
    fetchBannersByType,
    updateBanners,
    removeBannerImage,
    clearError
  } = useContext(MyContext); 

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [typeBanners, setTypeBanners] = useState([]);
  const [childBoxes, setChildBoxes] = useState(new Array(6).fill(null));
  const [childPreviews, setChildPreviews] = useState(new Array(6).fill(null));
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  // Get banner type label
  const getBannerTypeLabel = () => {
    switch (type) {
      case 0: return "Lab 0";
      case 1: return "Lab 1";
      case 2: return "Home 2";
      case 3: return "Pharmacy 3";
      case 4: return "Pharmacy 4";
      case 5: return "Pharmacy 5";
      case 6: return "Pharmacy 6";
      case 7: return "Pharmacy 7";
      default: return `Type ${type}`;
    }
  };

  // Fetch banners for this type
  const fetchBanners = async () => {
    const result = await fetchBannersByType(type);
    if (result.success) {
      setTypeBanners(result.data || []);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [type]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Handle modal open
  const openModal = (imageUrl, title = "Banner Image") => {
    setModalImage(imageUrl);
    setModalTitle(title);
    setShowModal(true);
  };

  // Handle modal close
  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
    setModalTitle("");
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      alert("You can only upload a maximum of 6 banners.");
      return;
    }
    setSelectedFiles(files);

    // Show preview of first file
    if (files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setPreview(null);
    }
  };

  const moveToChildBoxes = () => {
    if (selectedFiles.length === 0) {
      alert("No banners to move!");
      return;
    }

    const updatedBoxes = [...childBoxes];
    const updatedPreviews = [...childPreviews];
    let index = 0;

    for (let i = 0; i < updatedBoxes.length; i++) {
      if (!updatedBoxes[i] && index < selectedFiles.length) {
        updatedBoxes[i] = selectedFiles[index];
        const reader = new FileReader();
        reader.onloadend = () => {
          updatedPreviews[i] = reader.result;
          setChildPreviews([...updatedPreviews]);
        };
        reader.readAsDataURL(selectedFiles[index]);
        index++;
      }
    }

    setChildBoxes(updatedBoxes);
    setSelectedFiles([]);
    setPreview(null);
  };

  const handleUpdateBanner = async () => {
    if (childBoxes.every(box => box === null)) {
      alert("Please add banners to boxes first!");
      return;
    }

    const formData = new FormData();

    // Add non-null files to formData
    childBoxes.forEach((file, index) => {
      if (file) {
        formData.append(`image${index + 1}`, file);
      }
    });

    formData.append("type", type.toString());

    const result = await updateBanners(formData);
    
    if (result.success) {
      alert(result.message || "Banners updated successfully!");
      setChildBoxes(new Array(6).fill(null));
      setChildPreviews(new Array(6).fill(null));
      await fetchBanners(); // Refresh banners
    }
  };

  const handleRemoveBanner = async (bannerId, imageField) => {
    if (!window.confirm("Are you sure you want to remove this banner?")) {
      return;
    }

    const result = await removeBannerImage(bannerId, imageField);
    if (result.success) {
      alert("Banner removed successfully!");
      await fetchBanners(); // Refresh banners
    }
  };

  const clearChildBox = (index) => {
    const updatedBoxes = [...childBoxes];
    const updatedPreviews = [...childPreviews];
    
    updatedBoxes[index] = null;
    updatedPreviews[index] = null;
    
    setChildBoxes(updatedBoxes);
    setChildPreviews(updatedPreviews);
  };

  // Get image URL from banner object
  const getImageUrl = (banner, imageField) => {
    const imageUrl = banner[imageField];
    if (imageUrl && imageUrl !== "") {
      return `${process.env.REACT_APP_API_URL}${imageUrl}`;
    }
    return null;
  };

  // Get active images from banner
  const getActiveImages = (banner) => {
    const activeImages = [];
    for (let i = 1; i <= 6; i++) {
      const imageField = `image${i}`;
      const imageUrl = getImageUrl(banner, imageField);
      if (imageUrl) {
        activeImages.push({
          field: imageField,
          url: imageUrl,
          position: i
        });
      }
    }
    return activeImages;
  };

  return (
    <>
      <div className="border rounded-4 p-4 mb-4">
        <h4 className="mb-4">{getBannerTypeLabel()} Banners</h4>
        
        {error && (
          <div className="alert alert-danger mb-4 d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <div className="row gap-3">
          {/* Upload Section */}
          <div className="col-md-4 px-0">
            <div className="card rounded-4" style={{ height: "400px" }}>
              <div className="card-body d-flex flex-column">
                <div 
                  className="card-img-top object-fit-contain flex-grow-1 cursor-pointer"
                  style={{ height: "250px", cursor: preview ? 'pointer' : 'default' }}
                  onClick={() => preview && openModal(preview, "Selected Banner Preview")}
                >
                  <img
                    src={preview || "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}
                    className="w-100 h-100 object-fit-contain"
                    alt="Preview"
                    style={{ cursor: preview ? 'pointer' : 'default' }}
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                  />
                  <small className="text-muted">Select up to 6 images</small>
                </div>
                <div className="text-end mt-2">
                  <button 
                    className="btn btn-primary" 
                    onClick={moveToChildBoxes}
                    disabled={selectedFiles.length === 0}
                  >
                    Move to Boxes ({selectedFiles.length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Banners */}
          <div className="col-md-7">
            <div className="border rounded-4 p-3">
              <h6 className="mb-3">Existing Banners</h6>
              {typeBanners.length > 0 ? (
                <div className="d-grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {typeBanners.map((banner, bannerIndex) => (
                    <React.Fragment key={banner._id}>
                      {getActiveImages(banner).map((image, imageIndex) => (
                        <div key={`${banner._id}-${image.field}`} className="p-2 rounded-4 border d-flex flex-column gap-2 align-items-center">
                          <div 
                            className="w-100 cursor-pointer"
                            onClick={() => openModal(image.url, `Banner Position ${image.position}`)}
                          >
                            <img
                              src={image.url}
                              className="rounded-3 object-fit-cover w-100"
                              style={{ height: "150px", cursor: 'pointer' }}
                              alt={`Banner ${image.position}`}
                            />
                          </div>
                          <small className="text-muted">Position: {image.position}</small>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveBanner(banner._id, image.field)}
                            disabled={loading}
                          >
                            {loading ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No banners found for this type.</p>
              )}
            </div>
          </div>
        </div>

        {/* Child Boxes Preview */}
        <div className="mt-4">
          <h6 className="mb-3">Banners to Upload</h6>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {childBoxes.map((box, index) => (
              <div
                key={index}
                className="border rounded-3 position-relative"
                style={{
                  width: "150px",
                  height: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  cursor: childPreviews[index] ? 'pointer' : 'default'
                }}
                onClick={() => childPreviews[index] && openModal(childPreviews[index], `New Banner Position ${index + 1}`)}
              >
                {childPreviews[index] ? (
                  <>
                    <img
                      src={childPreviews[index]}
                      alt={`Banner ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: 'pointer'
                      }}
                    />
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearChildBox(index);
                      }}
                      style={{ width: "25px", height: "25px", padding: 0 }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-muted">Empty</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Update Button */}
        <div className="text-end mt-4">
          <button 
            className="btn btn-success px-4"
            onClick={handleUpdateBanner}
            disabled={loading || childBoxes.every(box => box === null)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Updating...
              </>
            ) : (
              "Update Banners"
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          tabIndex="-1"
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-xl" style={{
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh"
  }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 bg-transparent">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">{modalTitle}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img
                  src={modalImage}
                  alt={modalTitle}
                  className="img-fluid rounded-3"
                  style={{ 
                    maxHeight: '80vh', 
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div className="modal-footer border-0 justify-content-center pt-2">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={closeModal}
                >
                  Close
                </button>
                <a
                  href={modalImage}
                  download
                  className="btn btn-primary ms-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Banners = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Banner Management</h2>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((type) => (
            <BannerUploader key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banners;