interface Colors {
    primary: string;
    secondary: string;
    globalGlow: string;
    globalBlack: string;
    globalWhite: string;
    globalStroke: string;
    globalGray: string;
    globalGrayBackground: string;
    globalGreen: string;
    globalPurple: string;
    globalYellow: string;
    globalBlue: string;
    globalOrange: string;
    globalRed: string;
    stateError: string;
    stateSuccess: string;
    stateWarning: string;
    stateLink: string;
    globalTableHeader: string;
}

interface FlowSettings {
    skip_checkout: boolean;
}

interface GeneralSettings {
    header: boolean;
    footer: boolean;
    colors: Colors;
    logo: string;
    logo_style: string;
    footer_logo_style: string;
    assets_path: string;
    api_tail: string;
    site_font: string;
    site_title: string;
    favicon: string;
    timezone: string;
    flow_settings: FlowSettings;
}

interface Hero {
    'background-image': string;
    'airport-name'?: string;
    text?: string;
    text_highlight?: string;
}

interface PromotionalFooterContent {
    description: string;
}

interface PromotionalFooter {
    show: boolean;
    content: PromotionalFooterContent[];
}

interface ImagesSliderContent {
    filename: string;
    settings?: string;
}

export interface ImagesSlider {
    show: boolean;
    content: ImagesSliderContent[];
}

interface Display {
    promotional_footer: PromotionalFooter;
    images_slider: ImagesSlider;
}

interface ProductCustomUi {
    enabled: boolean;
    title?: string;
    description?: string;
    notice?: string;
    image?: string;
    buttonText?: string;
}

interface Products {
    subscription?: ProductCustomUi;
    cardonfile?: ProductCustomUi;
    reservation?: ProductCustomUi;
}

interface ThankYouProps {
    HeroText?: string;
    msg?: string;
    msgBg?: string;
}

interface ThankYou {
    backgroundImage?: string;  
    default?: ThankYouProps;
    awaitingApproval?: ThankYouProps;
    declined?: ThankYouProps;
    cardonfile?: ThankYouProps;
    subscription?: ThankYouProps;
}

interface Homepage {
    hero: Hero;
    products: Products;
    display: Display;
}

interface Footer {
    elements: string[];
    logo_icon: string;
    text?: string;
}

interface Header {
    elements: string[];
    login_icon: string;
    logo_clickable: boolean;
}

interface RegistrationCustomLabels {
    booking_summary_label?: string;
    form_header?: string;
    checkbox_notifications_required?: boolean;
    checkbox_notifications?: string;
    checkbox_marketing_terms?: string;
    checkbox_general_terms?: string;
}

interface Registration {
    enable_certificate?: boolean;
    custom_labels?: RegistrationCustomLabels;
}

export interface SiteSettings {
    general: GeneralSettings;
    homepage: Homepage;
    thank_you: ThankYou;
    landing_lounge: Hero;
    footer: Footer;
    header: Header;
    registration?: Registration;
}

export const defaultSettings: SiteSettings = {
    general: {
        header: true,
        footer: true,
        colors: {
            primary: '#2F3490',
            secondary: '#767561',
            globalGlow: '#22C0F1',
            globalBlack: '#101010',
            globalWhite: '#FFFFFF',
            globalStroke: '#CECECE',
            globalGray: '#676767',
            globalGrayBackground: '#F1F1F1',
            globalGreen: '#32673B',
            globalPurple: '#551D86',
            globalYellow: '#FFC700',
            globalBlue: '#104B7D',
            globalOrange: '#f3923f',
            globalRed: '#9F2930',
            stateError: '#FF0E4D',
            stateSuccess: '#048E1A',
            stateWarning: '#da9717',
            stateLink: '#2296F9',
            globalTableHeader: '#104B7D'
        },
        logo: 'images/header_logo.png',
        logo_style: 'width: auto;',
        footer_logo_style: 'width: 14rem; height: auto; padding-top: 2.2rem;',
        assets_path: 'https://cdn.parkswiftssp.com/public/',
        api_tail: '/internal/v1/',
        site_font: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
        site_title: 'Atlanta Airport Parking',
        favicon: 'icons/favicon.png',
        timezone: 'Asia/Jerusalem',
        flow_settings: {
            skip_checkout: true
        }
    },
    header: {
        elements: [
            "logo",
            "login_button"
        ],
        login_icon: "login-icon.svg",
        logo_clickable: true
    },
    footer: {
        elements: [
            "logo",
        ],
        logo_icon: "images/footer_logo.png",
        text: "",
    },
    thank_you: {
        backgroundImage: 'images/hero_bg.jpg',
        default: {
            HeroText: 'Thank you',
            msg:'',
            msgBg: 'var(--color-primary)',
        },
        awaitingApproval:{
            HeroText: 'Your reuest is <br/> being processed',
            msg: 'Your request has been submitted and is currently <br>',
            msgBg: 'var(--color-state-warning)'
        },
        declined:{
            HeroText: 'Your reuest is <br/> being processed',
            msg: 'Your request has been submitted and is currently <br>',
            msgBg: 'var(--color-state-error)'
        },
        cardonfile:{
            HeroText: 'Your reuest is <br/> being processed',
            msg: 'Your request has been submitted and is currently <br>'
        },
        subscription:{
            HeroText: 'Your reuest is <br/> being processed',
            msg: 'Your request has been submitted and is currently <br>'
        }
    },
    landing_lounge: {
            'background-image': 'images/hero_bg.jpg',
            text: 'landing lounge',
            text_highlight: 'Choose your parking journey\u200b'
    },
    homepage: {
        hero: {
            'background-image': 'images/hero_bg.jpg',
            'airport-name': 'Willington',
            text: 'We Open Worlds',
            text_highlight: 'Choose your parking journey\u200b'
        },
        display: {
            promotional_footer: {
                show: true,
                content: [
                    {
                        description: 'Enjoy a discounted rate by booking your parking in advance'
                    },
                    {
                        description: 'Convenient window up entry and exit from parking facility'
                    },
                    {
                        description: 'Reservations ahead of arrival'
                    },
                    {
                        description: 'Personal, family and business accounts - supporting multiple vehicles on one account'
                    },
                    {
                        description: 'Permit management for staff and approved parkers'
                    },
                    {
                        description: 'E-receipts and convenient self-management'
                    },
                    {
                        description: 'SMS Push Notifications'
                    }
                ]
            },
            images_slider: {
                show: true,
                content: [
                    {
                        filename: 'faac.png',
                    },
                    {
                        filename: 'faac-logo.png',
                    },
                    {
                        filename: 'innovation.png',
                    },
                    {
                        filename: 'logos.png',
                    },
                    {
                        filename: 'pioneering.png',
                    },
                    {
                        filename: 'tiba-parking-lot.jpeg',
                    }
                ]
            }
        },
        products: {
            subscription: {
                enabled: true,
                title: 'Parking Permits',
                description: 'Select the Flex Plan that suits your needs! Conveniently self-manage your vehicles, payment information, and contact details.',
                notice: 'Flex Pass',
                image: 'https://cdn.parkswiftssp.com/public/tenants/fwairpt1/images/flexible-subscription-2.jpg',
                buttonText: 'Purchase'
            },
            cardonfile: {
                enabled: true,
                title: 'Park and GO',
                description: '<strong>Pre-register your payment details online</strong> before you park. Once registered, your license plate will be linked to your credit card for automatic payments',
                notice: 'Card on file',
                image: '',
                buttonText: 'Register'
            },
            reservation: {
                enabled: true,
                title: 'Park Smart',
                description: 'Reserve your parking space in advance for a seamless parking experience.',
                notice: 'Reservations',
                image: '',
                buttonText: 'Book'
            }
        }
    },
    registration: {
        enable_certificate: true,
        custom_labels: {
            booking_summary_label: "Access Summary",
            form_header: "REGISTRATION INFORMATION",
            checkbox_notifications_required: true,
        }
    }
};

