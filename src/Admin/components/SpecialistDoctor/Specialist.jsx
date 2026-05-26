import { useState, useRef, useEffect, useContext } from 'react';
import { MyContext } from "../../../Context/Context";
 
function SpecialistUploadFormSA() {
  const {
    createSpecialist,
    loading // Use loading from context
  } = useContext(MyContext);
 
 
  const [specialists, setSpecialists] = useState('');
 
 
  const [specialistImageFile, setSpecialistImageFile] = useState(null);
 
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
 
  // 4. Ref to programmatically open file dialog
  const fileInputRef = useRef(null);
 
  // Handler for file selection change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
   
    // Clear previous states
    setSpecialistImageFile(null);
    setImagePreviewUrl(null);
 
    if (file) {
        // Basic file type validation
        if (file.type.startsWith('image/')) {
            setSpecialistImageFile(file);
            // Create a local URL for image preview
            setImagePreviewUrl(URL.createObjectURL(file));
        } else {
            alert('Please select a valid image file (PNG, JPEG, etc.).');
            event.target.value = null; // Clear the input
        }
    }
  };
 
  useEffect(() => {
    return () => {
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
    };
  }, [imagePreviewUrl]);
 
 
  const handleUpload = async () => {
    if (!specialists.trim()) {
      alert('Please enter a specialists name');
      return;
    }
   
    if (!specialistImageFile) {
        alert('Please select a specialist image to upload');
        return;
    }
 
    try {
      console.log('Creating specialists:', specialists, 'with file:', specialistImageFile.name);
     
      const result = await createSpecialist({
        name: specialists.trim(),
        imageFile: specialistImageFile, // Pass the file
      });
     
      if (result.success) {
        setSpecialists('');
        setSpecialistImageFile(null);
        setImagePreviewUrl(null); // Clear preview
        if(fileInputRef.current) {
            fileInputRef.current.value = null; // Clear the file input visually
        }
      }
     
    } catch (error) {
      console.error('Error in handleUpload:', error);
    }
  };
 
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-0">Specialist Upload</h1>
                </div>
 
                {/* Form */}
                <div className="row g-3">
                  {/* Specialist Input */}
                  <div className="col-12">
                    <label htmlFor="specialists" className="form-label fw-medium text-dark mb-2">
                      Specialist doctor Name
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3"
                      id="specialists"
                      placeholder="Enter specialists name"
                      value={specialists}
                      onChange={(e) => setSpecialists(e.target.value)}
                      disabled={loading}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
 
                  {/* Image Upload Input and Display */}
                  <div className="col-12">
                    <label htmlFor="specialistImageFile" className="form-label fw-medium text-dark mb-2">
                      Specialist Image
                    </label>
                    <input
                        type="file"
                        id="specialistImageFile"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/gif" // Restrict file types
                        hidden // Hide the default input
                    />
                   
                    {/* Custom File Button */}
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 py-2 rounded-3 fw-medium d-flex align-items-center justify-content-between"
                        onClick={() => !loading && fileInputRef.current.click()} // Open file dialog
                        disabled={loading}
                        style={{ fontSize: '16px' }}
                    >
                        <span>
                            {specialistImageFile
                                ? specialistImageFile.name.length > 30
                                    ? specialistImageFile.name.substring(0, 27) + '...'
                                    : specialistImageFile.name
                                : 'Choose Image File'}
                        </span>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 0 1-.708-.708l3-3z"/>
                        </svg>
                    </button>
                    {specialistImageFile && (
                        <small className="text-success mt-1 d-block">
                           File selected: {specialistImageFile.name}
                        </small>
                    )}
                  </div>
                 
                  {/* --- Image Preview Section --- */}
                  {imagePreviewUrl && (
                    <div className="col-12 mt-3 text-center">
                        <label className="form-label fw-medium text-dark mb-2">
                           Image Preview
                        </label>
                        <div className="border rounded-3 p-2 bg-white">
                            <img
                                src={imagePreviewUrl}
                                alt="Specialist Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain'
                                }}
                                className="img-fluid rounded-2"
                            />
                        </div>
                    </div>
                  )}
                  {/* --- End Image Preview Section --- */}
 
 
                  {/* Upload Button */}
                  <div className="col-12 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary w-100 py-3 rounded-3 fw-medium"
                      onClick={handleUpload}
                      disabled={loading}
                      style={{ fontSize: '16px' }}
                    >
                      {loading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            style={{ width: '16px', height: '16px' }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="me-2"
                            viewBox="0 0 16 16"
                          >
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 0 1-.708-.708l3-3z"/>
                          </svg>
                          Upload Specialist
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default SpecialistUploadFormSA;
 