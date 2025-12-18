'use client';
import { useOffers } from '@/hooks/useOffers';
import { OfferTile, Breakdown } from '@/schemas/productsSchemas';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/UI/Loader';
import { CheckoutCard } from '@/components/Cards/CheckoutCard';
import { calculateBreakdown } from '@/api/products';
import { BreakdownCard } from '@/components/Cards/Breakdown';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FileUploader } from '@/components/FileUploader';
import { useFileUploaderContext } from '@/contexts/FileUploaderContext';
import { ErrorPopUp } from '@/components/UI/popup/ErrorPopUp';
import { usePopup } from '@/contexts/PopupContext';



const CheckoutPage = () => {
    const { getById } = useOffers();
    const { open, close } = usePopup();
    const [offer, setOffer] = useState<OfferTile | null>(null);
    const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
    const searchParams = useSearchParams();
    const offerId = searchParams.get('offerId');
    const entry = searchParams.get('entry');
    const exit = searchParams.get('exit');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { registration } = useSiteSettings();
    const { files } = useFileUploaderContext();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!offerId) {
            open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { router.push('/'); close() }), { maxWidth: 400 });
            setHasError(true);
            return;
        }

        const fetchOffer = async () => {
            setIsLoading(true);
            try {
                const offer = await getById(offerId);
                if (offer) {
                    setOffer(offer);
                    try {
                        const breakdownData = await calculateBreakdown(offerId, 0, entry || '', exit || '');
                        setBreakdown(breakdownData);
                    } catch (error: any) {
                        open(ErrorPopUp('Error', <>{error}</>, () => { close(); router.push('/') }), { maxWidth: 400 });
                        setIsLoading(false);
                    }
                } else {
                    open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { router.push('/'); close() }), { maxWidth: 400 });
                    setHasError(true);
                }
            } catch (error) {
                open(ErrorPopUp('Error', <>{'Offer not found'}</>, () => { router.push('/'); close() }), { maxWidth: 400 });
                    setHasError(true);
            }
        };

        fetchOffer().finally(() => setIsLoading(false));
    }, [offerId]);

    if (hasError || !offer || !breakdown) {
        return;
    }
    if (isLoading) {
        return <Loader />;
    }
    const showbreakdown = breakdown.total.incVat > 0;
    const filesRequired = offer.options?.files?.required || false;
    return (
        <div className="container">
            <div className={`${showbreakdown ? 'split-panel' : 'panel'}`}>
                <div >
                    <CheckoutCard title={offer?.ui.title || ''} bulletMarkers={offer?.ui.bulletMarkers || []} />
                    {offer.options?.files?.enabled && <FileUploader
                            label="Certification of Eligibility"
                            required={filesRequired}
                        />
                    }
                </div>

                {showbreakdown && <BreakdownCard
                    title={registration?.custom_labels?.booking_summary_label || 'Summary'}
                    breakdown={breakdown}
                    isStatic={true}
                    onClick={() => router.push(`/details?offerId=${offerId}`)}
                    disabled={files.length === 0 && filesRequired}
                />}
            </div>
        </div>
    );
}

export default CheckoutPage;