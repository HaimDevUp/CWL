// הגדרת worker של PDF.js לפני טעינת react-pdf
// קובץ זה צריך להיות מיובא לפני כל שימוש ב-react-pdf

if (typeof window !== 'undefined') {
  // נסה להגדיר את ה-worker לפני טעינת react-pdf
  // נשתמש ב-setTimeout כדי לוודא שזה קורה אחרי שה-module system מוכן
  setTimeout(() => {
    import('react-pdf').then((reactPdfModule) => {
      const { pdfjs } = reactPdfModule
      if (pdfjs && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.5.4.296.min.mjs'
      }
    }).catch((error) => {
      console.error('Failed to set PDF.js worker:', error)
    })
  }, 0)
}

export {}

