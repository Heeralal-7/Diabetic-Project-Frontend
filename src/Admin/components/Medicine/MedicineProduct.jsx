import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import "../../Assests/css/MedicineProduct.css";
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';

// Memoized Image Component to prevent re-renders
const MedicineImage = React.memo(({ src, alt, className, style, onError }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={style}
      onError={onError}
      loading="lazy" // Add lazy loading
    />
  );
});

const MedicineProduct = () => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(new Set([
    'Id', 'name', 'manufacturers', 'salt_composition', 'packaging', 'mrp', 
    'best_price', 'discont_percent', 'prescription_required','image_url', 
    'primary_use', 'for_sale', 'actions', 'view_more'
  ]));

  // Dummy images for fallback
  const dummyImages = [
    "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
    "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
    "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg"
  ];

  // Get data and methods from context
  const {
    products,
    loading,
    uploadProgress,
    fetchAllProducts,
    uploadMedicineExcel,
    updateMedicineProduct,
    deleteMedicineProduct
  } = useContext(MyContext);

  // Memoize table headers to prevent recreation
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

  // Memoize searchable fields
  const searchableFields = useMemo(() => [
    'name', 'manufacturers', 'salt_composition', 'primary_use', 
    'description', 'benefits', 'bread_crumb', 'alternate_brand'
  ], []);

  // Memoize column width function
  const getColumnWidth = useCallback((key) => {
    const widthMap = {
      'Id': '80px',
      'name': '200px',
      'manufacturers': '180px',
      'salt_composition': '220px',
      'packaging': '150px',
      'mrp': '100px',
      'best_price': '100px',
      'discont_percent': '100px',
      'prescription_required': '150px',
      'image_url': '80px',
      'primary_use': '200px',
      'description': '250px',
      'storage': '200px',
      'introduction': '250px',
      'use_of': '200px',
      'benefits': '250px',
      'side_effect': '200px',
      'how_to_use': '200px',
      'how_works': '200px',
      'safety_advise': '200px',
      'supervision': '200px',
      'if_miss': '150px',
      'alternate_brand': '180px',
      'for_sale': '120px',
      'discount_seller': '120px',
      'rating': '100px',
      'boughtParameter': '120px',
      'expectedDelivery': '130px',
      'popularCategory': '120px',
      'orderCount': '100px',
      'bread_crumb': '200px',
      'url': '80px',
      'createdAt': '120px',
      'updatedAt': '120px',
      'actions': '140px',
      'view_more': '120px'
    };
    return widthMap[key] || '120px';
  }, []);

  // Memoize image error handler with dummy images
  const handleImageError = useCallback((e) => {
    const currentSrc = e.target.src;
    const currentIndex = dummyImages.indexOf(currentSrc);
    
    if (currentIndex === -1 || currentIndex === dummyImages.length - 1) {
      // If not a dummy image or last dummy image, use first dummy image
      e.target.src = dummyImages[0];
    } else {
      // Try next dummy image
      e.target.src = dummyImages[currentIndex + 1];
    }
  }, [dummyImages]);

  // Fetch products on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filter products based on search term - memoized
  const filteredProductsMemo = useMemo(() => {
    if (searchTerm) {
      return products.filter(product =>
        searchableFields.some(field =>
          product[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return products;
  }, [products, searchTerm, searchableFields]);

  // Update filtered products when memo changes
  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  // Sort products - memoized
  const sortedProducts = useMemo(() => {
    if (!sortColumn) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle numeric values
      if (['mrp', 'best_price', 'rating', 'boughtParameter', 'orderCount', 'discount_seller'].includes(sortColumn)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle boolean values
      if (sortColumn === 'popularCategory') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      // Handle date values
      if (['createdAt', 'updatedAt'].includes(sortColumn)) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortColumn, sortDirection]);

  // Memoize event handlers
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
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
      try {
        await uploadMedicineExcel(selectedFile);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('excel-file');
        if (fileInput) fileInput.value = '';
      } catch (error) {
        console.error('Upload failed:', error);
      }
    } else {
      alert('Please select a file first');
    }
  }, [selectedFile, uploadMedicineExcel]);

  const handleSort = useCallback((column) => {
    setSortColumn(prevColumn => {
      if (prevColumn === column) {
        setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        return column;
      } else {
        setSortDirection('asc');
        return column;
      }
    });
  }, []);

  const handleEdit = useCallback((rowId, rowData) => {
    setEditingRow(rowId);
    setEditedData({...rowData});
  }, []);

  const handleSave = useCallback(async (rowId) => {
    try {
      await updateMedicineProduct(rowId, editedData);
      setEditingRow(null);
      setEditedData({});
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [editedData, updateMedicineProduct]);

  const handleDelete = useCallback(async (rowId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteMedicineProduct(rowId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }, [deleteMedicineProduct]);

  const handleCancel = useCallback(() => {
    setEditingRow(null);
    setEditedData({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Memoize cell content renderer
  const renderCellContent = useCallback((key, value, isEditing, rowData) => {
    if (isEditing && key !== 'Id' && key !== 'actions' && key !== 'createdAt' && key !== 'updatedAt' && key !== '_id' && key !== 'view_more') {
      if (key === 'prescription_required') {
        return (
          <select 
            className="form-select form-select-sm"
            value={editedData[key] || value}
            onChange={(e) => handleInputChange(key, e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      }
      if (key === 'for_sale') {
        return (
          <select 
            className="form-select form-select-sm"
            value={editedData[key] || value}
            onChange={(e) => handleInputChange(key, e.target.value)}
          >
            <option value="ADD TO CART">ADD TO CART</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>
        );
      }
      if (key === 'popularCategory') {
        return (
          <select 
            className="form-select form-select-sm"
            value={editedData[key] !== undefined ? editedData[key] : value}
            onChange={(e) => handleInputChange(key, e.target.value === 'true')}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      }
      if (['rating', 'boughtParameter', 'orderCount', 'discount_seller'].includes(key)) {
        return (
          <input
            type="number"
            className="form-control shadow-none form-control shadow-none-sm"
            value={editedData[key] !== undefined ? editedData[key] : value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min="0"
            step={key === 'rating' ? '0.1' : '1'}
          />
        );
      }
      if (['mrp', 'best_price'].includes(key)) {
        return (
          <input
            type="number"
            className="form-control shadow-none form-control shadow-none-sm"
            value={editedData[key] !== undefined ? editedData[key] : value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min="0"
            step="0.01"
          />
        );
      }
      if (['description', 'introduction', 'benefits', 'side_effect', 'how_to_use', 'how_works', 'safety_advise', 'supervision'].includes(key)) {
        return (
          <textarea
            className="form-control shadow-none form-control shadow-none-sm"
            value={editedData[key] !== undefined ? editedData[key] : value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            rows="2"
          />
        );
      }
      return (
        <input
          type="text"
          className="form-control shadow-none form-control "
          value={editedData[key] !== undefined ? editedData[key] : value}
          onChange={(e) => handleInputChange(key, e.target.value)}
        />
      );
    }

    if (key === 'actions') {
      return (
        <div className="d-flex gap-1">
          {isEditing ? (
            <>
              <button
                className="btn btn-success btn-sm px-3"
                onClick={() => handleSave(rowData._id)}
                disabled={loading}
              >
                <i className="fas fa-check"></i>
              </button>
              <button
                className="btn btn-secondary btn-sm px-3"
                onClick={handleCancel}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary btn-sm px-2"
                onClick={() => handleEdit(rowData._id, rowData)}
                disabled={loading}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="btn btn-danger btn-sm px-2"
                onClick={() => handleDelete(rowData._id)}
                disabled={loading}
              >
                <i className="fas fa-trash"></i>
              </button>
            </>
          )}
        </div>
      );
    }

    // Handle View More button
    if (key === 'view_more') {
      return (
        <button 
          className="btn btn-info btn-sm"
          onClick={() => {
            setSelectedMedicine(rowData);
            setModalShow(true);
          }}
        >
          More Info
        </button>
      );
    }

    // Handle specific field rendering
    switch (key) {
      case 'name':
        return (
          <Link 
            to="#" 
            className="text-primary text-decoration-none fw-semibold"
            title={value}
          >
            {value}
          </Link>
        );
      case 'url':
        return (
          <Link 
            to={value} 
            className="text-primary text-decoration-none" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Link
          </Link>
        );
      case 'bread_crumb':
        return <span className="text-muted small">{value}</span>;
      case 'prescription_required':
        return (
          <span className={`badge rounded-pill px-3 py-2 ${
            value === 'Yes' ? 'bg-warning text-dark' : 'bg-success'
          }`}>
            {value}
          </span>
        );
      case 'for_sale':
        return (
          <span className={`badge rounded-pill px-3 py-2 ${
            value === 'ADD TO CART' ? 'bg-success' : 'bg-danger'
          }`}>
            {value}
          </span>
        );
      case 'popularCategory':
        return (
          <span className={`badge rounded-pill px-3 py-2 ${
            value ? 'bg-success' : 'bg-secondary'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'discont_percent':
        return value === '0%' ? 
          <span className="badge bg-info text-dark rounded-pill px-3 py-2">{value}</span> : 
          <span className="badge bg-primary rounded-pill px-3 py-2">{value}</span>;
      case 'mrp':
        return <span className="fw-bold">₹{value}</span>;
      case 'best_price':
        return value === 'N/A' ? 
          <span className="text-muted">{value}</span> : 
          <span className="text-success fw-bold">₹{value}</span>;
      case 'rating':
        return (
          <div className="d-flex align-items-center">
            <span className="badge bg-warning text-dark">{value}</span>
            <span className="ms-1"  style={{color:"gold"}}><i className="fa-solid fa-star"></i></span>
          </div>
        );
      case 'expectedDelivery':
        return (
          <span className="badge bg-info text-dark">{value}</span>
        );
      case 'orderCount':
        return (
          <span className="badge bg-primary">{value}</span>
        );
      case 'discount_seller':
        return (
          <span className="badge bg-secondary">{value}</span>
        );
      case 'boughtParameter':
        return (
          <span className="badge bg-dark">{value}</span>
        );
    case 'image_url':
  return (
    <div 
      style={{ cursor: 'pointer' }}
      onClick={() => {
        setSelectedMedicine(rowData);
        setModalShow(true);
      }}
      title="Click to view details"
    >
      <MedicineImage
        src={value} 
        alt="Medicine" 
        className="medicine-image"
        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        onError={handleImageError}
      />
    </div>
  );
      case 'createdAt':
      case 'updatedAt':
        return (
          <span className="text-muted small">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      case 'description':
      case 'introduction':
      case 'benefits':
      case 'side_effect':
      case 'how_to_use':
      case 'how_works':
      case 'safety_advise':
      case 'supervision':
      case 'primary_use':
      case 'salt_composition':
      case 'storage':
      case 'use_of':
      case 'if_miss':
      case 'alternate_brand':
        return (
          <span 
            className="text-truncate d-block" 
            style={{maxWidth: '200px'}} 
            title={value}
          >
            {value}
          </span>
        );
      default:
        return value || 'N/A';
    }
  }, [editedData, handleInputChange, handleSave, handleCancel, handleEdit, handleDelete, loading, handleImageError]);

  // Memoize visible headers
  const visibleHeaders = useMemo(() => 
    tableHeaders.filter(header => visibleColumns.has(header.key)),
    [tableHeaders, visibleColumns]
  );

  return (
    <div className="container-fluid py-4">
      <div className="medicine-table-container">
        <div className="container-fluid">
          {/* Upload Medicine Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="upload-card">
                <h1 className="upload-title">Upload Medicine</h1>
                
                <label className="upload-label">Upload Excel File:</label>
                
                <div className="file-input-container">
                  <input
                    type="file"
                    id="excel-file"
                    className="file-input px-5"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <label htmlFor="excel-file" className="file-input-label px-5">
                    Choose File
                  </label>
                  <span className="ms-3 text-muted">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                </div>
                
                {selectedFile && (
                  <div className="selected-file">
                    <strong>Selected file:</strong> {selectedFile.name}
                  </div>
                )}
                
                <p className="file-info">
                  Only Excel files (.xlsx, .xls) are accepted
                </p>
                
                <button 
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                >
                  {loading && uploadProgress > 0 ? (
                    `Uploading... ${uploadProgress}%`
                  ) : (
                    <>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Column Visibility Controls */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Column Visibility</h5>
                  <div className="row">
                    {tableHeaders.map((header) => (
                      <div key={header.key} className="col-md-3 col-sm-6 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`column-${header.key}`}
                            checked={visibleColumns.has(header.key)}
                            onChange={() => toggleColumn(header.key)}
                          />
                          <label className="form-check-label" htmlFor={`column-${header.key}`}>
                            {header.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Medicine Table Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="table-card">
                <div className="table-header d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">Medicine Products ({sortedProducts.length})</h2>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="search-container">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '300px' }}
                      />
                    </div>
                    {loading && !uploadProgress && (
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="row">
            <div className="col-12">
              <div className="table-card">
                <div className="table-responsive">
                  <table className="table custom-table mb-0">
                    <thead>
                      <tr>
                        {visibleHeaders.map((header) => (
                          <th
                            key={header.key}
                            className={header.sortable ? 'sortable-header' : ''}
                            onClick={() => header.sortable && handleSort(header.key)}
                            style={{ 
                              minWidth: getColumnWidth(header.key),
                              cursor: header.sortable ? 'pointer' : 'default'
                            }}
                          >
                            {header.label}
                            {sortColumn === header.key && (
                              <span className="ms-1">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.length > 0 ? (
                        sortedProducts.map((row) => {
                          const isEditing = editingRow === row._id;
                          return (
                            <tr key={row._id} className={isEditing ? 'table-warning' : ''}>
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
                          <td colSpan={visibleHeaders.length} className="text-center py-4">
                            {loading ? (
                              <div className="d-flex justify-content-center align-items-center">
                                <div className="spinner-border text-primary me-2" role="status"></div>
                                Loading medicines...
                              </div>
                            ) : (
                              'No medicine products found'
                            )}
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

      {/* Medicine Details Modal with Large Image */}
      {modalShow && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedMedicine?.name || 'Medicine Details'}
              </h5>
              <button 
                type="button" 
                className="close" 
                onClick={() => setModalShow(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedMedicine && (
                <div className="medicine-details">
                  {/* Large Image Row */}
                  <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-center">
                      <img 
                        src={selectedMedicine.image_url || dummyImages[0]} 
                        alt={selectedMedicine.name} 
                        className="img-fluid medicine-large-image"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                  
                  {/* Details Row */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title text-primary">Description</h5>
                          <p className="card-text">{selectedMedicine.description || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Introduction</h5>
                          <p className="card-text">{selectedMedicine.introduction || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">How It Works</h5>
                          <p className="card-text">{selectedMedicine.how_works || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Benefits</h5>
                          <p className="card-text">{selectedMedicine.benefits || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title text-primary">Storage</h5>
                          <p className="card-text">{selectedMedicine.storage || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Usage</h5>
                          <p className="card-text">{selectedMedicine.use_of || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">How To Use</h5>
                          <p className="card-text">{selectedMedicine.how_to_use || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Side Effects</h5>
                          <p className="card-text">{selectedMedicine.side_effect || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Safety Advice</h5>
                          <p className="card-text">{selectedMedicine.safety_advise || 'N/A'}</p>
                          
                          <h5 className="card-title text-primary mt-4">Supervision</h5>
                          <p className="card-text">{selectedMedicine.supervision || 'N/A'}</p>
                        </div>
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
                onClick={() => setModalShow(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineProduct;