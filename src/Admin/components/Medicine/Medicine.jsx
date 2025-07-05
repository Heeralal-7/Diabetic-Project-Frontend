import { useState, useRef, useEffect, useContext } from 'react';
import "../../Assests/css/medical.css"
import { MyContext } from "../../../Context/Context";

function Medicines() {
  const {
    Medicines,
    getMedicines,
    updateMedicine,
    uploadMedicineExcel, // Added from context
    isUploading // Added from context
  } = useContext(MyContext);

  // State for scroll toggle and edit mode
  const [showScrollToggle, setShowScrollToggle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editableMedicines, setEditableMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [savingMedicine, setSavingMedicine] = useState(null);
  const scrollContainerRef = useRef(null);

  // NEW STATE FOR EXCEL UPLOAD
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load medicines data on component mount
  useEffect(() => {
    getMedicines();
  }, []);

  // Update editable medicines when Medicines context changes
  useEffect(() => {
    if (Medicines && Medicines.length > 0) {
      setEditableMedicines([...Medicines]);
    }
  }, [Medicines]);

  // Get current medicines based on edit mode
  const currentMedicines = editableMedicines.length > 0 ? editableMedicines : Medicines;

  // Show toggle button when scrollbar is needed
  useEffect(() => {
    const checkScrollWidth = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollToggle(scrollWidth > clientWidth);
      }
    };
    
    checkScrollWidth();
    window.addEventListener('resize', checkScrollWidth);

    return () => {
      window.removeEventListener('resize', checkScrollWidth);
    };
  }, [currentMedicines]);

  // Toggle full view (scroll to end) function
  const toggleFullView = () => {
    if (scrollContainerRef.current) {
      if (!isExpanded) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      } else {
        scrollContainerRef.current.scrollLeft = 0;
      }
      setIsExpanded(!isExpanded);
    }
  };

  // NEW: EXCEL UPLOAD HANDLERS
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['.xlsx', '.xls', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension) && !validTypes.includes(file.type)) {
      alert("Please select a valid Excel file (.xlsx or .xls)");
      e.target.value = ''; // Reset input
      return;
    }
    
    setExcelFile(file);
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select a file first");
      return;
    }
    
    try {
      await uploadMedicineExcel(excelFile);
      // Clear file input after upload
      setExcelFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh medicines data
      getMedicines();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Enhanced Edit function with API integration
  const handleEdit = async (medicineId) => {
    if (editingRowId === medicineId) {
      // Save changes for specific medicine
      setSavingMedicine(medicineId); // Set loading state
      
      try {
        const updatedMedicine = editableMedicines.find(med => med._id === medicineId);
        console.log("Saving changes for medicine:", updatedMedicine);
        
        // Prepare medicine data for API (exclude _id and other system fields)
        const medicineData = {
          Id: updatedMedicine.Id,
          name: updatedMedicine.name,
          manufacturers: updatedMedicine.manufacturers,
          salt_composition: updatedMedicine.salt_composition,
          mrp: updatedMedicine.mrp,
          best_price: updatedMedicine.best_price,
          discont_percent: updatedMedicine.discont_percent,
          prescription_required: updatedMedicine.prescription_required,
          packaging: updatedMedicine.packaging,
          expectedDelivery: updatedMedicine.expectedDelivery,
          rating: updatedMedicine.rating,
          bread_crumb: updatedMedicine.bread_crumb,
          storage: updatedMedicine.storage,
          for_sale: updatedMedicine.for_sale,
          primary_use: updatedMedicine.primary_use,
          introduction: updatedMedicine.introduction,
          how_to_use: updatedMedicine.how_to_use,
          how_works: updatedMedicine.how_works,
          side_effect: updatedMedicine.side_effect,
          safety_advise: updatedMedicine.safety_advise,
          alternate_brand: updatedMedicine.alternate_brand,
          url: updatedMedicine.url
        };

        // Call API to update medicine
        const result = await updateMedicine(medicineId, medicineData);
        
        if (result.success) {
          console.log("Medicine updated successfully:", result.data);
          setEditingRowId(null);
          // Refresh medicines data to get updated information
          getMedicines();
        } else {
          console.error("Failed to update medicine:", result.error);
          // You might want to revert changes or show an error message
        }
      } catch (error) {
        console.error("Error during medicine update:", error);
      } finally {
        setSavingMedicine(null); // Clear loading state
      }
    } else {
      // Enter edit mode for specific medicine
      if (editableMedicines.length === 0) {
        setEditableMedicines([...Medicines]);
      }
      setEditingRowId(medicineId);
    }
  };

  // Check if specific row is in edit mode
  const isRowInEditMode = (medicineId) => {
    return editingRowId === medicineId;
  };

  // Check if medicine is being saved
  const isMedicineSaving = (medicineId) => {
    return savingMedicine === medicineId;
  };

  // Handle input change in edit mode
  const handleInputChange = (id, field, value) => {
    setEditableMedicines(editableMedicines.map(medicine =>
      medicine._id === id ? { ...medicine, [field]: value } : medicine
    ));
  };

  // Show medicine details
  const showDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailModal(true);
  };

  // Format safety advice for display
  const formatSafetyAdvice = (safetyAdvice) => {
    if (!safetyAdvice) return 'N/A';
    return safetyAdvice.split(' | ').map((advice, index) => (
      <div key={index} className="mb-2">
        <strong>{advice.split(' : ')[0]}:</strong> {advice.split(' : ')[1]}
      </div>
    ));
  };

  // Format side effects for display
  const formatSideEffects = (sideEffects) => {
    if (!sideEffects) return 'N/A';
    return sideEffects.split(' | ').map((effect, index) => (
      <span key={index} className="badge text-dark me-1 mb-1 bg-light text-wrap text-start fw-semibold" style={{lineHeight:'15px'}}>{effect}</span>
    ));
  };

  // Show loading if no medicines data
  if (!currentMedicines || currentMedicines.length === 0) {
    return (
      <div className="container-fluid px-4 py-5">
        <h1 className="display-5 fw-bold mb-4 text-center text-primary">Medicines</h1>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading medicines data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* FOR UPLOAD MEDITION EXCEL FILE Start - UPDATED SECTION */}
      <div className="container-fluid p-4">
        <h2 className="mb-4 text-primary">Upload Medicine</h2>
        <div className='row'>
          <div className='col-md-8'>
            <form onSubmit={handleExcelUpload}>
              <div className="mb-3">
                <label className="form-label fw-bold fs-5">Upload Excel File:</label>
                <input 
                  type="file" 
                  className="form-control shadow-none py-2" 
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                <div className="form-text">
                  Only Excel files (.xlsx, .xls) are accepted
                </div>
                <div className="mt-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-5 py-2"
                    disabled={!excelFile || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* FOR UPLOAD MEDITION EXCEL FILE End */}

      <div className="container-fluid px-4 py-5">
        <h1 className="display-5 fw-bold mb-4 text-center text-primary">Medicine</h1>
        <div className="position-relative">
          <div
            ref={scrollContainerRef}
            className="table-responsive custom-scrollbar"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <table className="table table-bordered table-striped align-middle">
              <thead className="sticky-top">
                <tr>
                  <th className="table-header-custom" style={{ minWidth: "60px" }}>S.No</th>
                  <th className="table-header-custom" style={{ minWidth: "80px" }}>ID</th>
                  <th className="table-header-custom" style={{ minWidth: "150px" }}>Medicine Name</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>Manufacturer</th>
                  <th className="table-header-custom" style={{ minWidth: "180px" }}>Salt Composition</th>
                  <th className="table-header-custom" style={{ minWidth: "100px" }}>MRP</th>
                  <th className="table-header-custom" style={{ minWidth: "100px" }}>Best Price</th>
                  <th className="table-header-custom" style={{ minWidth: "80px" }}>Discount %</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>Prescription Required</th>
                  <th className="table-header-custom" style={{ minWidth: "100px" }}>Packaging</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>Expected Delivery</th>
                  <th className="table-header-custom" style={{ minWidth: "80px" }}>Rating</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>Bread Crumb</th>
                  <th className="table-header-custom" style={{ minWidth: "100px" }}>Storage</th>
                  <th className="table-header-custom" style={{ minWidth: "100px" }}>For Sale</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>More Information</th>
                  <th className="table-header-custom" style={{ minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMedicines.map((medicine, index) => (
                  <tr key={medicine._id || index}>
                    <td className="text-center fw-medium">{index + 1}</td>
                    
                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.Id || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'Id', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "80px" }}
                        />
                      ) : (
                        medicine.Id || 'N/A'
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.name || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'name', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "150px" }}
                        />
                      ) : (
                        <span className="fw-medium text-primary">{medicine.name || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.manufacturers || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'manufacturers', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "120px" }}
                        />
                      ) : (
                        medicine.manufacturers || 'N/A'
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <textarea
                          value={medicine.salt_composition || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'salt_composition', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "180px", minHeight: "60px" }}
                          rows="2"
                        />
                      ) : (
                        <span className="text-muted small">{medicine.salt_composition || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.mrp || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'mrp', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "100px" }}
                        />
                      ) : (
                        <span className="fw-medium">{medicine.mrp || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.best_price || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'best_price', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "100px" }}
                        />
                      ) : (
                        <span className="fw-medium text-success">{medicine.best_price || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.discont_percent || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'discont_percent', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "80px" }}
                        />
                      ) : (
                        <span className="badge bg-info">{medicine.discont_percent || '0%'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <select
                          value={medicine.prescription_required || 'NO'}
                          onChange={(e) => handleInputChange(medicine._id, 'prescription_required', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "120px" }}
                        >
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      ) : (
                        <span className={`badge ${medicine.prescription_required === 'YES' ? 'bg-warning' : 'bg-success'}`}>
                          {medicine.prescription_required || 'NO'}
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.packaging || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'packaging', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "100px" }}
                        />
                      ) : (
                        medicine.packaging || 'N/A'
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.expectedDelivery || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'expectedDelivery', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "120px" }}
                        />
                      ) : (
                        <span className="badge bg-info">{medicine.expectedDelivery || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="number"
                          value={medicine.rating || 0}
                          onChange={(e) => handleInputChange(medicine._id, 'rating', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "80px" }}
                          min="0"
                          max="5"
                          step="0.1"
                        />
                      ) : (
                        <div>
                          <span className="fw-medium">{medicine.rating || 0}</span>
                          <div className="text-warning">
                            {'★'.repeat(Math.floor(medicine.rating || 0))}
                            {'☆'.repeat(5 - Math.floor(medicine.rating || 0))}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.bread_crumb || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'bread_crumb', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "120px" }}
                        />
                      ) : (
                        <span className="small text-muted">{medicine.bread_crumb || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      {isRowInEditMode(medicine._id) ? (
                        <input
                          type="text"
                          value={medicine.storage || ''}
                          onChange={(e) => handleInputChange(medicine._id, 'storage', e.target.value)}
                          className="form-control shadow-none form-control shadow-none-sm text-center"
                          style={{ minWidth: "100px" }}
                        />
                      ) : (
                        <span className="small">{medicine.storage || 'N/A'}</span>
                      )}
                    </td>

                    <td className="text-center">
                      <span className={`badge ${medicine.for_sale === 'FOR SALE' ? 'bg-success' : 'bg-danger'}`}>
                        {medicine.for_sale || 'NOT FOR SALE'}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-info btn-sm d-flex align-items-center text-white fw-semibold py-2 mx-auto"
                        onClick={() => showDetails(medicine)}
                        title="View Details"
                      >
                        See more...
                      </button>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1 flex-wrap">
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center"
                          onClick={handleExcelUpload}
                          title="Upload"
                        >
                          <i className="fas fa-upload me-1"></i>
                          Upload
                        </button>
                        <button
                          className="btn btn-warning btn-sm d-flex align-items-center"
                          onClick={() => handleEdit(medicine._id)}
                          title={isRowInEditMode(medicine._id) ? 'Save Changes' : 'Edit Medicine'}
                          disabled={isMedicineSaving(medicine._id)}
                        >
                          {isMedicineSaving(medicine._id) ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className={`fas ${isRowInEditMode(medicine._id) ? 'fa-save' : 'fa-edit'} me-1`}></i>
                              {isRowInEditMode(medicine._id) ? 'Save' : 'Edit'}
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toggle button in scroll track */}
          {showScrollToggle && (
            <button
              className="btn btn-light btn-sm position-absolute scroll-toggle-btn"
              onClick={toggleFullView}
              title={isExpanded ? "Show start" : "Show all"}
              style={{ bottom: '20px', right: '20px', zIndex: 10 }}
            >
              <i className={`fas ${isExpanded ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
            </button>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedMedicine && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-pills me-2"></i>
                    {selectedMedicine.name} - Detailed Information
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">Basic Information</h6>
                        </div>
                        <div className="card-body">
                          <p><strong>Medicine ID:</strong> {selectedMedicine.Id}</p>
                          <p><strong>Name:</strong> {selectedMedicine.name}</p>
                          <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturers}</p>
                          <p><strong>Salt Composition:</strong> {selectedMedicine.salt_composition}</p>
                          <p className=''><strong>Primary Use:</strong> <span className="badge   p-0 pt-1 text-start text-wrap text-muted fw-medium">{selectedMedicine.primary_use || 'N/A'}</span></p>
                          <p><strong>Packaging:</strong> {selectedMedicine.packaging || 'N/A'}</p>
                          <p><strong>Storage:</strong> {selectedMedicine.storage}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">Pricing & Availability</h6>
                        </div>
                        <div className="card-body">
                          <p><strong>MRP:</strong> {selectedMedicine.mrp || 'N/A'}</p>
                          <p><strong>Best Price:</strong> {selectedMedicine.best_price || 'N/A'}</p>
                          <p><strong>Discount:</strong> {selectedMedicine.discont_percent || '0%'}</p>
                          <p><strong>Expected Delivery:</strong> {selectedMedicine.expectedDelivery}</p>
                          <p><strong>Rating:</strong> {selectedMedicine.rating || 0}/5</p>
                          <p><strong>Prescription Required:</strong> 
                            <span className={`badge ms-2 ${selectedMedicine.prescription_required === 'YES' ? 'bg-warning' : 'bg-success'}`}>
                              {selectedMedicine.prescription_required}
                            </span>
                          </p>
                          <p><strong>For Sale:</strong> 
                            <span className={`badge ms-2 ${selectedMedicine.for_sale === 'FOR SALE' ? 'bg-success' : 'bg-danger'}`}>
                              {selectedMedicine.for_sale}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Description & Usage</h6>
                        </div>
                        <div className="card-body">
                          <p><strong>Introduction:</strong></p>
                          <p className="text-muted">{selectedMedicine.introduction}</p>
                          
                          <p><strong>How to Use:</strong></p>
                          <p className="text-muted">{selectedMedicine.how_to_use}</p>
                          
                          <p><strong>How it Works:</strong></p>
                          <p className="text-muted">{selectedMedicine.how_works}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">Side Effects</h6>
                        </div>
                        <div className="card-body text-wrap">
                          <div className="">
                        <p className=''> {formatSideEffects(selectedMedicine.side_effect)}</p>
                          </div>
                        
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">Safety Advice</h6>
                        </div>
                        <div className="card-body">
                          {formatSafetyAdvice(selectedMedicine.safety_advise)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedMedicine.alternate_brand && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header">
                            <h6 className="mb-0">Alternative Brands</h6>
                          </div>
                          <div className="card-body">
                            <p className="text-muted small">{selectedMedicine.alternate_brand}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </button>
                  {selectedMedicine.url && (
                    <a
                      href={selectedMedicine.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <i className="fas fa-external-link-alt me-1"></i>
                      View on 1mg
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Medicines;