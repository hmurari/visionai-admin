import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { OrderFormDetails } from '@/types/quote';
import { formatCurrency } from './formatters';

export const generateOrderFormDocx = async (orderFormDetails: OrderFormDetails) => {
  try {
    const { clientInfo, keyTerms, successCriteria, termsAndConditions, quoteDetails, orderFormNumber } = orderFormDetails;
    
    // Create document sections
    const sections = [];
    
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
      const children: TextRun[] = [];
      
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
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
}; 