'use client';

import React, { useState, useRef, useEffect } from 'react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './FilesViewer.scss'
import PlusIcon from '@/assets/icons/plus.svg';
import MinusIcon from '@/assets/icons/minus.svg';

// Dynamic import של react-pdf כדי להגדיר את ה-worker לפני הטעינה
let Document: any, Page: any, pdfjs: any
let reactPdfModule: any = null

// טען את react-pdf בצורה אסינכרונית והגדר את ה-worker
if (typeof window !== 'undefined') {
  import('react-pdf').then((module) => {
    reactPdfModule = module
    Document = module.Document
    Page = module.Page
    pdfjs = module.pdfjs
    
    // הגדרת worker מיד אחרי הטעינה
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.5.4.296.min.mjs'
    }
  }).catch((error) => {
    console.error('Failed to load react-pdf:', error)
  })
  
}

const FilesViewer = ({ fileUrl, fileType }: { fileUrl: string, fileType: string }) => {
    const [numPages, setNumPages] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [scale, setScale] = useState(1.0)

    // גרירה
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [translation, setTranslation] = useState({ x: 0, y: 0 })

    const containerRef = useRef(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [reactPdfReady, setReactPdfReady] = useState(false)

    // טען את react-pdf בצורה אסינכרונית
    useEffect(() => {
        if (typeof window === 'undefined') return
        
        if (reactPdfModule) {
            setReactPdfReady(true)
            return
        }
        
        import('react-pdf').then((module) => {
            Document = module.Document
            Page = module.Page
            pdfjs = module.pdfjs
            reactPdfModule = module
            
            // הגדרת worker מיד אחרי הטעינה
            if (pdfjs && pdfjs.GlobalWorkerOptions) {
                pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.5.4.296.min.mjs'
            }
            
            setReactPdfReady(true)
        }).catch((error) => {
            console.error('Failed to load react-pdf:', error)
            setError('Failed to load PDF viewer')
        })
    }, [])

    // Debug effect to check PDF URL changes
    useEffect(() => {
        if (fileUrl) {
            setLoading(true)
            setError(null)
            setPageNumber(1) // איפוס עמוד (רלוונטי רק לPDF)
            setTranslation({ x: 0, y: 0 }) // איפוס מיקום
            setScale(1.0)
        }
    }, [fileUrl])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoading(false)
        setError(null)
    }

    const onDocumentLoadError = (error: any) => {
        setError(`Error loading PDF: ${error.message || error}`)
        setLoading(false)
    }

    const onImageLoad = () => {
        setLoading(false)
        setError(null)
        setNumPages(1) // תמונה = עמוד אחד
    }

    const onImageError = () => {
        setError('Error loading image')
        setLoading(false)
    }

    // הגבלת תרגום לגבולות הנכונים
    const constrainTranslation = (currentTranslation: { x: number, y: number }) => {
        const bounds = calculateBounds()
        if (!bounds) return currentTranslation

        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, currentTranslation.x)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, currentTranslation.y))
        }
    }

    // פונקציות זום עם הגבלת גבולות
    const zoomIn = () => {
        setScale(prevScale => {
            const newScale = Math.min(prevScale * 1.2, 3.0)
            // עדכון התרגום לאחר זום
            setTimeout(() => {
                setTranslation(prevTranslation => constrainTranslation(prevTranslation))
            }, 0)
            return newScale
        })
    }

    const zoomOut = () => {
        setScale(prevScale => {
            const newScale = Math.max(prevScale / 1.2, 0.5)
            // עדכון התרגום לאחר זום
            setTimeout(() => {
                setTranslation(prevTranslation => constrainTranslation(prevTranslation))
            }, 0)
            return newScale
        })
    }

    const resetZoom = () => {
        setScale(1.0)
        setTranslation({ x: 0, y: 0 })
    }

    // פונקציות ניווט בין עמודים
    const goToPrevPage = () => {
        setPageNumber(prev => {
            const newPage = Math.max(prev - 1, 1)
            // איפוס התרגום כשמחליפים עמוד
            if (newPage !== prev) {
                setTimeout(() => {
                    setTranslation(prevTranslation => constrainTranslation(prevTranslation))
                }, 100)
            }
            return newPage
        })
    }

    const goToNextPage = () => {
        setPageNumber(prev => {
            const newPage = Math.min(prev + 1, numPages)
            // איפוס התרגום כשמחליפים עמוד
            if (newPage !== prev) {
                setTimeout(() => {
                    setTranslation(prevTranslation => constrainTranslation(prevTranslation))
                }, 100)
            }
            return newPage
        })
    }

    // חישוב גבולות גרירה
    const calculateBounds = () => {
        if (!containerRef.current) return null

        const container = (containerRef.current as HTMLElement).getBoundingClientRect()

        // גודל האלמנט עם הזום הנוכחי
        const element = (fileType === 'application/pdf' ? canvasRef.current : imageRef.current) as HTMLImageElement | HTMLCanvasElement | null
        if (!element) return null
        let scaledWidth, scaledHeight

        if (fileType === 'image/jpeg' && element instanceof HTMLImageElement) {
            // עבור תמונות
            scaledWidth = element.offsetWidth * scale
            scaledHeight = element.offsetHeight * scale
        } else {
            // עבור PDF
            scaledWidth = element.offsetWidth * scale
            scaledHeight = element.offsetHeight * scale
        }

        // גבולות התנועה - מניחים שהאלמנט במרכז
        const maxX = Math.max(0, (scaledWidth - container.width) / 2)
        const maxY = Math.max(0, (scaledHeight - container.height) / 2)

        return {
            minX: -maxX,
            maxX: maxX,
            minY: -maxY,
            maxY: maxY
        }
    }

    // פונקציות גרירה עם הגבלת גבולות
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        setDragStart({
            x: e.clientX - translation.x,
            y: e.clientY - translation.y
        })
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return

        const newTranslation = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }

        // הגבלת התנועה לגבולות הדף
        const bounds = calculateBounds()
        if (bounds) {
            newTranslation.x = Math.max(bounds.minX, Math.min(bounds.maxX, newTranslation.x))
            newTranslation.y = Math.max(bounds.minY, Math.min(bounds.maxY, newTranslation.y))
        }

        setTranslation(newTranslation)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        if (isDragging) {
            const handleMouseMoveGlobal = (e: MouseEvent) => {
                if (!isDragging) return

                const newTranslation = {
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                }

                // הגבלת התנועה לגבולות הדף
                const bounds = calculateBounds()
                if (bounds) {
                    newTranslation.x = Math.max(bounds.minX, Math.min(bounds.maxX, newTranslation.x))
                    newTranslation.y = Math.max(bounds.minY, Math.min(bounds.maxY, newTranslation.y))
                }

                setTranslation(newTranslation)
            }

            document.addEventListener('mousemove', handleMouseMoveGlobal)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMoveGlobal)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, dragStart])


    if (error) {
        return <div className="pdf-error">{error}</div>
    }

    // אם react-pdf עדיין לא נטען, הצג loading
    if (!reactPdfReady || !Document || !Page) {
        return <div className="pdf-loading">Loading PDF viewer...</div>
    }

    return (
        <div className="pdf-viewer">
            <div className="pdf-toolbar">
                <div className="files-popup--preview-zoom">
                    <button className="action-button" onClick={zoomIn} disabled={scale >= 3.0}>
                        <PlusIcon />
                    </button>
                    <span>{Math.round(scale * 100)}%</span>
                    <button className="action-button" onClick={zoomOut} disabled={scale <= 0.5}>
                        <MinusIcon />
                    </button>

                    {/* <button onClick={goToPrevPage} disabled={pageNumber <= 1}> `{'<'}` </button>
                    <button onClick={goToNextPage} disabled={pageNumber >= numPages}> `{'>'}` </button> */}
                </div>
            </div>

            <div
                ref={containerRef}
                className="pdf-container"
                onMouseDown={handleMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div
                    className="pdf-content"
                    style={{
                        transform: `translate(${translation.x}px, ${translation.y}px) scale(${scale})`,
                        transformOrigin: 'center center'
                    }}
                >
                    {fileType === 'application/pdf' ? (
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<div className="pdf-loading">Loading document...</div>}
                        >
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={() => {
                                    // עדכון התרגום לאחר טעינת העמוד
                                    setTimeout(() => {
                                        setTranslation(prevTranslation => constrainTranslation(prevTranslation))
                                    }, 100)
                                }}
                                canvasRef={(canvas: HTMLCanvasElement | null) => {
                                    if (canvas && canvasRef.current !== canvas) {
                                        canvasRef.current = canvas
                                    }
                                }}
                            />
                        </Document>
                    ) : (
                        <img
                            ref={imageRef}
                            src={fileUrl}
                            alt="Image content"
                            onLoad={onImageLoad}
                            onError={onImageError}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                display: 'block',
                            }}
                            draggable={false}
                        />
                    )}
                </div>
            </div>

        </div>
    )
}

export default FilesViewer 