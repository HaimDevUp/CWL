import React, { ChangeEvent, useMemo, useState } from 'react';
import './Cards.scss';
import { Order } from '@/schemas/profileSchemas';
import { formatDateShort } from '@/utils/dateUtils';
import { cancelSubscription, updateOrderPaymentPriority } from '@/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toastUtils';
import { ErrorPopUp } from '../UI/popup/ErrorPopUp';
import { Loader } from '../UI/Loader';
import { footerPopUp } from '../UI/popup/footerPopUp';
import { usePopup } from '@/contexts/PopupContext';

export type PaymentPriority = 'WalletFirst' | 'CardOnly';

export const OrderCard = (order: Order) => {
    const { updateUser, refreshUserData } = useAuth();
    const { open, close } = usePopup();
    const isCardOnFile = order.offer.type.toLowerCase() === 'cardonfile';
    const [loading, setLoading] = useState(false);
    const handleCancelSubscription = (orderId: string) => {
        const CancelSubscriptionFooter: React.FC = () => {
            const [loading, setLoading] = useState(false);

            const onConfirm = async () => {
                try {
                    setLoading(true);
                    const updatedProfile = await cancelSubscription(orderId);
                    await updateUser(updatedProfile.customer);
                    showSuccess('Subscription cancelled successfully');
                    close();
                } catch (err) {
                    open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400, isFooter: false });
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div style={{ display: 'flex', gap: '1.6rem' }}>
                    <button onClick={close} className="btn-secondary">
                        nevermind
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{ '--color': 'var(--color-state-error)' } as React.CSSProperties}
                    >
                        {loading ? (
                            <Loader
                                size="small"
                                color="var(--color-global-white)"
                                fullScreen={false}
                            />
                        ) : (
                            'Cancel subscription'
                        )}
                    </button>
                </div>
            );
        };

        open(footerPopUp('YOU ARE ABOUT TO CANCEL THE AUTOMATIC RENEWAL OF YOUR SUBSCRIPTION',
            <div style={{ color: 'var(--color-global-gray)' }}>
                Please note: after cancellation, your subscription will remain active
                until the end of the<br /> current validity period.
            </div>,
            close,
            <CancelSubscriptionFooter />,
        ),
            { isFooter: true });
    };

    const datesLabel = useMemo(() => {
        const fromDate = formatDateShort(order.validity.from);
        const toDate = formatDateShort(order.validity.to);

        return isCardOnFile
            ? `${fromDate} - ${toDate}`
            : `Will renew on ${toDate}`;
    }, [isCardOnFile, order.validity.from, order.validity.to]);

    const handlePriorityChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        const newPriority = event.target.value as PaymentPriority;
        try {
            setLoading(true);
            await updateOrderPaymentPriority(order.id, newPriority);
            await refreshUserData();
            showSuccess('Payment priority updated successfully');
        } catch (err) {
            open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400, isFooter: false });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="order-card">
            <div className="order-card--col">
                <h4>{order.offer.name}</h4>
                <span style={{ color: '#303E4F' }}>
                    {isCardOnFile ? 'Payment Effective Dates' : 'Resident Subscriber'}
                </span>
            </div>

            <div className="order-card--col">
                {!isCardOnFile && <div>Renewal</div>}
                <div className="order-card--dates">
                    <div className={isCardOnFile ? 'order-card--center' : ''}>
                        {datesLabel}
                    </div>
                    {!isCardOnFile && (
                        <>
                            <div className="spacer" />
                            <button
                                type="button"
                                className="btn btn-text hoverscale"
                                onClick={() => handleCancelSubscription(order.id)}
                            >
                                Cancel Subscription
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="order-card--col">
                <select
                    className="choose-method"
                    data-order-id={order.id}
                    value={order.paymentMethod?.priority || ''}
                    onChange={handlePriorityChange}
                >
                    <option value="" disabled>
                        Primary
                    </option>
                    <option value="WalletFirst">Digital Wallet</option>
                    <option value="CardOnly">Credit card</option>
                </select>
            </div>
        </div>
    );
};