import { jsPDF } from 'jspdf';
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
}

export const generatePDFFromData = async (
  quoteDetails: QuoteDetailsV2,
  branding: Branding,
  checkoutLink: { checkoutUrl: string; expiresAt: string } | null,
  options: PDFGeneratorOptions = {}
) => {
  const {
    filename = `Visionify_Quote_${quoteDetails.clientInfo.company}_${new Date().toISOString().split('T')[0]}`,
    margin = 30,
    title = `Visionify Quote - ${quoteDetails.clientInfo.company}`,
    subject = 'Safety Analytics Quote',
    creator = 'Visionify Quote Generator',
    author = 'Visionify Inc.',
    keywords = 'quote, safety analytics, visionify'
  } = options;

  try {
    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
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

    // A4 dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (2 * margin);
    
    // Start positions
    let yPos = margin;
    
    // Define colors
    const colors = {
      primary: branding.primaryColor || '#1E40AF',
      secondary: branding.secondaryColor || '#4B5563',
      blue50: '#EFF6FF',
      blue100: '#DBEAFE',
      blue600: '#2563EB',
      gray50: '#F9FAFB',
      gray200: '#E5E7EB',
      gray500: '#6B7280',
      white: '#FFFFFF',
    };
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(amount);
    };

    // HEADER SECTION
    // Add logo
    pdf.addImage('/logo-color.png', 'PNG', margin, yPos, 150, 50);
    
    // Add quote title and details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QUOTE', pageWidth - margin - 100, yPos + 20, { align: 'right' });
    
    // Add date and quote number
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Date: ${quoteDetails.date}`, pageWidth - margin - 100, yPos + 40, { align: 'right' });
    
    if (quoteDetails.quoteNumber) {
      pdf.text(`Quote #: ${quoteDetails.quoteNumber}`, pageWidth - margin - 100, yPos + 60, { align: 'right' });
    }
    
    yPos += 80;
    
    // CLIENT DATA SECTION
    // Draw container
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, yPos, contentWidth, 120, 3, 3, 'FD');
    
    // FROM section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('FROM', margin + 15, yPos + 20);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Visionify, Inc.', margin + 15, yPos + 35);
    pdf.text('1499, W 120th Ave, Ste 110', margin + 15, yPos + 50);
    pdf.text('Westminster, CO 80234', margin + 15, yPos + 65);
    pdf.text('Ph: 720-449-1124', margin + 15, yPos + 80);
    pdf.text('Email: sales@visionify.ai', margin + 15, yPos + 95);
    
    // TO section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('TO', margin + contentWidth/2 + 15, yPos + 20);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(quoteDetails.clientInfo.name || '', margin + contentWidth/2 + 15, yPos + 35);
    pdf.text(quoteDetails.clientInfo.company || '', margin + contentWidth/2 + 15, yPos + 50);
    pdf.text(quoteDetails.clientInfo.address || '', margin + contentWidth/2 + 15, yPos + 65);
    pdf.text(`${quoteDetails.clientInfo.city || ''} ${quoteDetails.clientInfo.state || ''} ${quoteDetails.clientInfo.zip || ''}`, margin + contentWidth/2 + 15, yPos + 80);
    pdf.text(quoteDetails.clientInfo.email || '', margin + contentWidth/2 + 15, yPos + 95);
    
    yPos += 140;
    
    // PACKAGE SUMMARY SECTION
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('PACKAGE SUMMARY', margin, yPos);
    yPos += 20;
    
    // Draw table
    const packageName = quoteDetails.isEverythingPackage ? "Everything Package" : "Core Package";
    const subscriptionType = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === quoteDetails.subscriptionType
    )?.name || 'Monthly';
    
    // Table headers
    pdf.setFillColor(249, 250, 251); // gray-50
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.rect(margin, yPos, contentWidth, 30, 'FD');
    
    const colWidths = [contentWidth * 0.25, contentWidth * 0.15, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2];
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Package', margin + 10, yPos + 20);
    pdf.text('Cameras', margin + colWidths[0] + 10, yPos + 20);
    pdf.text('Subscription', margin + colWidths[0] + colWidths[1] + 10, yPos + 20);
    pdf.text('Hardware', margin + colWidths[0] + colWidths[1] + colWidths[2] + 10, yPos + 20);
    pdf.text('Deployment', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 10, yPos + 20);
    
    // Draw vertical lines
    pdf.line(margin + colWidths[0], yPos, margin + colWidths[0], yPos + 60);
    pdf.line(margin + colWidths[0] + colWidths[1], yPos, margin + colWidths[0] + colWidths[1], yPos + 60);
    pdf.line(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, margin + colWidths[0] + colWidths[1] + colWidths[2], yPos + 60);
    pdf.line(margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos + 60);
    
    // Table data
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.rect(margin, yPos + 30, contentWidth, 30, 'S');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(packageName, margin + 10, yPos + 50);
    pdf.text(quoteDetails.totalCameras.toString(), margin + colWidths[0] + 10, yPos + 50);
    pdf.text(subscriptionType, margin + colWidths[0] + colWidths[1] + 10, yPos + 50);
    pdf.text('Included', margin + colWidths[0] + colWidths[1] + colWidths[2] + 10, yPos + 50);
    pdf.text('Visionify Cloud', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 10, yPos + 50);
    
    yPos += 80;
    
    // SELECTED SCENARIOS SECTION
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('SELECTED SCENARIOS', margin, yPos);
    yPos += 20;
    
    // Draw container
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, yPos, contentWidth, 80, 3, 3, 'FD');
    
    // Draw scenario pills
    const scenarios = pricingDataV2.scenarios;
    const pillWidth = 120;
    const pillHeight = 25;
    const pillsPerRow = 3;
    const pillMargin = 10;
    
    let pillX = margin + 10;
    let pillY = yPos + 20;
    
    scenarios.forEach((scenario, index) => {
      const isSelected = quoteDetails.selectedScenarios.includes(scenario);
      
      // Draw pill background
      if (isSelected) {
        pdf.setFillColor(239, 246, 255); // blue-50
        pdf.setDrawColor(219, 234, 254); // blue-100
      } else {
        pdf.setFillColor(249, 250, 251); // gray-50
        pdf.setDrawColor(229, 231, 235); // gray-200
      }
      
      pdf.roundedRect(pillX, pillY, pillWidth, pillHeight, 12, 12, 'FD');
      
      // Draw checkmark for selected scenarios
      if (isSelected) {
        pdf.setTextColor(37, 99, 235); // blue-600
        pdf.text('✓', pillX + 10, pillY + 17);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.text(scenario, pillX + 20, pillY + 17);
      } else {
        pdf.setTextColor(156, 163, 175); // gray-400
        pdf.setFontSize(8);
        pdf.text(scenario, pillX + 10, pillY + 17);
      }
      
      // Move to next position
      if ((index + 1) % pillsPerRow === 0) {
        pillX = margin + 10;
        pillY += pillHeight + pillMargin;
      } else {
        pillX += pillWidth + pillMargin;
      }
    });
    
    yPos += 100;
    
    // PRICING SHEET SECTION
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('PRICING SHEET', margin, yPos);
    yPos += 20;
    
    // Base Price Table
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.rect(margin, yPos, contentWidth, 60, 'S');
    
    // Table header
    pdf.setFillColor(249, 250, 251); // gray-50
    pdf.rect(margin, yPos, contentWidth, 30, 'FD');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Item', margin + 10, yPos + 20);
    pdf.text('Price', margin + contentWidth - 100, yPos + 20, { align: 'right' });
    
    // Base price row
    pdf.setFont('helvetica', 'normal');
    pdf.text('Base Price', margin + 10, yPos + 50);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('Starter Kit, Edge Server included', margin + 10, yPos + 65);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatCurrency(quoteDetails.oneTimeBaseCost)} one-time`, margin + contentWidth - 10, yPos + 50, { align: 'right' });
    
    yPos += 80;
    
    // Additional Cameras Table
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.rect(margin, yPos, contentWidth, 150, 'S');
    
    // Table header row 1
    pdf.setFillColor(249, 250, 251); // gray-50
    pdf.rect(margin, yPos, contentWidth, 30, 'FD');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Additional Cameras', margin + 10, yPos + 20);
    
    // Get subscription discount
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === quoteDetails.subscriptionType
    );
    const discountPercentage = subscription?.discount ? subscription.discount * 100 : 0;
    
    // Add discount text
    if (discountPercentage > 0) {
      pdf.setFontSize(8);
      pdf.setTextColor(0, 128, 0); // green
      pdf.text(`${discountPercentage}% discount per camera/month applied`, margin + 10, yPos + 35);
    }
    
    // Package headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Core Package', margin + contentWidth * 0.6, yPos + 15);
    pdf.text('Everything Package', margin + contentWidth * 0.85, yPos + 15);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('per camera/month', margin + contentWidth * 0.6, yPos + 30);
    pdf.text('per camera/month', margin + contentWidth * 0.85, yPos + 30);
    
    // Draw vertical lines
    pdf.line(margin + contentWidth * 0.5, yPos, margin + contentWidth * 0.5, yPos + 150);
    pdf.line(margin + contentWidth * 0.75, yPos, margin + contentWidth * 0.75, yPos + 150);
    
    // Camera pricing tiers
    const tiers = pricingDataV2.additionalCameraPricing.corePackage;
    const everythingTiers = pricingDataV2.additionalCameraPricing.everythingPackage;
    
    // Apply discount
    const applyDiscount = (price: number) => {
      return price * (1 - (subscription?.discount || 0));
    };
    
    // Draw tier rows
    tiers.forEach((tier, index) => {
      const rowY = yPos + 60 + (index * 30);
      
      // Draw horizontal line
      if (index > 0) {
        pdf.line(margin, rowY, margin + contentWidth, rowY);
      }
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(tier.range, margin + 10, rowY + 20);
      
      // Core package price
      const corePrice = applyDiscount(tier.pricePerMonth);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${Math.round(corePrice)}`, margin + contentWidth * 0.6, rowY + 20);
      
      // Everything package price
      const everythingPrice = applyDiscount(everythingTiers[index].pricePerMonth);
      pdf.text(`$${Math.round(everythingPrice)}`, margin + contentWidth * 0.85, rowY + 20);
    });
    
    yPos += 170;
    
    // Check if we need to add a new page
    if (yPos > pageHeight - 200) {
      pdf.addPage();
      yPos = margin;
    }
    
    // PRICING SUMMARY SECTION
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('PRICING SUMMARY', margin, yPos);
    yPos += 20;
    
    // Draw table
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.rect(margin, yPos, contentWidth, 120, 'S');
    
    // Table header
    pdf.setFillColor(239, 246, 255); // blue-50
    pdf.rect(margin, yPos, contentWidth, 30, 'FD');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('Description', margin + 10, yPos + 20);
    pdf.text('Amount', margin + contentWidth - 10, yPos + 20, { align: 'right' });
    
    // Base price row
    pdf.line(margin, yPos + 30, margin + contentWidth, yPos + 30);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Base Price', margin + 10, yPos + 50);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('Starter Kit, Edge Server included', margin + 10, yPos + 65);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(formatCurrency(quoteDetails.oneTimeBaseCost), margin + contentWidth - 50, yPos + 50, { align: 'right' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('one-time', margin + contentWidth - 10, yPos + 50, { align: 'right' });
    
    // Camera subscription row
    pdf.line(margin, yPos + 70, margin + contentWidth, yPos + 70);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Camera Subscription', margin + 10, yPos + 90);
    
    const subscriptionDesc = `${quoteDetails.totalCameras} cameras × $${Math.round(quoteDetails.additionalCameraCost)} per camera/month × 12 months`;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(subscriptionDesc, margin + 10, yPos + 105);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(formatCurrency(quoteDetails.discountedAnnualRecurring), margin + contentWidth - 50, yPos + 90, { align: 'right' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('per year', margin + contentWidth - 10, yPos + 90, { align: 'right' });
    
    yPos += 140;
    
    // Total Contract Value box
    pdf.setFillColor(239, 246, 255); // blue-50
    pdf.setDrawColor(219, 234, 254); // blue-100
    pdf.roundedRect(margin, yPos, contentWidth, 80, 3, 3, 'FD');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total Contract Value', margin + 20, yPos + 30);
    
    const contractDesc = `${formatCurrency(quoteDetails.oneTimeBaseCost)} one-time base price + ${formatCurrency(quoteDetails.discountedAnnualRecurring)} per year (${discountPercentage}% subscription discount) for ${quoteDetails.totalCameras} cameras`;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(contractDesc, margin + 20, yPos + 45);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text(formatCurrency(quoteDetails.totalContractValue), margin + contentWidth - 20, yPos + 30, { align: 'right' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(`for ${quoteDetails.contractLength / 12} year`, margin + contentWidth - 20, yPos + 50, { align: 'right' });
    
    yPos += 100;
    
    // Check if we need to add a new page
    if (yPos > pageHeight - 200) {
      pdf.addPage();
      yPos = margin;
    }
    
    // STANDARD FEATURES SECTION
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(colors.primary.slice(1, 3), 16), 
                    parseInt(colors.primary.slice(3, 5), 16), 
                    parseInt(colors.primary.slice(5, 7), 16));
    pdf.text('STANDARD FEATURES', margin, yPos);
    yPos += 20;
    
    // Draw container
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, yPos, contentWidth, 120, 3, 3, 'FD');
    
    // Standard features
    const features = [
      'Web & Mobile App',
      '4 weeks whiteglove onboarding',
      '12s Video Clips',
      '1 Year Video Archival',
      'Up to 100 users',
      'TV Wall Feature',
      'Text, Email, MS Teams, WhatsApp',
      'Periodic Reports (daily, weekly)',
      'Speaker Integration (Axis, HikVision)'
    ];
    
    // Draw features in two columns
    const colWidth = contentWidth / 2;
    let featureY = yPos + 20;
    
    features.forEach((feature, index) => {
      const colX = margin + (index % 2 === 0 ? 0 : colWidth);
      
      // Draw checkmark
      pdf.setTextColor(37, 99, 235); // blue-600
      pdf.setFontSize(12);
      pdf.text('✓', colX + 15, featureY);
      
      // Draw feature text
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(feature, colX + 30, featureY);
      
      // Move to next row if we're on the right column
      if (index % 2 === 1) {
        featureY += 25;
      }
    });
    
    yPos += 140;
    
    // FOOTER SECTION
    // Draw separator line
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 20;
    
    // Footer text
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Thank you for your business. We look forward to working with you!', margin, yPos);
    yPos += 15;
    
    pdf.text('For any questions, please contact us at ', margin, yPos);
    pdf.setTextColor(37, 99, 235); // blue-600
    pdf.textWithLink('sales@visionify.ai', margin + 210, yPos, { url: 'mailto:sales@visionify.ai' });
    yPos += 15;
    
    // Quote ID
    if (quoteDetails._id) {
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Quote ID: ${quoteDetails._id}`, margin, yPos);
      yPos += 20;
    }
    
    // Payment link section
    if (checkoutLink && checkoutLink.checkoutUrl) {
      // Draw payment box
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.setDrawColor(219, 234, 254); // blue-100
      pdf.roundedRect(margin, yPos, contentWidth, 80, 3, 3, 'FD');
      
      // Payment title
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.text('Complete your purchase online:', margin + 15, yPos + 20);
      
      // Payment button
      pdf.setFillColor(37, 99, 235); // blue-600
      pdf.roundedRect(margin + 15, yPos + 30, 120, 30, 3, 3, 'F');
      
      // Button text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Pay Now', margin + 75, yPos + 50, { align: 'center' });
      
      // Add link annotation
      pdf.link(margin + 15, yPos + 30, 120, 30, { url: checkoutLink.checkoutUrl });
      
      // Expiration date
      const expirationDate = new Date(checkoutLink.expiresAt).toLocaleDateString();
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(`Valid until: ${expirationDate}`, margin + 15, yPos + 70);
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Original HTML-based PDF generator (keep for backward compatibility)
export const generatePDF = async (
  elementRef: HTMLElement,
  options: PDFGeneratorOptions = {}
) => {
  if (!elementRef) return;
  
  const {
    filename = `Export_${new Date().toISOString().split('T')[0]}`,
    margin = 30,
    title = 'Generated PDF',
    subject = 'Document Export',
    creator = 'PDF Export Utility',
    author = 'Application User',
    keywords = ''
  } = options;

  try {
    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
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

    // A4 dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (2 * margin);
    
    // Start positions
    let yPos = margin;
    let currentPage = 1;
    
    // Define colors
    const colors = {
      primary: '#1E40AF',
      blue50: '#EFF6FF',
      blue100: '#DBEAFE',
      blue600: '#2563EB',
      blue800: '#1E40AF',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      white: '#FFFFFF',
      black: '#000000',
    };
    
    // HEADER SECTION
    const headerSection = elementRef.querySelector('.quote-header');
    if (headerSection) {
      // Add logo
      const logo = headerSection.querySelector('img') as HTMLImageElement;
      if (logo) {
        pdf.addImage(logo.src, 'PNG', margin, yPos, 150, 50);
      }
      
      // Add quote title and details
      const titleElement = headerSection.querySelector('h2');
      if (titleElement) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('QUOTE', pageWidth - margin - 100, yPos + 20, { align: 'right' });
      }
      
      // Add date and quote number
      const dateElement = headerSection.querySelector('p:nth-child(1)');
      const quoteNumberElement = headerSection.querySelector('p:nth-child(2)');
      
      if (dateElement) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(dateElement.textContent || '', pageWidth - margin - 100, yPos + 40, { align: 'right' });
      }
      
      if (quoteNumberElement) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(quoteNumberElement.textContent || '', pageWidth - margin - 100, yPos + 60, { align: 'right' });
      }
      
      yPos += 80;
    }
    
    // CLIENT DATA SECTION
    const clientDataSection = elementRef.querySelector('.quote-client-data');
    if (clientDataSection) {
      // Draw container
      pdf.setDrawColor(229, 231, 235); // gray-200
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPos, contentWidth, 120, 3, 3, 'FD');
      
      // FROM section
      const fromTitle = clientDataSection.querySelector('div:nth-child(1) h3');
      const fromLines = clientDataSection.querySelectorAll('div:nth-child(1) p');
      
      if (fromTitle) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175); // primary blue
        pdf.text(fromTitle.textContent || '', margin + 15, yPos + 20);
      }
      
      if (fromLines.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        fromLines.forEach((line, index) => {
          pdf.text(line.textContent || '', margin + 15, yPos + 35 + (index * 15));
        });
      }
      
      // TO section
      const toTitle = clientDataSection.querySelector('div:nth-child(2) h3');
      const toLines = clientDataSection.querySelectorAll('div:nth-child(2) p');
      
      if (toTitle) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175); // primary blue
        pdf.text(toTitle.textContent || '', margin + contentWidth/2 + 15, yPos + 20);
      }
      
      if (toLines.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        toLines.forEach((line, index) => {
          pdf.text(line.textContent || '', margin + contentWidth/2 + 15, yPos + 35 + (index * 15));
        });
      }
      
      yPos += 140;
    }
    
    // Rest of the PDF generation code...
    // (Keep the existing implementation for backward compatibility)
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const prepareElementForPDF = (element: HTMLElement) => {
  return element;
};