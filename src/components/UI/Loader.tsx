import './Loader.scss';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    fullScreen?: boolean;
    text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
    size = 'medium', 
    color = 'var(--color-primary)', 
    fullScreen = true,
    text 
}) => {
    const loaderClasses = [
        'loader',
        fullScreen ? 'loader--fullscreen' : 'loader--inline',
        `loader--${size}`
    ].filter(Boolean).join(' ');

    return (
        <div className={loaderClasses}>
            <div className="loader__spinner" style={{ '--spinner-color': color } as React.CSSProperties}>
                <div className="loader__spinner-ring"></div>
                <div className="loader__spinner-ring"></div>
                <div className="loader__spinner-ring"></div>
            </div>
            {text && <div className="loader__text">{text}</div>}
        </div>
    );
};