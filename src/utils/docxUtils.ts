import { TemplateHandler } from 'easy-template-x';
import { saveAs } from 'file-saver';
import { OrderFormDetails } from '@/types/quote';
import { formatCurrency } from './formatters';

/**
 * Template-based Order Form Generation using easy-template-x
 * 
 * This module uses the VisionifyLetterHead.docx template file located in the public directory.
 * The template should contain placeholder variables in the format {{variableName}} that will
 * be replaced with actual data when generating the order form.
 * 
 * IMPORTANT: Template Variable Format Issues in Word
 * 
 * Microsoft Word often splits template variables across multiple text runs, causing 
 * replacement to fail. To fix this:
 * 
 * 1. Type the variable in a plain text editor first: {{customerCompany}}
 * 2. Copy and paste it into Word as plain text (Ctrl+Shift+V)
 * 3. Or use the "Paste Special" > "Unformatted Text" option
 * 4. Avoid typing the variables directly in Word
 * 5. Use simple formatting (bold, italic) rather than complex styles
 * 
 * Common Issues:
 * - Variables split across text runs: {{customer}}Company}} → won't work
 * - Invisible formatting characters between braces
 * - Auto-correction or spell-check interference
 * 
 * Template Variables Available:
 * 
 * Header & Basic Info:
 * - {{orderFormNumber}} - Order form number (e.g., ORDER-1)
 * - {{orderFormDate}} - Date the order form was generated
 * 
 * Customer Information:
 * - {{customerCompany}} - Customer company name
 * - {{customerName}} - Customer contact name
 * - {{customerEmail}} - Customer email address
 * - {{customerAddress}} - Customer street address
 * - {{customerCityStateZip}} - Customer city, state, and ZIP code
 * 
 * Key Terms:
 * - {{product}} - Product name (e.g., Visionify Core Package)
 * - {{program}} - Program description (e.g., 1 year subscription)
 * - {{deployment}} - Deployment type (e.g., Hybrid SaaS)
 * - {{initialTerm}} - Initial contract term
 * - {{startDate}} - Contract start date
 * - {{endDate}} - Contract end date
 * - {{licenses}} - License information (e.g., 20 Cameras)
 * - {{renewal}} - Renewal terms
 * 
 * Package Summary:
 * - {{totalCameras}} - Total number of cameras
 * - {{subscriptionType}} - Subscription type (monthly, annual, etc.)
 * - {{packageType}} - Package type (Core Package or Everything Package)
 * - {{selectedScenarios}} - Selected AI scenarios (formatted as bullet list)
 * 
 * Order Items & Pricing:
 * - {{serverCount}} - Number of servers
 * - {{serverBaseCost}} - Cost per server (formatted currency)
 * - {{serverTotalCost}} - Total server cost (formatted currency)
 * - {{implementationDescription}} - Implementation service description
 * - {{implementationCost}} - Implementation cost (formatted currency)
 * - {{speakerCount}} - Number of speakers
 * - {{speakerDescription}} - Speaker description with pricing
 * - {{speakerTotalCost}} - Total speaker cost (formatted currency)
 * - {{travelDescription}} - Travel service description
 * - {{travelCost}} - Travel cost (formatted currency)
 * - {{cameraSubscriptionDescription}} - Camera subscription pricing breakdown
 * - {{annualRecurringCost}} - Annual subscription cost (formatted currency)
 * 
 * Cost Summary:
 * - {{totalOneTimeCost}} - Total one-time costs (formatted currency)
 * - {{totalRecurringCost}} - Total recurring costs (formatted currency)
 * - {{totalContractValue}} - Total contract value (formatted currency)
 * - {{oneTimeCostDescription}} - Description of what's included in one-time costs
 * - {{recurringCostDescription}} - Description of recurring costs
 * 
 * Conditional Variables (use with {{#if}} statements):
 * - {{includeImplementation}} - Boolean: whether to include implementation section
 * - {{includeSpeakers}} - Boolean: whether to include speakers section
 * - {{includeTravel}} - Boolean: whether to include travel section
 * 
 * Success Criteria & Terms:
 * - {{successCriteria}} - Success criteria (formatted as numbered list)
 * - {{termsAndConditions}} - Terms and conditions text
 * 
 * Signature Information:
 * - {{visionifyCompany}} - Visionify company name
 * - {{visionifyAddress}} - Visionify address
 * - {{visionifySigneeName}} - Visionify signee name
 * - {{visionifySigneeTitle}} - Visionify signee title
 * - {{visionifyDate}} - Visionify signature date
 * - {{customerSignatureCompany}} - Customer company for signature
 * - {{customerSigneeName}} - Customer signee name
 * - {{customerSigneeTitle}} - Customer signee title
 * - {{customerSignatureAddress}} - Customer address for signature
 * - {{customerSignatureDate}} - Customer signature date
 * 
 * Example Template Usage:
 * 
 * Basic replacement: "Order Form: {{orderFormNumber}}"
 * Conditional content: "{{#if includeImplementation}}Implementation: {{implementationCost}}{{/if}}"
 * 
 * To modify the template:
 * 1. Edit VisionifyLetterHead.docx in Microsoft Word or compatible editor
 * 2. Add placeholder variables using double curly braces: {{variableName}}
 * 3. IMPORTANT: Paste variables as plain text to avoid text run splitting
 * 4. Save the template and place it in the public directory
 * 5. The system will automatically use the updated template
 */

// Template-based document generation using easy-template-x
export const generateOrderFormDocx = async (orderFormDetails: OrderFormDetails) => {
  try {
    const { clientInfo, keyTerms, successCriteria, termsAndConditions, quoteDetails, orderFormNumber } = orderFormDetails;
    
    // Load the template file (accessible from public directory)
    // Cache-bust to ensure latest template is loaded
    const templateUrl = `/VisionifyLetterHead.docx?v=${Date.now()}`;
    let template: ArrayBuffer;
    
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      template = await response.arrayBuffer();
    } catch (error) {
      console.error('Error loading template:', error);
      // Fallback to programmatic generation if template loading fails
      return generateOrderFormDocxProgrammatic(orderFormDetails);
    }

    // Prepare template data with debugging info
    const templateData = {
      // Header information
      orderFormNumber: orderFormNumber || 'ORDER-DRAFT',
      orderFormDate: new Date(orderFormDetails.date).toLocaleDateString(),
      
      // Customer information
      customerCompany: clientInfo.company || 'Test Company Inc.',
      customerName: clientInfo.name || 'John Doe',
      customerEmail: clientInfo.email || 'john.doe@company.com',
      customerAddress: clientInfo.address || '123 Business Street',
      customerCityStateZip: `${clientInfo.city || 'City'} ${clientInfo.state || 'State'} ${clientInfo.zip || '12345'}`.trim(),
      
      // Key terms
      product: keyTerms.product || 'Visionify Core Package',
      program: keyTerms.program || '1 year subscription',
      deployment: keyTerms.deployment || 'Hybrid SaaS',
      initialTerm: keyTerms.initialTerm || '1 Year',
      startDate: keyTerms.startDate || 'TBD',
      endDate: keyTerms.endDate || 'TBD',
      licenses: keyTerms.licenses || '20 Cameras',
      renewal: keyTerms.renewal || 'Auto-renews annually',
      
      // Package summary
      totalCameras: quoteDetails.totalCameras || 20,
      subscriptionType: quoteDetails.subscriptionType || 'Annual',
      packageType: quoteDetails.isEverythingPackage ? 'Everything Package' : 'Core Package',
      
      // Selected scenarios (convert array to formatted string)
      selectedScenarios: quoteDetails.selectedScenarios ? 
        quoteDetails.selectedScenarios.map((scenario: string) => `• ${scenario}`).join('\n') : 
        '• PPE Detection\n• Spill Detection\n• Workplace Safety',
      
      // Order items
      serverCount: quoteDetails.serverCount || 1,
      serverBaseCost: formatCurrency(quoteDetails.serverBaseCost || 2000),
      serverTotalCost: formatCurrency((quoteDetails.serverCount || 1) * (quoteDetails.serverBaseCost || 2000)),
      
      // Implementation (conditional)
      includeImplementation: Boolean(quoteDetails.includeImplementationCost),
      implementationDescription: quoteDetails.implementationDescription || "Implementation and configuration services",
      implementationCost: formatCurrency(quoteDetails.implementationCost || 0),
      
      // Speakers (conditional)
      includeSpeakers: Boolean(quoteDetails.includeSpeakers && quoteDetails.speakerCount > 0),
      speakerCount: quoteDetails.speakerCount || 0,
      speakerCost: formatCurrency(quoteDetails.speakerCost || 950),
      speakerTotalCost: formatCurrency((quoteDetails.speakerCount || 0) * (quoteDetails.speakerCost || 950)),
      speakerDescription: `${quoteDetails.speakerCount || 0} speaker${(quoteDetails.speakerCount || 0) > 1 ? 's' : ''} × ${formatCurrency(quoteDetails.speakerCost || 950)} per speaker`,
      
      // Travel (conditional)
      includeTravel: Boolean(quoteDetails.includeTravel && quoteDetails.travelCost > 0),
      travelDescription: quoteDetails.travelDescription || "Site survey, camera recommendations, onsite installation support, configuration & training",
      travelCost: formatCurrency(quoteDetails.travelCost || 0),
      
      // Camera subscription
      cameraSubscriptionDescription: `${quoteDetails.totalCameras} cameras × ${formatCurrency((quoteDetails.monthlyRecurring || 0) / (quoteDetails.totalCameras || 1))} per camera/month × 12 months`,
      annualRecurringCost: formatCurrency(quoteDetails.annualRecurring || (quoteDetails.monthlyRecurring || 0) * 12),
      
      // Total cost summary
      totalOneTimeCost: formatCurrency(quoteDetails.totalOneTimeCost || 0),
      totalRecurringCost: formatCurrency(quoteDetails.annualRecurring || (quoteDetails.monthlyRecurring || 0) * 12),
      totalContractValue: formatCurrency(quoteDetails.totalContractValue || 0),
      
      // Cost summary description
      oneTimeCostDescription: `1 server${quoteDetails.includeImplementationCost ? ', implementation fee' : ''}${quoteDetails.includeSpeakers ? ', speakers' : ''}${quoteDetails.includeTravel ? ', travel and onsite installation support' : ''}`,
      recurringCostDescription: `For ${quoteDetails.totalCameras} cameras per year`,
      
      // Success criteria (format as numbered list)
      successCriteria: successCriteria.split('\n')
        .filter(line => line.trim())
        .map((line, index) => `${index + 1}. ${line.replace(/^-\s*/, '')}`)
        .join('\n'),
      
      // Terms and conditions (keep original formatting)
      termsAndConditions: termsAndConditions,
      
      // Signature information
      visionifyCompany: 'Visionify Inc.',
      visionifyAddress: '1499, W 120th Ave, Ste 110, Westminster, CO 80234',
      visionifySigneeName: orderFormDetails.visionifySignature?.signeeName || '________________________',
      visionifySigneeTitle: orderFormDetails.visionifySignature?.signeeTitle || '________________________',
      visionifyDate: orderFormDetails.visionifySignature?.date || '________________________',
      
      customerSignatureCompany: clientInfo.company || '________________________',
      customerSigneeName: orderFormDetails.customerSignature?.signeeName || '________________________',
      customerSigneeTitle: orderFormDetails.customerSignature?.signeeTitle || '________________________',
      customerSignatureAddress: orderFormDetails.customerSignature?.companyAddress || '________________________',
      customerSignatureDate: orderFormDetails.customerSignature?.date || '________________________'
    };

    // Debug log the template data
    console.log('Template data being passed to easy-template-x:', {
      customerCompany: templateData.customerCompany,
      customerName: templateData.customerName,
      customerEmail: templateData.customerEmail,
      customerAddress: templateData.customerAddress,
      customerCityStateZip: templateData.customerCityStateZip,
      orderFormNumber: templateData.orderFormNumber,
      orderFormDate: templateData.orderFormDate
    });
    
    // Validate template data structure
    if (!templateData || typeof templateData !== 'object') {
      throw new Error('Invalid template data: must be an object');
    }
    
    console.log('Template data validation passed');

    // Initialize template handler configured for double-curly delimiters
    const handler = new TemplateHandler({
      delimiters: {
        tagStart: "{{",
        tagEnd: "}}",
        containerTagOpen: "#",
        containerTagClose: "/",
      },
    });
    
    // Process the template with data
    console.log('Processing template with easy-template-x...');
    console.log('Template size:', template.byteLength, 'bytes');
    console.log('Handler instance:', handler);
    
    let doc;
    try {
      // Optional: list tags in template (best-effort)
      if ((handler as any).parseTags) {
        try {
          const tags = await (handler as any).parseTags(template);
          console.log('Template tags detected:', tags);
        } catch (tagErr) {
          console.warn('Unable to parse template tags (non-fatal):', tagErr);
        }
      }
      doc = await handler.process(template, templateData);
      console.log('Template processing completed successfully');
    } catch (processingError) {
      console.error('Template processing failed:', processingError);
      throw new Error(`Template processing failed: ${processingError.message}`);
    }
    
    // Generate filename
    const customerName = clientInfo.company || clientInfo.name || 'Customer';
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    const orderFormNum = orderFormNumber?.replace('ORDER-', '') || '1';
    const filename = `Visionify-Order-Form-${orderFormNum}-${sanitizedCustomerName}.docx`;
    
    // Save the document
    saveAs(new Blob([doc]), filename);
    
  } catch (error) {
    console.error('Error generating order form with template:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Fallback to programmatic generation
    console.log('Falling back to programmatic generation...');
    return generateOrderFormDocxProgrammatic(orderFormDetails);
  }
};

// Keep the original programmatic generation as a fallback
const generateOrderFormDocxProgrammatic = async (orderFormDetails: OrderFormDetails) => {
  // Import docx library for fallback
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = await import('docx');
  
  try {
    const { clientInfo, keyTerms, successCriteria, termsAndConditions, quoteDetails, orderFormNumber } = orderFormDetails;
    
    // Create document sections
    const sections: any[] = [];
    
    // Document styling
    const headerStyle = { bold: true, size: 24, color: "1e40af", font: "Calibri" };
    const subHeaderStyle = { bold: true, size: 20, color: "1e40af", font: "Calibri" };
    const normalStyle = { size: 20, font: "Calibri" };
    const tableHeaderStyle = { bold: true, size: 18, color: "1e40af", font: "Calibri" };
    
    // Header section with better formatting
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "VISIONIFY",
            bold: true,
            size: 36,
            color: "1e40af",
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Order Form",
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: orderFormNumber || 'Draft',
            size: 20,
            color: "6b7280",
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${new Date(orderFormDetails.date).toLocaleDateString()}`,
            size: 20,
            color: "6b7280",
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 },
      })
    );

    // From/To Section (Visionify & Customer)
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "FROM & TO" })],
        spacing: { before: 200, after: 150 },
      })
    );

    const fromToTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "FROM: VISIONIFY INC." })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "1499, W 120th Ave, Ste 110" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Westminster, CO 80234" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Phone: (720) 449-4948" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Email: info@visionify.ai" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Website: https://visionify.ai" })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "TO: CUSTOMER" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: clientInfo.company || 'Company Name' })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: clientInfo.name || 'Contact Name' })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: clientInfo.email || 'Email' })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: clientInfo.address || 'Address' })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: `${clientInfo.city || ''} ${clientInfo.state || ''} ${clientInfo.zip || ''}`.trim() || 'City, State ZIP' })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    });

    sections.push(fromToTable);

    // Legal Summary
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "LEGAL SUMMARY" })],
        spacing: { before: 400, after: 150 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "This Order Form is issued under and governed by the terms of the Visionify Customer License Agreement (\"CLA\"), available at https://visionify.ai/cla, between Visionify Inc. (\"Visionify\") and the customer named below (\"Customer\"). By signing below, Customer agrees to purchase the Services listed in this Order Form, subject to the terms specified herein and in the CLA.",
            ...normalStyle,
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Package Summary Section
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "PACKAGE SUMMARY" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const packageSummaryTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Total Cameras" })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: `${quoteDetails.totalCameras} cameras` })] })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Subscription Type" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: quoteDetails.subscriptionType || 'Annual' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Package Type" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: quoteDetails.isEverythingPackage ? 'Everything Package' : 'Core Package' })] })],
            }),
          ],
        }),
      ],
    });

    sections.push(packageSummaryTable);

    // Selected Scenarios Section
    if (quoteDetails.selectedScenarios && quoteDetails.selectedScenarios.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ ...headerStyle, text: "SELECTED AI SCENARIOS" })],
          spacing: { before: 400, after: 150 },
        })
      );

      const scenariosList = quoteDetails.selectedScenarios.map((scenario: string) => 
        new Paragraph({
          children: [new TextRun({ ...normalStyle, text: `• ${scenario}` })],
          spacing: { after: 80 },
        })
      );

      sections.push(...scenariosList);
    }

    // Customer Info Table
    const customerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Company", bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: clientInfo.company || 'N/A' })] })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Contact Name", bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: clientInfo.name || 'N/A' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Email", bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: clientInfo.email || 'N/A' })] })],
            }),
          ],
        }),
      ],
    });

    sections.push(customerTable);

    // Key Terms Section (Complete)
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "KEY TERMS" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const keyTermsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Product" })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.product })] })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Program" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.program })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Deployment" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.deployment })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Initial Term" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.initialTerm })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Start Date" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.startDate })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "End Date" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.endDate })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Licenses" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.licenses })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Renewal" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ ...normalStyle, text: keyTerms.renewal })] })],
            }),
          ],
        }),
      ],
    });

    sections.push(keyTermsTable);

    // Order Items Section (Complete)
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "ORDER ITEMS" })],
        spacing: { before: 400, after: 150 },
      })
    );

    // Create order items table rows
    const orderItemsRows = [];
    
    // Header row
    orderItemsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...tableHeaderStyle, text: "Description" })] })],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ ...tableHeaderStyle, text: "Amount" })],
              alignment: AlignmentType.RIGHT 
            })],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );

    // AI Servers
    orderItemsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ ...subHeaderStyle, text: "AI Servers" })] }),
              new Paragraph({ children: [new TextRun({ 
                text: `${quoteDetails.serverCount || 1} server × ${formatCurrency(quoteDetails.serverBaseCost || 2000)} per server`,
                size: 16,
                color: "6b7280",
                font: "Calibri"
              })] }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [
                new TextRun({ ...subHeaderStyle, text: formatCurrency((quoteDetails.serverCount || 1) * (quoteDetails.serverBaseCost || 2000)) }),
                new TextRun({ text: " one-time", size: 16, color: "6b7280", font: "Calibri" })
              ],
              alignment: AlignmentType.RIGHT 
            })],
          }),
        ],
      })
    );

    // Implementation Fee (if included)
    if (quoteDetails.includeImplementationCost) {
      orderItemsRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ ...subHeaderStyle, text: "Implementation Fee" })] }),
                new Paragraph({ children: [new TextRun({ 
                  text: quoteDetails.implementationDescription || "Implementation and configuration services",
                  size: 16,
                  color: "6b7280",
                  font: "Calibri"
                })] }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [
                  new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.implementationCost || 0) }),
                  new TextRun({ text: " one-time", size: 16, color: "6b7280", font: "Calibri" })
                ],
                alignment: AlignmentType.RIGHT 
              })],
            }),
          ],
        })
      );
    }

    // AXIS Network Speakers (if included)
    if (quoteDetails.includeSpeakers && quoteDetails.speakerCount > 0) {
      orderItemsRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ ...subHeaderStyle, text: "AXIS Network Speakers" })] }),
                new Paragraph({ children: [new TextRun({ 
                  text: `${quoteDetails.speakerCount} speaker${quoteDetails.speakerCount > 1 ? 's' : ''} × ${formatCurrency(quoteDetails.speakerCost || 950)} per speaker`,
                  size: 16,
                  color: "6b7280",
                  font: "Calibri"
                })] }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [
                  new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.speakerCount * (quoteDetails.speakerCost || 950)) }),
                  new TextRun({ text: " one-time", size: 16, color: "6b7280", font: "Calibri" })
                ],
                alignment: AlignmentType.RIGHT 
              })],
            }),
          ],
        })
      );
    }

    // Travel and Onsite Installation Support (if included)
    if (quoteDetails.includeTravel && quoteDetails.travelCost > 0) {
      orderItemsRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ ...subHeaderStyle, text: "Travel and Onsite Installation Support" })] }),
                new Paragraph({ children: [new TextRun({ 
                  text: quoteDetails.travelDescription || "Site survey, camera recommendations, onsite installation support, configuration & training",
                  size: 16,
                  color: "6b7280",
                  font: "Calibri"
                })] }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [
                  new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.travelCost) }),
                  new TextRun({ text: " one-time", size: 16, color: "6b7280", font: "Calibri" })
                ],
                alignment: AlignmentType.RIGHT 
              })],
            }),
          ],
        })
      );
    }

    // Camera Subscription
    orderItemsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ ...subHeaderStyle, text: "Camera Subscription" })] }),
              new Paragraph({ children: [new TextRun({ 
                text: `${quoteDetails.totalCameras} cameras × ${formatCurrency(quoteDetails.monthlyRecurring / quoteDetails.totalCameras)} per camera/month × 12 months`,
                size: 16,
                color: "6b7280",
                font: "Calibri"
              })] }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [
                new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.annualRecurring || quoteDetails.monthlyRecurring * 12) }),
                new TextRun({ text: " per year", size: 16, color: "6b7280", font: "Calibri" })
              ],
              alignment: AlignmentType.RIGHT 
            })],
          }),
        ],
      })
    );

    const orderItemsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: orderItemsRows,
    });

    sections.push(orderItemsTable);

    // Total Cost Summary Section
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "TOTAL COST SUMMARY" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const totalCostSummaryTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ ...tableHeaderStyle, text: "One-time Fees" })],
                alignment: AlignmentType.CENTER 
              })],
              width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ ...tableHeaderStyle, text: "Subscription Fees" })],
                alignment: AlignmentType.CENTER 
              })],
              width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ ...tableHeaderStyle, text: "Total Contract Value" })],
                alignment: AlignmentType.CENTER 
              })],
              width: { size: 34, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        // Values row
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ 
                  children: [new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.totalOneTimeCost || 0), size: 22 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 }
                }),
                new Paragraph({ 
                  children: [new TextRun({ 
                    text: `1 server, ${quoteDetails.includeImplementationCost ? 'implementation fee, ' : ''}${quoteDetails.includeSpeakers ? 'speakers, ' : ''}${quoteDetails.includeTravel ? 'travel and onsite installation support' : ''}`.replace(/,\s*$/, ''),
                    size: 14,
                    color: "6b7280",
                    font: "Calibri"
                  })],
                  alignment: AlignmentType.CENTER 
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  children: [new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.annualRecurring || quoteDetails.monthlyRecurring * 12), size: 22 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 }
                }),
                new Paragraph({ 
                  children: [new TextRun({ 
                    text: `For ${quoteDetails.totalCameras} cameras per year`,
                    size: 14,
                    color: "6b7280",
                    font: "Calibri"
                  })],
                  alignment: AlignmentType.CENTER 
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  children: [new TextRun({ ...subHeaderStyle, text: formatCurrency(quoteDetails.totalContractValue || 0), size: 22 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 }
                }),
                new Paragraph({ 
                  children: [new TextRun({ 
                    text: "For 1 Year",
                    size: 14,
                    color: "6b7280",
                    font: "Calibri"
                  })],
                  alignment: AlignmentType.CENTER 
                }),
              ],
            }),
          ],
        }),
      ],
    });

    sections.push(totalCostSummaryTable);

    // Success Criteria
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "SUCCESS CRITERIA" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const successLines = successCriteria.split('\n').filter(line => line.trim());
    successLines.forEach((line, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${line.replace(/^-\s*/, '')}`,
              ...normalStyle,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });

    // Terms & Conditions
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "TERMS & CONDITIONS" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const termsLines = termsAndConditions.split('\n').filter(line => line.trim());
    termsLines.forEach((line) => {
      // Simple bold text handling
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const children: any[] = [];
      
      parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          children.push(new TextRun({ text: boldText, bold: true, size: 18, font: "Calibri" }));
        } else {
          children.push(new TextRun({ text: part, size: 18, font: "Calibri" }));
        }
      });

      sections.push(
        new Paragraph({
          children: children,
          spacing: { after: 100 },
        })
      );
    });

    // Signature Section
    sections.push(
      new Paragraph({
        children: [new TextRun({ ...headerStyle, text: "SIGNATURES" })],
        spacing: { before: 400, after: 150 },
      })
    );

    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ 
                  children: [new TextRun({ ...tableHeaderStyle, text: "VISIONIFY INC." })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 }
                }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Company: Visionify Inc." })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Authorized Signature: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Name: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Title: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Company Address: 1499, W 120th Ave, Ste 110, Westminster, CO 80234" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Date: ________________________" })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  children: [new TextRun({ ...tableHeaderStyle, text: "CUSTOMER" })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 }
                }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: `Company: ${clientInfo.company || '________________________'}` })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Authorized Signature: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Name: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Title: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Company Address: ________________________" })] }),
                new Paragraph({ children: [new TextRun({ text: "" })] }),
                new Paragraph({ children: [new TextRun({ ...normalStyle, text: "Date: ________________________" })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    });

    sections.push(signatureTable);

    // Create the document
    const doc = new Document({
      creator: "Visionify Order Form Generator",
      title: "Visionify Order Form",
      description: "Professional order form generated by Visionify",
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,  // 0.5 inch  
              bottom: 720, // 0.5 inch
              left: 720,   // 0.5 inch
            },
          },
        },
        children: sections,
      }],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const customerName = clientInfo.company || clientInfo.name || 'Customer';
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    const orderFormNum = orderFormNumber?.replace('ORDER-', '') || '1';
    const filename = `Visionify-Order-Form-${orderFormNum}-${sanitizedCustomerName}.docx`;
    
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating Word document with fallback:', error);
    throw new Error('Failed to generate Word document');
  }
}; 