import { ImagesSlider, useSiteSettings } from "@/hooks/useSiteSettings";
import { ImageSlider } from "../UI/ImageSlider";
import './PromotionalFooter.scss';

interface PromotionalFooterProps {
    sliderImages: ImagesSlider;
    benefits: string[];
}

export const PromotionalFooter = ({ benefits, sliderImages }: PromotionalFooterProps) => {
    const { getCommonAsset, getTenantAsset } = useSiteSettings();
    const successCheckImage = getCommonAsset('success-check.png');
    
    return (
        <div className="promotional-footer">
            <div className="promotional-footer--benefits" style={{ '--success-check-image': `url(${successCheckImage})` } as React.CSSProperties}>
                <h3>Benefits</h3>
                <ul>
                    {benefits.map((benefit, index) => (
                        <li key={`benefit-${index}`}>
                            {benefit}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="promotional-footer--slider">
                {sliderImages.show && sliderImages.content.length > 0 && (
                    <ImageSlider images={sliderImages.content.map(item => getTenantAsset(`images/${item.filename}`))} />
                )}
            </div>
        </div>
    ) 
}