import { useSiteSettings } from "@/hooks/useSiteSettings";
import './Hero.scss';

export interface HeroProps {
    backgroundImage: string;
    text: string;
    textHighlight: string;
    options?: {
        icon?: React.ReactNode;
        backgroundColor?: string;
    }
}

const Hero = ({ backgroundImage, text, textHighlight, options }: HeroProps) => {
    const { getTenantAsset } = useSiteSettings();

    return (
        <div className="hero">
            <div className="image-container">
                <img src={getTenantAsset(backgroundImage)} alt={text} />
                <div className="image-container--overlay"></div>
            </div>
            <div className={`hero--content ${options?.backgroundColor ? 'hero--content-with-bg' : ''}`}>
                {options?.icon && <div className="hero--content-icon">{options.icon}</div>}
                <h1 dangerouslySetInnerHTML={{ __html: text }} />
                {options?.backgroundColor && <div className="hero--content-bg" style={{ backgroundColor: options.backgroundColor }}></div>}
            </div>
        </div>
    )
}

export default Hero;