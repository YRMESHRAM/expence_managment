import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';

const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Other',
];

const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    description: '',
    receipt: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'UPI',
        description: initialData.description || '',
        receipt: initialData.receipt || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: categories.length > 0 ? categories[0].name : 'Food',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        description: '',
        receipt: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount greater than 0 is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'Add New Expense'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Expense Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Grocery Shopping, Metro Card, Dinner"
            className="input-field"
            autoFocus
          />
          {errors.title && (
            <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
              {errors.title}
            </span>
          )}
        </div>

        {/* Amount & Date Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="input-field"
            />
            {errors.amount && (
              <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {errors.amount}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
            />
            {errors.date && (
              <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {errors.date}
              </span>
            )}
          </div>
        </div>

        {/* Category & Payment Method Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {!categories.some((c) => c.name === 'Other') && (
                <option value="Other">Other</option>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add context or notes about this expense..."
            rows={3}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Receipt URL / Reference */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Receipt / Invoice Reference (Optional URL)
          </label>
          <input
            type="text"
            name="receipt"
            value={formData.receipt}
            onChange={handleChange}
            placeholder="https://... or Receipt ID"
            className="input-field"
          />
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {initialData ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
