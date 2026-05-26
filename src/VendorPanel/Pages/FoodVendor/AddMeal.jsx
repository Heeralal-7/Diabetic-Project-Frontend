// src/components/admin/AddMeal.js
import React, { useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AddMeal = ({ onMealAdded }) => {
    const { addMeal1 } = useContext(MyContext);
    const [name, setName] = useState('');
    const [mealImage, setMealImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Meal name is required.";
        if (!mealImage) newErrors.image = "Meal image is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.warn("Please fill out all required fields.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('MealImage', mealImage);

        try {
            const response = await addMeal1(formData);
            if (response.success === 1) {
                toast.success("Meal added successfully!");
                setName('');
                setMealImage(null);
                e.target.reset(); // Resets the file input
                if (onMealAdded) onMealAdded();
            } else {
                toast.error(response.message || "Failed to add meal.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} noValidate>
            <Alert variant="info">Use this form to create a new meal type (e.g., "Breakfast," "Lunch"). You can then assign food items to this meal.</Alert>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meal Name<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!errors.name}
                            required
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meal Image<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => setMealImage(e.target.files[0])}
                            isInvalid={!!errors.image}
                            required
                        />
                        <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <><Spinner as="span" size="sm" /> Adding Meal...</> : "Add Meal"}
            </Button>
        </Form>
    );
};

export default AddMeal;