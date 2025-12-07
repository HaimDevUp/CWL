import { MdOutlineCancel } from "react-icons/md";


export const ErrorPopUp = ( title: string = 'Error', content: React.ReactNode, onOk: () => void ) => {
    return (
        <div className="error-pop-up">
            <MdOutlineCancel className="error-pop-up-icon" />
            <h4>{title}</h4>
            <div className="error-pop-up-content">{content}</div>
            <button onClick={onOk} className="btn-primary">OK</button>
        </div>
    );
};