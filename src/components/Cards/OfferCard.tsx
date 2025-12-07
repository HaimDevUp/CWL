import { useState } from 'react';
import './Cards.scss';
import ArrowIcon from '@/assets/icons/arrow.svg';

interface OfferCardProps {
    id: string;
    title: string;
    subtitle: string;
    price: {
        type: string;
        amount: number;
    };
    buttonText: string;
    address: {
        name: string;
        street: string | null;
        city: string | null;
        state: string | null;
        postCode: string | null;
    } | null;
    bulletMarkers: string[];
    onClick: () => void;
    toggleOffer: (offerId: string) => void;
}

export const OfferCard = (offer: OfferCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleShowMore = (id: string) => {
        setIsOpen(!isOpen);

        if (isOpen) {
            setTimeout(() => {
                offer.toggleOffer(id);
            }, 300);
        }
        else {
            offer.toggleOffer(id);
        }
    }
    return (
        <div key={offer.id} className={`offer-card ${isOpen ? 'is-open' : ''}`}>
            <div className="offer-card--cap" />
            <div className="offer-card--content">
                <div className="offer-card--header">
                    <h4>{offer.title}</h4>
                    {offer.price.type != "unknown" ? <>
                        <span className="offer-card--header-subtitle">{offer.subtitle}</span>
                        <div className="offer-card--header-price">${offer.price.amount.toFixed(2)}</div>
                    </> : null}


                </div>
                <button className=" btn-primary fw" onClick={offer.onClick}>{offer.buttonText}</button>
                {offer.address && (
                    <div className="offer-card--address">
                        <span>{offer.address?.name}</span>
                        <span>{offer.address?.street}</span>
                        <span>{offer.address?.city} {offer.address?.state} {offer.address?.postCode}</span>
                    </div>
                )}
                {offer.bulletMarkers.length > 0 && (
                    <div className="offer-card--bullet-markers">
                        <h5>Details</h5>
                        {offer.bulletMarkers.map((marker, index) => {
                            const isBold = marker.startsWith('>');
                            const content = isBold ? marker.substring(1) : marker;
                            return (
                                <span key={`${marker}-${index}`}>
                                    {isBold ? <strong>{content}</strong> : content}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
            {offer.bulletMarkers.length > 0 && <button className="show-more fw" onClick={() => handleShowMore(offer.id)}><ArrowIcon /></button>}
        </div>
    )
}