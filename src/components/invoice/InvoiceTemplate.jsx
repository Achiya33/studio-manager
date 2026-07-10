import { forwardRef } from 'react';
import { format } from 'date-fns';
import './Invoice.css';

const InvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
  const {
    invoiceNumber,
    date,
    client,
    shoot,
    payment,
    studioInfo,
    transactions,
  } = invoiceData;

  const totalAmount = payment?.totalAmount || 0;
  const paidAmount = payment?.paidAmount || 0;
  const balance = payment?.balance || 0;

  return (
    <div className="invoice-wrapper" ref={ref}>
      <div className="invoice-page">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#invoiceGrad)"/>
                <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 12C22.03 12 23.92 12.67 25.45 13.82L23.57 15.7C22.56 14.96 21.33 14.5 20 14.5C16.97 14.5 14.5 16.97 14.5 20C14.5 21.33 14.96 22.56 15.7 23.57L13.82 25.45C12.67 23.92 12 22.03 12 20C12 15.58 15.58 12 20 12ZM26.18 14.55C27.33 16.08 28 17.97 28 20C28 24.42 24.42 28 20 28C17.97 28 16.08 27.33 14.55 26.18L16.43 24.3C17.44 25.04 18.67 25.5 20 25.5C23.03 25.5 25.5 23.03 25.5 20C25.5 18.67 25.04 17.44 24.3 16.43L26.18 14.55Z" fill="black"/>
                <defs>
                  <linearGradient id="invoiceGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#d97706"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="invoice-studio-name">{studioInfo?.name || 'Studio Manager Pro'}</h1>
              <p className="invoice-studio-tagline">{studioInfo?.tagline || 'Professional Photography Services'}</p>
            </div>
          </div>
          <div className="invoice-title-block">
            <h2 className="invoice-title">INVOICE</h2>
            <div className="invoice-meta">
              <div className="invoice-meta-row">
                <span>Invoice No:</span>
                <strong>{invoiceNumber || 'INV-0001'}</strong>
              </div>
              <div className="invoice-meta-row">
                <span>Date:</span>
                <strong>{date ? format(new Date(date), 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy')}</strong>
              </div>
              <div className="invoice-meta-row">
                <span>Status:</span>
                <strong className={`invoice-status invoice-status-${balance <= 0 ? 'paid' : 'pending'}`}>
                  {balance <= 0 ? 'PAID' : 'PENDING'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="invoice-divider" />

        {/* Addresses */}
        <div className="invoice-addresses">
          <div className="invoice-address-block">
            <h3>From</h3>
            <p className="invoice-address-name">{studioInfo?.name || 'Studio Manager Pro'}</p>
            <p>{studioInfo?.address || 'Colombo, Sri Lanka'}</p>
            <p>{studioInfo?.phone || '+94 77 000 0000'}</p>
            <p>{studioInfo?.email || 'info@studio.com'}</p>
          </div>
          <div className="invoice-address-block">
            <h3>Bill To</h3>
            <p className="invoice-address-name">{client?.name || 'Client Name'}</p>
            {client?.address && <p>{client.address}</p>}
            {client?.phone && <p>{client.phone}</p>}
            {client?.email && <p>{client.email}</p>}
          </div>
        </div>

        {/* Service Details */}
        <div className="invoice-table-section">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{shoot?.package || 'Photography Package'}</strong>
                  {shoot?.location && <br />}
                  {shoot?.location && <span className="invoice-location">📍 {shoot.location}</span>}
                  {shoot?.notes && <br />}
                  {shoot?.notes && <span className="invoice-notes">{shoot.notes}</span>}
                </td>
                <td>
                  <span className="invoice-type-badge">{shoot?.type || 'Photography'}</span>
                </td>
                <td>
                  {shoot?.date ? format(new Date(shoot.date), 'MMM d, yyyy') : '-'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  Rs. {totalAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="invoice-summary">
          <div className="invoice-summary-left">
            {/* Payment History */}
            {transactions && transactions.length > 0 && (
              <div className="invoice-payment-history">
                <h4>Payment History</h4>
                {transactions.map((t, i) => (
                  <div key={i} className="invoice-payment-entry">
                    <span className="invoice-payment-date">
                      {t.date ? format(new Date(t.date), 'MMM d, yyyy') : '-'}
                    </span>
                    <span className="invoice-payment-method">{t.method?.toUpperCase()}</span>
                    <span className="invoice-payment-amount">Rs. {t.amount?.toLocaleString()}</span>
                    {t.note && <span className="invoice-payment-note">({t.note})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="invoice-summary-right">
            <div className="invoice-summary-row">
              <span>Subtotal</span>
              <span>Rs. {totalAmount.toLocaleString()}</span>
            </div>
            <div className="invoice-summary-row">
              <span>Tax</span>
              <span>Rs. 0</span>
            </div>
            <div className="invoice-summary-row invoice-summary-total">
              <span>Total</span>
              <span>Rs. {totalAmount.toLocaleString()}</span>
            </div>
            <div className="invoice-summary-row invoice-summary-paid">
              <span>Paid</span>
              <span>Rs. {paidAmount.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="invoice-summary-row invoice-summary-balance">
                <span>Balance Due</span>
                <span>Rs. {balance.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="invoice-footer-notes">
            <h4>Notes</h4>
            <p>Thank you for choosing our services. We look forward to working with you again!</p>
          </div>
          <div className="invoice-footer-bank">
            <h4>Bank Details</h4>
            <p>{studioInfo?.bankName || 'Bank of Ceylon'}</p>
            <p>A/C: {studioInfo?.bankAccount || 'XXXX XXXX XXXX'}</p>
            <p>Branch: {studioInfo?.bankBranch || 'Main Branch'}</p>
          </div>
        </div>

        <div className="invoice-bottom-bar">
          <p>This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
