export const BasicPopUp = ( title: string, content: React.ReactNode, footer?: React.ReactNode, icon?: React.ReactNode,) => {
    return (
        <div className="basic-pop-up">
            {icon && <div className="basic-pop-up-icon">
                {icon}
            </div>}
            <h4>{title}</h4>
            <div className="basic-pop-up-content">{content}</div>
            {footer && <div className="basic-pop-up-footer">{footer}</div>}
        </div>
    );
};