import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [permissionModal, setPermissionModal] = useState(false);
    const [page, setPage] = useState('products_list');
    const [permissions, setPermissions] = useState({
        can_view: false,
        can_edit: false,
        can_create: false,
        can_delete: false,
    });
    const navigate = useNavigate();

    const pages = [
        'products_list', 'marketing_list', 'order_list', 'media_plans', 'offer_pricing_skus',
        'clients', 'suppliers', 'customer_support', 'sales_reports', 'finance_accounting'
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const toTitleCase = (str) => {
        return str
            .replace('_', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:8000/api/users/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setUsers(res.data.users || []);
            console.log('API users:', res.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                setError('Failed to fetch users');
            }
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(
                'http://localhost:8000/api/users/create/', // Fixed URL
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            setEmail('');
            setPassword('');
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                setError(error.response?.data?.error || 'Failed to add user');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(
                `http://localhost:8000/api/users/${selectedUser.id}/delete/`, // Fixed URL
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            setShowDeleteModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                setError('Failed to delete user');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionChange = (key, value) => {
        setPermissions({ ...permissions, [key]: value });
    };

    const savePermissions = async () => {
        if (!selectedUser?.id || !page) {
            console.error('Invalid user ID or page:', selectedUser?.id, page);
            setError('Invalid user or page selected');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const payload = { page, ...permissions };
            console.log('Saving permissions for user:', selectedUser.id, 'Payload:', payload);
            const res = await axios.put(
                `http://localhost:8000/api/users/${selectedUser.id}/permissions/`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            console.log('Save permissions response:', res.data);
            setPermissionModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving permissions:', error);
            console.log('Error response:', error.response?.data, 'Status:', error.response?.status);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                setError(error.response?.data?.error || 'Failed to save permissions');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const openPermissionModal = (user) => {
        setSelectedUser(user);
        setPage('products_list');
        setPermissions({
            can_view: false,
            can_edit: false,
            can_create: false,
            can_delete: false,
        });
        setPermissionModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="container py-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">Admin Dashboard</h2>
                    <div className="d-flex gap-2">
                        <Button variant="light" size="sm" onClick={fetchUsers}>
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right"></i> Logout
                        </Button>
                    </div>
                </div>

                <div className="card-body">
                    <Form onSubmit={handleAddUser} className="mb-4">
                        <div className="row g-3">
                            <div className="col-md-5">
                                <Form.Label htmlFor="email">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                            <div className="col-md-5">
                                <Form.Label htmlFor="password">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <Button
                                    type="submit"
                                    variant="success"
                                    className="w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-plus me-1"></i> Add User
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Form>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="table-responsive">
                        <Table striped hover>
                            <thead className="table-dark">
                                <tr>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Permissions</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.permissions?.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {user.permissions.map((perm) => (
                                                            <span key={perm.page} className="badge bg-info">
                                                                {toTitleCase(perm.page)}:
                                                                {perm.can_view && ' View'}
                                                                {perm.can_edit && ' Edit'}
                                                                {perm.can_create && ' Create'}
                                                                {perm.can_delete && ' Delete'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">No permissions</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => openPermissionModal(user)}
                                                    >
                                                        <i className="bi bi-shield-lock"></i> Permissions
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(user)}
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">
                                            <i className="bi bi-people display-6 mb-2 d-block"></i>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteUser}>
                        <i className="bi bi-trash"></i> Delete User
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={permissionModal} onHide={() => setPermissionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-shield-lock me-2"></i>
                        Manage Permissions for {selectedUser?.email}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Page</Form.Label>
                            <Form.Select value={page} onChange={(e) => setPage(e.target.value)}>
                                {pages.map((p) => (
                                    <option key={p} value={p}>
                                        {toTitleCase(p)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="row">
                            {['can_view', 'can_edit', 'can_create', 'can_delete'].map((perm) => (
                                <div key={perm} className="col-md-6 mb-3">
                                    <Form.Check
                                        type="switch"
                                        id={perm}
                                        label={toTitleCase(perm.replace('can_', ''))}
                                        checked={permissions[perm]}
                                        onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setPermissionModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={savePermissions} disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <>
                                <i className="bi bi-save"></i> Save Permissions
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;