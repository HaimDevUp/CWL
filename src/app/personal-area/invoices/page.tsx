
"use client";
import { useEffect, useState, Fragment } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { handleDownload } from '@/utils/downloadUtils';
import { formatDateTime } from '@/utils/dateUtils';
import { Statement } from '@/api/user';
import { Loader } from '@/components/UI/Loader';
import { toastMessages, updateToast, showLoading, dismissToast } from '@/utils/toastUtils';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { useIsMobile } from '@/hooks/useIsMobile';



export default function InvoicesPage() {
    const { getInvoices, downloadInvoice } = useUserProfile();
    const [invoices, setInvoices] = useState<Statement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const itemsPerPage = 10;
    const isMobile = useIsMobile();

    const totalPages = Math.ceil(invoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const invoicesToShow = invoices.slice(startIndex, endIndex);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            const invoicesData = await getInvoices();
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleAccordion = (invoiceId: string) => {
        setOpenAccordion(openAccordion === invoiceId ? null : invoiceId);
    };



    const handleDownloadInvoice = async (InvoiceId: string, InvoiceShortId: string) => {
        const toastId = showLoading('Starting Receipt download...');
        try {

            await handleDownload(
                downloadInvoice(InvoiceId),
                `receipt-${InvoiceShortId}`,
                'pdf'
            );
            updateToast(toastId, `Receipt ${InvoiceShortId} downloaded successfully!`, 'success');
        } catch (error) {
            dismissToast(toastId);
            toastMessages.downloadError('Receipt');
        }
    };

    if (isLoading) {
        return <Loader size="large" />;
    }

    return (
        <div>
            <section className="personal-area--section">
                <div className="personal-area--section-header">
                    <h4>Invoices</h4>
                </div>
                <div className="personal-area--table-wrapper">
                    <table className="personal-area--table">
                        <thead>
                            <tr>
                                <th className="ellipsis">Invoices Number</th>
                                <th>Product</th>
                                {!isMobile && <><th>Statement date</th>
                                    <th>Service</th>
                                    <th>Total charged</th></>}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoicesToShow.map((invoice) => {
                                const isOpen = openAccordion === invoice.id;
                                return (
                                    <Fragment key={invoice.id}>
                                        <tr 
                                            onClick={() => isMobile && toggleAccordion(invoice.id || '')}
                                            className={(isMobile ? 'table-row-clickable' : '') + (isOpen ? ' open' : '')}
                                        >
                                            <td className="ellipsis">{invoice.shortId}</td>
                                            <td>{invoice.offerType}</td>
                                            {!isMobile && <>
                                                <td>{formatDateTime(invoice.date)}</td>
                                                <td>{invoice.kind}</td>
                                                <td>${invoice.total.incVat}</td>
                                                <td><button onClick={() => handleDownloadInvoice(invoice.id, invoice.shortId)} className="btn-download">Download</button></td>
                                            </>}
                                            <td><ArrowIcon className="table-row-clickable-icon" /></td>
                                        </tr>
                                        {isMobile && isOpen && (
                                            <tr key={`${invoice.id}-details`} className="table-accordion-row" >
                                                <td colSpan={3}>
                                                    <div className="table-accordion-row-content">
                                                        <span className="table-accordion-row-content-label">Statement date</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {formatDateTime(invoice.date) || '-'}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">Service</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {invoice.kind || '-'}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">Total charged</span>
                                                        <span className="table-accordion-row-content-value">
                                                            ${invoice.total.incVat || '-'}
                                                        </span>
                                                        <span className="table-accordion-row-content-bottom-row">
                                                        <button onClick={() => handleDownloadInvoice(invoice.id, invoice.shortId)} className="btn-download">Download</button>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                            {totalPages > 1 && (
                                <tr>
                                    <td colSpan={6} className="pagination-cell">
                                        <div className="personal-area--pagination">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="pagination-btn"
                                            >
                                                <ArrowIcon className="arrow-icon-left" />
                                            </button>
                                            <div className="pagination-pages">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="pagination-btn"
                                            >
                                                <ArrowIcon className="arrow-icon-right" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}




