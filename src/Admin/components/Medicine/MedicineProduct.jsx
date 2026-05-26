import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import "../../Assests/css/MedicineProduct.css"; // Ensure this path is correct for your project
import { MyContext } from '../../../Context/Context'; // Ensure this path is correct for your project
import { Link } from 'react-router-dom';

// ===================================================================================
//  1. MEMOIZED HELPER COMPONENT
// ===================================================================================

/**
 * A memoized Image component to prevent unnecessary re-renders when props haven't changed.
 * Includes lazy loading for performance.
 */
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

// ===================================================================================
//  2. MAIN COMPONENT: MedicineProduct
// ===================================================================================

const MedicineProduct = () => {
  // ===================================================================================
  //  A. STATE MANAGEMENT
  // ===================================================================================

  // State for table sorting
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // State for inline editing
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for searching and filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the details modal
  const [modalShow, setModalShow] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // State for multiple selection and deletion
  const [selectedIds, setSelectedIds] = useState([]);

  // State for controlling which table columns are visible
  const [visibleColumns, setVisibleColumns] = useState(new Set([
    'Id', 'name', 'manufacturers', 'packaging', 'mrp', 
    'best_price', 'discont_percent', 'prescription_required','image_url', 
    'primary_use', 'for_sale', 'actions', 'view_more'
  ]));

  // Fallback images for products without a valid image URL
  const dummyImages = [
    "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
    "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
    "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg"
  ];

  // ===================================================================================
  //  B. CONTEXT INTEGRATION
  // ===================================================================================
  
  const {
    products,
    loading,
    uploadProgress,
    fetchAllProducts,
    uploadProductExcel,
    updateMedicineProduct,
    deleteProduct,
    deleteMultipleProducts,
    isDeleting
  } = useContext(MyContext);

  // ===================================================================================
  //  C. MEMOIZED VALUES & CONFIGURATION
  // ===================================================================================

  // Memoize the entire list of table headers to prevent re-creation on every render
  const tableHeaders = useMemo(() => [
    { key: 'Id', label: 'ID', sortable: true },
    { key: 'name', label: 'Medicine Name', sortable: true },
    { key: 'manufacturers', label: 'Manufacturer', sortable: true },
    { key: 'salt_composition', label: 'Salt Composition', sortable: false },
    { key: 'packaging', label: 'Packaging', sortable: false },
    { key: 'mrp', label: 'MRP', sortable: true },
    { key: 'best_price', label: 'Best Price', sortable: true },
    { key: 'discont_percent', label: 'Discount %', sortable: true },
    { key: 'prescription_required', label: 'Prescription Required', sortable: true },
    { key: 'image_url', label: 'Image', sortable: false },
    { key: 'primary_use', label: 'Primary Use', sortable: false },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'storage', label: 'Storage', sortable: false },
    { key: 'introduction', label: 'Introduction', sortable: false },
    { key: 'use_of', label: 'Use Of', sortable: false },
    { key: 'benefits', label: 'Benefits', sortable: false },
    { key: 'side_effect', label: 'Side Effects', sortable: false },
    { key: 'how_to_use', label: 'How to Use', sortable: false },
    { key: 'how_works', label: 'How it Works', sortable: false },
    { key: 'safety_advise', label: 'Safety Advice', sortable: false },
    { key: 'supervision', label: 'Supervision', sortable: false },
    { key: 'if_miss', label: 'If Missed', sortable: false },
    { key: 'alternate_brand', label: 'Alternate Brand', sortable: false },
    { key: 'for_sale', label: 'For Sale', sortable: true },
    { key: 'discount_seller', label: 'Discount Seller', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'boughtParameter', label: 'Bought Parameter', sortable: true },
    { key: 'expectedDelivery', label: 'Expected Delivery', sortable: false },
    { key: 'popularCategory', label: 'Popular Category', sortable: true },
    { key: 'orderCount', label: 'Order Count', sortable: true },
    { key: 'bread_crumb', label: 'Category', sortable: false },
    { key: 'url', label: 'URL', sortable: false },
    { key: 'createdAt', label: 'Created At', sortable: true },
    { key: 'updatedAt', label: 'Updated At', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
    { key: 'view_more', label: 'View More', sortable: false }
  ], []);

  // Memoize the fields that should be included in the search functionality
  const searchableFields = useMemo(() => [
    'name', 'manufacturers', 'salt_composition', 'primary_use', 
    'description', 'benefits', 'bread_crumb', 'alternate_brand'
  ], []);

  // ===================================================================================
  //  D. LIFECYCLE HOOKS
  // ===================================================================================
  
  // Fetch products from the API when the component first mounts
  useEffect(() => {
    fetchAllProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

  // ===================================================================================
  //  E. DATA PROCESSING & DERIVED STATE
  // ===================================================================================
  
  // Memoize the filtering and sorting logic to avoid expensive recalculations on every render
  const sortedProducts = useMemo(() => {
    let processedProducts = [...products];

    // Apply search filter first
    if (searchTerm) {
      processedProducts = processedProducts.filter(product =>
        searchableFields.some(field =>
          product[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting if a sort column is selected
    if (sortColumn) {
      processedProducts.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Handle specific data types for accurate sorting
        if (['mrp', 'best_price', 'rating', 'boughtParameter', 'orderCount', 'discount_seller'].includes(sortColumn)) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortColumn === 'popularCategory') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        } else if (['createdAt', 'updatedAt'].includes(sortColumn)) {
          aValue = new Date(aValue).getTime() || 0;
          bValue = new Date(bValue).getTime() || 0;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return processedProducts;
  }, [products, searchTerm, searchableFields, sortColumn, sortDirection]);
  
  // ===================================================================================
  //  F. EVENT HANDLERS & CALLBACKS
  // ===================================================================================
  
  // Memoize event handlers to maintain stable function references across renders
  
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        event.target.value = '';
      }
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFile) {
      const result = await uploadProductExcel(selectedFile);
      if (result.success) {
        setSelectedFile(null);
        const fileInput = document.getElementById('excel-file');
        if (fileInput) fileInput.value = '';
      }
    } else {
      alert('Please select a file first');
    }
  }, [selectedFile, uploadProductExcel]);

  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const handleEdit = useCallback((rowId, rowData) => {
    setEditingRow(rowId);
    setEditedData({...rowData});
  }, []);

  const handleSave = useCallback(async (rowId) => {
    const result = await updateMedicineProduct(rowId, editedData);
    if (result.success) {
      setEditingRow(null);
      setEditedData({});
    }
  }, [editedData, updateMedicineProduct]);
  
  const handleDelete = useCallback(async (rowId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const result = await deleteProduct(rowId);
      if (result.success) {
        fetchAllProducts(); // Refresh data after successful deletion
      }
    }
  }, [deleteProduct, fetchAllProducts]);

  const handleCancel = useCallback(() => {
    setEditingRow(null);
    setEditedData({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleColumn = useCallback((columnKey) => {
    setVisibleColumns(prev => {
      const newVisibleColumns = new Set(prev);
      if (newVisibleColumns.has(columnKey)) {
        newVisibleColumns.delete(columnKey);
      } else {
        newVisibleColumns.add(columnKey);
      }
      return newVisibleColumns;
    });
  }, []);
  
  const handleImageError = useCallback((e) => {
    const currentSrc = e.target.src;
    const currentIndex = dummyImages.indexOf(currentSrc);
    e.target.src = (currentIndex === -1 || currentIndex === dummyImages.length - 1) ? dummyImages[0] : dummyImages[currentIndex + 1];
  }, [dummyImages]);
  
  // NEW: Handler for opening the modal via row click
  const handleRowClick = useCallback((rowData) => {
    setSelectedMedicine(rowData);
    setModalShow(true);
  }, []);


  // Handlers for multiple selection and deletion
  const handleSelectRow = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === sortedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProducts.map(p => p._id));
    }
  }, [selectedIds.length, sortedProducts]);

  const handleDeleteSelected = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected products?`)) {
        const result = await deleteMultipleProducts(selectedIds);
        if (result.success) {
            setSelectedIds([]); // Clear selection after successful deletion
            fetchAllProducts();
        }
    }
  }, [deleteMultipleProducts, fetchAllProducts, selectedIds]);

  // ===================================================================================
  //  G. DYNAMIC RENDERING LOGIC
  // ===================================================================================
  
  /**
   * Main function to render the content of each table cell.
   * It handles display mode, edit mode, and special formatting for different columns.
   */
  const renderCellContent = useCallback((key, value, isEditing, rowData) => {
    // --- Edit Mode Rendering ---
    if (isEditing && key !== 'Id' && key !== 'actions' && key !== 'createdAt' && key !== 'updatedAt' && key !== '_id' && key !== 'view_more') {
      switch (key) {
        case 'prescription_required':
          return <select className="form-select form-select-sm" value={editedData[key] || value} onChange={(e) => handleInputChange(key, e.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select>;
        case 'for_sale':
          return <select className="form-select form-select-sm" value={editedData[key] || value} onChange={(e) => handleInputChange(key, e.target.value)}><option value="ADD TO CART">ADD TO CART</option><option value="OUT OF STOCK">OUT OF STOCK</option></select>;
        case 'popularCategory':
          return <select className="form-select form-select-sm" value={editedData[key] !== undefined ? editedData[key] : value} onChange={(e) => handleInputChange(key, e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></select>;
        case 'rating': case 'boughtParameter': case 'orderCount': case 'discount_seller':
          return <input type="number" className="form-control form-control-sm" value={editedData[key] !== undefined ? editedData[key] : value} onChange={(e) => handleInputChange(key, e.target.value)} min="0" step={key === 'rating' ? '0.1' : '1'} />;
        case 'mrp': case 'best_price':
          return <input type="number" className="form-control form-control-sm" value={editedData[key] !== undefined ? editedData[key] : value} onChange={(e) => handleInputChange(key, e.target.value)} min="0" step="0.01" />;
        case 'description': case 'introduction': case 'benefits': case 'side_effect': case 'how_to_use': case 'how_works': case 'safety_advise': case 'supervision':
          return <textarea className="form-control form-control-sm" value={editedData[key] !== undefined ? editedData[key] : value} onChange={(e) => handleInputChange(key, e.target.value)} rows="2" />;
        default:
          return <input type="text" className="form-control form-control-sm" value={editedData[key] !== undefined ? editedData[key] : value} onChange={(e) => handleInputChange(key, e.target.value)} />;
      }
    }

    // --- Actions Column Rendering ---
    if (key === 'actions') {
      return (
        // MODIFIED: Added onClick with stopPropagation to the wrapper div
        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <>
              <button className="btn btn-success btn-sm px-3" onClick={() => handleSave(rowData._id)} disabled={loading || isDeleting}><i className="fas fa-check"></i></button>
              <button className="btn btn-secondary btn-sm px-3" onClick={handleCancel} disabled={loading || isDeleting}><i className="fas fa-times"></i></button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-sm px-2" onClick={() => handleEdit(rowData._id, rowData)} disabled={loading || isDeleting}><i className="fas fa-edit"></i></button>
              <button className="btn btn-danger btn-sm px-2" onClick={() => handleDelete(rowData._id)} disabled={loading || isDeleting}><i className="fas fa-trash"></i></button>
            </>
          )}
        </div>
      );
    }

    // --- View More Column Rendering ---
    if (key === 'view_more') {
      return (
        // This button now opens the modal, which is redundant but kept for UI consistency.
        // The row click is the primary method.
        <button className="btn btn-info btn-sm" onClick={(e) => { e.stopPropagation(); handleRowClick(rowData); }}>More Info</button>
      );
    }
    
    // --- Display Mode Rendering (with special formatting) ---
    switch (key) {
      case 'name': return <Link to="#" className="text-primary text-decoration-none fw-semibold" title={value}>{value}</Link>;
      case 'url': return <Link to={value || '#'} className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Link</Link>;
      case 'bread_crumb': return <span className="text-muted small">{value}</span>;
      case 'prescription_required': return <span className={`badge rounded-pill px-3 py-2 ${value === 'Yes' ? 'bg-warning text-dark' : 'bg-success'}`}>{value}</span>;
      case 'for_sale': return <span className={`badge rounded-pill px-3 py-2 ${value === 'ADD TO CART' ? 'bg-success' : 'bg-danger'}`}>{value}</span>;
      case 'popularCategory': return <span className={`badge rounded-pill px-3 py-2 ${value ? 'bg-success' : 'bg-secondary'}`}>{value ? 'Yes' : 'No'}</span>;
      case 'discont_percent': return <span className={`badge ${value === '0%' ? 'bg-info text-dark' : 'bg-primary'} rounded-pill px-3 py-2`}>{value}</span>;
      case 'mrp': return <span className="fw-bold">₹{value}</span>;
      case 'best_price': return value === 'N/A' ? <span className="text-muted">{value}</span> : <span className="text-success fw-bold">₹{value}</span>;
      case 'rating': return <div className="d-flex align-items-center"><span className="badge bg-warning text-dark">{value}</span><span className="ms-1" style={{color:"gold"}}><i className="fa-solid fa-star"></i></span></div>;
      case 'expectedDelivery': return <span className="badge bg-info text-dark">{value}</span>;
      case 'orderCount': return <span className="badge bg-primary">{value}</span>;
      case 'discount_seller': return <span className="badge bg-secondary">{value}</span>;
      case 'boughtParameter': return <span className="badge bg-dark">{value}</span>;
      // CORRECTED: Handle image_url as an array
      case 'image_url': {
        const imageUrl = Array.isArray(value) && value.length > 0 ? value[0] : dummyImages[0];
        return (
          // MODIFIED: Removed the onClick handler from this div. The row's onClick handles it.
          <div title="Click row to view details">
            <MedicineImage 
              src={imageUrl} 
              alt="Medicine" 
              className="medicine-image" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
              onError={handleImageError} 
            />
          </div>
        );
      }
      case 'createdAt': case 'updatedAt': return <span className="text-muted small">{new Date(value).toLocaleDateString()}</span>;
      case 'description': case 'introduction': case 'benefits': case 'side_effect': case 'how_to_use': case 'how_works': case 'safety_advise': case 'supervision': case 'primary_use': case 'salt_composition': case 'storage': case 'use_of': case 'if_miss': case 'alternate_brand':
        return <span className="text-truncate d-block" style={{maxWidth: '200px'}} title={value}>{value}</span>;
      default: return value || 'N/A';
    }
  }, [editedData, handleInputChange, handleSave, handleCancel, handleEdit, handleDelete, loading, isDeleting, handleImageError, dummyImages, handleRowClick]);
  
  // Memoize the list of currently visible headers
  const visibleHeaders = useMemo(() => tableHeaders.filter(header => visibleColumns.has(header.key)), [tableHeaders, visibleColumns]);

  // ===================================================================================
  //  H. JSX RETURN (COMPONENT RENDER)
  // ===================================================================================
  
  return (
    <div className="container-fluid py-4">
      <div className="medicine-table-container">
        <div className="container-fluid">
          
          {/* Section: Upload Medicine Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="upload-card">
                <h1 className="upload-title">Upload Products</h1>
                <label className="upload-label">Upload Excel File:</label>
                <div className="file-input-container">
                  <input type="file" id="excel-file" className="file-input px-5" accept=".xlsx,.xls" onChange={handleFileChange} disabled={loading}/>
                  <label htmlFor="excel-file" className="file-input-label px-5">Choose File</label>
                  <span className="ms-3 text-muted">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                </div>
                {selectedFile && <div className="selected-file"><strong>Selected file:</strong> {selectedFile.name}</div>}
                <p className="file-info">Only Excel files (.xlsx, .xls) are accepted</p>
                <button className="upload-btn" onClick={handleUpload} disabled={!selectedFile || loading}>
                  {loading && uploadProgress > 0 ? (`Uploading... ${uploadProgress}%`) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Upload</>)}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Column Visibility Controls */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Column Visibility</h5>
                  <div className="row">
                    {tableHeaders.map((header) => (
                      <div key={header.key} className="col-md-3 col-sm-6 mb-2">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id={`column-${header.key}`} checked={visibleColumns.has(header.key)} onChange={() => toggleColumn(header.key)}/>
                          <label className="form-check-label" htmlFor={`column-${header.key}`}>{header.label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Table Header, Search, and Bulk Actions */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="table-card">
                <div className="table-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <h2 className="mb-0">Medicine Products ({sortedProducts.length})</h2>
                  <div className="d-flex gap-3 align-items-center">
                    {selectedIds.length > 0 && (
                      <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={isDeleting}>
                        {isDeleting ? (<><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</>) : (<><i className="fas fa-trash me-2"></i>Delete Selected ({selectedIds.length})</>)}
                      </button>
                    )}
                    <div className="search-container">
                      <input type="text" className="form-control" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '300px' }}/>
                    </div>
                    {(loading || isDeleting) && !uploadProgress && (<div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Main Data Table */}
          <div className="row">
            <div className="col-12">
              <div className="table-card">
                <div className="table-responsive">
                  <table className="table custom-table table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <div className="form-check d-flex justify-content-center">
                            <input className="form-check-input" type="checkbox" onChange={handleSelectAll} checked={sortedProducts.length > 0 && selectedIds.length === sortedProducts.length} title="Select All"/>
                          </div>
                        </th>
                        {visibleHeaders.map((header) => (
                          <th key={header.key} className={header.sortable ? 'sortable-header' : ''} onClick={() => header.sortable && handleSort(header.key)} >
                            {header.label}
                            {sortColumn === header.key && (<span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.length > 0 ? (
                        sortedProducts.map((row) => {
                          const isEditing = editingRow === row._id;
                          return (
                            // MODIFIED: Added onClick to the row itself to open the modal.
                            // It only triggers if not in editing mode.
                            // Added cursor style for better UX.
                            <tr 
                              key={row._id} 
                              className={isEditing ? 'table-warning' : ''} 
                              onClick={() => !isEditing && handleRowClick(row)}
                              style={{ cursor: isEditing ? 'default' : 'pointer' }}
                            >
                              {/* MODIFIED: Added onClick with stopPropagation to prevent row click when selecting. */}
                              <td className="align-middle" onClick={(e) => e.stopPropagation()}>
                                <div className="form-check d-flex justify-content-center">
                                  <input className="form-check-input" type="checkbox" onChange={() => handleSelectRow(row._id)} checked={selectedIds.includes(row._id)}/>
                                </div>
                              </td>
                              {visibleHeaders.map((header) => (
                                <td key={header.key} className="align-middle">
                                  {renderCellContent(header.key, row[header.key], isEditing, row)}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={visibleHeaders.length + 1} className="text-center py-4">
                            {loading ? (<div className="d-flex justify-content-center align-items-center"><div className="spinner-border text-primary me-2" role="status"></div>Loading medicines...</div>) : ('No medicine products found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Medicine Details Modal */}
      {modalShow && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
            <div className="modal-header">
              <h5 className="modal-title">{selectedMedicine.name || 'Medicine Details'}</h5>
              <button type="button" className="close" onClick={() => setModalShow(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="medicine-details">
                <div className="row mb-4">
                  <div className="col-12 d-flex justify-content-center">
                    
                    {/* --- START: बदला हुआ कैराउज़ल कोड --- */}
                    {Array.isArray(selectedMedicine.image_url) && selectedMedicine.image_url.length > 0 ? (
                      <div id="medicineImageCarousel" className="carousel slide" data-bs-ride="carousel" style={{ maxHeight: '400px', maxWidth: '100%' }}>
                        
                        {/* कैराउज़ल इंडिकेटर्स (नीचे के डॉट्स) */}
                        <div className="carousel-indicators">
                          {selectedMedicine.image_url.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              data-bs-target="#medicineImageCarousel"
                              data-bs-slide-to={index}
                              className={index === 0 ? 'active' : ''}
                              aria-current={index === 0 ? 'true' : 'false'}
                              aria-label={`Slide ${index + 1}`}
                            ></button>
                          ))}
                        </div>

                        {/* कैराउज़ल की इमेज */}
                        <div className="carousel-inner">
                          {selectedMedicine.image_url.map((imgSrc, index) => (
                            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                              <img 
                                src={imgSrc} 
                                className="d-block w-100" 
                                alt={`${selectedMedicine.name} - slide ${index + 1}`} 
                                style={{ maxHeight: '400px', objectFit: 'contain' }}
                                onError={handleImageError} 
                              />
                            </div>
                          ))}
                        </div>

                        {/* कैराउज़ल के कंट्रोल (Next/Prev बटन) */}
                        {selectedMedicine.image_url.length > 1 && (
                          <>
                            <button className="carousel-control-prev" type="button" data-bs-target="#medicineImageCarousel" data-bs-slide="prev">
                              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                              <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#medicineImageCarousel" data-bs-slide="next">
                              <span className="carousel-control-next-icon" aria-hidden="true"></span>
                              <span className="visually-hidden">Next</span>
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      // अगर कोई इमेज नहीं है तो फॉलबैक इमेज दिखाएं
                      <img 
                        src={dummyImages[0]}
                        alt={selectedMedicine.name} 
                        className="img-fluid medicine-large-image" 
                        style={{ maxHeight: '400px', objectFit: 'contain' }} 
                        onError={handleImageError}
                      />
                    )}
                    {/* --- END: बदला हुआ कैराउज़ल कोड --- */}

                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100"><div className="card-body"><h5 className="card-title text-primary">Description</h5><p className="card-text">{selectedMedicine.description || 'N/A'}</p><h5 className="card-title text-primary mt-4">Introduction</h5><p className="card-text">{selectedMedicine.introduction || 'N/A'}</p><h5 className="card-title text-primary mt-4">How It Works</h5><p className="card-text">{selectedMedicine.how_works || 'N/A'}</p><h5 className="card-title text-primary mt-4">Benefits</h5><p className="card-text">{selectedMedicine.benefits || 'N/A'}</p></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card h-100"><div className="card-body"><h5 className="card-title text-primary">Storage</h5><p className="card-text">{selectedMedicine.storage || 'N/A'}</p><h5 className="card-title text-primary mt-4">Usage</h5><p className="card-text">{selectedMedicine.use_of || 'N/A'}</p><h5 className="card-title text-primary mt-4">How To Use</h5><p className="card-text">{selectedMedicine.how_to_use || 'N/A'}</p><h5 className="card-title text-primary mt-4">Side Effects</h5><p className="card-text">{selectedMedicine.side_effect || 'N/A'}</p><h5 className="card-title text-primary mt-4">Safety Advice</h5><p className="card-text">{selectedMedicine.safety_advise || 'N/A'}</p><h5 className="card-title text-primary mt-4">Supervision</h5><p className="card-text">{selectedMedicine.supervision || 'N/A'}</p></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineProduct;