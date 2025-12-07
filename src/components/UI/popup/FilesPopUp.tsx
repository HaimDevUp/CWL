"use client";
import { useState } from "react";
import DownloadIcon from '@/assets/icons/download.svg';
import CloseIcon from '@/assets/icons/Close.svg';
import dynamic from 'next/dynamic';

// Load FilesViewer only on the client to avoid SSR issues with react-pdf
const FilesViewer = dynamic(() => import('./FilesViewer'), { ssr: false });




const FilesPopUp = ({ selectedFiles, setShowFilesPopup }: { selectedFiles: any[], setShowFilesPopup: (show: boolean) => void }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = selectedFiles[currentFileIndex]?.name || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening in new tab
            window.open(url, '_blank');
        }
    };

    return <div className="popup-overlay" onClick={() => setShowFilesPopup(false)}>
        <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup--header">
                <h3>{selectedFiles[currentFileIndex]?.name}</h3>
                <button className="close-button" onClick={() => setShowFilesPopup(false)}>
                    <CloseIcon />
                </button>
            </div>
            <div className="popup--body">
                <div className="files-popup--preview">
                    <FilesViewer fileUrl={selectedFiles[currentFileIndex]?.url} fileType={selectedFiles[currentFileIndex]?.contentType} />
                </div>
            </div>
            <div className="files-popup--footer popup--footer ">
                <button onClick={() => handleDownload(selectedFiles[currentFileIndex]?.url)} className='request-button'><DownloadIcon /> Download</button>

                {selectedFiles.length > 1 && <div className="files-popup--footer--arrows">
                    <button className="action-button" disabled={currentFileIndex >= selectedFiles.length - 1} onClick={() => setCurrentFileIndex(currentFileIndex + 1)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.55537 5.37774L11.4046 8.43774C11.4181 8.44811 11.4309 8.45928 11.4431 8.47117C11.5106 8.54727 11.5479 8.64544 11.5479 8.74714C11.5479 8.84884 11.5106 8.94702 11.4431 9.02311C11.4312 9.03578 11.4183 9.04752 11.4046 9.05824L8.55537 12.1182C8.49463 12.1858 8.40954 12.2265 8.3188 12.2314C8.22805 12.2363 8.13908 12.205 8.07143 12.1443C8.06237 12.1364 8.05444 12.1279 8.04594 12.1188C7.97813 12.0439 7.94057 11.9464 7.94057 11.8454C7.94057 11.7443 7.97813 11.6469 8.04594 11.572L10.6758 8.7477L8.04594 5.92344C7.97813 5.84852 7.94057 5.75108 7.94057 5.65002C7.94057 5.54897 7.97813 5.45153 8.04594 5.37661C8.10694 5.30919 8.19214 5.26866 8.28293 5.26388C8.37372 5.2591 8.4627 5.29047 8.53043 5.35111C8.53935 5.3594 8.54768 5.3683 8.55537 5.37774Z" fill="#2C3E50" stroke="#2C3E50" stroke-width="0.566667" />
                        </svg>
                    </button>
                    <div className="files-popup--footer-current">{selectedFiles.length}\<span className='files-popup--footer-current-count'>{currentFileIndex + 1}</span></div>

                    <button className="action-button" disabled={currentFileIndex <= 0} onClick={() => setCurrentFileIndex(currentFileIndex - 1)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_72_13311)">
                                <path d="M10.3665 5.37774L7.5173 8.43774C7.5038 8.44811 7.49094 8.45928 7.47877 8.47117C7.41129 8.54727 7.37402 8.64544 7.37402 8.74714C7.37402 8.84884 7.41129 8.94702 7.47877 9.02311C7.4907 9.03578 7.50358 9.04752 7.5173 9.05824L10.3665 12.1182C10.4272 12.1858 10.5123 12.2265 10.6031 12.2314C10.6938 12.2363 10.7828 12.205 10.8504 12.1443C10.8595 12.1364 10.8674 12.1279 10.8759 12.1188C10.9437 12.0439 10.9813 11.9464 10.9813 11.8454C10.9813 11.7443 10.9437 11.6469 10.8759 11.572L8.24604 8.7477L10.8759 5.92344C10.9437 5.84852 10.9813 5.75108 10.9813 5.65002C10.9813 5.54897 10.9437 5.45153 10.8759 5.37661C10.8149 5.30919 10.7297 5.26866 10.6389 5.26388C10.5482 5.2591 10.4592 5.29047 10.3914 5.35111C10.3825 5.3594 10.3742 5.3683 10.3665 5.37774Z" fill="#2C3E50" stroke="#2C3E50" stroke-width="0.566667" />
                            </g>
                            <defs>
                                <clipPath id="clip0_72_13311">
                                    <rect width="17" height="17" fill="white" transform="matrix(-1 0 0 1 17.9609 0.25)" />
                                </clipPath>
                            </defs>
                        </svg>

                    </button>

                </div>}
            </div>
        </div>
    </div>

}

export default FilesPopUp;