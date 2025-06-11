import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const pages = [
        'products_list', 'marketing_list', 'order_list', 'media_plans', 'offer_pricing_skus',
        'clients', 'suppliers', 'customer_support', 'sales_reports', 'finance_accounting'
    ];

    const toTitleCase = (str) => {
        return str
            .replace('_', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const fetchPermissions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:8000/api/me/permissions/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setUser(res.data.user || {});
            console.log('User permissions:', res.data.user);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                setError('Failed to fetch permissions');
            }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    return (
        <div className="container py-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">User Dashboard</h2>
                    <Button variant="danger" size="sm" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                    </Button>
                </div>

                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <h4>Your Permissions</h4>
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead className="table-dark">
                                <tr>
                                    <th>Page</th>
                                    <th>Permissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="2" className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : user?.permissions?.length > 0 ? (
                                    user.permissions.map((perm) => (
                                        <tr key={perm.page}>
                                            <td>{toTitleCase(perm.page)}</td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {perm.can_view && <span className="badge bg-success">View</span>}
                                                    {perm.can_edit && <span className="badge bg-success">Edit</span>}
                                                    {perm.can_create && <span className="badge bg-success">Create</span>}
                                                    {perm.can_delete && <span className="badge bg-success">Delete</span>}
                                                    {!perm.can_view && !perm.can_edit && !perm.can_create && !perm.can_delete && (
                                                        <span className="text-muted">No permissions</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            <i className="bi bi-shield-lock display-6 mb-2 d-block"></i>
                                            No permissions assigned
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;