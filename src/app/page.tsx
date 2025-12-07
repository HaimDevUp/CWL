'use client';


import { useSiteSettings } from '@/hooks/useSiteSettings';
import './home.scss';
import { ProductCard } from '@/components/Cards/ProductCard';
import { PromotionalFooter } from '@/components/Cards/PromotionalFooter';
import { useRouter } from 'next/navigation';
import Hero from '@/components/UI/Hero';
import { usePopup } from '@/contexts/PopupContext';
import { footerPopUp } from '@/components/UI/popup/footerPopUp';
import { DateField } from '@/components/inputs';
import isBefore from 'date-fns/isBefore';
import startOfToday from 'date-fns/startOfToday';
import { useState } from 'react';
import { formatDateForUrl } from '@/utils/dateUtils';



export type Product = {
  type: string;
  image: string;
  title: string;
  description: string;
  notice: string;
  buttonText: string;
  onClick: () => void;
};
export default function Home() {

  const { homepage, getTenantAsset } = useSiteSettings();
  const { products } = homepage;
  const router = useRouter();
  const { open, close } = usePopup();
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));


  const handleReservationClick = () => {
    // Reset dates when opening the popup
    const initialEntryDate = new Date();
    const initialExitDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    setEntryDate(initialEntryDate);
    setExitDate(initialExitDate);

    

    const handleGetPrice = () => {
      if (entryDate && exitDate) {
        const entryFormatted = formatDateForUrl(entryDate);
        const exitFormatted = formatDateForUrl(exitDate);
        const url = `/search-results?type=reservation&entry=${encodeURIComponent(entryFormatted)}&exit=${encodeURIComponent(exitFormatted)}`;
        close();
        router.push(url);
      }
    };

    const content = (
      <div className='date-container'>
        <DateField 
          icon="entry" 
          label="Entry Date & Time" 
          shouldDisableDate={date => isBefore(date, startOfToday())} 
          defaultValue={initialEntryDate}
          onChange={setEntryDate}
        />
        <DateField 
          icon="exit" 
          label="Exit Date & Time" 
          shouldDisableDate={date => isBefore(date, startOfToday())} 
          defaultValue={initialExitDate}
          onChange={setExitDate}
        />
        <button 
          className="btn-primary" 
          style={{ "--color": "var(--color-global-black)" } as React.CSSProperties}
          onClick={handleGetPrice}
        >
          Get my price
        </button>
      </div>
    )
    open(footerPopUp('Select your stay', content, () => close()), { isFooter: true, backgroundColor: 'var(--color-primary)' });
  }


  const offers: Product[] = [
    homepage.products.reservation?.enabled && {
      type: 'reservation',
      image: (products.reservation?.image?.trim()) || getTenantAsset('images/staff-parking-and-special-permits.jpg'),
      title: (products.reservation?.title?.trim()) || 'Park Smart',
      description: (products.reservation?.description?.trim()) || 'Reserve your parking space in advance for a seamless and secure parking experience.​',
      notice: (products.reservation?.notice?.trim()) || 'Book in advance​​',
      buttonText: (products.reservation?.buttonText?.trim()) || 'Book',
      onClick: handleReservationClick
    },
    homepage.products.cardonfile?.enabled && {
      type: 'cardonfile',
      image: (products.cardonfile?.image?.trim()) || getTenantAsset('images/pay-by-plate.jpg'),
      title: (products.cardonfile?.title?.trim()) || 'Park and GO',
      description: (products.cardonfile?.description?.trim()) || 'Preregister your vehicles and payment information to allow for a frictionless experience on entry and exit - control your costs and get your receipts via email​',
      notice: (products.cardonfile?.notice?.trim()) || 'Card on file​',
      buttonText: (products.cardonfile?.buttonText?.trim()) || 'Register',
      onClick: () => router.push('/search-results?type=cardonfile')
    },
    homepage.products.subscription?.enabled && {
      type: 'subscription',
      image: (products.subscription?.image?.trim()) || getTenantAsset('images/flexible-subscription.jpg'),
      title: (products.subscription?.title?.trim()) || 'Flex Pass',
      description: (products.subscription?.description?.trim()) || 'Select the Flex Plan that suits your needs! Conveniently self-manage your vehicles, payment information, and contact details all while enjoying a discounted rate.',
      notice: (products.subscription?.notice?.trim()) || 'Flex & Save',
      buttonText: (products.subscription?.buttonText?.trim()) || 'Purchase',
      onClick: () => router.push('/search-results?type=subscription')
    }
  ].filter(Boolean) as Product[]


  return (
    <div className="home">

      <Hero backgroundImage={homepage.hero['background-image'] || ''} text={homepage.hero.text || ''} textHighlight={homepage.hero.text_highlight || ''} />

      <div className="container">
        <div className="home--products-container">
          <div className="home--products">
            {offers.map((product) => (
              <ProductCard key={product.title} product={product} />
            ))}
          </div>
        </div>

        <PromotionalFooter benefits={homepage.display.promotional_footer.content.map(item => item.description)} sliderImages={homepage.display.images_slider} />
      </div>
    </div>
  );
}