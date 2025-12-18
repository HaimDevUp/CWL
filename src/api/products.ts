import { InitCardResponse, Order, ProfileResponse } from '@/schemas/profileSchemas';
import api from './index';
import { OfferTile, Breakdown, PurchaseData, initiateFilesResponse, initiateFileRequest, PurchaseResponse, uploadFilesRequest, UploadResult } from '@/schemas/productsSchemas';

const BASE_URL = '/api/v1/web/';



export async function fetchOffers(type: string, entry?: string, exit?: string, tags?: string): Promise<OfferTile[]> {
    let url = `${BASE_URL}offers?type=${type}`;
    if (entry) {
        url += `&entry=${entry}`;
    }
    if (exit) {
        url += `&exit=${exit}`;
    }
    if (tags) {
        url += `&tags=${tags}`;
    }
    return await api.get<OfferTile[]>(url);
}

export async function fetchOfferById(id: string): Promise<OfferTile> {
    return await api.get<OfferTile>(`${BASE_URL}offers/${id}`);
}


export async function calculateBreakdown(id: string, topUp?: number, entry?: string, exit?: string): Promise<Breakdown> {
    let url = `${BASE_URL}orders/calculate-breakdown`;
    return await api.post<Breakdown>(url, { offerId: id, 
        options: { wallet: { topUpAmount: topUp } }, 
        validity: { entry: entry, exit: exit } });
}

export async function validateOrder(purchaseData: PurchaseData): Promise<any> {
    return await api.post<any>(`${BASE_URL}orders/validate`, purchaseData);
}

export async function initPurchaseCard(): Promise<InitCardResponse> {
    return await api.post<InitCardResponse>(`${BASE_URL}/orders/purchase/cards/init`);
}

export async function Purchase(purchaseData: PurchaseData): Promise<PurchaseResponse> {
    return await api.post<PurchaseResponse>(`${BASE_URL}/orders/purchase`, purchaseData);
}


export async function getOrderById(orderId: string): Promise<Order> {
    return await api.get<Order>(`${BASE_URL}/orders/${orderId}/public`);
}

export async function initiateFiles(files: initiateFileRequest): Promise<initiateFilesResponse> {
    return await api.post<initiateFilesResponse>(`${BASE_URL}/files/bulk-create`, files);
}

// Convert base64 string to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

export async function uploadFilesS3(files: uploadFilesRequest): Promise<UploadResult[]> {
    // Upload all files in parallel and wait for all to complete
    const uploadPromises = files.map(async (file): Promise<UploadResult> => {
        try {
            // Convert base64 content to Blob
            const blob = base64ToBlob(file.content, file.contentType);
            const response = await fetch(file.uploadUrl, {
                method: 'PUT',
                body: blob,
                headers: {
                    'Content-Type': file.contentType,
                },
            })
            if (!response.ok) {
                return {
                    fileId: file.fileId,
                    name: file.name,
                    contentType: file.contentType,
                    success: false,
                    error: `Upload failed with status ${response.status}: ${response.statusText}`,
                    response,
                };
            }

            return {
                fileId: file.fileId,
                name: file.name,
                contentType: file.contentType,
                success: true,
                response,
            };
        } catch (error) {
            return {
                fileId: file.fileId,
                name: file.name,
                contentType: file.contentType,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });

    // Wait for all uploads to complete (even if some fail)
    const results = await Promise.allSettled(uploadPromises);
    
    // Extract results from Promise.allSettled format
    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            // If the promise itself was rejected (shouldn't happen since we catch errors)
            return {
                fileId: files[index].fileId,
                name: files[index].name,
                contentType: files[index].contentType,
                success: false,
                error: result.reason instanceof Error ? result.reason.message : 'Promise rejected',
            };
        }
    });
}
