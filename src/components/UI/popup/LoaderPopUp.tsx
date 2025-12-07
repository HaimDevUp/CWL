import { Loader } from "../Loader";


export const LoaderPopUp = (msg?: string) => {
    return (
        <div className="loader-pop-up">
            <Loader fullScreen={false} size="large" text={msg} />
        </div>
    );
};