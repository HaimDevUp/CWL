
/**
 * Generic file download function
 * @param blob - Blob data from API
 * @param filename - Full filename with extension
 */
export const downloadFile = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
};


/**
 * Enhanced download function with error handling and console logging
 * @param apiCall - Promise that returns blob data
 * @param filename - Name for the downloaded file
 * @param fileType - Type of file ('pdf', 'csv', or custom extension)
 */
export const handleDownload = async (
    apiCall: Promise<Blob>, 
    filename: string, 
    fileType: 'pdf' | 'csv' | string = 'pdf'
): Promise<void> => {
    try {
        console.log(`Starting ${fileType.toUpperCase()} download:`, filename);
        
        const blob = await apiCall;
        
        // Determine file extension
        let fullFilename: string;
        if (fileType === 'pdf' || fileType === 'csv') {
            fullFilename = `${filename}.${fileType}`;
        } else {
            fullFilename = filename.includes('.') ? filename : `${filename}.${fileType}`;
        }
        
        downloadFile(blob, fullFilename);
        
        console.log(`${fileType.toUpperCase()} download completed:`, fullFilename);
        
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error(`Failed to download ${fileType.toUpperCase()} file: ${error}`);
    }
}; 