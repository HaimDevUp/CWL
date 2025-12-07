import CloseIcon from '@/assets/icons/Close.svg';

export const footerPopUp = (title: string = 'Error', content: React.ReactNode, close: () => void, footer?: React.ReactNode) => {
    return (
        <div className="container">
            <div className="footer-pop-up">
                <div className="footer-pop-up-header">
                    <h4>{title}</h4>
                    <button onClick={close}><CloseIcon/></button>
                </div>
                <div className="footer-pop-up-content">
                    {content}
                </div>
                {footer && <div className="footer-pop-up-footer">
                    {footer}
                </div>}
            </div>
        </div>
    );
};