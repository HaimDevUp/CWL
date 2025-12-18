'use client';

import { useSiteSettings } from '@/hooks/useSiteSettings';
import './Footer.scss';

export const Footer: React.FC = () => {
    const { footer, getCommonAsset, getTenantAsset, general } = useSiteSettings();
    const logoIcon = getTenantAsset(footer.logo_icon);
    const siteTitle = general.site_title;
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer--wrapper">
                    <div className="footer--left">
                        {footer.elements.includes('logo') && <img src={logoIcon} alt="Footer Logo" />}

                        {footer.text ?
                            <span dangerouslySetInnerHTML={{ __html: footer.text }} /> :
                            <span>©  {siteTitle} {new Date().getFullYear()}</span>
                        }
                    </div>

                    <div className="footer--links">
                        <a target="_blank" href={getTenantAsset('docs/terms-and-conditions.pdf')}>Terms and Conditions</a>
                        <a target="_blank" href={getTenantAsset('docs/privacy-and-policy.pdf')}>Privacy Policy</a>
                    </div>

                </div>
            </div>
        </footer>
    )
}