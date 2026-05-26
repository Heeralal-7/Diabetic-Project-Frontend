import React, { useState, useRef, useEffect, useContext, useMemo, useCallback } from 'react';
import "../../../Css/medical.css";
import "../../../Css/MedicineProduct.css";
import { MyContext } from "../../../../Context/Context";

// A memoized Image component to prevent unnecessary re-renders.
const MedicineImage = React.memo(({ src, alt, className, style, onError }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={style}
      onError={onError}
      loading="lazy"
    />
  );
});

function Medicines() {
  const {
    medicinesSub:Medicines,
    getAllMedicinesSubadmin:getMedicines,
    updateMedicineSubadmin:updateMedicine,
    uploadMedicineExcelSubadmin:uploadMedicineExcel, 
    isUploading,
    deleteMedicineSubadmin:deleteMedicine,
    deleteMultipleMedicinesSubadmin:deleteMultipleMedicines,
    isDeleting
  } = useContext(MyContext);

  // Component State
  const [editingRowId, setEditingRowId] = useState(null);
  const [editableMedicines, setEditableMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [savingMedicine, setSavingMedicine] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Default visible columns
  const [visibleColumns, setVisibleColumns] = useState(new Set([
    'Id', 'name', 'manufacturers', 'mrp', 'best_price', 'prescription_required', 'for_sale', 'actions', 'image_url'
  ]));

  const dummyImages = useMemo(() => [
    "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
    "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
    "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg"
  ], []);
  
  // Memoized table headers
  const tableHeaders = useMemo(() => [
    { key: 'Id', label: 'ID' },
    { key: 'name', label: 'Medicine Name' },
    { key: 'manufacturers', label: 'Manufacturer' },
    { key: 'salt_composition', label: 'Salt Composition' },
    { key: 'packaging', label: 'Packaging' },
    { key: 'mrp', label: 'MRP' },
    { key: 'best_price', label: 'Best Price' },
    { key: 'discont_percent', label: 'Discount %' },
    { key: 'prescription_required', label: 'Prescription Required' },
    { key: 'image_url', label: 'Image' },
    { key: 'primary_use', label: 'Primary Use' },
    { key: 'description', label: 'Description' },
    { key: 'storage', label: 'Storage' },
    { key: 'introduction', label: 'Introduction' },
    { key: 'use_of', label: 'Use Of' },
    { key: 'benefits', label: 'Benefits' },
    { key: 'side_effect', label: 'Side Effects' },
    { key: 'how_to_use', label: 'How to Use' },
    { key: 'how_works', label: 'How it Works' },
    { key: 'safety_advise', label: 'Safety Advice' },
    { key: 'for_sale', label: 'For Sale' },
    { key: 'rating', label: 'Rating' },
    { key: 'expectedDelivery', label: 'Expected Delivery' },
    { key: 'bread_crumb', label: 'Category' },
    { key: 'url', label: 'URL' },
    { key: 'actions', label: 'Actions' }
  ], []);

  // Lifecycle hook to fetch data on mount
  useEffect(() => {
    getMedicines();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to sync local editable state with context
  useEffect(() => {
    if (Medicines && Medicines.length > 0) {
      setEditableMedicines([...Medicines]);
    }
  }, [Medicines]);

  const currentMedicines = editableMedicines.length > 0 ? editableMedicines : (Medicines || []);

  // --- EVENT HANDLERS (wrapped in useCallback for performance) ---

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  }, []);

  const handleExcelUpload = useCallback(async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select a file first");
      return;
    }
    const result = await uploadMedicineExcel(excelFile);
    if (result && result.success) {
      setExcelFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      getMedicines(); // Refresh data after upload
    }
  }, [excelFile, uploadMedicineExcel, getMedicines]);

  const handleEdit = useCallback((medicineId) => {
    setEditingRowId(medicineId);
  }, []);

  const handleSave = useCallback(async (medicineId) => {
    setSavingMedicine(medicineId);
    try {
      const updatedMedicine = editableMedicines.find(med => med._id === medicineId);
      const { _id, __v, ...medicineData } = updatedMedicine;
      
      const result = await updateMedicine(medicineId, medicineData);
      if (result && result.success) {
        setEditingRowId(null);
        getMedicines(); // Refresh data
      }
    } finally {
      setSavingMedicine(null);
    }
  }, [editableMedicines, updateMedicine, getMedicines]);

  const handleCancel = useCallback(() => {
    setEditingRowId(null);
  }, []);

  const handleInputChange = useCallback((id, field, value) => {
    setEditableMedicines(medicines =>
      medicines.map(med => (med._id === id ? { ...med, [field]: value } : med))
    );
  }, []);
  
  const handleDelete = useCallback(async (medicineId) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      await deleteMedicine(medicineId);
    }
  }, [deleteMedicine]);

  const handleDeleteSelected = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected medicines?`)) {
      const result = await deleteMultipleMedicines(selectedIds);
      if (result && result.success) {
        setSelectedIds([]);
      }
    }
  }, [deleteMultipleMedicines, selectedIds]);

  const handleSelectRow = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === currentMedicines.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentMedicines.map(med => med._id));
    }
  }, [selectedIds.length, currentMedicines]);

  const toggleColumn = useCallback((columnKey) => {
    setVisibleColumns(prev => {
      const newVisibleColumns = new Set(prev);
      newVisibleColumns.has(columnKey) ? newVisibleColumns.delete(columnKey) : newVisibleColumns.add(columnKey);
      return newVisibleColumns;
    });
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src = dummyImages[Math.floor(Math.random() * dummyImages.length)];
  }, [dummyImages]);

  const handleRowClick = useCallback((medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailModal(true);
  }, []);

  const visibleHeaders = useMemo(() => tableHeaders.filter(header => visibleColumns.has(header.key)), [tableHeaders, visibleColumns]);

  // --- RENDER LOGIC ---

  const renderCellContent = (medicine, header) => {
    const isEditing = editingRowId === medicine._id;
    const value = medicine[header.key];

    // **FIX**: The condition `&& header.key !== 'Id'` has been removed to make the ID field editable.
    if (isEditing && header.key !== 'actions') {
      // You could add specific inputs for different keys here if needed
      // switch (header.key) { ... }
      return <input type="text" value={value || ''} onChange={(e) => handleInputChange(medicine._id, header.key, e.target.value)} className="form-control form-control-sm" />;
    }

    // Display mode rendering
    switch (header.key) {
      case 'actions':
        return (
          <div className="d-flex justify-content-center gap-1" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <>
                <button className="btn btn-success btn-sm" onClick={() => handleSave(medicine._id)} disabled={savingMedicine === medicine._id}>
                  {savingMedicine === medicine._id ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-save"></i>}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCancel}><i className="fas fa-times"></i></button>
              </>
            ) : (
              <>
                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(medicine._id)} disabled={isDeleting}><i className="fas fa-edit"></i></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(medicine._id)} disabled={isDeleting}><i className="fas fa-trash"></i></button>
              </>
            )}
          </div>
        );
      case 'image_url': {
        const imageUrl = Array.isArray(value) && value.length > 0 ? value[0] : dummyImages[0];
        return <MedicineImage src={imageUrl} alt={medicine.name || "Medicine"} className="medicine-image" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={handleImageError} />;
      }
      case 'prescription_required':
        return <span className={`badge ${value === 'YES' ? 'bg-warning text-dark' : 'bg-success'}`}>{value}</span>;
      case 'for_sale':
        return <span className={`badge ${value === 'FOR SALE' ? 'bg-success' : 'bg-danger'}`}>{value}</span>;
      case 'best_price':
        return <span className="text-success fw-bold">{value ? `₹${value}` : 'N/A'}</span>;
       case 'mrp':
        return <span className="fw-bold">{value ? `₹${value}` : 'N/A'}</span>;
      default:
        return <span className="text-truncate d-block" style={{maxWidth: '200px'}} title={value}>{value || 'N/A'}</span>;
    }
  };

  if (!currentMedicines) {
    return <div className="d-flex vh-100 justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <>
      <div className="container-fluid py-4">
        {/* File Upload Card */}
        <div className='card mb-4'>
            <div className='card-body'>
                <h3 className="mb-3 text-primary">Upload Medicines</h3>
                <form onSubmit={handleExcelUpload}>
                    <div className="mb-2">
                        <label className="form-label">Upload Excel File (.xlsx, .xls):</label>
                        <input type="file" className="form-control" accept=".xlsx,.xls" onChange={handleFileChange} ref={fileInputRef} disabled={isUploading}/>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!excelFile || isUploading}>
                        {isUploading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>) : 'Upload'}
                    </button>
                </form>
            </div>
        </div>

        {/* Column Visibility Card */}
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Column Visibility</h5>
                <div className="row">
                {tableHeaders.map((header) => (
                    <div key={header.key} className="col-md-3 col-sm-6 mb-2">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id={`col-${header.key}`} checked={visibleColumns.has(header.key)} onChange={() => toggleColumn(header.key)}/>
                        <label className="form-check-label" htmlFor={`col-${header.key}`}>{header.label}</label>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Medicines Table Card */}
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h3 className="mb-0 text-primary">Medicines ({currentMedicines.length})</h3>
                {selectedIds.length > 0 && (
                    <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={isDeleting}>
                        {isDeleting ? <><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</> : <><i className="fas fa-trash me-2"></i>Delete Selected ({selectedIds.length})</>}
                    </button>
                )}
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                        <tr>
                            <th style={{ width: '50px' }} className="text-center">
                                <input type="checkbox" className="form-check-input" onChange={handleSelectAll} checked={currentMedicines.length > 0 && selectedIds.length === currentMedicines.length} title="Select All"/>
                            </th>
                            <th style={{width: '60px'}}>S.No</th> 
                            {visibleHeaders.map(header => (
                                <th key={header.key}>{header.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {currentMedicines.length > 0 ? (
                            currentMedicines.map((medicine, index) => {
                                const isEditing = editingRowId === medicine._id;
                                return (
                                    <tr 
                                        key={medicine._id} 
                                        onClick={() => !isEditing && handleRowClick(medicine)}
                                        style={{ cursor: isEditing ? 'default' : 'pointer' }}
                                        className={isEditing ? 'table-warning' : ''}
                                    >
                                        <td onClick={(e) => e.stopPropagation()} className="text-center">
                                            <input type="checkbox" className="form-check-input" onChange={() => handleSelectRow(medicine._id)} checked={selectedIds.includes(medicine._id)} />
                                        </td>
                                        <td>{index + 1}</td>
                                        {visibleHeaders.map(header => (
                                            <td key={header.key}>
                                                {renderCellContent(medicine, header)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={visibleHeaders.length + 2} className="text-center py-4">
                                    No medicines found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailModal && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
            <div className="modal-header">
              <h5 className="modal-title">{selectedMedicine.name || 'Medicine Details'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="medicine-details">
                <div className="row mb-4">
                  <div className="col-12 d-flex justify-content-center">
                    {Array.isArray(selectedMedicine.image_url) && selectedMedicine.image_url.length > 0 ? (
                      <div id="medicineDetailsCarousel" className="carousel slide" data-bs-ride="carousel" style={{ maxHeight: '400px', maxWidth: '100%' }}>
                        <div className="carousel-indicators">
                          {selectedMedicine.image_url.map((_, index) => (
                            <button key={index} type="button" data-bs-target="#medicineDetailsCarousel" data-bs-slide-to={index} className={index === 0 ? 'active' : ''} aria-current={index === 0 ? 'true' : 'false'} aria-label={`Slide ${index + 1}`}></button>
                          ))}
                        </div>
                        <div className="carousel-inner">
                          {selectedMedicine.image_url.map((imgSrc, index) => (
                            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                              <img src={imgSrc} className="d-block w-100" alt={`${selectedMedicine.name} slide ${index + 1}`} style={{ maxHeight: '400px', objectFit: 'contain' }} onError={handleImageError} />
                            </div>
                          ))}
                        </div>
                        {selectedMedicine.image_url.length > 1 && (
                          <>
                            <button className="carousel-control-prev" type="button" data-bs-target="#medicineDetailsCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon" aria-hidden="true"></span><span className="visually-hidden">Previous</span></button>
                            <button className="carousel-control-next" type="button" data-bs-target="#medicineDetailsCarousel" data-bs-slide="next"><span className="carousel-control-next-icon" aria-hidden="true"></span><span className="visually-hidden">Next</span></button>
                          </>
                        )}
                      </div>
                    ) : (
                      <img src={dummyImages[0]} alt={selectedMedicine.name} className="img-fluid" style={{ maxHeight: '400px', objectFit: 'contain' }} onError={handleImageError} />
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title text-primary">Description</h5><p className="card-text">{selectedMedicine.description || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">Introduction</h5><p className="card-text">{selectedMedicine.introduction || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">How It Works</h5><p className="card-text">{selectedMedicine.how_works || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">Benefits</h5><p className="card-text">{selectedMedicine.benefits || 'N/A'}</p>
                        </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title text-primary">Storage</h5><p className="card-text">{selectedMedicine.storage || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">Usage</h5><p className="card-text">{selectedMedicine.use_of || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">How To Use</h5><p className="card-text">{selectedMedicine.how_to_use || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">Side Effects</h5><p className="card-text">{selectedMedicine.side_effect || 'N/A'}</p>
                            <h5 className="card-title text-primary mt-4">Safety Advice</h5><p className="card-text">{selectedMedicine.safety_advise || 'N/A'}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              {selectedMedicine.url && <a href={selectedMedicine.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Source</a>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Medicines;