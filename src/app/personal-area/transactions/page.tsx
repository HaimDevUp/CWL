
"use client";
import { useEffect, useState, Fragment } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { handleDownload } from '@/utils/downloadUtils';
import { calculateDuration, formatDateTime } from '@/utils/dateUtils';
import { Transaction } from '@/schemas/profileSchemas';
import { Loader } from '@/components/UI/Loader';
import { toastMessages, updateToast, showLoading, dismissToast } from '@/utils/toastUtils';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { useIsMobile } from '@/hooks/useIsMobile';
import './transactions.scss';
import ExportIcon from '@/assets/icons/ExportFile.svg';


export default function TransactionsPage() {
    const { getCustomerTransactions, downloadCustomerTransactions } = useUserProfile();
    const [data, setData] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [downloadRangeFrom, setDownloadRangeFrom] = useState<string>('');
    const [downloadRangeTo, setDownloadRangeTo] = useState<string>('');

    const itemsPerPage = 10;
    const isMobile = useIsMobile();

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dataToShow = data.slice(startIndex, endIndex);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await getCustomerTransactions();
            setData(response);
        } catch (error) {
            console.error('Error fetching Transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleAccordion = (rowId: string) => {
        setOpenAccordion(openAccordion === rowId ? null : rowId);
    };



    const handleDownloadTransactions = async () => {
        const toastId = showLoading('Starting Transactions download...');
        try {

            await handleDownload(
                downloadCustomerTransactions(downloadRangeFrom, downloadRangeTo),
                `transactions-${formatDateTime(new Date(), 'date')}`,
                'csv'
            );
            updateToast(toastId, `Transactions downloaded successfully!`, 'success');
        } catch (error) {
            dismissToast(toastId);
            toastMessages.downloadError('Transactions');
        }
    };

    const handleDownloadRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '0') {
            setDownloadRangeFrom('');
            setDownloadRangeTo('');
            return;
        }
        const from = new Date(Date.now() - parseInt(value));
        const to = new Date();

        setDownloadRangeFrom(from.toISOString());
        setDownloadRangeTo(to.toISOString());
    };

    if (isLoading) {
        return <Loader size="large" />;
    }

    return (
        <div className="transactions-page">
            <section className="personal-area--section">
                <div className="personal-area--section-header">
                    <h4>Credit transactions</h4>
                    <div className="personal-area--section-header-actions">
                        <select onChange={handleDownloadRangeChange}>
                            <option value="0">All Time</option>
                            <option value="86400000">24 Hours</option>
                            <option value="2592000000">30 Days</option>
                            <option value="7776000000">3 Months</option>
                        </select>
                        <button onClick={() => handleDownloadTransactions()} className="btn-primary">Export <ExportIcon /></button>
                    </div>
                </div>
                <div className="personal-area--table-wrapper">
                    <table className="personal-area--table">
                        <thead>
                            <tr>
                                <th className="ellipsis">Offer</th>
                                <th>Car Plate</th>
                                {!isMobile && <>
                                    <th>Lot Name</th>
                                    <th>Date & Time</th>
                                    <th>Duration</th>
                                    <th>Cost</th>
                                </>}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataToShow.map((row) => {
                                const isOpen = openAccordion === row.id;
                                return (
                                    <Fragment key={row.id}>
                                        <tr
                                            onClick={() => isMobile && toggleAccordion(row.id || '')}
                                            className={(isMobile ? 'table-row-clickable' : '') + (isOpen ? ' open' : '')}
                                        >
                                            <td>{row.offer.name}</td>
                                            <td>{row.vehicleNumber}</td>
                                            {!isMobile && <>
                                                <td>{row.spot.name}</td>
                                                <td>{formatDateTime(row.enter)}<br />{formatDateTime(row.exit)}</td>
                                                <td>{calculateDuration(row.enter, row.exit)}</td>
                                                <td>${row.amount.incVat}</td>
                                            </>}
                                            <td><ArrowIcon className="table-row-clickable-icon" /></td>
                                        </tr>
                                        {isMobile && isOpen && (
                                            <tr key={`${row.id}-details`} className="table-accordion-row" >
                                                <td colSpan={3}>
                                                    <div className="table-accordion-row-content">
                                                        <span className="table-accordion-row-content-label">Lot Name</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {row.spot.name || '-'}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">Date & Time</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {formatDateTime(row.enter)}<br />{formatDateTime(row.exit)}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">Duration</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {calculateDuration(row.enter, row.exit) || '-'}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">Cost</span>
                                                        <span className="table-accordion-row-content-value">
                                                            ${row.amount.incVat || '-'}
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




