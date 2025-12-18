"use client";
import { useState } from "react";
import DownloadIcon from '@/assets/icons/download.svg';
import CloseIcon from '@/assets/icons/Close.svg';
import dynamic from 'next/dynamic';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { updateToast, showLoading } from '@/utils/toastUtils';


import '@/utils/pdfjsWorker'

const FilesViewer = dynamic(() => import('./FilesViewer'), { ssr: false });




const FilesPopUp = ({ selectedFiles, setShowFilesPopup }: { selectedFiles: any[], setShowFilesPopup: (show: boolean) => void }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const handleDownload = async (url: string, name:string) => {
        const toastId = showLoading('Starting Receipt download...');
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
            updateToast(toastId, `${name} downloaded successfully!`, 'success');

        } catch (error) {
            console.error('Download failed:', error);
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
                    {/* <FilesViewer fileUrl="/test.pdf" fileType="application/pdf" /> */}
                </div>
            </div>
            <div className="files-popup--footer popup--footer ">
                <button onClick={() => handleDownload(selectedFiles[currentFileIndex]?.url, selectedFiles[currentFileIndex]?.name)} className='download-button'><DownloadIcon /> Download</button>

                {selectedFiles.length > 1 && <div className="files-popup--footer--arrows">
                    <button className="next-arrow" disabled={currentFileIndex >= selectedFiles.length - 1} onClick={() => setCurrentFileIndex(currentFileIndex + 1)}>
                        <ArrowIcon />
                    </button>
                    <div className="files-popup--footer-current">{selectedFiles.length} \ <span className='files-popup--footer-current-count'>{currentFileIndex + 1}</span></div>

                    <button className="prev-arrow" disabled={currentFileIndex <= 0} onClick={() => setCurrentFileIndex(currentFileIndex - 1)}>
                        <ArrowIcon />
                    </button>

                </div>}
            </div>
        </div>
    </div>

}

export default FilesPopUp;