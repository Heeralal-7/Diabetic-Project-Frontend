import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Button, Spinner, Alert, Form, Row, Col, InputGroup, Image, Modal, Carousel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditFoodModal from './EditFoodModal';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const calculateDiscountedPrice = (amount, discountPercentage) => {
    const originalAmount = parseFloat(amount);
    const discount = parseFloat(discountPercentage);

    if (isNaN(originalAmount) || isNaN(discount) || discount < 0 || discount > 100) {
        return originalAmount;
    }

    return originalAmount - (originalAmount * discount / 100);
};

const AllFoods = ({ refreshKey, onRefresh }) => {

    const { getFood, updateFoodStatus, searchFood, getFoodCategories, setError } = useContext(MyContext);

    const [foodList, setFoodList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [componentError, setComponentError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);

    const [showImageCarouselModal, setShowImageCarouselModal] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentFoodName, setCurrentFoodName] = useState('');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    /* ---------------- FETCH CATEGORIES ONLY ONCE ---------------- */

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getFoodCategories();

                if (response.success === 1) {
                    setCategories(response.data);
                }

            } catch (err) {
                toast.error("Failed to fetch food categories.");
            }
        };

        fetchCategories();

        // eslint-disable-next-line
    }, []);

    /* ---------------- FETCH FOODS ---------------- */

    useEffect(() => {

        const fetchFoods = async () => {

            setIsLoading(true);
            setComponentError('');

            try {

                let response;

                if (debouncedSearchQuery.trim()) {
                    response = await searchFood(debouncedSearchQuery);
                } else {
                    response = await getFood(1, 10, filterCategory);
                }

                if (response.success === 1) {
                    setFoodList(response.details);
                } 
                else if (response.message !== "No food available right now") {
                    setComponentError(response.message);
                    setFoodList([]);
                } 
                else {
                    setFoodList([]);
                }

            } catch (err) {

                setComponentError("An unexpected error occurred while fetching data.");
                toast.error("An unexpected error occurred.");

            } finally {

                setIsLoading(false);

            }

        };

        fetchFoods();

        // eslint-disable-next-line
    }, [debouncedSearchQuery, filterCategory, refreshKey]);

    /* ---------------- REMOVE FOOD ---------------- */

    const handleRemove = async (id) => {

        if (window.confirm("This action will move the item to the 'Removed' list. Continue?")) {

            const response = await updateFoodStatus(id);

            if (response.success === 1) {

                toast.success("Food item removed successfully!");
                onRefresh();

            } else {

                toast.error(response.message || "Failed to remove item.");
                setError(response.message);

            }
        }
    };

    const clearSearch = () => setSearchQuery('');

    /* ---------------- EDIT MODAL ---------------- */

    const handleShowEditModal = (food) => {
        setSelectedFood(food);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedFood(null);
    };

    /* ---------------- IMAGE MODAL ---------------- */

    const handleShowImageCarouselModal = (images, foodName) => {
        setCurrentImages(images);
        setCurrentFoodName(foodName);
        setShowImageCarouselModal(true);
    };

    const handleCloseImageCarouselModal = () => {
        setShowImageCarouselModal(false);
        setCurrentImages([]);
        setCurrentFoodName('');
    };

    /* ---------------- TABLE BODY ---------------- */

    const renderTableBody = () => {

        if (isLoading) {
            return (
                <tr>
                    <td colSpan="7" className="text-center">
                        <Spinner animation="border" />
                    </td>
                </tr>
            );
        }

        if (foodList.length === 0) {
            return (
                <tr>
                    <td colSpan="7">
                        <Alert variant="info" className="text-center m-0">
                            {debouncedSearchQuery ? 'No results found.' : 'No food available right now.'}
                        </Alert>
                    </td>
                </tr>
            );
        }

        return foodList.map((food) => {

            const discountedPrice = calculateDiscountedPrice(food.amount, food.discountPercentage);

            return (
                <tr key={food._id}>

                    <td>
                        {food.image?.length > 0 ? (
                            <Image
                                src={`${process.env.REACT_APP_API_URL}${food.image[0]}`}
                                width="50"
                                height="50"
                                style={{ objectFit: 'cover', borderRadius: '5px', cursor: 'pointer' }}
                                thumbnail
                                onClick={() => handleShowImageCarouselModal(food.image, `${food.foodSubCategory} ${food.foodName}`)}
                            />
                        ) : (
                            <div style={{ width:50,height:50,background:'#f0f0f0',textAlign:'center',lineHeight:'50px',borderRadius:'5px'}}>No Img</div>
                        )}
                    </td>

                    <td>{food.foodName} {food.foodSubCategory}</td>

                    <td>{food.foodCategory}</td>

                    <td>₹{food.amount}</td>

                    <td>{food.discountPercentage}%</td>

                    <td>₹{discountedPrice.toFixed(2)}</td>

                    <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(food)}>
                            Edit
                        </Button>

                        <Button variant="outline-danger" size="sm" onClick={() => handleRemove(food._id)}>
                            Remove
                        </Button>
                    </td>

                </tr>
            );
        });
    };

    return (
        <>
            <Row className="mb-3">

                <Col md={6}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search by name, ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-secondary" onClick={clearSearch} disabled={!searchQuery}>
                            Clear
                        </Button>
                    </InputGroup>
                </Col>

                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>Filter by Category</InputGroup.Text>
                        <Form.Select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </InputGroup>
                </Col>

            </Row>

            {componentError && <Alert variant="danger">{componentError}</Alert>}

            <Table striped bordered hover responsive>

                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Original Price</th>
                        <th>Discount</th>
                        <th>Vendor Price (After Discount)</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {renderTableBody()}
                </tbody>

            </Table>

            {selectedFood && (
                <EditFoodModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    food={selectedFood}
                    onFoodUpdated={()=>{
                        onRefresh();
                        handleCloseEditModal();
                    }}
                />
            )}

            <Modal show={showImageCarouselModal} onHide={handleCloseImageCarouselModal} size="lg" centered>

                <Modal.Header closeButton>
                    <Modal.Title>{currentFoodName} Images</Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    {currentImages?.length > 0 ? (

                        <Carousel interval={null}>
                            {currentImages.map((imagePath,index)=>(
                                <Carousel.Item key={index}>
                                    <Image
                                        className="d-block w-100"
                                        src={`${process.env.REACT_APP_API_URL}${imagePath}`}
                                        style={{maxHeight:'500px',objectFit:'contain'}}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>

                    ) : (
                        <p className="text-center">No images available for this item.</p>
                    )}

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseImageCarouselModal}>
                        Close
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
};

export default AllFoods;