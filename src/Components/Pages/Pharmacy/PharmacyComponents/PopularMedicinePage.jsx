import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import PharmacyItemCard from '../PharmacyComponents/PharmacyItemCard';
import CardsCarousel from '../PharmacyComponents/CardsCarousel';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const PopularMedicinePage = () => {
  const { 
    popularMedicines1: popularMedicines = [],
    loading, 
    error,
    fetchPopularMedicines,
    getUserToken
  } = useContext(MyContext);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Debug logs
  useEffect(() => {
    console.group("PopularMedicinePage Context Data");
    console.log("Popular Medicines:", popularMedicines);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.groupEnd();
  }, [popularMedicines, loading, error]);

  // Token check & API fetch
  useEffect(() => {
    const token = getUserToken();
    console.log("User Token:", token);

    if (!token) {
      setAuthError('Please login to access medicines');
      return;
    }

    const loadData = async () => {
      try {
        if (popularMedicines.length === 0) {
          console.log("Fetching popular medicines...");
          await fetchPopularMedicines();
        }

        // Clear local error on success
        setLocalError(null);

      } catch (err) {
        console.error('❌ Error while loading popular medicines:', err);

        if (err.message?.toLowerCase().includes('token') || 
            err.message?.toLowerCase().includes('auth')) {
          setAuthError('Your session has expired. Please login again.');
        } else {
          setLocalError('Failed to load popular medicines. Please try again later.');
        }
      }
    };

    loadData();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = popularMedicines.filter(medicine => {
      return (
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.salt_composition?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    console.log("Filtered Popular Medicines:", filtered);
    setFilteredMedicines(filtered);
  }, [searchTerm, popularMedicines]);

  // Critical error checker
  const isCriticalError = (err) => {
    if (!err) return false;
    const e = err.toLowerCase();
    return e.includes('token') || e.includes('auth') || e.includes('unauthorized');
  };

  // Check if we already have valid data
  const hasValidData = popularMedicines.length > 0;

  // Auth Error Handling
  if ((authError || isCriticalError(error)) && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          {authError || error}
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => navigate('/login', { state: { from: '/pharmacy/popular-medicines' } })}
            >
              Login Now
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading popular medicines...</p>
      </Container>
    );
  }

  // API / Local Error
  if ((error || localError) && !hasValidData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p>{localError || `Error loading popular medicines: ${error}`}</p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              console.log("Retrying fetch...");
              fetchPopularMedicines();
              setLocalError(null);
            }}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // Main UI
  return (
    <Container className="py-4">


      {/* Carousel for Featured Popular Medicines */}
      {popularMedicines.length > 0 && (
        <div className="mb-5">
          <CardsCarousel
            mainTittle="Featured Popular Medicines"
            items={popularMedicines.slice(0, 10)} // Show top 10 in carousel
            isMedicine={true}
            showSeeAll={false}
          />
        </div>
      )}
      {/* Search Section */}
      <Row className="mb-4">
        <Col md={12}>
          <Form.Control
            type="search"
            placeholder="Search popular medicines by name or salt composition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {/* Popular Medicines Title */}
      <h2 className="mb-4">
        Popular Medicines
        <small className="text-muted ms-2">
          ({filteredMedicines.length} {filteredMedicines.length === 1 ? 'item' : 'items'})
        </small>
      </h2>
      {/* All Popular Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-5">
          <i className="ri-medicine-bottle-line fs-1 text-muted"></i>
          <h4 className="mt-3">No popular medicines found</h4>
          <p className="text-muted">
            {searchTerm ? 'Try a different search term' : 'No popular medicines available'}
          </p>
          {searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <Row className="g-4">
          {filteredMedicines.map(medicine => (
            <Col key={medicine._id} xs={12} sm={6} md={4} lg={3}>
              <PharmacyItemCard item={medicine} isMedicine={true} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PopularMedicinePage;