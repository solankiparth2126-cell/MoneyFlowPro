import * as pdfjs from 'pdfjs-dist';

// Point to the worker source from a reliable CDN (unpkg) to avoid 404s and mixed-content issues.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF File object (client-side)
 * using the standard pdfjs-dist library.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(arrayBuffer),
            useSystemFonts: true,
            isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Extract and join text fragments from the page
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            
            fullText += pageText + '\n';
        }
        
        return fullText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF statement. Please ensure it's not password protected.");
    }
}
