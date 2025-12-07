'use client';

import { fetchOffers } from "@/api/products";
import { OfferCard } from "@/components/Cards/OfferCard";
import { Loader } from "@/components/UI/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import './search-results.scss';
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Hero from "@/components/UI/Hero";
import { PromotionalFooter } from "@/components/Cards/PromotionalFooter";
import { useOffers } from "@/hooks/useOffers";
import { usePopup } from "@/contexts/PopupContext";
import { ErrorPopUp } from "@/components/UI/popup/ErrorPopUp";
import { DateField } from "@/components/inputs";
import { formatDateTime, parseDateFromUrl } from "@/utils/dateUtils";
import { useIsMobile } from '@/hooks/useIsMobile';
import EntryIcon from '@/assets/icons/EntryIcon.svg';
import ExitIcon from '@/assets/icons/ExitIcon.svg';
import Arrow from '@/assets/icons/arrow.svg';


const SearchResultsPage = () => {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const entry = searchParams.get('entry');
    const exit = searchParams.get('exit');
    const [isLoading, setIsLoading] = useState(false);
    const { homepage } = useSiteSettings();
    const router = useRouter();
    const { offers, set: setOffers } = useOffers();
    const [openOffers, setOpenOffers] = useState<string[]>([]);
    const { open, close } = usePopup();
    const isMobile = useIsMobile();
    const [heroOpened, setHeroOpened] = useState(false);

    useEffect(() => {
        const fetchOffersData = async () => {
            setIsLoading(true);
            try {
                const fetchedOffers = await fetchOffers(type || '', entry || '', exit || '');
                setOffers(fetchedOffers);
            } catch (error: any) {
                const errorMessage = typeof error === 'string'
                    ? error
                    : error?.response?.data?.message || error?.message || 'An error occurred while fetching the offers. Please try again.';
                open(ErrorPopUp('Error', <>{errorMessage}</>, () => { close(); router.push('/') }), { maxWidth: 400 });
                console.error(error);
            }
        }
        fetchOffersData().finally(() => setIsLoading(false));
    }, [type, entry, exit, setOffers]);

    const handleToggleOffer = (offerId: string) => {
        setOpenOffers(openOffers.includes(offerId) ? openOffers.filter((id) => id !== offerId) : [...openOffers, offerId]);
    }

    const handleRegister = (offerId: string, FileRequired: boolean) => {
        if (FileRequired) {
            if (entry && exit) {
                router.push(`/checkout?offerId=${offerId}&entry=${entry}&exit=${exit}`);
            }
            else {
                router.push(`/checkout?offerId=${offerId}`);
            }
        }
        else {
            router.push(`/details?offerId=${offerId}`);
        }
    }

    if (isLoading) {
        return <Loader />;
    }

    const getHeroProps = () => {
        switch (type) {
            case 'cardonfile':
                return {
                    backgroundImage: homepage.hero['background-image'] || '',
                    text: 'Park and GO',
                    textHighlight: ''
                }
            case 'subscription':
                return {
                    backgroundImage: homepage.hero['background-image'] || '',
                    text: 'Flexible Subscription',
                    textHighlight: ''
                }
        }
        return {
            backgroundImage: homepage.hero['background-image'] || '',
            text: homepage.hero.text || '',
            textHighlight: homepage.hero.text_highlight || ''
        }
    }

    const getButtonText = () => {
        switch (type) {
            case 'reservation':
                return 'Book Now';
            case 'subscription':
                return 'Book Now';
            default:
                return 'Register';
        }
    }

    return (
        <div className="search-results ">
            {type !== 'reservation' && <Hero {...getHeroProps()} />}
            <div className="container">
                {type === 'reservation' && (
                    <div className="search-results--reservation-hero">
                        {isMobile && !heroOpened ? (
                            <div className="search-results--reservation-hero-close">
                                <div className="flex-container">
                                    <EntryIcon />
                                    {formatDateTime(parseDateFromUrl(entry || ''))}
                                </div>
                                <div className="divider"></div>
                                <div className="flex-container">
                                    <ExitIcon />
                                    {formatDateTime(parseDateFromUrl(exit || ''))}
                                </div>
                            </div>
                        ) : (

                            <div className='date-container'>
                                <DateField
                                    icon="entry"
                                    label="Entry Date & Time"
                                    defaultValue={parseDateFromUrl(entry || '')}
                                    disabled={true}
                                />
                                <DateField
                                    icon="exit"
                                    label="Exit Date & Time"
                                    defaultValue={parseDateFromUrl(exit || '')}
                                    disabled={true}
                                />
                            </div>
                        )}
                        <button onClick={() => setHeroOpened(prev => !prev)} className={heroOpened ? 'is-open' : ''}><Arrow /></button>
                    </div>
                )}
                <div className={`search-results--offers ${openOffers.length > 0 ? 'some-open' : ''}`}>
                    {offers.map((offer) => (
                        <OfferCard
                            key={offer.id}
                            id={offer.id}
                            title={offer.name}
                            subtitle={offer.subtitle || (offer.type !== "cardonfile" ? "TOTAL PRICE FOR STAY" : "")}
                            price={offer.price}
                            buttonText={offer.buttonText || getButtonText()}
                            address={offer.spot.address}
                            bulletMarkers={offer.ui.bulletMarkers}
                            toggleOffer={handleToggleOffer}
                            onClick={() => handleRegister(offer.id, offer.options?.files?.enabled || false)} />
                    ))}
                </div>

                <PromotionalFooter benefits={homepage.display.promotional_footer.content.map(item => item.description)} sliderImages={homepage.display.images_slider} />
            </div>
        </div>
    )
}

export default SearchResultsPage;