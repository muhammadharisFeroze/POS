import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
    Title,
    Button,
    Text,
    MessageStrip,
    BusyIndicator
} from '@ui5/webcomponents-react';
import { useAuthStore } from '../store/authStore';
import './ImportProducts.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ImportProducts = () => {
    const { token } = useAuthStore();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [importResult, setImportResult] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check if it's an Excel file
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setMessage({ type: '', text: '' });
                setImportResult(null);

                // Read and preview Excel data
                try {
                    const data = await readExcelFile(selectedFile);
                    setPreviewData(data);
                    setShowPreview(true);
                    setMessage({ type: 'info', text: `File loaded: ${data.length} rows found. Review the data below and click "Confirm Import" to proceed.` });
                } catch (error) {
                    setMessage({ type: 'error', text: 'Failed to read Excel file. Please check the format.' });
                    setFile(null);
                }
            } else {
                setMessage({ type: 'error', text: 'Please select a valid Excel file (.xlsx or .xls)' });
                setFile(null);
            }
        }
    };

    const readExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleImport = async () => {
        if (previewData.length === 0) {
            setMessage({ type: 'error', text: 'No data to import. Please select a file first.' });
            return;
        }

        setLoading(true);
        setMessage({ type: 'info', text: 'Importing products... This may take a few moments.' });

        try {
            console.log('Token available:', !!token);
            console.log('Sending data:', previewData.length, 'rows');

            const response = await fetch(`${API_BASE_URL}/products/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: previewData })
            });

            const data = await response.json();

            if (response.status === 401) {
                setMessage({ type: 'error', text: 'Unauthorized. Please login as admin.' });
                setLoading(false);
                return;
            }

            if (response.status === 403) {
                setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
                setLoading(false);
                return;
            }

            if (data.success) {
                setImportResult(data.data);
                const { successCount, skippedCount, errorCount } = data.data;
                let messageText = `Successfully imported ${successCount} products!`;
                if (skippedCount > 0) {
                    messageText += ` ${skippedCount} skipped (duplicate SKU).`;
                }
                if (errorCount > 0) {
                    messageText += ` ${errorCount} failed.`;
                }

                setMessage({
                    type: skippedCount > 0 || errorCount > 0 ? 'warning' : 'success',
                    text: messageText
                });
                setFile(null);
                setPreviewData([]);
                setShowPreview(false);
                // Reset file input
                document.getElementById('file-input').value = '';
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to import products' });
            }
        } catch (error) {
            console.error('Import error:', error);
            setMessage({ type: 'error', text: 'Failed to import products. Please check your file format.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="import-products-page">
            <div style={{ marginBottom: '32px' }}>
                <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                    Import Products
                </Title>
                <Text style={{ color: '#666666', fontSize: '14px' }}>
                    Upload an Excel file to import multiple products at once
                </Text>
            </div>

            {message.text && (
                <MessageStrip
                    design={message.type === 'success' ? 'Positive' : message.type === 'error' ? 'Negative' : 'Information'}
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
                padding: '32px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px', display: 'block' }}>
                        📋 Excel File Requirements
                    </Text>
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '16px',
                        marginTop: '12px'
                    }}>
                        <Text style={{ fontSize: '14px', color: '#475569', display: 'block', marginBottom: '8px' }}>
                            Your Excel file should contain the following columns:
                        </Text>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#475569', fontSize: '14px' }}>
                            <li><strong>Product Name</strong> (required) - Name of the product</li>
                            <li><strong>SKU / Code / Barcode</strong> - Unique product code</li>
                            <li><strong>Category</strong> - Product category</li>
                            <li><strong>Price</strong> - Product price</li>
                            <li><strong>Stock / Quantity</strong> - Available quantity</li>
                            <li><strong>Tax</strong> - Tax percentage (optional)</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    marginBottom: '24px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📥</div>
                    <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <Button
                        design="Emphasized"
                        onClick={() => document.getElementById('file-input').click()}
                        style={{ marginBottom: '16px' }}
                    >
                        Select Excel File
                    </Button>
                    {file && (
                        <div style={{ marginTop: '16px' }}>
                            <Text style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                                ✓ Selected: {file.name}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#666666', display: 'block', marginTop: '4px' }}>
                                Size: {(file.size / 1024).toFixed(2)} KB
                            </Text>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Button
                        design="Emphasized"
                        onClick={handleImport}
                        disabled={previewData.length === 0 || loading}
                        style={{ background: '#2563eb', minWidth: '200px' }}
                    >
                        {loading ? <BusyIndicator active size="Small" /> : 'Confirm Import'}
                    </Button>
                    {file && !loading && (
                        <Button
                            onClick={() => {
                                setFile(null);
                                setPreviewData([]);
                                setShowPreview(false);
                                setImportResult(null);
                                setMessage({ type: '', text: '' });
                                document.getElementById('file-input').value = '';
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Preview Data Table */}
            {showPreview && previewData.length > 0 && (
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
                }}>
                    <Text style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px', display: 'block' }}>
                        📋 Preview Data ({previewData.length} rows)
                    </Text>
                    <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>#</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Product Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>SKU/Code</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Category</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Unit</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Price</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Stock</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Tax %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, index) => {
                                    const name = row['name'] || row['Product Name'] || row['Name'] || row['PRODUCT NAME'] || row['Product'] || '-';
                                    const sku = row['barcode_category'] || row['barcode'] || row['SKU'] || row['Code'] || row['Barcode'] || row['SKU Code'] || row['BARCODE'] || '-';
                                    const category = row['category'] || row['Category'] || row['CATEGORY'] || 'General';
                                    const unit = row['unit'] || row['Unit'] || row['UNIT'] || '-';
                                    const price = row['price'] || row['Price'] || row['PRICE'] || row['Rate'] || 0;
                                    const stock = row['stock_quantity'] || row['stock_qty'] || row['Stock'] || row['Quantity'] || row['QTY'] || row['STOCK'] || 0;
                                    const tax = row['tax_percent'] || row['Tax'] || row['TAX'] || row['Tax %'] || 0;

                                    return (
                                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', color: '#666666' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: '500' }}>{name}</td>
                                            <td style={{ padding: '12px', color: '#666666' }}>{sku}</td>
                                            <td style={{ padding: '12px', color: '#666666' }}>{category}</td>
                                            <td style={{ padding: '12px', color: '#666666' }}>{unit}</td>
                                            <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(price || 0).toFixed(2)}</td>
                                            <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>{stock}</td>
                                            <td style={{ padding: '12px', color: '#666666', textAlign: 'right' }}>{tax}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {importResult && (
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
                }}>
                    <Text style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px', display: 'block' }}>
                        Import Results
                    </Text>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{
                            padding: '16px',
                            background: '#dcfce7',
                            borderRadius: '6px',
                            border: '1px solid #86efac'
                        }}>
                            <Text style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a', display: 'block' }}>
                                {importResult.successCount}
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#15803d' }}>
                                Successfully Imported
                            </Text>
                        </div>
                        {importResult.skippedCount > 0 && (
                            <div style={{
                                padding: '16px',
                                background: '#fef3c7',
                                borderRadius: '6px',
                                border: '1px solid #fbbf24'
                            }}>
                                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#d97706', display: 'block' }}>
                                    {importResult.skippedCount}
                                </Text>
                                <Text style={{ fontSize: '14px', color: '#92400e' }}>
                                    Skipped (Duplicate SKU)
                                </Text>
                            </div>
                        )}
                        {importResult.errorCount > 0 && (
                            <div style={{
                                padding: '16px',
                                background: '#fee2e2',
                                borderRadius: '6px',
                                border: '1px solid #fecaca'
                            }}>
                                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', display: 'block' }}>
                                    {importResult.errorCount}
                                </Text>
                                <Text style={{ fontSize: '14px', color: '#991b1b' }}>
                                    Failed
                                </Text>
                            </div>
                        )}
                        {importResult.totalRows && (
                            <div style={{
                                padding: '16px',
                                background: '#eff6ff',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb', display: 'block' }}>
                                    {importResult.totalRows}
                                </Text>
                                <Text style={{ fontSize: '14px', color: '#1e40af' }}>
                                    Total Rows
                                </Text>
                            </div>
                        )}
                    </div>

                    {/* Show skipped items */}
                    {importResult.skipped && importResult.skipped.length > 0 && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '8px' }}>
                                ⚠️ Skipped Items (Duplicate SKU):
                            </Text>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
                                {importResult.skipped.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            {importResult.skippedCount > 10 && (
                                <Text style={{ fontSize: '12px', color: '#92400e', marginTop: '8px', display: 'block' }}>
                                    ... and {importResult.skippedCount - 10} more
                                </Text>
                            )}
                        </div>
                    )}

                    {/* Show error items */}
                    {importResult.errors && importResult.errors.length > 0 && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', display: 'block', marginBottom: '8px' }}>
                                ❌ Errors:
                            </Text>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '13px' }}>
                                {importResult.errors.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            {importResult.errorCount > 10 && (
                                <Text style={{ fontSize: '12px', color: '#991b1b', marginTop: '8px', display: 'block' }}>
                                    ... and {importResult.errorCount - 10} more
                                </Text>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '24px'
            }}>
                <Text style={{ fontSize: '14px', color: '#92400e', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    💡 Tips:
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
                    <li>Make sure your Excel file has column headers in the first row</li>
                    <li>Product names are required for each row</li>
                    <li>Products with duplicate SKU/Barcode will be skipped</li>
                    <li>Missing SKU codes will be auto-generated</li>
                </ul>
            </div>
        </div>
    );
};

export default ImportProducts;
