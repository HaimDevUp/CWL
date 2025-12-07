"use client";
import { useUserProfile } from "@/hooks/useUserProfile";
import './payment-wallet.scss';
import TrashIcon from '@/assets/icons/trash.svg';
import CheckIcon from '@/assets/icons/check-circle.svg';
import { formatMonthYear } from '@/utils/dateUtils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePopup } from "@/contexts/PopupContext";
import { BasicPopUp } from "@/components/UI/popup/BasicPopUp";
import { addMoneyToBalance, setDefaultCard, deleteCard, initCard, addCard, checkHppStatus } from "@/api/user";
import React, { useEffect, useRef, useState } from "react";
import { showSuccess } from "@/utils/toastUtils";
import { ErrorPopUp } from "@/components/UI/popup/ErrorPopUp";
import { Loader } from "@/components/UI/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { Order, PaymentMethods } from "@/schemas/profileSchemas";
import { OrderCard } from "@/components/Cards/OrderCard";
import  {cardIcons}  from "@/utils/styleUtils";

const TOP_UP_AMOUNTS = [10, 25, 50, 100];
const CONVENIENCE_FEE = 4;
const TAX_AMOUNT = 0.05;

const TopUpAmountSelector: React.FC<{
    selectedAmount: number;
    onChange: (amount: number) => void;
    cardNumber: string;
}> = ({ selectedAmount, onChange, cardNumber }) => {
    return (
        <div className="top-up-amount-selector">
            <div>Please choose an amount to add to your wallet.</div>
            <div className="top-up-amount-selector-credit">Your credit card ending in <strong>{cardNumber}</strong> will be charged</div>
            <div className="top-up-options">
                {TOP_UP_AMOUNTS.map((amount) => (
                    <label key={amount} className="top-up-option">
                        <input
                            type="radio"
                            className="top-up-amount"
                            value={amount}
                            checked={selectedAmount === amount}
                            onChange={() => onChange(amount)}
                        />
                        <span>${amount}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


export default function PaymentWalletPage() {
    const { getWallet, getPaymentMethods, getActiveOrders } = useUserProfile();
    const { updateUser, user } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const isMobile = useIsMobile();
    const [wallet, setWallet] = useState<any>(null);
    const isUp5 = wallet?.balance >= 5;
    const { open, close } = usePopup();
    const amountRef = useRef<number>(TOP_UP_AMOUNTS[0]);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        const wallet = getWallet();
        setWallet(wallet);
    }, [user]);

    useEffect(() => {
        const paymentMethods = getPaymentMethods();
        setPaymentMethods(paymentMethods);
    }, [user]);

    useEffect(() => {
        const activeOrders = getActiveOrders();
        setActiveOrders(activeOrders);
    }, [user]);

    const TopUpFooter: React.FC<{ selectedAmount: number }> = ({ selectedAmount }) => {
        const [loading, setLoading] = React.useState(false);
        const convenienceFee = CONVENIENCE_FEE;
        const tax = selectedAmount * TAX_AMOUNT;
        const finalAmount = selectedAmount + convenienceFee + tax;
        const breakdown: string[] = [];
        if (convenienceFee > 0) {
            breakdown.push(`$${convenienceFee.toFixed(2)} Convenience Fee`);
        }
        if (tax > 0) {
            breakdown.push(`$${tax.toFixed(2)} in tax`);
        }
        const onClick = async () => {
            try {
                setLoading(true);
                const updatedProfile = await addMoneyToBalance(finalAmount);
                await updateUser(updatedProfile.customer);
                showSuccess('Money added to balance successfully');
                close();
            } catch (err) {
                open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400 });
            } finally {
                setLoading(false);
            }
        };
        return (
            <>
                <div className="top-up-note">
                    <strong>Note:</strong> The final charge will be{' '}
                    <strong className="amount">${finalAmount.toFixed(2)}</strong>
                    {breakdown.length > 0 && (
                        <>
                            , which includes {breakdown.join(' and ')}
                        </>
                    )}
                </div>
                <button onClick={onClick} className="btn-primary ml">{loading ? <Loader size="small" color="var(--color-global-white)" fullScreen={false} /> : 'Continue'}</button>
            </>
        );
    };
    const TopUpPopupContent: React.FC<{ cardNumber: string }> = ({ cardNumber }) => {
        const [selectedAmount, setSelectedAmount] = React.useState<number>(amountRef.current || TOP_UP_AMOUNTS[0]);

        React.useEffect(() => {
            amountRef.current = selectedAmount;
        }, [selectedAmount]);

        return BasicPopUp(
            'Add to Wallet',
            <TopUpAmountSelector
                selectedAmount={selectedAmount}
                onChange={setSelectedAmount}
                cardNumber={cardNumber}
            />,
            <TopUpFooter selectedAmount={selectedAmount} />
        );
    };

    const handleAddMoney = () => {
        open(<TopUpPopupContent cardNumber={paymentMethods?.cards[0].last4D ?? ''} />, { maxWidth: 800 });
    }

    const DeleteCardFooter: React.FC<{ cardID: string }> = ({ cardID }) => {
        const [loading, setLoading] = React.useState(false);
        const onClick = async () => {
            try {
                setLoading(true);
                const updatedProfile = await deleteCard(cardID);
                await updateUser(updatedProfile.customer);
                showSuccess('Card deleted successfully');
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
                <button onClick={onClick} className="btn-primary" style={{ "--color": "var(--color-state-error)" } as React.CSSProperties}>{loading ? <Loader size="small" color="var(--color-global-white)" fullScreen={false} /> : 'Remove payment method'}</button>
            </>
        );
    };
    const handleDeleteCard = (cardID: string) => {
        open(BasicPopUp('Remove Payment Method',
            <div>Are you sure you want to delete this payment method?</div>,
            <DeleteCardFooter cardID={cardID} />),
            { maxWidth: 600 });
    }

    const pollTimerRef = React.useRef<number | null>(null);
    const handleInitCard = async () => {
        const clearPoll = () => {
            if (pollTimerRef.current !== null) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
        // open immediately with loader
        open(
            BasicPopUp(
                'ADD CARD',
                <div className="iframe-container"><Loader fullScreen={false} /></div>
            ),
            {
                maxWidth: 400,
            }
        );
        // then fetch init and swap content to iframe
        const init = await initCard();
        open(
            BasicPopUp(
                'ADD CARD',
                <div className="iframe-container"><iframe src={init.url}></iframe></div>
            ),
            {
                maxWidth: 400,
            }
        );

        // poll every 2s until status is not pending, then try to add the card
        pollTimerRef.current = window.setInterval(async () => {
            try {
                const status = await checkHppStatus(init.sid);
                console.log(status);

                const normalized = String(status.status).toLowerCase();
                const isPending = normalized === 'pending' || normalized === 'in_progress' || normalized === 'processing';
                if (isPending) return;

                clearPoll();

                const profile = await addCard(init.sid);
                if (profile && profile.customer) {
                    await updateUser(profile.customer);
                    showSuccess('Card added successfully');
                }
                close();
            } catch (err) {
                clearPoll();
                open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400 });
            }
        }, 2000);
    }



    const handleSetDefaultCard = async (cardID: string) => {
        try {
            setLoading(true);
            const updatedProfile = await setDefaultCard(cardID);
            console.log(updatedProfile);

            await updateUser(updatedProfile.customer);
            showSuccess('Default card set successfully');
        } catch (err) {
            open(ErrorPopUp('Error', <>{String(err)}</>, close), { maxWidth: 400 });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <section className="personal-area--section padding">
                <div className="personal-area--section-header">
                    <h4>wallet Balance</h4>
                </div>

                <div className={`personal-area--balance-card ${isUp5 ? 'good-balance' : ''}`}>
                    <div className="personal-area--balance-card-header">
                        <h4>YOUR BALANCE</h4>
                        <span className="personal-area--balance-card-header-balance">${(wallet?.balance ?? 0).toFixed(2)} USD</span>
                    </div>
                    <div className="personal-area--balance-card-content">
                        <div className="personal-area--balance-card-content-text">
                            Smart parking starts with a loaded wallet – automatic and fast payment, smooth exit, no stops.
                        </div>
                        <button onClick={handleAddMoney} className="btn-primary">Add money to balance</button>
                    </div>
                </div>
            </section>

            <section className="personal-area--section padding">
                <div className="personal-area--section-header">
                    <h4>Payment method <strong>({paymentMethods?.cards.length})</strong></h4>
                    <button onClick={handleInitCard} className="btn-primary">Add New</button>
                </div>
                {paymentMethods?.cards.map((card) => (
                    <div key={card.token} className={`personal-area--payment-method-card ${card.isDefault ? 'default' : ''}`}>
                        <div className="personal-area--payment-method-card-content">
                            <div className="personal-area--payment-method-card-col">
                                <h5>Debit / Credit card</h5>
                                <div>{cardIcons(card.type)} {card.type} {card.last4D}</div>
                                <h6>{card.holder}</h6>
                            </div>
                            <div className="personal-area--payment-method-card-col expires">
                                <h5>Expires</h5>
                                <div>{formatMonthYear(card.expiry)}</div>
                            </div>
                            {!isMobile && <div className="personal-area--payment-method-card-col">
                                {card.isDefault ?
                                    <span className="personal-area--payment-method-card-default"><CheckIcon /> Default</span> :
                                    <button onClick={() => handleSetDefaultCard(card.token)} className="btn-transparent">Set as default</button>}
                            </div>}
                        </div>
                        <div className="personal-area--payment-method-card-actions">
                            {isMobile && (<>{card.isDefault ?
                                <span className="personal-area--payment-method-card-default"><CheckIcon /> Default</span> :
                                <button onClick={() => handleSetDefaultCard(card.token)} className="btn-transparent">Set as default</button>}</>)}
                            <button onClick={() => handleDeleteCard(card.token)}><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </section>

            <section className="personal-area--section padding">
                <div className="personal-area--section-header">
                    <h4>Orders <strong>({activeOrders.length})</strong></h4>
                </div>
                {activeOrders.map((order) => (
                    <OrderCard key={order.id} {...order} />
                ))}
            </section>
        </>

    );
}


