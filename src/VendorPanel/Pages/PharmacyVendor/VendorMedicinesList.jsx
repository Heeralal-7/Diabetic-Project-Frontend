import React, { useContext, useEffect, useState, useMemo } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Badge, Spinner, Form, Pagination, InputGroup, Modal, Row, Col, ListGroup, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsPencil, BsCheck, BsX, BsBox } from 'react-icons/bs';

const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";

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

const VendorMedicinesList = ({ refreshKey }) => {
  const { vendorMedicines = [], loading, fetchVendorMedicines2, updateMedicineStock } = useContext(MyContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({ stock: "", discount: "" });

  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

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
  const filteredMedicines = useMemo(() => {
    if (!Array.isArray(vendorMedicines)) return [];
    
    return vendorMedicines.filter(medicine => {
      if (!medicine) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (medicine.name || '').toLowerCase().includes(searchLower) ||
        (medicine.manufacturers || '').toLowerCase().includes(searchLower) ||
        (medicine.Id || '').toString().includes(searchTerm) ||
        (medicine.salt_composition || '').toLowerCase().includes(searchLower)
      );
    });
  }, [vendorMedicines, searchTerm]);

  const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

    return { currentItems, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [currentPage, itemsPerPage, filteredMedicines]);

  useEffect(() => {
    const loadMedicines = async () => {
      const tokenData = sessionStorage.getItem("Pharmacytoken");
      if (!tokenData) {
        navigate("/pharmacy/login");
        return;
      }
      try {
        await fetchVendorMedicines2();
      } catch (err) {
        console.error('Failed to load vendor medicines:', err);
      }
    };
    
    loadMedicines();
  }, [fetchVendorMedicines2, refreshKey, navigate]);

  const handleEdit = (e, medicine) => {
    e.stopPropagation();
    if (!medicine) return;
    
    setEditingId(medicine._id);
    setStockUpdates({
      stock: medicine.vendorStock || 0,
      discount: medicine.vendorDiscount || 0
    });
  };

  const handleUpdate = async (e, medicineId) => {
    e.stopPropagation();
    try {
      const result = await updateMedicineStock(
        medicineId, 
        stockUpdates.stock, 
        stockUpdates.discount
      );
      if (result?.success) {
        setEditingId(null);
        await fetchVendorMedicines2();
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
  
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleRowClick = (medicine) => {
    if (editingId !== medicine._id) {
      setSelectedMedicine(medicine);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };
  
  if (loading && vendorMedicines.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
        <p className="mt-2">Loading vendor medicines...</p>
      </div>
    );
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
            <h5 className="card-title mb-0">Your Hospital Medicines (In Stock)</h5>
          </div>

          <div className="row mb-4 ">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search your medicines..."
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
              <Badge bg="secondary" className="fs-6">
                Showing {Math.min(indexOfFirstItem + 1, filteredMedicines.length)}-
                {Math.min(indexOfLastItem, filteredMedicines.length)} of {filteredMedicines.length} medicines
              </Badge>
            </div>
          </div>

          {loading && vendorMedicines.length > 0 && (
            <div className="text-center mb-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Updating medicines...</span>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="mb-0">
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
                    <tr key={medicine._id} onClick={() => handleRowClick(medicine)} style={{ cursor: 'pointer' }}>
                      <td className="fw-semibold">#{medicine.Id || 'N/A'}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={getMedicineImage(medicine)}
                            alt={medicine.name || 'Medicine image'}
                            className="rounded me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DUMMY_IMAGE;
                            }}
                          />
                          <div>
                            <h6 className="mb-0">{medicine.name || 'Unnamed Medicine'}</h6>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                              {medicine.salt_composition || 'No salt composition'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{medicine.manufacturers || '-'}</td>
                      <td className="text-end">₹{parseFloat(medicine.mrp || 0).toFixed(2)}</td>
                      <td className="text-end">₹{parseFloat(medicine.best_price || 0).toFixed(2)}</td>
                      
                      <td className="text-end text-primary fw-semibold">
                        ₹{
                          (
                            parseFloat(medicine.best_price || 0) - 
                            (parseFloat(medicine.best_price || 0) * parseFloat(medicine.vendorDiscount || 0) / 100)
                          ).toFixed(2)
                        }
                      </td>

                      <td className="text-end">
                        {editingId === medicine._id ? (
                          <Form.Control
                            type="number"
                            min="0"
                            max="100"
                            size="sm"
                            value={stockUpdates.discount}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const value = Math.min(100, Math.max(0, parseInt(e.target.value)) || 0);
                              setStockUpdates(prev => ({ ...prev, discount: value }));
                            }}
                            style={{ width: '80px' }}
                            className="ms-auto"
                            disabled={loading}
                          />
                        ) : (
                          <Badge bg="warning" text="dark">
                            {medicine.vendorDiscount || 0}%
                          </Badge>
                        )}
                      </td>
                      <td className="text-end">
                        {editingId === medicine._id ? (
                          <Form.Control
                            type="number"
                            min="0"
                            size="sm"
                            value={stockUpdates.stock}
                             onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const value = Math.max(0, parseInt(e.target.value) || 0);
                              setStockUpdates(prev => ({ ...prev, stock: value }));
                            }}
                            style={{ width: '80px' }}
                            className="ms-auto"
                            disabled={loading}
                          />
                        ) : (
                          <span className={(medicine.vendorStock || 0) <= 10 ? 'text-danger fw-semibold' : ''}>
                            {medicine.vendorStock || 0}
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge bg={medicine.for_sale === 'ADD TO CART' ? 'success' : 
                                  medicine.for_sale === 'SOLD OUT' ? 'danger' : 'secondary'}>
                          {medicine.for_sale === 'ADD TO CART' ? 'Available' : 
                           medicine.for_sale === 'SOLD OUT' ? 'Sold Out' : 
                           medicine.for_sale === 'NOT FOR SALE' ? 'Not for Sale' : 'Unknown'}
                        </Badge>
                      </td>
                      <td>
                        {editingId === medicine._id ? (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={(e) => handleUpdate(e, medicine._id)}
                              disabled={loading}
                              className="d-flex align-items-center"
                            >
                              {loading ? (
                                <Spinner as="span" size="sm" animation="border" role="status" />
                              ) : (
                                <BsCheck size={16} />
                              )}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="d-flex align-items-center"
                            >
                              <BsX size={16} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={(e) => handleEdit(e, medicine)}
                            disabled={loading || editingId !== null}
                            className="d-flex align-items-center"
                          >
                            <BsPencil className="me-1" size={13} />
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <div className="py-4">
                        <BsBox size={48} className="text-muted mb-3" />
                        <p className="fs-5 mb-1">
                          {searchTerm ? 'No matching medicines found' : 'No medicines in stock'}
                        </p>
                        <p className="text-muted mb-3">
                          {searchTerm ? 'Try a different search term' : 'Add stock to medicines to see them here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {filteredMedicines.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {selectedMedicine && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="xl" dialogClassName="medicine-detail-modal">
          <Modal.Header closeButton>
            <Modal.Title>{selectedMedicine.name || 'Medicine Details'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             {/* ⭐⭐⭐ START: MODAL DESIGN UPDATE ⭐⭐⭐ */}
            <Row className="w-100">
              <Col md={5} className="text-center mb-4 mb-md-0">
                {Array.isArray(selectedMedicine.image_url) && selectedMedicine.image_url.length > 1 ? (
                  <Carousel>
                    {selectedMedicine.image_url.map((img, index) => (
                      <Carousel.Item key={index}>
                        <img className="d-block w-100" src={img} alt={`${selectedMedicine.name} - view ${index + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }} />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img src={getMedicineImage(selectedMedicine)} alt={selectedMedicine.name} className="img-fluid rounded shadow-sm" style={{ maxHeight: '300px', objectFit: 'contain' }} onError={(e) => { e.target.src = DUMMY_IMAGE; }} />
                )}
              </Col>
              <Col md={7}>
                <Row>
                  <Col md={6}>
                    <DetailItem label="Medicine ID" value={selectedMedicine.Id} />
                    <DetailItem label="Packaging" value={selectedMedicine.packaging} />
                    <DetailItem label="Primary Use" value={selectedMedicine.use_of || selectedMedicine.primary_use} />
                    <DetailItem label="Prescription Required" value={selectedMedicine.prescription_required === 'YES' || selectedMedicine.prescription_required === true} />
                    <DetailItem label="Manufacturer" value={selectedMedicine.manufacturers} />
                  </Col>
                  <Col md={6}>
                    <DetailItem label="MRP" value={`₹${parseFloat(selectedMedicine.mrp || 0).toFixed(2)}`} />
                    <DetailItem label="Best Price" value={`₹${parseFloat(selectedMedicine.best_price || 0).toFixed(2)}`} />
                    <DetailItem label="Your Price" value={`₹${(parseFloat(selectedMedicine.best_price || 0) - (parseFloat(selectedMedicine.best_price || 0) * parseFloat(selectedMedicine.vendorDiscount || 0) / 100)).toFixed(2)}`} />
                    <DetailItem label="Salt Composition" value={selectedMedicine.salt_composition} />
                    <DetailItem label="Storage" value={selectedMedicine.storage} />
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '15px' }}>
                <DetailItem label="Introduction" value={selectedMedicine.introduction} />
                <DetailItem label="Description" value={selectedMedicine.description} />
                <DetailItem label="Benefits" value={selectedMedicine.benefits} />
                <DetailItem label="Common Side Effects" value={selectedMedicine.side_effect} />
                <DetailItem label="How to Use" value={selectedMedicine.how_to_use} />
                <DetailItem label="How It Works" value={selectedMedicine.how_works} />
                <DetailItem label="Safety Advice" value={selectedMedicine.safety_advise} />
                <DetailItem label="If You Miss a Dose" value={selectedMedicine.if_miss} />
                <DetailItem label="Alternate Brands" value={selectedMedicine.alternate_brand} />
            </div>
            {/* ⭐⭐⭐ END: MODAL DESIGN UPDATE ⭐⭐⭐ */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default VendorMedicinesList;