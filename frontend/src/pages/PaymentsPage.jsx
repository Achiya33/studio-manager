import { useState, useMemo } from 'react';
import { demoStore, generateId } from '../lib/demoStore';
import { PAYMENT_METHODS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import {
  Search, Plus, X, CreditCard, TrendingUp, AlertCircle,
  CheckCircle, DollarSign, Filter, FileText
} from 'lucide-react';
import InvoiceModal from '../components/invoice/InvoiceModal';
import './Payments.css';

export default function PaymentsPage() {
  const { isAdmin } = useAuth();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [payments, setPayments] = useState(() => demoStore.getAll('payments'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [invoicePaymentId, setInvoicePaymentId] = useState(null);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!p.clientName.toLowerCase().includes(q)) return false;
        }
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [payments, searchQuery, filterStatus]);

  const summary = useMemo(() => {
    const total = payments.reduce((s, p) => s + p.totalAmount, 0);
    const received = payments.reduce((s, p) => s + p.paidAmount, 0);
    const outstanding = payments.reduce((s, p) => s + p.balance, 0);
    return { total, received, outstanding };
  }, [payments]);

  const handleRecordPayment = (paymentId, transaction) => {
    const payment = demoStore.getById('payments', paymentId);
    if (!payment) return;

    const newPaid = payment.paidAmount + transaction.amount;
    const newBalance = payment.totalAmount - newPaid;

    demoStore.update('payments', paymentId, {
      paidAmount: newPaid,
      balance: Math.max(0, newBalance),
      status: newBalance <= 0 ? 'paid' : 'partial',
      transactions: [...(payment.transactions || []), {
        ...transaction,
        date: new Date().toISOString(),
        recordedBy: user?.uid,
      }],
    });

    setPayments(demoStore.getAll('payments'));
    setShowPaymentForm(null);
    showToast(`Payment of Rs. ${transaction.amount.toLocaleString()} recorded`, 'success');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track all payments and outstanding balances</p>
        </div>
      </div>

      <div className="payment-summary-cards stagger-children">
        <div className="payment-summary-card animate-fade-in-up">
          <div className="payment-summary-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span className="payment-summary-title">Total Value</span>
            <span className="payment-summary-amount">Rs. {summary.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="payment-summary-card animate-fade-in-up">
          <div className="payment-summary-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="payment-summary-title">Received</span>
            <span className="payment-summary-amount" style={{ color: 'var(--success)' }}>Rs. {summary.received.toLocaleString()}</span>
          </div>
        </div>
        <div className="payment-summary-card animate-fade-in-up">
          <div className="payment-summary-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="payment-summary-title">Outstanding</span>
            <span className="payment-summary-amount" style={{ color: 'var(--warning)' }}>Rs. {summary.outstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="shoots-filters" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="payments-grid">
        {filteredPayments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-card-header">
              <div className="payment-client-info">
                <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)', color: '#000' }}>
                  {payment.clientName?.[0]?.toUpperCase()}
                </div>
                <span className="payment-client-name">{payment.clientName}</span>
              </div>
              <span className={`badge badge-${payment.status === 'paid' ? 'success' : payment.status === 'partial' ? 'warning' : 'danger'}`}>
                {payment.status}
              </span>
            </div>
            
            <div className="payment-card-body">
              <div className="payment-detail-row">
                <span className="payment-detail-label">Total Amount</span>
                <span className="payment-detail-value">Rs. {payment.totalAmount.toLocaleString()}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Paid Amount</span>
                <span className="payment-detail-value" style={{ color: 'var(--success)' }}>Rs. {payment.paidAmount.toLocaleString()}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Transactions</span>
                <span className="payment-detail-value" style={{ color: 'var(--text-tertiary)' }}>{payment.transactions?.length || 0} records</span>
              </div>
              
              <div className="payment-balance-row">
                <span className="payment-balance-label">Balance</span>
                <span className="payment-balance-amount" style={{ color: payment.balance > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  Rs. {payment.balance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="payment-card-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setInvoicePaymentId(payment.id)}
              >
                <FileText size={16} /> Receipt
              </button>
              {isAdmin && payment.balance > 0 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPaymentForm(payment)}
                >
                  <Plus size={16} /> Record
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showPaymentForm && (
        <RecordPaymentModal
          payment={showPaymentForm}
          onSave={(transaction) => handleRecordPayment(showPaymentForm.id, transaction)}
          onClose={() => setShowPaymentForm(null)}
        />
      )}

      {invoicePaymentId && (
        <InvoiceModal
          paymentId={invoicePaymentId}
          onClose={() => setInvoicePaymentId(null)}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({ payment, onSave, onClose }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payAmount = Number(amount);
    if (payAmount <= 0) return;
    if (payAmount > payment.balance) {
      alert(`Amount cannot exceed the balance of Rs. ${payment.balance.toLocaleString()}`);
      return;
    }
    onSave({ amount: payAmount, method, note });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                <strong>{payment.clientName}</strong> — Balance: <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Rs. {payment.balance.toLocaleString()}</span>
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (Rs.)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: ${payment.balance.toLocaleString()}`}
                max={payment.balance}
                min={1}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., Final payment" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
