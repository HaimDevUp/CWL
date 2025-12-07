import { useState } from 'react';
import './Cards.scss';
import { useSiteSettings } from '@/hooks/useSiteSettings';


interface CheckoutCardProps {
    title: string;
    bulletMarkers: string[];
};

export const CheckoutCard = ({ title, bulletMarkers }: CheckoutCardProps) => {
    const { getCommonAsset } = useSiteSettings();
    const successCheckImage = getCommonAsset('success-check.png');

    return (
        <div className="checkout-card">
            <div className="checkout-card--cap"></div>
            <div className="checkout-card--content">
                <h3>{title}</h3>
                <div className="checkout-card--bullet-markers" style={{ '--success-check-image': `url(${successCheckImage})` } as React.CSSProperties}>
                    {bulletMarkers.map((marker, index) => {
                        const isBold = marker.startsWith('>');
                        const content = isBold ? marker.substring(1) : marker;
                        return (
                            <span key={`${marker}-${index}`} className={isBold ? 'bold' : ''}>
                                {content}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}