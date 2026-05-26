import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Spinner, Form, Pagination, InputGroup, Modal, Row, Col, ListGroup, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsPencil, BsBox } from 'react-icons/bs';

const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";

const MEDICINE_STATUS = { AVAILABLE: 'ADD TO CART', SOLD_OUT: 'SOLD OUT', NOT_FOR_SALE: 'NOT FOR SALE' };

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

const MedicinesList = ({ refreshKey }) => {
  const { medicines2 = [], vendorMedicines = [], loading, fetchMedicines2, fetchVendorMedicines2, updateMedicineStock } = useContext(MyContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showEditModal, setShowEditModal] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({ stock: '', discount: '' });
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState(null);

  const getMedicineImage = (medicine) => {
    if (!medicine) return DUMMY_IMAGE;
    if (Array.isArray(medicine.image_url) && medicine.image_url.length > 0) {
      const firstImageUrl = medicine.image_url[0];
      if (typeof firstImageUrl === 'string' && firstImageUrl.startsWith('http')) return firstImageUrl;
    }
    if (typeof medicine.image === 'string' && medicine.image.startsWith('http')) return medicine.image;
    return DUMMY_IMAGE;
  };
  
  // ... (rest of the logic is the same)
  const medicinesWithVendorData = useMemo(() => {
    const vendorDataMap = new Map(vendorMedicines.map(m => [m._id, {
      vendorStock: m.vendorStock,
      vendorDiscount: m.vendorDiscount,
      vendorPrice: m.vendorPrice
    }]));

    const combined = medicines2.map(medicine => ({
      ...medicine,
      ...vendorDataMap.get(medicine._id)
    }));
    
    combined.sort((a, b) => {
        const idA = a.Id ? parseInt(a.Id, 10) : 0;
        const idB = b.Id ? parseInt(b.Id, 10) : 0;
        if (isNaN(idA) || isNaN(idB)) {
            return (a.Id || '').toString().localeCompare((b.Id || '').toString());
        }
        return idA - idB;
    });

    return combined;
  }, [medicines2, vendorMedicines]);

  const filteredMedicines = useMemo(() => {
    if (!Array.isArray(medicinesWithVendorData)) return [];
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    if (!searchLower) return medicinesWithVendorData;

    return medicinesWithVendorData.filter(medicine => {
      if (!medicine) return false;
      return (
        (medicine.name || '').toLowerCase().includes(searchLower) ||
        (medicine.manufacturers || '').toLowerCase().includes(searchLower) ||
        (medicine.Id || '').toString().toLowerCase().includes(searchLower) ||
        (medicine.salt_composition || '').toLowerCase().includes(searchLower)
      );
    });
  }, [medicinesWithVendorData, debouncedSearchTerm]);

  const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
    return { currentItems, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [currentPage, itemsPerPage, filteredMedicines]);

  const loadData = useCallback(async () => {
    const tokenData = sessionStorage.getItem("Pharmacytoken");
    if (!tokenData) {
      navigate("/pharmacy/login");
      return;
    }
    try {
      await Promise.all([fetchMedicines2(), fetchVendorMedicines2()]);
    } catch (err) {
      console.error('Failed to load medicines data:', err);
    }
  }, [fetchMedicines2, fetchVendorMedicines2, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleEdit = (medicine) => {
    if (!medicine) return;
    setMedicineToEdit(medicine);
    setStockUpdates({
      stock: medicine.vendorStock || '',
      discount: medicine.vendorDiscount || ''
    });
    setShowEditModal(true);
  };

   const handleUpdate = async () => {
    if (!medicineToEdit) return;
    try {
      const result = await updateMedicineStock(medicineToEdit._id, stockUpdates.stock, stockUpdates.discount);
      
      if (result.success) {
        setShowEditModal(false);
        setMedicineToEdit(null);
        await loadData(); 
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
  
  const handleRowClick = (medicine) => {
    setSelectedMedicineDetail(medicine);
    setShowDetailModal(true);
  };
  
  const handleCloseDetailModal = () => {
      setShowDetailModal(false);
      setSelectedMedicineDetail(null);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setMedicineToEdit(null);
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (value !== '') {
        const numValue = parseInt(value, 10);
        if (name === 'stock') processedValue = Math.max(0, numValue);
        else if (name === 'discount') processedValue = Math.min(100, Math.max(0, numValue));
    }
    setStockUpdates(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const buildPaginationItems = () => {
    const items = [];
    const pageNeighbours = 1; 
    
    if (totalPages <= 1) return null;

    const startPage = Math.max(2, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

    items.push(<Pagination.Item key={1} active={1 === currentPage} onClick={() => setCurrentPage(1)}>1</Pagination.Item>);

    if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
    }

    for (let number = startPage; number <= endPage; number++) {
        items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>{number}</Pagination.Item>);
    }

    if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
    }

    if (totalPages > 1) {
      items.push(<Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item>);
    }

    return items;
  };
  
  const renderMedicineStatus = (status) => {
    switch (status) {
        case MEDICINE_STATUS.AVAILABLE: return <Badge bg="success">Available</Badge>;
        case MEDICINE_STATUS.SOLD_OUT: return <Badge bg="danger">Sold Out</Badge>;
        case MEDICINE_STATUS.NOT_FOR_SALE: return <Badge bg="secondary">Not for Sale</Badge>;
        default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };
  
  if (loading && medicines2.length === 0) {
    return <div className="text-center py-5"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner><p className="mt-2">Loading medicines...</p></div>;
  }

  return (
    <>
      <style>
      {`
        .medicine-detail-modal { max-width: 1140px !important; width: 100% !important; margin: auto; }
        .medicine-detail-modal .modal-content { max-width: 1140px !important; width: 100% !important; flex: 1 1 auto; }
        .carousel-item img { height: 300px; object-fit: contain; width: 100%; }
      `}
      </style>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {/* Table remains the same */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h5 className="card-title mb-0">Medicines Inventory</h5>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, manufacturer, ID or salt..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                />
              </InputGroup>
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
              <Badge bg="light" text="dark" className="fs-6 p-2">
                Showing {filteredMedicines.length > 0 ? Math.min(indexOfFirstItem + 1, filteredMedicines.length) : 0}-
                {Math.min(indexOfLastItem, filteredMedicines.length)} of {filteredMedicines.length} medicines
              </Badge>
            </div>
          </div>


          {loading && medicines2.length > 0 && (
            <div className="text-center mb-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Updating medicines...</span>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Medicine ID</th>
                  <th>Medicine Info</th>
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
                {currentItems.length > 0 ? (
                  currentItems.map(medicine => (
                    medicine && (
                      <tr key={medicine._id} onClick={() => handleRowClick(medicine)} style={{ cursor: 'pointer' }}>
                        <td className="fw-semibold">#{medicine.Id || 'N/A'}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={getMedicineImage(medicine)} alt={medicine.name || 'Medicine'} className="rounded me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }} />
                            <div>
                              <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>{medicine.name || 'Unnamed Medicine'}</h6>
                              <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>{medicine.salt_composition || 'No composition'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{medicine.manufacturers || '-'}</td>
                        <td className="text-end">₹{parseFloat(medicine.mrp || 0).toFixed(2)}</td>
                        <td className="text-end">₹{parseFloat(medicine.best_price || 0).toFixed(2)}</td>
                        <td className="text-end text-primary fw-semibold">₹{medicine.vendorPrice || '0.00'}</td>
                        <td className="text-end">
                           <Badge bg={medicine.vendorDiscount > 0 ? "warning" : "light"} text={medicine.vendorDiscount > 0 ? "dark" : "secondary"}>{medicine.vendorDiscount || 0}%</Badge>
                        </td>
                        <td className="text-end">
                           <span className={(medicine.vendorStock || 0) <= 10 ? 'text-danger fw-semibold' : ''}>{medicine.vendorStock || 0}</span>
                        </td>
                        <td>{renderMedicineStatus(medicine.for_sale)}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(medicine); }} disabled={loading} className="d-flex align-items-center">
                            <BsPencil className="me-1" size={13} /> Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                   <tr>
                     <td colSpan="10" className="text-center py-4">
                       <div className="py-5">
                         <BsBox size={48} className="text-muted mb-3" />
                         <h5 className="mb-1">{debouncedSearchTerm ? 'No Matching Medicines Found' : 'No Medicines Available'}</h5>
                         <p className="text-muted">{debouncedSearchTerm ? 'Try adjusting your search term.' : 'Please check back later.'}</p>
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
             <div className="d-flex justify-content-center mt-4">
               <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || loading} />
                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || loading} />
                {buildPaginationItems()}
                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || loading} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || loading} />
               </Pagination>
             </div>
          )}
        </div>
      </div>
      
      {selectedMedicineDetail && (
        <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered size="xl" dialogClassName="medicine-detail-modal">
          <Modal.Header closeButton>
            <Modal.Title>{selectedMedicineDetail.name || 'Medicine Details'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             {/* ⭐⭐⭐ START: MODAL DESIGN UPDATE ⭐⭐⭐ */}
            <Row className="w-100">
              <Col md={5} className="text-center mb-4 mb-md-0">
                {Array.isArray(selectedMedicineDetail.image_url) && selectedMedicineDetail.image_url.length > 1 ? (
                  <Carousel>
                    {selectedMedicineDetail.image_url.map((img, index) => (
                      <Carousel.Item key={index}>
                        <img className="d-block w-100" src={img} alt={`${selectedMedicineDetail.name} - view ${index + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }}/>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img src={getMedicineImage(selectedMedicineDetail)} alt={selectedMedicineDetail.name} className="img-fluid rounded shadow-sm" style={{ maxHeight: '300px', objectFit: 'contain' }} onError={(e) => { e.target.src = DUMMY_IMAGE; }} />
                )}
              </Col>
              <Col md={7}>
                <Row>
                  <Col md={6}>
                    <DetailItem label="Medicine ID" value={selectedMedicineDetail.Id} />
                    <DetailItem label="Packaging" value={selectedMedicineDetail.packaging} />
                    <DetailItem label="Primary Use" value={ selectedMedicineDetail.use_of || selectedMedicineDetail.primary_use } />
                    <DetailItem label="Prescription Required" value={ selectedMedicineDetail.prescription_required === 'YES' || selectedMedicineDetail.prescription_required === true } />
                    <DetailItem label="Manufacturer" value={selectedMedicineDetail.manufacturers} />
                  </Col>
                  <Col md={6}>
                    <DetailItem label="MRP" value={`₹${parseFloat(selectedMedicineDetail.mrp || 0).toFixed(2)}`} />
                    <DetailItem label="Best Price" value={`₹${parseFloat(selectedMedicineDetail.best_price || 0).toFixed(2)}`} />
                    <DetailItem label="Your Price" value={`₹${parseFloat(selectedMedicineDetail.vendorPrice || 0).toFixed(2)}`} />
                    <DetailItem label="Salt Composition" value={selectedMedicineDetail.salt_composition} />
                    <DetailItem label="Storage" value={selectedMedicineDetail.storage} />
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '15px' }}>
                <DetailItem label="Introduction" value={selectedMedicineDetail.introduction} />
                <DetailItem label="Description" value={selectedMedicineDetail.description} />
                <DetailItem label="Benefits" value={selectedMedicineDetail.benefits} />
                <DetailItem label="How to Use" value={selectedMedicineDetail.how_to_use} />
                <DetailItem label="How It Works" value={selectedMedicineDetail.how_works} />
                <DetailItem label="Safety Advice" value={selectedMedicineDetail.safety_advise} />
                <DetailItem label="If You Miss a Dose" value={selectedMedicineDetail.if_miss} />
                <DetailItem label="Alternate Brands" value={selectedMedicineDetail.alternate_brand} />
            </div>
             {/* ⭐⭐⭐ END: MODAL DESIGN UPDATE ⭐⭐⭐ */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit modal remains the same */}
      <Modal show={showEditModal} onHide={handleEditModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Medicine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {medicineToEdit && (
            <div>
                 <p><strong>Medicine:</strong> {medicineToEdit.name}</p>
                 <Form>
                     <Form.Group className="mb-3" controlId="medicineStock">
                         <Form.Label>Your Stock</Form.Label>
                         <Form.Control type="number" name="stock" min="0" value={stockUpdates.stock} onChange={handleModalFormChange} placeholder="Enter stock quantity" />
                     </Form.Group>
                     <Form.Group className="mb-3" controlId="medicineDiscount">
                         <Form.Label>Your Discount %</Form.Label>
                         <Form.Control type="number" name="discount" min="0" max="100" value={stockUpdates.discount} onChange={handleModalFormChange} placeholder="Enter discount %" />
                     </Form.Group>
                 </Form>
             </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditModalClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MedicinesList;