import React, { useContext, useEffect, useState, useMemo } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Spinner, Form, Pagination, InputGroup, Modal, Row, Col, ListGroup, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsPencil, BsCheck, BsX, BsBox } from 'react-icons/bs';

const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";

// Helper: Debounce for API calls
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const DetailItem = ({ label, value, isHtml = false }) => {
  if (value === null || value === undefined || value === '' || value.length === 0) return null;
  const renderValue = () => {
    if (typeof value === 'boolean') return <Badge bg={value ? 'success' : 'danger'}>{value ? 'Yes' : 'No'}</Badge>;
    if (Array.isArray(value)) return <ul className="list-unstyled mb-0">{value.map((item, index) => <li key={index}>{item}</li>)}</ul>;
    if (typeof value === 'string' && value.includes('::')) return <ListGroup variant="flush">{value.split('|').map((item, index) => <ListGroup.Item key={index} className="px-0 py-1">{item.trim()}</ListGroup.Item>)}</ListGroup>;
    return value;
  };
  return <div className="mb-3"><strong className="text-muted d-block mb-1">{label}</strong>{isHtml ? <div dangerouslySetInnerHTML={{ __html: renderValue() }} /> : <span>{renderValue()}</span>}</div>;
};

const VendorProductsList = ({ refreshKey }) => {
  const { 
    vendorProducts = [], 
    vendorTotalPages = 1,
    vendorTotalCount = 0,
    loading, 
    fetchVendorProducts2, 
    updateProductStock 
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // Wait 500ms before API call

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  const [editingId, setEditingId] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({ stock: "", discount: "" });

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getProductImage = (product) => {
    if (!product) return DUMMY_IMAGE;
    if (Array.isArray(product.image_url) && product.image_url.length > 0) return product.image_url[0] || DUMMY_IMAGE;
    return product.image || DUMMY_IMAGE;
  };

  // --- 1. API Call (Server Side Search) ---
  useEffect(() => {
    const loadData = async () => {
      const token = sessionStorage.getItem("Pharmacytoken");
      if (!token) {
        navigate("/pharmacy/login");
        return;
      }
      await fetchVendorProducts2(currentPage, debouncedSearch);
    };
    loadData();
  }, [fetchVendorProducts2, currentPage, debouncedSearch, refreshKey, navigate]);


  // --- 2. Client Side Filtering & Pagination (The Search Fix) ---
  const { currentItems, displayTotalPages, displayTotalCount } = useMemo(() => {
    let processedData = vendorProducts;

    // STEP A: Client-side Filter (Safety Net)
    // Agar API search ignore karti hai (ya saara data bhejti hai), to hum yahan filter karenge
    if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        processedData = vendorProducts.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
            (item.manufacturers && item.manufacturers.toLowerCase().includes(lowerSearch)) ||
            (item.Id && item.Id.toString().includes(lowerSearch))
        );
    }

    // STEP B: Pagination Logic
    let paginatedItems = [];
    let calcTotalPages = 1;
    let calcTotalCount = 0;

    if (processedData.length > itemsPerPage) {
        // Case: We have a large list (likely all items fetched), so we slice locally
        calcTotalCount = processedData.length;
        calcTotalPages = Math.ceil(calcTotalCount / itemsPerPage);
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        paginatedItems = processedData.slice(startIndex, startIndex + itemsPerPage);
        
        // Edge case: Search result reduced items such that current page is empty
        if (paginatedItems.length === 0 && processedData.length > 0) {
            paginatedItems = processedData.slice(0, itemsPerPage); // Fallback to page 1
        }
    } else {
        // Case: We have a small list (likely Server Pagination returned exactly 10 items)
        paginatedItems = processedData;
        // Use Server counts if available, otherwise fallback to local length
        // Note: If we filtered locally (Step A), we must use local length
        if (searchTerm.trim() && processedData.length !== vendorProducts.length) {
             calcTotalCount = processedData.length;
             calcTotalPages = 1; // Filtered result usually fits on 1 page unless very large list cached
        } else {
             calcTotalCount = vendorTotalCount || processedData.length;
             calcTotalPages = vendorTotalPages || 1;
        }
    }

    return { 
        currentItems: paginatedItems, 
        displayTotalPages: Math.max(1, calcTotalPages),
        displayTotalCount: calcTotalCount
    };
  }, [vendorProducts, searchTerm, currentPage, itemsPerPage, vendorTotalCount, vendorTotalPages]);


  // --- Handlers ---
  const handleEdit = (e, product) => {
    e.stopPropagation();
    setEditingId(product._id);
    setStockUpdates({ stock: product.vendorStock || 0, discount: product.vendorDiscount || 0 });
  };

  const handleUpdate = async (e, productId) => {
    e.stopPropagation();
    const res = await updateProductStock(productId, stockUpdates.stock, stockUpdates.discount);
    if (res?.success) {
        setEditingId(null);
        fetchVendorProducts2(currentPage, debouncedSearch);
    }
  };

  const handleRowClick = (product) => {
      if(editingId !== product._id) { setSelectedProduct(product); setShowModal(true); }
  };

  // --- Pagination Render ---
  const renderPaginationItems = () => {
    let items = [];
    if (displayTotalPages <= 1) return null;

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(displayTotalPages - 1, currentPage + 1);

    if (currentPage <= 3) { start = 2; end = Math.min(4, displayTotalPages - 1); }
    if (currentPage >= displayTotalPages - 2) { start = Math.max(displayTotalPages - 3, 2); end = displayTotalPages - 1; }

    items.push(<Pagination.Item key={1} active={1 === currentPage} onClick={() => setCurrentPage(1)}>1</Pagination.Item>);
    if (start > 2) items.push(<Pagination.Ellipsis key="start-dots" disabled />);
    for (let i = start; i <= end; i++) {
        items.push(<Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>{i}</Pagination.Item>);
    }
    if (end < displayTotalPages - 1) items.push(<Pagination.Ellipsis key="end-dots" disabled />);
    if (displayTotalPages > 1) items.push(<Pagination.Item key={displayTotalPages} active={displayTotalPages === currentPage} onClick={() => setCurrentPage(displayTotalPages)}>{displayTotalPages}</Pagination.Item>);
    
    return items;
  };

  if (loading && vendorProducts.length === 0) {
    return <div className="text-center py-5"><Spinner animation="border" /> <p>Loading...</p></div>;
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h5 className="card-title mb-0">Your Hospital Products (In Stock)</h5>
        </div>

        <div className="row mb-4">
            <div className="col-md-6">
                <InputGroup>
                    <InputGroup.Text><BsSearch/></InputGroup.Text>
                    <Form.Control 
                        placeholder="Search products..." 
                        value={searchTerm} 
                        onChange={e => { 
                            setSearchTerm(e.target.value); 
                            if(currentPage !== 1) setCurrentPage(1); 
                        }} 
                    />
                </InputGroup>
            </div>
            <div className="col-md-6 text-md-end">
                <Badge bg="secondary">Total: {displayTotalCount} (Page {currentPage}/{displayTotalPages})</Badge>
            </div>
        </div>

        <div className="table-responsive">
            <Table hover className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Info</th>
                        <th>Price</th>
                        <th>Your Price</th>
                        <th>Stock</th>
                        <th>Discount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map(product => (
                            <tr key={product._id} onClick={() => handleRowClick(product)} style={{cursor: 'pointer'}}>
                                <td>#{product.Id || 'N/A'}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <img src={getProductImage(product)} style={{width:40, height:40, objectFit:'cover'}} className="rounded me-2" alt=""/>
                                        <div><h6 className="mb-0">{product.name}</h6></div>
                                    </div>
                                </td>
                                <td>{product.manufacturers}</td>
                                <td>₹{parseFloat(product.mrp || 0).toFixed(2)}</td>
                                <td className="text-primary fw-bold">₹{parseFloat(product.vendorPrice || 0).toFixed(2)}</td>
                                
                                <td>
                                    {editingId === product._id ? (
                                        <Form.Control type="number" size="sm" style={{width:70}} value={stockUpdates.stock} onClick={e=>e.stopPropagation()} onChange={e=>setStockUpdates({...stockUpdates, stock: e.target.value})} />
                                    ) : <span className={product.vendorStock <= 5 ? 'text-danger fw-bold' : ''}>{product.vendorStock || 0}</span>}
                                </td>

                                <td>
                                    {editingId === product._id ? (
                                        <Form.Control type="number" size="sm" style={{width:70}} value={stockUpdates.discount} onClick={e=>e.stopPropagation()} onChange={e=>setStockUpdates({...stockUpdates, discount: e.target.value})} />
                                    ) : <Badge bg="warning" text="dark">{product.vendorDiscount || 0}%</Badge>}
                                </td>

                                <td>
                                    {editingId === product._id ? (
                                        <div className="d-flex gap-1">
                                            <Button size="sm" variant="success" onClick={(e)=>handleUpdate(e, product._id)}><BsCheck/></Button>
                                            <Button size="sm" variant="secondary" onClick={(e)=>{e.stopPropagation(); setEditingId(null)}}><BsX/></Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="outline-primary" onClick={(e)=>handleEdit(e, product)}><BsPencil/></Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="10" className="text-center py-4">No products match your search.</td></tr>
                    )}
                </tbody>
            </Table>
        </div>

        {displayTotalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
                <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} />
                    {renderPaginationItems()}
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(displayTotalPages, p+1))} disabled={currentPage === displayTotalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(displayTotalPages)} disabled={currentPage === displayTotalPages} />
                </Pagination>
            </div>
        )}

      </div>

      {selectedProduct && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl" dialogClassName="product-detail-modal">
          <Modal.Header closeButton><Modal.Title>{selectedProduct.name}</Modal.Title></Modal.Header>
          <Modal.Body>
             <Row>
               <Col md={5} className="text-center">
                 {Array.isArray(selectedProduct.image_url) && selectedProduct.image_url.length > 1 ? (
                   <Carousel>
                     {selectedProduct.image_url.map((img, i) => <Carousel.Item key={i}><img className="d-block w-100" src={img} style={{maxHeight: 300, objectFit: 'contain'}} alt=""/></Carousel.Item>)}
                   </Carousel>
                 ) : <img src={getProductImage(selectedProduct)} className="img-fluid" style={{maxHeight: 300, objectFit: 'contain'}} alt=""/>}
               </Col>
               <Col md={7}>
                 <DetailItem label="Product ID" value={selectedProduct.Id} />
                 <DetailItem label="Manufacturer" value={selectedProduct.manufacturers} />
                 <DetailItem label="Description" value={selectedProduct.description} />
                 <DetailItem label="Use" value={selectedProduct.primary_use} />
               </Col>
             </Row>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default VendorProductsList;