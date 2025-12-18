'use client';

import { fetchOffers } from "@/api/products";
import { OfferCard } from "@/components/Cards/OfferCard";
import { Loader } from "@/components/UI/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import '../search-results/search-results.scss';
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Hero from "@/components/UI/Hero";
import { useOffers } from "@/hooks/useOffers";
import { usePopup } from "@/contexts/PopupContext";
import { ErrorPopUp } from "@/components/UI/popup/ErrorPopUp";


const LandingLoungePage = () => {
    const searchParams = useSearchParams();
    const entry = searchParams.get('entry');
    const exit = searchParams.get('exit');
    const [isLoading, setIsLoading] = useState(false);
    const { landing_lounge, homepage } = useSiteSettings();
    const { offers, set: setOffers } = useOffers();
    const router = useRouter();
    const [openOffers, setOpenOffers] = useState<string[]>([]);
    const { open, close } = usePopup();

    useEffect(() => {
        const fetchOffersData = async () => {
            setIsLoading(true);
            try {
                const fetchedOffers = await fetchOffers('subscription', entry || '', exit || '', 'audience:lounge');
                setOffers(fetchedOffers);
            } catch (error: any) {
                const errorMessage = typeof error === 'string'
                    ? error
                    : error?.response?.data?.message || error?.message || 'An error occurred while fetching the offers. Please try again.';
                open(ErrorPopUp('Error', <>{errorMessage}</>, () => { close(); router.push('/') }), { maxWidth: 400 });
            }
        }
        fetchOffersData().finally(() => setIsLoading(false));
    }, [entry, exit]);

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


    return (
        <div className="search-results">
            <Hero 
            backgroundImage={landing_lounge['background-image'] || homepage.hero['background-image'] || ''} 
            text={landing_lounge.text || ''} 
            textHighlight={landing_lounge.text_highlight || ''} 
            />

            <div className="container">
                <div className={`search-results--offers ${openOffers.length > 0 ? 'some-open' : ''}`}>
                    {offers.map((offer) => (
                        <OfferCard
                            key={offer.id}
                            id={offer.id}
                            title={offer.name}
                            subtitle={offer.subtitle || (offer.type !== "cardonfile" ? "TOTAL PRICE FOR STAY" : "")}
                            price={offer.price}
                            buttonText={offer.buttonText || 'Book Now'}
                            address={offer.spot.address}
                            bulletMarkers={offer.ui.bulletMarkers}
                            toggleOffer={handleToggleOffer}
                            onClick={() => handleRegister(offer.id, offer.options?.files?.enabled || false)} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LandingLoungePage;