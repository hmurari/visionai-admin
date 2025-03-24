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