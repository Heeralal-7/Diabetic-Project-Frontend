import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Form, Button, Row, Col, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';

// Initial state for the category form for easy reset
const initialCategoryState = {
    selectedType: '',
    customTypeName: '',
    subCategory: '',
    calorie: '',
};

const UploadFood = ({ onMealAdded, onCategoryAdded }) => {
    // New subadmin context functions
    const { 
        addMealSubadmin, 
        createFoodCategory, 
        getFoodCategoriesSubadmin,
        mealsLoading,
        foodCategoriesLoading
    } = useContext(MyContext);

    // ======== STATE FOR ADD MEAL TAB ========
    const [mealName, setMealName] = useState('');
    const [mealImage, setMealImage] = useState(null);
    const [mealErrors, setMealErrors] = useState({});

    // ======== STATE FOR ADD CATEGORY TAB ========
    const [categoryFormData, setCategoryFormData] = useState(initialCategoryState);
    const [foodImages, setFoodImages] = useState(null); // Holds multiple files
    const [foodTypes, setFoodTypes] = useState([]);
    const [categoryErrors, setCategoryErrors] = useState({});

    // Effect to fetch existing food types for the category dropdown
    useEffect(() => {
        const fetchFoodTypes = async () => {
            try {
                const response = await getFoodCategoriesSubadmin();
                if (response.success) {
                    // Ensure unique types are listed
                    const uniqueTypes = [...new Map(response.data.categories.map(item => [item.name, item])).values()];
                    setFoodTypes(uniqueTypes);
                }
            } catch (err) {
                toast.error("Failed to fetch existing food types.");
            }
        };
        fetchFoodTypes();
    }, []);

    // ======== LOGIC FOR ADD MEAL TAB ========
    const validateMeal = () => {
        const newErrors = {};
        if (!mealName.trim()) newErrors.name = "Meal name is required.";
        if (!mealImage) newErrors.image = "Meal image is required.";
        setMealErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMealSubmit = async (e) => {
        e.preventDefault();
        if (!validateMeal()) {
            toast.warn("Please fill out all required fields.");
            return;
        }

        const mealData = {
            name: mealName
        };

        try {
            const response = await addMealSubadmin(mealData, mealImage);
            if (response.success) {
                toast.success("Meal added successfully!");
                setMealName('');
                setMealImage(null);
                setMealErrors({});
                e.target.reset(); // Resets the file input
                if (onMealAdded) onMealAdded(); // Callback for parent component
            } else {
                toast.error(response.message || "Failed to add meal.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred while adding the meal.");
        }
    };

    // ======== LOGIC FOR ADD CATEGORY TAB ========
    const validateCategory = () => {
        const newErrors = {};
        if (!categoryFormData.selectedType) {
            newErrors.selectedType = "You must select a food type or choose to add a new one.";
        } else if (categoryFormData.selectedType === '__new__' && !categoryFormData.customTypeName.trim()) {
            newErrors.customTypeName = "The new custom type name is required.";
        }
        
        if (!categoryFormData.subCategory.trim()) {
            newErrors.subCategory = "The sub-category name is required.";
        }
        if (!foodImages || foodImages.length === 0) {
            newErrors.image = "At least one representative image is required.";
        }
        setCategoryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setCategoryFormData(prev => ({ ...prev, [name]: value }));
        if (categoryErrors[name]) {
            setCategoryErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCategoryFileChange = (e) => {
        setFoodImages(e.target.files);
        if (categoryErrors.image) {
            setCategoryErrors(prev => ({ ...prev, image: null }));
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!validateCategory()) {
            toast.warn("Please correct the form errors.");
            return;
        }

        const nameToSend = categoryFormData.selectedType === '__new__'
            ? categoryFormData.customTypeName.trim()
            : categoryFormData.selectedType;

        const categoryData = {
            name: nameToSend,
            category: categoryFormData.subCategory.trim(),
            calorie: categoryFormData.calorie.trim()
        };

        try {
            const response = await createFoodCategory(categoryData, foodImages ? foodImages[0] : null);
            if (response.success) {
                toast.success(`Category '${nameToSend} -> ${categoryFormData.subCategory.trim()}' created!`);
                setCategoryFormData(initialCategoryState);
                setFoodImages(null);
                setCategoryErrors({});
                e.target.reset(); // Resets all form fields including file input
                
                // Refresh food types list
                const typesResponse = await getFoodCategoriesSubadmin();
                if (typesResponse.success) {
                    const uniqueTypes = [...new Map(typesResponse.data.categories.map(item => [item.name, item])).values()];
                    setFoodTypes(uniqueTypes);
                }
                
                if (onCategoryAdded) onCategoryAdded(); // Callback for parent component
            } else {
                toast.error(response.message || "Failed to create category.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred while creating the category.");
        }
    };

    return (
        <Tabs defaultActiveKey="category" id="upload-food-tabs" className="mb-3">
            {/* ====== ADD CATEGORY TAB PANE ====== */}
            <Tab eventKey="category" title="Add Food Category">
                <Form onSubmit={handleCategorySubmit} noValidate>
                    <Alert variant="info">Use this form to add a specific food item (e.g., "Margherita") under a broader food type (e.g., "Pizza").</Alert>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Food Type<span className="text-danger">*</span></Form.Label>
                                <Form.Select name="selectedType" value={categoryFormData.selectedType} onChange={handleCategoryChange} isInvalid={!!categoryErrors.selectedType}>
                                    <option value="">Select a Type or Add New...</option>
                                    {foodTypes.map(type => (<option key={type._id} value={type.name}>{type.name}</option>))}
                                    <option value="__new__">-- Add New Custom Type --</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{categoryErrors.selectedType}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            {categoryFormData.selectedType === '__new__' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>New Custom Type Name<span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="customTypeName" value={categoryFormData.customTypeName} onChange={handleCategoryChange} placeholder="e.g., Pizza" isInvalid={!!categoryErrors.customTypeName} required />
                                    <Form.Control.Feedback type="invalid">{categoryErrors.customTypeName}</Form.Control.Feedback>
                                </Form.Group>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Sub-Category Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="subCategory" value={categoryFormData.subCategory} onChange={handleCategoryChange} placeholder="e.g., Veggie Delight" isInvalid={!!categoryErrors.subCategory} required />
                                <Form.Control.Feedback type="invalid">{categoryErrors.subCategory}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Calories (Optional)</Form.Label>
                                <Form.Control type="text" name="calorie" value={categoryFormData.calorie} onChange={handleCategoryChange} placeholder="e.g., 350 kcal" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Category Images<span className="text-danger">*</span></Form.Label>
                        <Form.Control type="file" onChange={handleCategoryFileChange} isInvalid={!!categoryErrors.image} required />
                        <Form.Control.Feedback type="invalid">{categoryErrors.image}</Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={foodCategoriesLoading}>
                        {foodCategoriesLoading ? <><Spinner as="span" size="sm" /> Creating...</> : "Create Category"}
                    </Button>
                </Form>
            </Tab>

            {/* ====== ADD MEAL TAB PANE ====== */}
            <Tab eventKey="meal" title="Add Meal Type">
                <Form onSubmit={handleMealSubmit} noValidate>
                    <Alert variant="info">Use this form to create a new meal type (e.g., "Breakfast," "Lunch"). You can then assign food items to this meal.</Alert>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meal Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={mealName}
                                    onChange={(e) => setMealName(e.target.value)}
                                    isInvalid={!!mealErrors.name}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{mealErrors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meal Image<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={(e) => setMealImage(e.target.files[0])}
                                    isInvalid={!!mealErrors.image}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{mealErrors.image}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={mealsLoading}>
                        {mealsLoading ? <><Spinner as="span" size="sm" /> Adding Meal...</> : "Add Meal"}
                    </Button>
                </Form>
            </Tab>
        </Tabs>
    );
};

export default UploadFood;