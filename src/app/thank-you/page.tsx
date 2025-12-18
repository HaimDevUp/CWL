'use client';

import Hero from "@/components/UI/Hero";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import CheckIcon from '@/assets/icons/check.svg';
import UnCheckIcon from '@/assets/icons/Uncheck.svg';
import { HeroProps } from "@/components/UI/Hero";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrderById } from "@/api/products";
import { Fragment, useEffect, useState } from "react";
import { Order } from "@/schemas/profileSchemas";
import { ErrorPopUp } from "@/components/UI/popup/ErrorPopUp";
import { usePopup } from "@/contexts/PopupContext";
import Loader from "rsuite/esm/Loader";
import './thank-you.scss';
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";


const ThankYouPage = () => {
    const { open, close } = usePopup();
    const { homepage, registration, getTenantAsset, thank_you } = useSiteSettings();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [hasError, setHasError] = useState(false);



    useEffect(() => {
        const fetchOrder = async () => {
            setIsLoading(true);
            if (orderId) {
                try {
                    const order = await getOrderById(orderId);
                    setOrder(order);
                } catch (error) {
                    open(ErrorPopUp('Error', <>{String(error)}</>, close), { maxWidth: 400 });
                }
                finally {
                    setIsLoading(false);
                }
            }
            else {
                open(ErrorPopUp('Error', <>{'Order not found'}</>, () => { close(); router.push('/') }), { maxWidth: 400 });
                setHasError(true);
                return;
            }
        }
        fetchOrder();
    }, [orderId]);

    const summaryDetails = {
        'First Name': order?.contact.firstName,
        'Last Name': order?.contact.lastName,
        'Email Address': order?.contact.email,
        'Mobile Phone': order?.contact.phone,
        'Postcode': order?.billingAddress.postCode,
        'License plate': order?.vehicles[0].plate,
    }

    const getHeroProps = (status: string, type: string) => {
        let props: { Hero: HeroProps, msg: string, title?: string } = {
            Hero: {
                backgroundImage: thank_you.backgroundImage || homepage.hero['background-image'],
                text: thank_you.default?.HeroText || `You're Booked!`,
                textHighlight: "",
                options: {
                    backgroundColor: thank_you.default?.msgBg || 'var(--color-primary)',
                    icon: <CheckIcon />,
                }
            },
            msg: thank_you.default?.msg || "We will send you a reminder prior to your booking scheduled trip.",
        }
        switch (status) {
            case 'awaitingApproval':
                props.Hero.text = thank_you.awaitingApproval?.HeroText || 'Your reuest is <br/> being processed';

                props.msg = thank_you.awaitingApproval?.msg || `Your request has been submitted and is currently <br>
                <span style="color: var(--color-state-warning); font-weight: 700;">pending administrator approval.</span><br>
                You will be notified once your request has been approved.`;

                break;
            case 'declined':
                props.Hero.text = thank_you.declined?.HeroText || `We couldn't approve <br/> your request..`;
                props.Hero.options!.icon = <UnCheckIcon />;

                props.msg = thank_you.declined?.msg || `<br><span style="color: var(--color-state-error); font-weight: 700;">Your request has been declined.</span><br>
                please reach out for support.`;

                break;
            default:
                switch (type) {
                    case 'cardonfile':
                        props.Hero.text = thank_you.cardonfile?.HeroText || `You're ready<br>to GO!`;
                        props.msg = thank_you.cardonfile?.msg || `Your credit card will be charged only when you park at one of our affiliated facilities
                                <br>
                                <br>
                                At any time you can enter your account to see<br>
                                transaction history, assigned vehicles, e-receipts and personal information.`;
                        props.title = `Enrolled to ${order?.offer.name}`

                        break;
                    case 'subscription':
                        props.Hero.text = thank_you.subscription?.HeroText || `Your enrollment is complete`;
                        break;
                }
        }
        return props;
    };
    if (hasError) {
        return;
    }
    if (isLoading) {
        return <Loader />;
    }
    const showQR = order?.offer.options?.showQR;
    const uiData = getHeroProps(order?.result?.status || '', order?.offer?.type || '');

    return (
        <div className="thank-you-page">
            <Hero {...uiData.Hero} />
            <div className="booking-summary">
                <h4 className="gray">{registration?.custom_labels?.booking_summary_label || 'Summary'}</h4>
                {uiData.title && <h4>{uiData.title}</h4>}
                <div className="booking-summary-msg" dangerouslySetInnerHTML={{ __html: uiData.msg }} />
                <div className={`booking-summary-content ${showQR ? 'show-qr' : ''}`}>
                    {showQR &&
                        <Image
                            src={getTenantAsset(`qrs/${orderId}.png`)}
                            alt="QR Code"
                            width={100}
                            height={100}
                            style={{ width: '100%', height: '100%' }}
                        />
                    }
                    <div className="booking-summary-details">
                        {Object.entries(summaryDetails).map(([key, value]) => (
                            <Fragment key={key}>
                                <span className="booking-summary-details-key">{key}</span>
                                <span className="booking-summary-details-value">{value}</span>
                            </Fragment>
                        ))}
                    </div>
                </div>

                {isAuthenticated && (
                    <button className="btn-primary" onClick={() => router.push('/personal-area')}>To my account</button>
                )}
            </div>
        </div>
    );
};

export default ThankYouPage;