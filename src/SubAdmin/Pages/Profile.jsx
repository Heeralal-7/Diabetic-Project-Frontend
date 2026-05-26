import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "../../Context/Context";

function SubAdminProfile() {
  const { getSubAdminProfile, updateSubAdminProfile } = useContext(MyContext);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await getSubAdminProfile();
      if (result.success === 1) {
        setProfile({
          name: result.data.name || "",
          email: result.data.email || "",
          image: null
        });
        // Set image preview with full path
        if (result.data.image) {
          const fullImagePath = `${process.env.REACT_APP_API_URL}/${result.data.image}`;
          setImagePreview(fullImagePath);
        }
      } else {
        setMessage(result.message || "Failed to fetch profile");
      }
    } catch (error) {
      setMessage("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should be less than 5MB");
        return;
      }

      setProfile(prev => ({
        ...prev,
        image: file
      }));

      // Create preview for new image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setMessage(""); // Clear any previous messages
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage("");

    // Basic validation
    if (!profile.name.trim() || !profile.email.trim()) {
      setMessage("Please fill in all required fields");
      setUpdateLoading(false);
      return;
    }

    try {
      const result = await updateSubAdminProfile(profile);
      if (result.success === 1) {
        setMessage("Profile updated successfully!");
        // Reset image file after successful upload
        setProfile(prev => ({
          ...prev,
          image: null
        }));
        // Refresh profile data to get updated image path
        await fetchProfile();
      } else {
        setMessage(result.message || "Failed to update profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    
    // If it's already a data URL (new upload preview), return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's a relative path from backend, prepend the base URL
    if (imagePath.startsWith('/')) {
      return `${URL}${imagePath}`;
    }
    
    return imagePath;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-4 border-0 rounded-4 rounded-bottom-0">
                <h2 className="h4 fw-bold text-dark text-center mb-0">
                  SubAdmin Profile
                </h2>
              </div>
              <div className="card-body p-4 p-md-5">
                {message && (
                  <div 
                    className={`alert ${
                      message.includes("successfully") 
                        ? "alert-success" 
                        : message.includes("Error") || message.includes("Failed")
                        ? "alert-danger"
                        : "alert-warning"
                    } alert-dismissible fade show`}
                    role="alert"
                  >
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage("")}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Profile Image */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <img
                        src={getImageUrl(imagePreview)}
                        alt="Profile"
                        className="rounded-circle border"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <label 
                        htmlFor="imageUpload"
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
                        style={{ 
                          cursor: "pointer",
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <i className="fas fa-camera fa-sm"></i>
                      </label>
                      <input
                        type="file"
                        id="imageUpload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        Click camera icon to change photo (Max 5MB)
                      </small>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubAdminProfile;