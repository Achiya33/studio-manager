import { useRef, useState, useMemo } from 'react';
import InvoiceTemplate from './InvoiceTemplate';
import { demoStore } from '../../lib/demoStore';
import { X, Download, Printer, Eye } from 'lucide-react';
import './InvoiceModal.css';

// Invoice number generator
const generateInvoiceNumber = (shootId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = shootId ? shootId.slice(-4).toUpperCase() : Math.random().toString(36).substr(2, 4).toUpperCase();
  return `INV-${year}${month}-${seq}`;
};

// Studio info (configurable from settings in future)
const getStudioInfo = () => {
  return {
    name: 'Studio Manager Pro',
    tagline: 'Professional Photography Services',
    address: 'Colombo, Sri Lanka',
    phone: '+94 77 000 0000',
    email: 'info@studio.com',
    bankName: 'Bank of Ceylon',
    bankAccount: 'XXXX XXXX XXXX',
    bankBranch: 'Main Branch',
  };
};

export default function InvoiceModal({ shootId, paymentId, onClose }) {
  const invoiceRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const invoiceData = useMemo(() => {
    let shoot = null;
    let payment = null;
    let client = null;

    if (shootId) {
      shoot = demoStore.getById('shoots', shootId);
    }

    if (paymentId) {
      payment = demoStore.getById('payments', paymentId);
      if (payment && !shoot) {
        shoot = demoStore.getById('shoots', payment.shootId);
      }
    } else if (shoot) {
      const payments = demoStore.getByField('payments', 'shootId', shootId);
      payment = payments[0] || null;
    }

    if (shoot?.clientId) {
      client = demoStore.getById('clients', shoot.clientId);
    } else if (payment?.clientId) {
      client = demoStore.getById('clients', payment.clientId);
    }

    return {
      invoiceNumber: generateInvoiceNumber(shootId || paymentId),
      date: new Date().toISOString(),
      client: client || { name: payment?.clientName || shoot?.clientName || 'Client' },
      shoot: shoot ? {
        package: shoot.package,
        type: shoot.type,
        date: shoot.date,
        location: shoot.location,
        notes: shoot.notes,
      } : null,
      payment: payment ? {
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        balance: payment.balance,
      } : {
        totalAmount: shoot?.packageAmount || 0,
        paidAmount: 0,
        balance: shoot?.packageAmount || 0,
      },
      transactions: payment?.transactions || [],
      studioInfo: getStudioInfo(),
    };
  }, [shootId, paymentId]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setGenerating(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `${invoiceData.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      };

      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try printing instead.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !invoiceRef.current) return;

    // Get the invoice CSS
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    let styleHTML = '';
    styles.forEach(s => {
      styleHTML += s.outerHTML;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceData.invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          ${styleHTML}
          <style>
            body { margin: 0; padding: 0; background: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${invoiceRef.current.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for fonts to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="modal-overlay invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-header">
          <div className="invoice-modal-title">
            <Eye size={20} />
            <h2>Invoice Preview</h2>
            <span className="invoice-modal-number">{invoiceData.invoiceNumber}</span>
          </div>
          <div className="invoice-modal-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              title="Print Invoice"
            >
              <Printer size={16} /> Print
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
              disabled={generating}
              title="Download as PDF"
            >
              {generating ? (
                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ) : (
                <Download size={16} />
              )}
              {generating ? 'Generating...' : 'Download PDF'}
            </button>
            <button className="btn-icon btn-ghost" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="invoice-modal-body">
          <InvoiceTemplate ref={invoiceRef} invoiceData={invoiceData} />
        </div>
      </div>
    </div>
  );
}
