"use client";
import React, { Fragment, useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/useIsMobile';
import WarningIcon from '@/assets/icons/alert-circle.svg';
import AttachmentIcon from '@/assets/icons/attachment.svg';
import { Order, Vehicle } from '@/schemas/profileSchemas';
import { formatDate } from '@/utils/dateUtils';
import ArrowIcon from '@/assets/icons/arrow.svg';
import FilesPopUp from '@/components/UI/popup/FilesPopUp';
import TrashIcon from '@/assets/icons/trash.svg';
import EditIcon from '@/assets/icons/edit.svg';
import { useRouter } from 'next/navigation';
import { deleteVehicle } from '@/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toastUtils';
import { ErrorPopUp } from '@/components/UI/popup/ErrorPopUp';
import { BasicPopUp } from '@/components/UI/popup/BasicPopUp';
import { Loader } from '@/components/UI/Loader';
import { usePopup } from '@/contexts/PopupContext';



function getStatus(status: string) {
    switch (status) {
        case 'active':
            return { class: 'active', text: 'Active' };
        case 'inactive':
            return { class: 'error', text: 'Inactive' };
        case 'pending':
            return { class: 'warning', text: 'Pending' };
        case 'awaitingApproval':
            return { class: '', text: 'Awaiting Approval' };
        case 'pending_info':
            return { class: 'warning', text: 'Pending Info' };
        case 'onerror':
            return { class: 'error', text: 'On Error' };
        case 'failed':
            return { class: 'error', text: 'Failed' };
        case 'canceled':
            return { class: '', text: 'Canceled' };
        case 'success':
            return { class: '', text: 'Success' };
        default:
            return { class: '', text: status };
    }
}

export default function ProductInformationPage() {
    //console log from here the orders
    const { getOrders, user, getVehicles } = useUserProfile();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [openOrderAccordion, setOpenOrderAccordion] = useState<string | null>(null);
    const isMobile = useIsMobile();
    const [showFilesPopup, setShowFilesPopup] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const { updateUser } = useAuth();
    const { open, close } = usePopup();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dataToShow = orders.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const ordersData = getOrders();
        setOrders(ordersData);
    }, []);

    useEffect(() => {
        const vehiclesData = getVehicles();
        setVehicles(vehiclesData);
    }, []);

    const toggleAccordion = (plate: string) => {
        setOpenAccordion(openAccordion === plate ? null : plate);
    };

    const toggleOrderAccordion = (orderId: string) => {
        setOpenOrderAccordion(openOrderAccordion === orderId ? null : orderId);
    };

    const handleFilesClick = (files: any[]) => {
        setSelectedFiles(files);
        setShowFilesPopup(true);
    };

    const handleEditVehicle = (plate: string) => {
        router.push(`/personal-area/account-settings?vehiclePlate=${encodeURIComponent(plate)}`);
    };

    const DeleteVehicleFooter: React.FC<{ plate: string }> = ({ plate }) => {
        const [loading, setLoading] = React.useState(false);
        const onClick = async () => {
            try {
                setLoading(true);
                const updatedProfile = await deleteVehicle(plate);
                await updateUser(updatedProfile.customer);
                showSuccess('Vehicle deleted successfully');
                close();
            } catch (err) {
                open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400 });
            } finally {
                setLoading(false);
            }
        };
        return (
            <>
                <button onClick={close} className="btn-secondary">nevermind</button>
                <button onClick={onClick} className="btn-primary" style={{ "--color": "var(--color-state-error)" } as React.CSSProperties}>{loading ? <Loader size="small" color="var(--color-global-white)" fullScreen={false} /> : 'Remove vehicle'}</button>
            </>
        );
    };
    const handleDeleteVehicle = (plate: string) => {
        open(BasicPopUp('Remove Vehicle',
            <div>Are you sure you want to delete this vehicle?</div>,
            <DeleteVehicleFooter plate={plate} />),
            { maxWidth: 600 });
    }

    return (
        <div>
            <section className="personal-area--section">
                <div className="personal-area--section-header">
                    <h4>PRODUCTS</h4>
                </div>
                <div className="personal-area--table-wrapper">
                    <table className="personal-area--table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Offer</th>
                                {!isMobile ? (
                                    <>
                                        <th>Status</th>
                                        <th>End Date</th>
                                        <th>Attachments</th>
                                    </>
                                ) : <th></th>}

                            </tr>
                        </thead>
                        <tbody>
                            {dataToShow.map((order) => {
                                const statusInfo = getStatus(order.result.status);
                                const isOpenOrder = openOrderAccordion === order.id;
                                return (
                                    <Fragment key={order.id}>
                                        <tr
                                            onClick={() => isMobile && toggleOrderAccordion(order.id || '')}
                                            className={(isMobile ? 'table-row-clickable' : order.result.status === 'pending_info' ? 'msg-row' : '') + (isOpenOrder ? ' open' : '')}>
                                            <td>{order.name}</td>
                                            <td>{order.offer.name}</td>
                                            {!isMobile && (
                                                <>
                                                    <td className={statusInfo.class}>{statusInfo.text}</td>
                                                    <td>{formatDate(order.validity.to)}</td>
                                                    {order.files.length > 0 && <td><button onClick={() => handleFilesClick(order.files)}><AttachmentIcon /></button> </td>}
                                                </>
                                            )}
                                            {isMobile && <td><ArrowIcon className="table-row-clickable-icon" /></td>}
                                        </tr>
                                        {isMobile && isOpenOrder && (
                                            <tr key={`${order.id}-details`} className="table-accordion-row" >
                                                <td colSpan={3}>
                                                    <div className="table-accordion-row-content">
                                                        <span className="table-accordion-row-content-label">Status</span>
                                                        <span className={`table-accordion-row-content-value ${statusInfo.class}`}>{statusInfo.text}
                                                            {order.files.length > 0 && <div className="buttons"><button onClick={() => handleFilesClick(order.files)}><AttachmentIcon /></button></div>}
                                                        </span>
                                                        <span className="table-accordion-row-content-label">End Date</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {formatDate(order.validity.to) || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {order.result.status === 'pending_info' && (
                                            <tr key={`${order.id}-pending-info`}>
                                                <td colSpan={6} className="msg-container">
                                                    <div className="warning-msg">
                                                        <WarningIcon />
                                                        Please update your registration details to continue.
                                                        <button className="btn-primary">Update Info</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                            {/* <tr>
                                <td>Product 1</td>
                                <td>Offer 1</td>
                                <td className="active">Active</td>
                                <td>End Date 1</td>
                                <td><AttachmentIcon /> </td>
                            </tr>
                            <tr className="msg-row">
                                <td>Product 1</td>
                                <td>Offer 1</td>
                                <td className="warning">Pending Info</td>
                                <td>End Date 1</td>
                                <td><AttachmentIcon /> </td>
                            </tr>
                            <tr>
                                <td colSpan={6} className="msg-container">
                                    <div className="warning-msg">
                                        <WarningIcon />
                                        Please update your registration details to continue.
                                        <button className="btn-primary">Update Info</button>
                                    </div>
                                </td>
                            </tr> */}
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



            <section className="personal-area--section">
                <div className="personal-area--section-header">
                    <h4>VEHICLES</h4>
                </div>
                <div className="personal-area--table-wrapper">
                    <table className="personal-area--table">
                        <thead>
                            <tr>
                                <th>License Plate</th>
                                <th> Permit Type</th>
                                {!isMobile && (
                                    <>
                                        <th>Toll Tag</th>
                                        <th>Card Number</th>
                                    </>
                                )}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => {
                                const isOpen = openAccordion === vehicle.plate;

                                return (
                                    <Fragment key={vehicle.plate}>
                                        <tr
                                            onClick={() => isMobile && toggleAccordion(vehicle.plate || '')}
                                            className={(isMobile ? 'table-row-clickable' : '') + (isOpen ? ' open' : '')}
                                        >
                                            <td>{vehicle.plate || '-'}</td>
                                            <td>{vehicle.permit || '-'}</td>

                                            {!isMobile && (
                                                <>
                                                    <td>{vehicle.plate || '-'}</td>
                                                    <td>{vehicle.cardNumber || '-'}</td>
                                                    <td>
                                                        <div className="buttons">
                                                            <button onClick={() => handleEditVehicle(vehicle.plate || '')}><EditIcon /></button>
                                                            <button onClick={() => handleDeleteVehicle(vehicle.plate || '')}><TrashIcon /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            {isMobile && <td><ArrowIcon className="table-row-clickable-icon" /></td>}

                                        </tr>

                                        {isMobile && isOpen && (
                                            <tr key={`${vehicle.plate}-details`} className="table-accordion-row" >
                                                <td colSpan={3}>
                                                    <div className="table-accordion-row-content">
                                                        <span className="table-accordion-row-content-label">Card Number</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {vehicle.plate || '-'}
                                                            <div className="buttons">
                                                                <button onClick={() => handleEditVehicle(vehicle.plate || '')}><EditIcon /></button>
                                                                <button onClick={() => handleDeleteVehicle(vehicle.plate || '')}><TrashIcon /></button>
                                                            </div>

                                                        </span>
                                                        <span className="table-accordion-row-content-label">Toll Tag</span>
                                                        <span className="table-accordion-row-content-value">
                                                            {vehicle.tollTag || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
            {showFilesPopup && <FilesPopUp selectedFiles={selectedFiles} setShowFilesPopup={setShowFilesPopup} />}


        </div>
    );
}


