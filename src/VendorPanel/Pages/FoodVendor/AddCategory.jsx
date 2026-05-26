import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const initialState = {
    selectedType: '',
    customTypeName: '',
    subCategory: '',
    calorie: '',
};

const AddCategory = ({ onCategoryAdded }) => {
    const { createCategory, getFoodCategories } = useContext(MyContext);
    
    const [formData, setFormData] = useState(initialState);
    // ✅ MODIFIED: State now holds a FileList (multiple files) instead of a single file
    const [foodImages, setFoodImages] = useState(null); 
    const [foodTypes, setFoodTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchFoodTypes = async () => {
            try {
                const response = await getFoodCategories();
                if (response.success === 1) {
                    const uniqueTypes = [...new Map(response.data.map(item => [item.name, item])).values()];
                    setFoodTypes(uniqueTypes);
                }
            } catch (err) {
                toast.error("Failed to fetch existing food types.");
            }
        };
        fetchFoodTypes();
    }, [getFoodCategories]);

    const validate = () => {
        const newErrors = {};
        if (!formData.selectedType) {
            newErrors.selectedType = "You must select a food type or choose to add a new one.";
        } else if (formData.selectedType === '__new__' && !formData.customTypeName.trim()) {
            newErrors.customTypeName = "The new custom type name is required.";
        }
        
        if (!formData.subCategory.trim()) {
            newErrors.subCategory = "The sub-category name is required.";
        }
        // ✅ MODIFIED: Validation now checks for multiple files
        if (!foodImages || foodImages.length === 0) {
            newErrors.image = "At least one representative image is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // ✅ NEW: Specific handler for multiple file input
    const handleFileChange = (e) => {
        setFoodImages(e.target.files);
        if(errors.image) {
            setErrors(prev => ({ ...prev, image: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.warn("Please correct the form errors.");
            return;
        }

        setIsLoading(true);
        
        const nameToSend = formData.selectedType === '__new__'
            ? formData.customTypeName.trim()
            : formData.selectedType;

        const data = new FormData();
        data.append('name', nameToSend);
        data.append('category', formData.subCategory.trim());
        data.append('calorie', formData.calorie.trim());

        // ✅ MODIFIED: Loop through the FileList and append each file
        // Appending multiple files with the same key name sends them as an array.
        if (foodImages) {
            for (let i = 0; i < foodImages.length; i++) {
                data.append('foodImage', foodImages[i]);
            }
        }

        try {
            const response = await createCategory(data);
            if (response.success === 1) {
                toast.success(`Category '${nameToSend} -> ${formData.subCategory.trim()}' created!`);
                setFormData(initialState);
                setFoodImages(null); // Reset file state
                e.target.reset();
                if (onCategoryAdded) onCategoryAdded();
            } else {
                toast.error(response.message || "Failed to create category.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} noValidate>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Food Type<span className="text-danger">*</span></Form.Label>
                        <Form.Select name="selectedType" value={formData.selectedType} onChange={handleChange} isInvalid={!!errors.selectedType}>
                            <option value="">Select a Type or Add New...</option>
                            {foodTypes.map(type => (<option key={type._id} value={type.name}>{type.name}</option>))}
                            <option value="__new__">-- Add New Custom Type --</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.selectedType}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    {formData.selectedType === '__new__' && (
                        <Form.Group className="mb-3">
                            <Form.Label>New Custom Type Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="customTypeName" value={formData.customTypeName} onChange={handleChange} placeholder="e.g., Sandwich" isInvalid={!!errors.customTypeName} required />
                            <Form.Control.Feedback type="invalid">{errors.customTypeName}</Form.Control.Feedback>
                        </Form.Group>
                    )}
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Sub-Category Name<span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g., Veggie Delight Pizza" isInvalid={!!errors.subCategory} required />
                        <Form.Control.Feedback type="invalid">{errors.subCategory}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Calories (Optional)</Form.Label>
                        <Form.Control type="text" name="calorie" value={formData.calorie} onChange={handleChange} placeholder="e.g., 350 kcal" />
                    </Form.Group>
                </Col>
            </Row>
            
            <Form.Group className="mb-3">
                <Form.Label>Category Images<span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="file"
                    // ✅ MODIFIED: Use new handler and add 'multiple' attribute
                    onChange={handleFileChange}
                    isInvalid={!!errors.image}
                    required
                    multiple 
                />
                <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
            </Form.Group>
            
            <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <><Spinner as="span" size="sm" /> Creating...</> : "Create Category"}
            </Button>
        </Form>
    );
};

export default AddCategory;