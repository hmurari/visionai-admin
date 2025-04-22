import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QuoteDetailsV2, Branding } from '@/types/quote';
import { pricingDataV2 } from '@/data/pricing_v2';

interface PDFGeneratorOptions {
  filename?: string;
  margin?: number;
  title?: string;
  subject?: string;
  creator?: string;
  author?: string;
  keywords?: string;
  checkoutUrl?: string;
}

export const generatePDFFromMultiplePages = async (
  pageElements: HTMLElement[],
  options: PDFGeneratorOptions = {}
) => {
  if (!pageElements.length) return;
  
  const {
    filename = `Visionify_Quote_${new Date().toISOString().split('T')[0]}`,
    title = 'Visionify Quote',
    subject = 'Safety Analytics Quote',
    creator = 'Visionify Quote Generator',
    author = 'Visionify Inc.',
    keywords = 'quote, safety analytics, visionify',
    checkoutUrl = null
  } = options;

  try {
    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set metadata
    pdf.setProperties({
      title,
      subject,
      author,
      keywords,
      creator,
      producer: 'Visionify PDF Generator'
    });

    // Process each page element
    for (let i = 0; i < pageElements.length; i++) {
      // Add a new page if not the first page
      if (i > 0) {
        pdf.addPage();
      }
      
      // Clone the element to avoid modifying the original
      const clonedElement = pageElements[i].cloneNode(true) as HTMLElement;
      
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.backgroundColor = 'white';
      container.appendChild(clonedElement);
      document.body.appendChild(container);

      // Capture the HTML element as a canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // A4 dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pageWidth;
      const pageHeight = imgHeight / ratio;
      
      // Add the image to the PDF with proper aspect ratio
      pdf.addImage(
        canvas,
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        'FAST'
      );
      
      // Add clickable checkout button if this is the second page and we have a checkout URL
      if (i === 1 && checkoutUrl) {
        // Add a button at the bottom - moved further down
        const pageHeight = pdf.internal.pageSize.getHeight();
        const buttonY = pageHeight - 20; // 20mm from bottom (moved from 30mm to 20mm)
        const buttonWidth = 80; // 80mm wide
        const buttonX = (pageWidth - buttonWidth) / 2; // Centered
        const buttonHeight = 10; // 10mm tall
        
        // Add "Ready to Proceed?" text above the button
        pdf.setTextColor(0, 0, 0); // Black text
        pdf.setFontSize(12);
        pdf.text('Ready to proceed?', pageWidth / 2, buttonY - 5, { align: 'center' });
        
        // Add clickable link annotation
        pdf.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: checkoutUrl });
        
        // Add a visible button
        pdf.setFillColor(59, 130, 246); // Blue color
        pdf.rect(buttonX, buttonY, buttonWidth, buttonHeight, 'F');
        
        // Add text to the button
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.text('Click here to Order', pageWidth / 2, buttonY + 6, { align: 'center' });
        
        console.log('Added checkout button with URL:', checkoutUrl);
      }
      
      // Clean up
      document.body.removeChild(container);
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Keep the original function for backward compatibility
export const generatePDFFromData = async (
  elementRef: HTMLElement,
  options: PDFGeneratorOptions = {}
) => {
  if (!elementRef) return;
  
  return generatePDFFromMultiplePages([elementRef], options);
};

// Alias for backward compatibility
export const generatePDF = generatePDFFromData;

export const prepareElementForPDF = (element: HTMLElement) => {
  return element;
};