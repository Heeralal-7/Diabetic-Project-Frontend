// src/components/EditFoodModal.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { MyContext } from '../../../Context/Context';
import { Modal, Button, Form, Row, Col, Spinner, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

const EditFoodModal = ({ show, handleClose, food, onFoodUpdated }) => {
    const { editFood } = useContext(MyContext);

    // ✅ MODIFIED: State management for form data and images
    const [formData, setFormData] = useState({});
    const [existingImages, setExistingImages] = useState([]); // To display existing image URLs
    const [newImageFiles, setNewImageFiles] = useState([]);   // To hold new File objects
    const [imagesToRemove, setImagesToRemove] = useState([]); // To track URLs of images to be deleted
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // ✅ NEW: Ref for the hidden file input
    const fileInputRef = useRef(null);

    // Populate the form and image states when the 'food' prop changes
    useEffect(() => {
        if (food) {
            setFormData({
                foodName: food.foodName || '',
                ingredients: food.ingredients || '',
                foodCategory: food.foodCategory || 'Veg', // Default to 'Veg' for consistency
                foodSubCategory: food.foodSubCategory || '',
                sugarFree: food.sugarFree || 'No',
                amount: food.amount || '',
                discountPercentage: food.discountPercentage || '0',
            });
            // ✅ NEW: Populate existing images
            setExistingImages(food.image || []);
            
            // Reset state for new files and removals on new modal open
            setNewImageFiles([]);
            setImagesToRemove([]);
            setErrors({});
        }
    }, [food]);

    // Simple validation function
    const validateForm = () => {
        const newErrors = {};
        if (!formData.foodName.trim()) newErrors.foodName = "Food name is required.";
        if (!formData.foodCategory.trim()) newErrors.foodCategory = "Category is required.";
        if (!formData.amount || formData.amount <= 0) newErrors.amount = "Price must be a positive number.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ NEW: Handle adding new files one by one
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFiles(prevFiles => [...prevFiles, file]);
        }
        e.target.value = null; // Reset input to allow selecting the same file again
    };

    // ✅ NEW: Handle removing a newly added file (from preview)
    const handleRemoveNewFile = (indexToRemove) => {
        setNewImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // ✅ NEW: Handle removing an existing image
    const handleRemoveExistingImage = (imageUrl) => {
        // Move from existingImages to imagesToRemove
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
        setImagesToRemove(prev => [...prev, imageUrl]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.warn("Please fix the errors before saving.");
            return;
        }
        setIsLoading(true);

        const updateData = new FormData();
        
        // Append all form text data
        Object.keys(formData).forEach(key => updateData.append(key, formData[key]));
        
        // ✅ NEW: Append new image files
        newImageFiles.forEach(file => {
            updateData.append('image', file);
        });
        
        // ✅ NEW: Append the list of images to be removed
        if (imagesToRemove.length > 0) {
            updateData.append('imagesToRemove', JSON.stringify(imagesToRemove));
        }

        try {
            const response = await editFood(food._id, updateData);
            if (response.success === 1) {
                toast.success('Food updated successfully!');
                onFoodUpdated(); // Trigger refresh in parent
                handleClose();   // Close modal
            } else {
                toast.error(response.message || "Failed to update food.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!food) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Edit Food: {formData.foodName}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Body>
                    {/* --- Text fields are mostly the same --- */}
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Food Name</Form.Label><Form.Control type="text" name="foodName" value={formData.foodName} onChange={handleChange} isInvalid={!!errors.foodName} required /><Form.Control.Feedback type="invalid">{errors.foodName}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Ingredients</Form.Label><Form.Control type="text" name="ingredients" value={formData.ingredients} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Food Category</Form.Label><Form.Select name="foodCategory" value={formData.foodCategory} onChange={handleChange}><option value="Veg">Veg</option><option value="Non-veg">Non-veg</option></Form.Select></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Food Sub-Category</Form.Label><Form.Control type="text" name="foodSubCategory" value={formData.foodSubCategory} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Price (₹)</Form.Label><Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} isInvalid={!!errors.amount} required /><Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Discount (%)</Form.Label><Form.Control type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Sugar Free</Form.Label><Form.Select name="sugarFree" value={formData.sugarFree} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></Form.Select></Form.Group></Col>
                    </Row>
                    
                    {/* ✅ NEW: Custom Image Uploader UI */}
                    <Form.Group className="mb-3 border p-3 rounded">
                        <Form.Label className="h5">Manage Images</Form.Label>
                        <div className="d-flex flex-wrap gap-3 my-3">
                            {/* Display existing images */}
                            {existingImages.map((imageUrl, index) => (
                                <Card key={`existing-${index}`} style={{ width: '100px', position: 'relative' }}>
                                    <Image src={`${process.env.REACT_APP_API_URL}${imageUrl}`} thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                    <Button variant="danger" size="sm" style={{ position: 'absolute', top: '-10px', right: '-10px', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRemoveExistingImage(imageUrl)}>
                                        &times;
                                    </Button>
                                </Card>
                            ))}
                            {/* Display newly added images */}
                            {newImageFiles.map((file, index) => (
                                <Card key={`new-${index}`} style={{ width: '100px', position: 'relative' }}>
                                    <Image src={URL.createObjectURL(file)} thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                    <Button variant="danger" size="sm" style={{ position: 'absolute', top: '-10px', right: '-10px', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRemoveNewFile(index)}>
                                        &times;
                                    </Button>
                                </Card>
                            ))}
                        </div>
                        <Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                        <Button variant="secondary" onClick={() => fileInputRef.current.click()}>
                            Add New Image
                        </Button>
                        <Form.Text className="d-block mt-2">Add new images or remove existing ones. If no changes are made, current images will be kept.</Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditFoodModal;