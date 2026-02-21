import { useState, useEffect } from 'react';
import {
    Title,
    Button,
    Input,
    Text,
    BusyIndicator,
    Dialog,
    Label,
    Select,
    Option,
    MessageStrip,
    CheckBox
} from '@ui5/webcomponents-react';
import { productAPI, discountAPI } from '../services/api';
import './DiscountSetup.css';

const DiscountSetup = () => {
    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        product_id: '',
        applyToAll: false,
        discount_percent: '',
        valid_from: '',
        valid_till: '',
        active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch products and discounts
            const [productsRes, discountsRes] = await Promise.all([
                productAPI.getAll(),
                discountAPI.getAll()
            ]);
            
            if (productsRes.data.products) {
                setProducts(productsRes.data.products);
            }
            
            if (discountsRes.data.success) {
                setDiscounts(discountsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (discount = null) => {
        if (discount) {
            setEditMode(true);
            setCurrentDiscount(discount);
            setFormData({
                product_id: discount.product_id.toString(),
                applyToAll: false,
                discount_percent: discount.discount_percent.toString(),
                valid_from: discount.valid_from,
                valid_till: discount.valid_till,
                active: discount.active
            });
        } else {
            setEditMode(false);
            setCurrentDiscount(null);
            setFormData({
                product_id: '',
                applyToAll: false,
                discount_percent: '',
                valid_from: '',
                valid_till: '',
                active: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormData({
            product_id: '',
            applyToAll: false,
            discount_percent: '',
            valid_from: '',
            valid_till: '',
            active: true
        });
    };

    const handleSubmit = async () => {
        try {
            if (formData.applyToAll) {
                // Apply discount to all products
                setMessage({ type: 'info', text: 'Creating discounts for all products...' });
                
                let successCount = 0;
                let errorCount = 0;
                
                for (const product of products) {
                    try {
                        const discountData = {
                            product_id: product.id,
                            discount_percent: parseFloat(formData.discount_percent),
                            valid_from: formData.valid_from,
                            valid_till: formData.valid_till,
                            active: formData.active
                        };
                        
                        await discountAPI.create(discountData);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to create discount for ${product.name}:`, error);
                        errorCount++;
                    }
                }
                
                setMessage({ 
                    type: 'success', 
                    text: `Discount applied to ${successCount} products! ${errorCount > 0 ? `(${errorCount} failed)` : ''}` 
                });
            } else {
                // Apply discount to single product
                const discountData = {
                    ...formData,
                    product_id: parseInt(formData.product_id),
                    discount_percent: parseFloat(formData.discount_percent)
                };

                if (editMode) {
                    await discountAPI.update(currentDiscount.id, discountData);
                    setMessage({ type: 'success', text: 'Discount updated successfully!' });
                } else {
                    await discountAPI.create(discountData);
                    setMessage({ type: 'success', text: 'Discount created successfully!' });
                }
            }
            
            handleCloseDialog();
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Save discount error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save discount' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this discount?')) {
            try {
                await discountAPI.delete(id);
                setMessage({ type: 'success', text: 'Discount deleted successfully!' });
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                console.error('Delete discount error:', error);
                setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete discount' });
            }
        }
    };

    const filteredDiscounts = discounts.filter(discount =>
        discount.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === ''
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <BusyIndicator active />
            </div>
        );
    }

    return (
        <div className="products-page">
            <div style={{ marginBottom: '32px' }}>
                <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                    Discount Setup
                </Title>
                <Text style={{ color: '#666666', fontSize: '14px' }}>Manage product discounts and promotions</Text>
            </div>

            {message.text && (
                <MessageStrip
                    design={message.type === 'success' ? 'Positive' : 'Negative'}
                    hideCloseButton
                    style={{ marginBottom: '24px' }}
                >
                    {message.text}
                </MessageStrip>
            )}

            <div style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
            }}>
                <Input
                    placeholder="Search by name, barcode, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, maxWidth: '400px' }}
                />
                <Button
                    design="Emphasized"
                    onClick={() => handleOpenDialog()}
                    style={{ background: '#2563eb', minWidth: '160px' }}
                >
                    + Add New Discount
                </Button>
            </div>

            <div style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discount %</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid From</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid Till</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDiscounts.map((discount, index) => (
                                <tr key={discount.id} style={{ borderBottom: index < filteredDiscounts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                    <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{discount.product_name}</td>
                                    <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{discount.discount_percent}%</td>
                                    <td style={{ padding: '16px', color: '#666666', fontSize: '14px', textAlign: 'center' }}>{new Date(discount.valid_from).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px', color: '#666666', fontSize: '14px', textAlign: 'center' }}>{new Date(discount.valid_till).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: discount.active ? '#dcfce7' : '#fee2e2',
                                            color: discount.active ? '#16a34a' : '#dc2626'
                                        }}>
                                            {discount.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleOpenDialog(discount)}
                                            style={{
                                                padding: '6px 16px',
                                                marginRight: '8px',
                                                background: '#f0f9ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '4px',
                                                color: '#2563eb',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            style={{
                                                padding: '6px 16px',
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '4px',
                                                color: '#dc2626',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDiscounts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
                        No discounts found
                    </div>
                )}
            </div>

            <Dialog
                open={dialogOpen}
                onAfterClose={handleCloseDialog}
                headerText={editMode ? 'Edit Discount' : 'Add New Discount'}
                style={{ width: '500px' }}
            >
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <CheckBox
                            checked={formData.applyToAll}
                            onChange={(e) => setFormData({ ...formData, applyToAll: e.target.checked, product_id: e.target.checked ? '' : formData.product_id })}
                            text="Apply to All Products"
                            disabled={editMode}
                        />
                        <Text style={{ fontSize: '12px', color: '#666666', display: 'block', marginTop: '8px' }}>
                            {editMode ? 'Cannot apply to all products in edit mode' : 'Check this to apply discount to all products at once'}
                        </Text>
                    </div>

                    {!formData.applyToAll && (
                        <div style={{ marginBottom: '20px' }}>
                            <Label required showColon>Product</Label>
                            <Select
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: e.detail.selectedOption.value })}
                                style={{ width: '100%', marginTop: '8px' }}
                            >
                                <Option value="">Select Product</Option>
                                {products.map(product => (
                                    <Option key={product.id} value={product.id.toString()}>
                                        {product.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {formData.applyToAll && (
                        <div style={{ 
                            marginBottom: '20px', 
                            padding: '12px', 
                            background: '#eff6ff', 
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>
                                ℹ️ This will create discount for all {products.length} products in the system
                            </Text>
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <Label required showColon>Discount Percentage</Label>
                        <Input
                            type="number"
                            value={formData.discount_percent}
                            onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                            placeholder="Enter discount percentage"
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Label required showColon>Valid From</Label>
                        <Input
                            type="date"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Label required showColon>Valid Till</Label>
                        <Input
                            type="date"
                            value={formData.valid_till}
                            onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <CheckBox
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            text="Active Discount"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button design="Emphasized" onClick={handleSubmit} style={{ background: '#2563eb' }}>
                            {editMode ? 'Update Discount' : 'Create Discount'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default DiscountSetup;
