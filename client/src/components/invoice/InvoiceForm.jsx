import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import Spinner from '../common/Spinner';

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS', 'ZAR'];

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0, total: 0 });

export default function InvoiceForm({ initialData = {}, onSubmit, loading, submitLabel = 'Save Invoice' }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPhone: '',
    description: '',
    items: [emptyItem()],
    tax: 0,
    discount: 0,
    dueDate: '',
    notes: '',
    currency: user?.currency || 'NGN',
    status: 'Unpaid',
    ...initialData,
    // Normalise dueDate to yyyy-MM-dd for input
    dueDate: initialData.dueDate
      ? new Date(initialData.dueDate).toISOString().slice(0, 10)
      : '',
  });

  const [errors, setErrors] = useState({});
  const [useItemised, setUseItemised] = useState(
    initialData.items && initialData.items.length > 0
  );

  // Recalculate item totals + overall amount
  const recalc = (items) => {
    const updated = items.map(it => ({
      ...it,
      total: Number(it.quantity || 0) * Number(it.unitPrice || 0),
    }));
    const subtotal = updated.reduce((s, it) => s + it.total, 0);
    const taxAmt = subtotal * ((Number(form.tax) || 0) / 100);
    const discAmt = subtotal * ((Number(form.discount) || 0) / 100);
    const amount = subtotal + taxAmt - discAmt;
    return { items: updated, amount: Math.max(0, amount) };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === 'tax' || name === 'discount') {
        const { amount } = recalc(next.items);
        return { ...next, amount };
      }
      return next;
    });
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = f.items.map((it, i) =>
        i === idx ? { ...it, [field]: value } : it
      );
      const { items: updated, amount } = recalc(items);
      return { ...f, items: updated, amount };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm(f => {
      const items = f.items.filter((_, i) => i !== idx);
      const { items: updated, amount } = recalc(items);
      return { ...f, items: updated, amount };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = 'Client name is required';
    if (!form.clientEmail.trim()) e.clientEmail = 'Client email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.clientEmail)) e.clientEmail = 'Invalid email';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (!useItemised && (!form.amount || Number(form.amount) <= 0)) e.amount = 'Amount must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      amount: useItemised
        ? recalc(form.items).amount
        : Number(form.amount),
      items: useItemised ? form.items : [],
      tax: Number(form.tax) || 0,
      discount: Number(form.discount) || 0,
    };
    onSubmit(payload);
  };

  const subtotal = useItemised
    ? form.items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0)
    : Number(form.amount) || 0;
  const taxAmt = subtotal * ((Number(form.tax) || 0) / 100);
  const discAmt = subtotal * ((Number(form.discount) || 0) / 100);
  const total = subtotal + taxAmt - discAmt;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Client details */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-ink-100 rounded-lg flex items-center justify-center text-sm">👤</span>
          Client Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name *</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              className={`input-field ${errors.clientName ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Emeka Okafor"
            />
            {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
          </div>
          <div>
            <label className="label">Client Email *</label>
            <input
              name="clientEmail"
              type="email"
              value={form.clientEmail}
              onChange={handleChange}
              className={`input-field ${errors.clientEmail ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="client@company.com"
            />
            {errors.clientEmail && <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>}
          </div>
          <div>
            <label className="label">Client Address <span className="text-ink-400 font-normal">(optional)</span></label>
            <input
              name="clientAddress"
              value={form.clientAddress}
              onChange={handleChange}
              className="input-field"
              placeholder="123 Victoria Island, Lagos"
            />
          </div>
          <div>
            <label className="label">Client Phone <span className="text-ink-400 font-normal">(optional)</span></label>
            <input
              name="clientPhone"
              value={form.clientPhone}
              onChange={handleChange}
              className="input-field"
              placeholder="+234 801 234 5678"
            />
          </div>
        </div>
      </div>

      {/* Invoice details */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-ink-100 rounded-lg flex items-center justify-center text-sm">📝</span>
          Invoice Details
        </h2>

        <div>
          <label className="label">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Web design & development services for Q1 2025…"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange} className="input-field">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due Date *</label>
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className={`input-field ${errors.dueDate ? 'border-red-400 focus:ring-red-400' : ''}`}
              min={new Date().toISOString().slice(0, 10)}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              {['Unpaid', 'Pending', 'Paid'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Line items toggle */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-ink-100 rounded-lg flex items-center justify-center text-sm">🔢</span>
            {useItemised ? 'Line Items' : 'Amount'}
          </h2>
          <button
            type="button"
            onClick={() => setUseItemised(v => !v)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {useItemised ? '→ Simple amount' : '→ Add line items'}
          </button>
        </div>

        {!useItemised ? (
          <div>
            <label className="label">Invoice Amount *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-mono">
                {form.currency === 'NGN' ? '₦' : form.currency}
              </span>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className={`input-field pl-9 ${errors.amount ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Items header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-ink-500 uppercase tracking-wider px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 sm:col-span-5">
                  <input
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="input-field text-sm text-center"
                    placeholder="1"
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="input-field text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
                  <span className="text-sm font-bold text-ink-700 text-right hidden sm:block">
                    {formatCurrency(item.total, form.currency)}
                  </span>
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >×</button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="w-full py-2.5 border border-dashed border-ink-300 rounded-xl text-sm text-ink-500 hover:border-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-all font-medium"
            >
              + Add Line Item
            </button>
          </div>
        )}

        {/* Tax / Discount */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-ink-100">
          <div>
            <label className="label">Tax %</label>
            <input
              name="tax"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.tax}
              onChange={handleChange}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Discount %</label>
            <input
              name="discount"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.discount}
              onChange={handleChange}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>

        {/* Totals summary */}
        <div className="bg-ink-50 rounded-xl p-4 space-y-2 mt-2">
          {useItemised && (
            <div className="flex justify-between text-sm text-ink-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, form.currency)}</span>
            </div>
          )}
          {Number(form.tax) > 0 && (
            <div className="flex justify-between text-sm text-ink-600">
              <span>Tax ({form.tax}%)</span>
              <span>+ {formatCurrency(taxAmt, form.currency)}</span>
            </div>
          )}
          {Number(form.discount) > 0 && (
            <div className="flex justify-between text-sm text-ink-600">
              <span>Discount ({form.discount}%)</span>
              <span>- {formatCurrency(discAmt, form.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-ink-900 text-base pt-2 border-t border-ink-200">
            <span>Total Due</span>
            <span>{formatCurrency(total, form.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-6">
        <label className="label">Notes <span className="text-ink-400 font-normal">(optional)</span></label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Payment terms, bank details, or any additional information for your client…"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary px-8">
          {loading ? <><Spinner size="sm" /> Saving…</> : submitLabel}
        </button>
      </div>
    </form>
  );
}
