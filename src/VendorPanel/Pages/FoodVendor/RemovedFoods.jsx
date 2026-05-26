import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const RemovedFoods = ({ refreshKey }) => {

    const { getRemovedData } = useContext(MyContext);

    const [removedList, setRemovedList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchRemoved = async () => {

            setIsLoading(true);
            setError(null);

            try {

                const response = await getRemovedData();

                if (response.success === 1) {

                    setRemovedList(response.details);

                } else {

                    setError(response.message || "Could not fetch removed items.");

                }

            } catch (err) {

                setError("An unexpected error occurred.");
                toast.error("Error fetching removed food items.");

            } finally {

                setIsLoading(false);

            }

        };

        fetchRemoved();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);



    if (isLoading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (removedList.length === 0) {
        return <Alert variant="info">No removed food items found.</Alert>;
    }

    return (

        <Table striped bordered hover responsive>

            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Date Removed</th>
                </tr>
            </thead>

            <tbody>

                {removedList.map((food, index) => (

                    <tr key={food._id}>

                        <td>{index + 1}</td>

                        <td>
                            {food.foodSubCategory} {food.foodName}
                        </td>

                        <td>{food.foodCategory}</td>

                        <td>₹{food.amount}</td>

                        <td>
                            {new Date(food.updatedAt).toLocaleDateString()}
                        </td>

                    </tr>

                ))}

            </tbody>

        </Table>

    );

};

export default RemovedFoods;