import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PDFGeneratorOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  windowWidth?: number;
  margin?: number;
  title?: string;
  subject?: string;
  creator?: string;
  author?: string;
  keywords?: string;
}

export const generatePDF = async (
  elementRef: HTMLElement,
  options: PDFGeneratorOptions = {},
  onComplete?: () => void
) => {
  if (!elementRef) return;
  
  const {
    filename = `Export_${new Date().toISOString().split('T')[0]}`,
    scale = 2,
    quality = 1.0,
    windowWidth = 1200,
    margin = 10,
    title = 'Generated PDF',
    subject = 'Document Export',
    creator = 'PDF Export Utility',
    author = 'Application User',
    keywords = ''
  } = options;
  
  try {
    elementRef.classList.add('printing');
    
    // Calculate content height and width
    const contentWidth = elementRef.offsetWidth;
    const contentHeight = elementRef.offsetHeight;
    
    // Generate canvas with adjusted settings
    const canvas = await html2canvas(elementRef, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth,
      height: contentHeight,
      width: contentWidth,
      onclone: (document, element) => {
        // Force table to stay together
        const pricingTables = element.getElementsByTagName('table');
        Array.from(pricingTables).forEach(table => {
          const parentDiv = table.closest('div');
          if (parentDiv) {
            parentDiv.style.pageBreakInside = 'avoid';
            parentDiv.style.breakInside = 'avoid';
            parentDiv.style.display = 'block';
            parentDiv.style.position = 'relative';
          }
          table.style.pageBreakInside = 'avoid';
          table.style.breakInside = 'avoid';
        });
        
        // Ensure all content is visible
        element.style.height = 'auto';
        element.style.overflow = 'visible';
        
        // Prepare payment buttons for PDF
        prepareElementForPDF(element);
      }
    });

    elementRef.classList.remove('printing');

    // PDF dimensions (A4)
    const pdfWidth = 210;  // mm
    const pdfHeight = 297; // mm
    
    // Calculate dimensions
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with compression
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    // First page
    pdf.addImage(
      canvas.toDataURL('image/jpeg', quality),
      'JPEG',
      margin,
      position + margin,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    // Add hyperlinks to the PDF
    addHyperlinks(elementRef, pdf, margin, imgWidth, imgHeight, canvas.width, canvas.height);

    heightLeft -= (pdfHeight - (margin * 2));
    position -= pdfHeight;

    // Add subsequent pages if needed
    while (heightLeft >= 0) {
      pdf.addPage();
      pageNumber++;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', quality),
        'JPEG',
        margin,
        position + margin,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      heightLeft -= (pdfHeight - (margin * 2));
      position -= pdfHeight;
    }

    // Add metadata
    pdf.setProperties({
      title,
      subject,
      author,
      keywords,
      creator,
      producer: 'Visionify PDF Generator'
    });

    // Save the PDF
    pdf.save(`${filename}.pdf`);

    if (onComplete) {
      onComplete();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again.');
  }
};

// Add this function to prepare elements for PDF generation
export const prepareElementForPDF = (element) => {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true);
  
  // Find payment link buttons and ensure they're visible in PDF
  const paymentButtons = clonedElement.querySelectorAll('.payment-link-button');
  paymentButtons.forEach(button => {
    // Make sure the button is styled for PDF
    button.style.display = 'inline-block';
    button.style.padding = '10px 16px';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.borderRadius = '4px';
    button.style.textAlign = 'center';
    button.style.fontWeight = 'bold';
    button.style.margin = '10px 0';
    button.style.textDecoration = 'none';
    
    // Remove any surrounding text that shouldn't be in the PDF
    const paymentContainer = button.closest('.pdf-payment-button');
    if (paymentContainer) {
      // Remove all children except the button
      Array.from(paymentContainer.children).forEach(child => {
        if (child !== button && !child.classList.contains('payment-link-button')) {
          paymentContainer.removeChild(child);
        }
      });
    }
  });
  
  // Remove the payment info card completely from the PDF
  const paymentInfoCard = clonedElement.querySelector('.payment-info-card');
  if (paymentInfoCard) {
    paymentInfoCard.parentNode.removeChild(paymentInfoCard);
  }
  
  return clonedElement;
};

// New function to add hyperlinks to the PDF
function addHyperlinks(element: HTMLElement, pdf: any, margin: number, pdfWidth: number, pdfHeight: number, canvasWidth: number, canvasHeight: number) {
  // Find all payment links in the document
  const paymentLinks = element.querySelectorAll('.pdf-payment-link');
  
  paymentLinks.forEach(link => {
    const url = link.getAttribute('data-url');
    if (!url) return;
    
    // Get the position of the link element
    const rect = link.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position in the PDF
    const x = (rect.left + scrollLeft) * (pdfWidth / canvasWidth) + margin;
    const y = (rect.top + scrollTop) * (pdfHeight / canvasHeight) + margin;
    const width = rect.width * (pdfWidth / canvasWidth);
    const height = rect.height * (pdfHeight / canvasHeight);
    
    // Add link to PDF
    pdf.link(x, y, width, height, { url });
  });
} 