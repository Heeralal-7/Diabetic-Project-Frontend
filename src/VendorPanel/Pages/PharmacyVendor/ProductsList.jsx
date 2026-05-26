import React, { useContext, useEffect, useState, useMemo } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Spinner, Form, Pagination, InputGroup, Modal, Row, Col, ListGroup, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsPencil, BsBox } from 'react-icons/bs';

const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";

// --- Helper Hook for Search Delay ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Original DetailItem Component ---
const DetailItem = ({ label, value, isHtml = false }) => {
  if (value === null || value === undefined || value === '' || value.length === 0) return null;

  const renderValue = () => {
    if (typeof value === 'boolean') {
      return <Badge bg={value ? 'success' : 'danger'}>{value ? 'Yes' : 'No'}</Badge>;
    }
    if (Array.isArray(value) && value.length > 0) {
      return (
        <ul className="list-unstyled mb-0">
          {value.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      );
    }
     if (typeof value === 'string' && value.includes('::')) {
        return (
            <ListGroup variant="flush">
                {value.split('|').map((item, index) => (
                    <ListGroup.Item key={index} className="px-0 py-1">{item.trim()}</ListGroup.Item>
                ))}
            </ListGroup>
        );
    }
    return value;
  };

  return (
    <div className="mb-3">
      <strong className="text-muted d-block mb-1">{label}</strong>
      {isHtml ? <div dangerouslySetInnerHTML={{ __html: renderValue() }} /> : <span>{renderValue()}</span>}
    </div>
  );
};

const ProductsList = ({ refreshKey }) => {
  const { 
    products2 = [], 
    vendorProducts = [],
    // Context must provide these from API response
    totalPages = 1,
    totalCount = 0,
    loading, 
    fetchProducts2, 
    fetchVendorProducts2, 
    updateProductStock 
  } = useContext(MyContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  // Delay search API call by 500ms
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({ stock: '', discount: '' });
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  // --- Original Image Logic ---
  const getProductImage = (product) => {
    if (!product) {
        return DUMMY_IMAGE;
    }
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
        const firstImageUrl = product.image_url[0];
        if (typeof firstImageUrl === 'string' && firstImageUrl.trim()) {
            return firstImageUrl;
        }
    }
    if (typeof product.image === 'string' && product.image.trim()) {
        return product.image;
    }
    return DUMMY_IMAGE;
  };

  // --- Merge Vendor Data ---
  const productsWithVendorData = useMemo(() => {
    const vendorDataMap = new Map(vendorProducts.map(p => [p._id, {
      vendorStock: p.vendorStock,
      vendorDiscount: p.vendorDiscount,
      vendorPrice: p.vendorPrice
    }]));

    // Map directly (Server sends filtered/paginated data)
    return products2.map(product => ({
      ...product,
      ...vendorDataMap.get(product._id)
    }));
  }, [products2, vendorProducts]);

  // --- API Call with Pagination ---
  useEffect(() => {
    const loadData = async () => {
      const tokenData = sessionStorage.getItem("Pharmacytoken");
      if (!tokenData) {
        navigate("/pharmacy/login");
        return;
      }
      try {
        // Passing Page and Search to Context Function
        await Promise.all([
          fetchProducts2(currentPage, debouncedSearch), 
          fetchVendorProducts2()
        ]);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    
    loadData();
  }, [fetchProducts2, fetchVendorProducts2, refreshKey, navigate, currentPage, debouncedSearch]);

  const handleEdit = (product) => {
    if (!product) return;
    setProductToEdit(product);
    setStockUpdates({
      stock: product.vendorStock || '',
      discount: product.vendorDiscount || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!productToEdit) return;
    try {
      const result = await updateProductStock(
        productToEdit._id,
        stockUpdates.stock,
        stockUpdates.discount
      );
      if (result.success) {
        setShowEditModal(false);
        setProductToEdit(null);
        // Refresh data
        fetchProducts2(currentPage, debouncedSearch);
        fetchVendorProducts2(); 
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
  
  const handleRowClick = (product) => {
      setSelectedProductDetail(product);
      setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
      setShowDetailModal(false);
      setSelectedProductDetail(null);
  }

  const handleEditModalClose = () => {
      setShowEditModal(false);
      setProductToEdit(null);
  }

  // --- Pagination UI Builder ---
  const renderPaginationItems = () => {
    let items = [];
    const maxPages = totalPages; 
    
    if (maxPages <= 1) return null;

    // Show limited range with ellipsis
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(maxPages - 1, currentPage + 1);

    if (currentPage <= 3) {
        startPage = 2;
        endPage = Math.min(4, maxPages - 1);
    }
    if (currentPage >= maxPages - 2) {
        startPage = Math.max(maxPages - 3, 2);
        endPage = maxPages - 1;
    }

    // Always 1
    items.push(<Pagination.Item key={1} active={1 === currentPage} onClick={() => setCurrentPage(1)}>1</Pagination.Item>);

    if (startPage > 2) items.push(<Pagination.Ellipsis key="start-dots" disabled />);

    for (let number = startPage; number <= endPage; number++) {
        items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>{number}</Pagination.Item>);
    }

    if (endPage < maxPages - 1) items.push(<Pagination.Ellipsis key="end-dots" disabled />);

    // Always Last
    if (maxPages > 1) {
        items.push(<Pagination.Item key={maxPages} active={maxPages === currentPage} onClick={() => setCurrentPage(maxPages)}>{maxPages}</Pagination.Item>);
    }

    return items;
  };


  if (loading && products2.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <style>
      {`
        .product-detail-modal {
          max-width: 1140px !important;
          width: 100% !important;
          margin: auto; 
        }
        .product-detail-modal .modal-content {
          max-width: 1140px !important;
          width: 100% !important;
          flex: 1 1 auto;
        }
        .carousel-item img {
            height: 300px;
            object-fit: contain;
            width: 100%;
        }
      `}
      </style>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h5 className="card-title mb-0">Hospital Products Inventory</h5>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, manufacturer or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if(currentPage !== 1) setCurrentPage(1); // Reset page on search
                  }}
                  disabled={loading}
                />
              </InputGroup>
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
              <Badge bg="secondary" className="fs-6">
                Total Products: {totalCount} (Page {currentPage} of {totalPages})
              </Badge>
            </div>
          </div>

          {loading && (
            <div className="text-center mb-3 text-muted">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Updating products...</span>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product ID</th>
                  <th>Product Info</th>
                  <th>Manufacturer</th>
                  <th className="text-end">MRP</th>
                  <th className="text-end">Base Price</th>
                  <th className="text-end">Your Price</th>
                  <th className="text-end">Your Discount %</th>
                  <th className="text-end">Your Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsWithVendorData.length > 0 ? (
                  productsWithVendorData.map(product => (
                    product && (
                      <tr key={product._id} onClick={() => handleRowClick(product)} style={{ cursor: 'pointer' }}>
                        <td className="fw-semibold">#{product.Id || 'N/A'}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={getProductImage(product)}
                              alt={product.name || 'Product image'}
                              className="rounded me-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DUMMY_IMAGE;
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{product.name || 'Unnamed Product'}</h6>
                              <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                                {(product.description || 'No description available').substring(0, 50)}...
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{product.manufacturers || '-'}</td>
                        <td className="text-end">₹{parseFloat(product.mrp || 0).toFixed(2)}</td>
                        <td className="text-end">₹{parseFloat(product.best_price || 0).toFixed(2)}</td>
                        <td className="text-end text-primary fw-semibold">
                          ₹{parseFloat(product.vendorPrice || 0).toFixed(2)}
                        </td>
                        <td className="text-end">
                          <Badge bg={product.vendorDiscount > 0 ? "warning" : "light"} text={product.vendorDiscount > 0 ? "dark" : "secondary"}>
                            {product.vendorDiscount || 0}%
                          </Badge>
                        </td>
                        <td className="text-end">
                           <span className={(product.vendorStock || 0) <= 10 ? 'text-danger fw-semibold' : ''}>
                              {product.vendorStock || 0}
                           </span>
                        </td>
                        <td>
                          <Badge bg={product.popularCategory ? 'success' : 'secondary'}>
                            {product.popularCategory ? 'Popular' : 'Standard'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                            disabled={loading}
                            className="d-flex align-items-center"
                          >
                            <BsPencil className="me-1" size={13} />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                   <tr>
                     <td colSpan="10" className="text-center py-4">
                       <div className="py-4">
                         <BsBox size={48} className="text-muted mb-3" />
                         <p className="fs-5 mb-1">
                           {searchTerm ? 'No matching products found' : 'No products available'}
                         </p>
                         <p className="text-muted mb-3">
                           {searchTerm ? 'Try a different search term' : 'Check back later or add new products'}
                         </p>
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* SERVER SIDE PAGINATION CONTROLS */}
          {totalPages > 1 && (
             <div className="d-flex justify-content-center mt-4">
               <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || loading} />
                <Pagination.Prev
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={currentPage === 1 || loading}
                 />
                 
                 {renderPaginationItems()}

                 <Pagination.Next
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={currentPage === totalPages || loading}
                 />
                 <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || loading} />
               </Pagination>
             </div>
          )}
        </div>
      </div>
      
      {/* FULL DETAIL MODAL WITH CAROUSEL */}
      {selectedProductDetail && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="xl"
          dialogClassName="product-detail-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedProductDetail.name || 'Product Details'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="w-100">
              <Col md={5} className="text-center mb-4 mb-md-0">
                {/* Carousel logic preserved */}
                {Array.isArray(selectedProductDetail.image_url) && selectedProductDetail.image_url.length > 1 ? (
                  <Carousel>
                    {selectedProductDetail.image_url.map((img, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={img}
                          alt={`${selectedProductDetail.name} - view ${index + 1}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src={getProductImage(selectedProductDetail)}
                    alt={selectedProductDetail.name}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = DUMMY_IMAGE; }}
                  />
                )}
              </Col>
              <Col md={7}>
                <Row>
                  <Col md={6}>
                    <DetailItem label="Product ID" value={selectedProductDetail.Id} />
                    <DetailItem label="Packaging" value={selectedProductDetail.packaging} />
                    <DetailItem label="Primary Use" value={selectedProductDetail.primary_use} />
                    <DetailItem label="Prescription Required" value={ selectedProductDetail.prescription_required === 'No' ? false : true } />
                    <DetailItem label="Manufacturer" value={selectedProductDetail.manufacturers} />

                  </Col>
                  <Col md={6}>
                    <DetailItem label="MRP" value={`₹${parseFloat(selectedProductDetail.mrp || 0).toFixed(2)}`} />
                    <DetailItem label="Best Price" value={`₹${parseFloat(selectedProductDetail.best_price || 0).toFixed(2)}`} />
                    <DetailItem label="Your Price" value={`₹${parseFloat(selectedProductDetail.vendorPrice || 0).toFixed(2)}`} />
                                    <DetailItem label="Category" value={selectedProductDetail.bread_crumb} />
                    <DetailItem label="Storage" value={selectedProductDetail.storage} />
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '15px' }}>
                <DetailItem label="Introduction" value={selectedProductDetail.introduction} />
                <DetailItem label="Description" value={selectedProductDetail.description} />
                <DetailItem label="Benefits" value={selectedProductDetail.benefits} />
                <DetailItem label="How to Use" value={selectedProductDetail.how_to_use} />
                <DetailItem label="How It Works" value={selectedProductDetail.how_works} />
                <DetailItem label="Safety Advice" value={selectedProductDetail.safety_advise} />
                <DetailItem label="Side Effects" value={selectedProductDetail.side_effect} />
                <DetailItem label="Alternate Brands" value={selectedProductDetail.alternate_brand} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit modal preserved */}
      <Modal show={showEditModal} onHide={handleEditModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToEdit && (
            <div>
                 <p><strong>Product:</strong> {productToEdit.name}</p>
                 <Form>
                     <Form.Group className="mb-3" controlId="productStock">
                         <Form.Label>Your Stock</Form.Label>
                         <Form.Control
                             type="number"
                             min="0"
                             value={stockUpdates.stock}
                             onChange={(e) => {
                                 const value = e.target.value;
                                 setStockUpdates(prev => ({
                                     ...prev,
                                     stock: value === '' ? '' : Math.max(0, parseInt(value))
                                 }));
                             }}
                             placeholder="Enter stock quantity"
                         />
                     </Form.Group>

                     <Form.Group className="mb-3" controlId="productDiscount">
                         <Form.Label>Your Discount %</Form.Label>
                         <Form.Control
                             type="number"
                             min="0"
                             max="100"
                             value={stockUpdates.discount}
                             onChange={(e) => {
                                  const value = e.target.value;
                                  setStockUpdates(prev => ({
                                      ...prev,
                                      discount: value === '' ? '' : Math.min(100, Math.max(0, parseInt(value)))
                                  }));
                             }}
                             placeholder="Enter discount %"
                         />
                     </Form.Group>
                 </Form>
             </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditModalClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate} 
            disabled={loading}
           >
            {loading ? <Spinner as="span" size="sm" animation="border" role="status" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductsList;