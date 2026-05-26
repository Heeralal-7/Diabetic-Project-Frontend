import React, { useState, useEffect, useContext, useRef } from 'react';
import { MyContext } from '../../../Context/Context';
import { Form, Button, Row, Col, Spinner, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

// initialState is the same
const initialState = {
    foodName: '',
    foodType: '',
    ingredients: '',
    foodCategory: 'Veg',
    foodSubCategory: '',
    sugarFree: 'No',
    amount: '',
    discountPercentage: '0',
    calorie: '',
    MealId: '',
    addons: [{ name: '', price: '', calorie: '' }],
};

const AddFood = ({ onFoodAdded }) => {
    const { createFood, getFoodCategories, getFoodSubcategories, getmealvendor } = useContext(MyContext);

    // ✅ MODIFIED: selectedFiles is now an array to hold multiple File objects
    const [formData, setFormData] = useState(initialState);
    const [selectedFiles, setSelectedFiles] = useState([]); // Changed to array
    const [foodTypes, setFoodTypes] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [meals, setMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ NEW: Ref to trigger the hidden file input
    const fileInputRef = useRef(null);

    // All useEffect hooks remain the same...
    useEffect(() => {
        const fetchFoodTypes = async () => {
            try {
                const response = await getFoodCategories();
                if (response.success === 1) setFoodTypes(response.data);
            } catch (err) { toast.error("Failed to fetch food types."); }
        };
        fetchFoodTypes();
    }, [getFoodCategories]);
    
    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const response = await getmealvendor();
                if (response.success === 1) setMeals(response.details);
            } catch (err) { toast.error("An error occurred while fetching meals."); }
        };
        fetchMeals();
    }, [getmealvendor]);

    useEffect(() => {
        if (formData.foodType) {
            const fetchSubCategories = async () => {
                try {
                    const response = await getFoodSubcategories(formData.foodType);
                    if (response.success === 1) setSubCategories(response.details);
                } catch (err) { toast.error("Failed to fetch food sub-categories."); }
            };
            fetchSubCategories();
        } else {
            setSubCategories([]);
            setFormData(prev => ({ ...prev, foodSubCategory: '' }));
        }
    }, [formData.foodType, getFoodSubcategories]);

    // ✅ MODIFIED: Validation now checks the length of the selectedFiles array
    const validateForm = () => {
        const newErrors = {};
        if (!formData.foodName.trim()) newErrors.foodName = "A food type must be selected.";
        if (!formData.ingredients.trim()) newErrors.ingredients = "Ingredients are required.";
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Price must be a positive number.";
        // Check array length
        if (selectedFiles.length === 0) newErrors.image = "At least one image is required.";
        
        formData.addons.forEach((addon, index) => {
            if (addon.name.trim() || addon.price.toString().trim()) {
                if (!addon.name.trim()) newErrors[`addonName${index}`] = "Add-on name is required.";
                if (isNaN(parseFloat(addon.price)) || parseFloat(addon.price) < 0) newErrors[`addonPrice${index}`] = "Add-on price must be a non-negative number.";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // handleChange remains the same
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'foodType') {
            setFormData(prev => ({ ...prev, foodType: value, foodName: value, foodSubCategory: '' }));
            if (errors.foodName) setErrors(prev => ({...prev, foodName: null}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // ✅ NEW/MODIFIED: Logic to handle iterative file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Add the new file to our existing array
            setSelectedFiles(prevFiles => [...prevFiles, file]);
            if (errors.image) setErrors(prev => ({ ...prev, image: null }));
        }
        // Reset the file input so the user can select the same file again if needed
        e.target.value = null; 
    };

    // ✅ NEW: Function to remove a selected file from the preview
    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Add-on handlers remain the same
    const handleAddonChange = (index, e) => {
        const { name, value } = e.target;
        const newAddons = [...formData.addons];
        newAddons[index][name] = value;
        setFormData(prev => ({ ...prev, addons: newAddons }));
    };
    const handleAddAddon = () => setFormData(prev => ({...prev, addons: [...prev.addons, { name: '', price: '', calorie: '' }]}));
    const handleRemoveAddon = (index) => setFormData(prev => ({...prev, addons: formData.addons.filter((_, i) => i !== index)}));

    // ✅ MODIFIED: handleSubmit now iterates over the selectedFiles array
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.warn("Please correct the errors before submitting.");
            return;
        }
        setIsLoading(true);
        const data = new FormData();
        
        // This part is the same
        for (const key in formData) {
            if (key === 'foodType') continue;
            if (key === 'addons') {
                const validAddons = formData.addons.filter(a => a.name.trim() || a.price.toString().trim()).map(a => ({...a, price: parseFloat(a.price) || 0}));
                if (validAddons.length > 0) data.append('addons', JSON.stringify(validAddons));
            } else if (key === 'MealId' && formData.MealId) {
                data.append(key, formData[key]);
            } else if (key !== 'MealId') {
                data.append(key, formData[key]);
            }
        }

        // Append files from our state array
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                data.append('image', file);
            }
        }

        try {
            const response = await createFood(data);
            if (response.success === 1) {
                toast.success("Food created successfully!");
                if (onFoodAdded) onFoodAdded();
                setFormData(initialState);
                setSelectedFiles([]); // Reset the files array
                e.target.reset();
                setErrors({});
            } else {
                toast.error(response.message || "Failed to create food.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} noValidate>
            {/* --- All other form fields are the same, no changes needed above this line --- */}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3"><Form.Label>Food Type<span className="text-danger">*</span></Form.Label><Form.Select name="foodType" value={formData.foodType} onChange={handleChange} isInvalid={!!errors.foodName} required><option value="">Select a type...</option>{foodTypes.map(type => <option key={type._id} value={type.name}>{type.name}</option>)}</Form.Select><Form.Control.Feedback type="invalid">{errors.foodName}</Form.Control.Feedback></Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3"><Form.Label>Food Name</Form.Label><Form.Control type="text" name="foodName" value={formData.foodName} readOnly placeholder="Auto-populated from Food Type" /></Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3"><Form.Label>Food Category<span className="text-danger">*</span></Form.Label><Form.Select name="foodCategory" value={formData.foodCategory} onChange={handleChange}><option value="Veg">Veg</option><option value="Non-veg">Non-veg</option></Form.Select></Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3"><Form.Label>Food Sub-Category</Form.Label><Form.Select name="foodSubCategory" value={formData.foodSubCategory} onChange={handleChange} disabled={subCategories.length === 0}><option value="">Select Sub-Category (Optional)</option>{subCategories.map(s => <option key={s._id} value={s.category}>{s.category}</option>)}</Form.Select></Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Ingredients<span className="text-danger">*</span></Form.Label><Form.Control type="text" name="ingredients" value={formData.ingredients} placeholder="e.g., Flour, Tomato, Cheese" onChange={handleChange} isInvalid={!!errors.ingredients} required /><Form.Control.Feedback type="invalid">{errors.ingredients}</Form.Control.Feedback></Form.Group>
            <Row>
                <Col md={3}><Form.Group className="mb-3"><Form.Label>Price (₹)<span className="text-danger">*</span></Form.Label><Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} isInvalid={!!errors.amount} required min="0.01" step="0.01" /><Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback></Form.Group></Col>
                <Col md={3}><Form.Group className="mb-3"><Form.Label>Discount (%)<span className="text-danger">*</span></Form.Label><Form.Control type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required min="0" max="100" /><Form.Control.Feedback type="invalid">{errors.discountPercentage}</Form.Control.Feedback></Form.Group></Col>
                <Col md={3}><Form.Group className="mb-3"><Form.Label>Sugar Free</Form.Label><Form.Select name="sugarFree" value={formData.sugarFree} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></Form.Select></Form.Group></Col>
                <Col md={3}><Form.Group className="mb-3"><Form.Label>Calories</Form.Label><Form.Control type="text" name="calorie" value={formData.calorie} placeholder="e.g., 300 kcal" onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Assign to a Meal (Optional)</Form.Label><Form.Select name="MealId" value={formData.MealId} onChange={handleChange} disabled={meals.length === 0}><option value="">Select a Meal...</option>{meals.map(meal => (<option key={meal._id} value={meal._id}>{meal.name}</option>))}</Form.Select></Form.Group>
            <Form.Group className="mb-3 border p-3 rounded bg-light"><Form.Label className="d-block mb-3 h5">Add-ons (Optional)</Form.Label>{formData.addons.map((addon, index) => (<Row key={index} className="mb-3 g-2 align-items-end"><Col md={4}><Form.Label>Add-on Name {index + 1}</Form.Label><Form.Control type="text" name="name" value={addon.name} onChange={(e) => handleAddonChange(index, e)} isInvalid={!!errors[`addonName${index}`]} /><Form.Control.Feedback type="invalid">{errors[`addonName${index}`]}</Form.Control.Feedback></Col><Col md={3}><Form.Label>Price (₹)</Form.Label><Form.Control type="number" name="price" value={addon.price} onChange={(e) => handleAddonChange(index, e)} min="0" step="0.01" isInvalid={!!errors[`addonPrice${index}`]}/><Form.Control.Feedback type="invalid">{errors[`addonPrice${index}`]}</Form.Control.Feedback></Col><Col md={3}><Form.Label>Calorie</Form.Label><Form.Control type="text" name="calorie" value={addon.calorie} onChange={(e) => handleAddonChange(index, e)}/></Col><Col md={2} className="d-flex align-items-end">{formData.addons.length > 1 && (<Button variant="outline-danger" size="sm" onClick={() => handleRemoveAddon(index)} className="w-100">Remove</Button>)}</Col></Row>))}<Button variant="outline-success" size="sm" onClick={handleAddAddon} className="mt-2">Add Another Add-on</Button></Form.Group>

            {/* ✅ NEW: Custom Image Uploader UI */}
            <Form.Group className="mb-3 border p-3 rounded">
                <Form.Label className="h5">Food Images<span className="text-danger">*</span></Form.Label>

                {/* Image Previews */}
                <div className="d-flex flex-wrap gap-3 my-3">
                    {selectedFiles.map((file, index) => (
                        <Card key={index} style={{ width: '100px', position: 'relative' }}>
                            <Image 
                                src={URL.createObjectURL(file)} 
                                thumbnail 
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => handleRemoveFile(index)}
                            >
                                &times;
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* Hidden File Input */}
                <Form.Control
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }} // Hide the default input
                    accept="image/png, image/jpeg, image/webp" // Optional: Restrict file types
                />

                {/* Custom Button to Trigger File Input */}
                <Button variant="secondary" onClick={() => fileInputRef.current.click()}>
                    Add Image
                </Button>
                
                {/* Validation Error Message */}
                {errors.image && <div className="text-danger mt-2">{errors.image}</div>}
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <><Spinner as="span" animation="border" size="sm" /> Adding Food...</> : "Add Food"}
            </Button>
        </Form>
    );
};

export default AddFood;