import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Container, Row, Col, Form, Spinner, Alert, Button, ToggleButton, ToggleButtonGroup, Badge } from 'react-bootstrap';
import PharmacyItemCard from '../PharmacyComponents/PharmacyItemCard';
import CardsCarousel from '../PharmacyComponents/CardsCarousel';
import { useNavigate } from 'react-router-dom';

// Utility function to calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const MedicinePage = () => {
  const { 
    medicines1: medicines = [], 
    popularMedicines1: popularMedicines = [],
    loading, 
    error,
    fetchMedicines,
    fetchPopularMedicines,
    getUserToken
  } = useContext(MyContext);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterWithin10km, setFilterWithin10km] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [prescriptionFilter, setPrescriptionFilter] = useState('all'); // 'all', 'yes', 'no'

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setLocationError('Enable location to filter nearby medicines');
          setFilterWithin10km(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      setFilterWithin10km(false);
    }
  }, []);

  // ✅ Debug logs
  useEffect(() => {
    console.group("MedicinePage Context Data");
    console.log("Medicines:", medicines);
    console.log("Popular Medicines:", popularMedicines);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.groupEnd();
  }, [medicines, popularMedicines, loading, error]);

  // ✅ Token check & API fetch
  useEffect(() => {
    const token = getUserToken();
    console.log("User Token:", token);

    if (!token) {
      setAuthError('Please login to access medicines');
      return;
    }

    const loadData = async () => {
      try {
        if (medicines.length === 0) {
          console.log("Fetching all medicines...");
          await fetchMedicines();
        }
        if (popularMedicines.length === 0) {
          console.log("Fetching popular medicines...");
          await fetchPopularMedicines();
        }

        // ✅ success pe local error clear
        setLocalError(null);

      } catch (err) {
        console.error('❌ Error while loading medicines:', err);

        if (err.message?.toLowerCase().includes('token') || 
            err.message?.toLowerCase().includes('auth')) {
          setAuthError('Your session has expired. Please login again.');
        } else {
          setLocalError('Failed to load medicines. Please try again later.');
        }
      }
    };

    loadData();
  }, []);

  // ✅ Categories निकालना
  useEffect(() => {
    const uniqueCategories = [...new Set(
      medicines
        .map(med => med.category || med.bread_crumb?.split('>')[0]?.trim())
        .filter(Boolean)
    )];

    console.log("Extracted Categories:", uniqueCategories);

    setCategories(['all', ...uniqueCategories]);
  }, [medicines]);

  // Helper function to check if prescription is required
  const isPrescriptionRequired = (medicine) => {
    const prescriptionValue = medicine.prescription_required;
    
    if (!prescriptionValue) return false;
    
    const value = prescriptionValue.toString().toLowerCase().trim();
    
    // Check for Yes/No
    if (value === 'yes' || value === 'true') return true;
    if (value === 'no' || value === 'false') return false;
    
    // Check for boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    return false;
  };

  // Process medicines with distance information
  const processMedicinesWithDistance = (meds) => {
    if (!userLocation) return meds;

    return meds.map(medicine => {
      try {
        if (!medicine.latitude || !medicine.longitude) {
          return { ...medicine, distance: null };
        }

        const medLat = parseFloat(medicine.latitude);
        const medLng = parseFloat(medicine.longitude);
        
        if (isNaN(medLat) || isNaN(medLng)) {
          return { ...medicine, distance: null };
        }

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          medLat,
          medLng
        );

        return { ...medicine, distance, requiresPrescription: isPrescriptionRequired(medicine) };
      } catch (error) {
        console.error('Error calculating distance for medicine:', medicine, error);
        return { ...medicine, distance: null, requiresPrescription: isPrescriptionRequired(medicine) };
      }
    });
  };

  // Filter medicines within 10km
  const filterMedicinesByDistance = (meds) => {
    return meds.filter(medicine => {
      return medicine.distance !== null && medicine.distance <= 10;
    });
  };

  // Sort medicines by distance (nearest first)
  const sortMedicinesByDistance = (meds) => {
    return [...meds].sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  };

  // ✅ Search + Filter
  useEffect(() => {
    let processed = [...medicines];
    
    // Add distance and prescription information
    processed = processMedicinesWithDistance(processed);
    
    // Sort by distance (nearest first)
    processed = sortMedicinesByDistance(processed);

    // Apply 10km filter if enabled
    if (filterWithin10km && userLocation) {
      processed = filterMedicinesByDistance(processed);
    }

    // Apply all filters
    const filtered = processed.filter(medicine => {
      // Search filter
      const matchesSearch =
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.salt_composition?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        medicine.category === selectedCategory ||
        medicine.bread_crumb?.includes(selectedCategory);

      // Prescription filter
      const matchesPrescription = 
        prescriptionFilter === 'all' ||
        (prescriptionFilter === 'yes' && medicine.requiresPrescription) ||
        (prescriptionFilter === 'no' && !medicine.requiresPrescription);

      return matchesSearch && matchesCategory && matchesPrescription;
    });

    console.log("Filtered Medicines:", filtered);
    setFilteredMedicines(filtered);
  }, [searchTerm, selectedCategory, medicines, filterWithin10km, userLocation, prescriptionFilter]);

  // ✅ Critical error checker
  const isCriticalError = (err) => {
    if (!err) return false;
    const e = err.toLowerCase();
    return e.includes('token') || e.includes('auth') || e.includes('unauthorized');
  };

  // ✅ Check if we already have valid data
  const hasValidData = medicines.length > 0 || popularMedicines.length > 0;

  // 🔴 Auth Error Handling (only when really needed)
  if ((authError || isCriticalError(error)) && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          {authError || error}
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => navigate('/login', { state: { from: '/pharmacy/medicines' } })}
            >
              Login Now
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // 🔄 Loading state
  if (loading && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading medicines...</p>
      </Container>
    );
  }

  // ❌ API / Local Error (only if no medicines yet)
  if ((error || localError) && !hasValidData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p>{localError || `Error loading medicines: ${error}`}</p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              console.log("Retrying fetch...");
              fetchMedicines();
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

  // ✅ Main UI
  return (
    <Container className="py-4">
      {/* Popular Medicines */}
      {/* {popularMedicines.length > 0 && (
        <div className="mb-5">
          <CardsCarousel
            mainTittle="Popular Medicines"
            items={popularMedicines}
            isMedicine={true}
            showSeeAll={false}
          />
        </div>
      )} */}

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder="Search medicines by name or salt composition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </Form.Select>
        </Col> 
        <Col md={3}>
          <Form.Select
            value={prescriptionFilter}
            onChange={(e) => setPrescriptionFilter(e.target.value)}
          >
            <option value="all">All Prescription Types</option>
            <option value="yes">Prescription Required</option>
            <option value="no">No Prescription Required</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Location and Distance Filter */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          {locationError && (
            <Alert variant="warning" className="mb-0 py-2">
              <small>{locationError}</small>
            </Alert>
          )}
          {userLocation && ( 
            <div className="text-muted">
              <small>
                <i className="fas fa-map-marker-alt me-1"></i>
                Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </small>
            </div>
          )}
        </div>
        
        <ToggleButtonGroup
          type="checkbox"
          value={filterWithin10km ? ['10km'] : []}
          onChange={() => setFilterWithin10km(!filterWithin10km)}
        >
          <ToggleButton
            id="toggle-10km"
            value="10km"
            variant={filterWithin10km ? 'primary' : 'outline-secondary'}
            disabled={!userLocation}
          >
            <i className="fas fa-location-arrow me-2"></i>
            Within 10km
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* All Medicines */}
      <h2 className="mb-4">
        {selectedCategory === 'all' ? 'All Medicines' : selectedCategory}
        <small className="text-muted ms-2">
          ({filteredMedicines.length} {filteredMedicines.length === 1 ? 'item' : 'items'})
          {filterWithin10km && userLocation && ' (within 10km)'}
          {prescriptionFilter !== 'all' && ` (${prescriptionFilter === 'yes' ? 'Rx Required' : 'No Rx Required'})`}
        </small>
      </h2>

      {filteredMedicines.length === 0 ? (
        <div className="text-center py-5">
          <i className="ri-medicine-bottle-line fs-1 text-muted"></i>
          <h4 className="mt-3">No medicines found</h4>
          <p className="text-muted">
            {searchTerm ? 'Try a different search term' : 'No medicines available in this category'}
            {filterWithin10km && ' within 10km radius'}
            {prescriptionFilter !== 'all' && ` with ${prescriptionFilter === 'yes' ? 'prescription required' : 'no prescription required'}`}
          </p>
          {(searchTerm || filterWithin10km || prescriptionFilter !== 'all') && (
            <Button
              variant="outline-primary"
              onClick={() => {
                setSearchTerm('');
                setFilterWithin10km(false);
                setPrescriptionFilter('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <Row className="g-4">
          {filteredMedicines.map(medicine => (
            <Col key={medicine._id} xs={12} sm={6} md={4} lg={3}>
              <PharmacyItemCard 
                item={medicine} 
                isMedicine={true} 
                showDistance={true}
                userLocation={userLocation}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};





// Updated fetchMedicines function
export default MedicinePage;
