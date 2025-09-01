# Visionify Order Form Template Instructions

## Overview

The Visionify order form generation system now uses a template-based approach with the `VisionifyLetterHead.docx` file. This allows for easy customization of the order form layout and branding while maintaining dynamic data insertion.

## ⚠️ CRITICAL: Template Variable Formatting in Microsoft Word

**The most common issue** with template variables is that Microsoft Word splits them across multiple text runs, causing the replacement to fail. This results in variables showing up as just `}` characters.

### How to Properly Add Variables to Your Template:

1. **Type variables in a text editor first**:
   - Open Notepad, VS Code, or any plain text editor
   - Type the variable: `{{customerCompany}}`
   - Copy the entire variable (including braces)

2. **Paste as plain text in Word**:
   - In Word, position your cursor where you want the variable
   - Use **Ctrl+Shift+V** (Windows) or **Cmd+Shift+V** (Mac) to paste as plain text
   - Or use "Paste Special" → "Unformatted Text"

3. **Alternative method - Use Word's Developer tab**:
   - Enable Developer tab: File → Options → Customize Ribbon → Check "Developer"
   - Use Developer → Plain Text Content Control for variables
   - Replace the placeholder text with your variable

4. **What NOT to do**:
   - ❌ Don't type variables directly in Word
   - ❌ Don't copy-paste from formatted documents
   - ❌ Don't apply complex formatting to variables

### Quick Test:
After adding variables, save the document and reopen it. Check that your variable `{{customerCompany}}` appears as one continuous piece of text when you select it. If it's split across multiple selections, it won't work.

## Template Setup

### 1. Template File Location
- The template file should be named `VisionifyLetterHead.docx`
- Place it in the `public/` directory of the project
- The file must be accessible via HTTP request from the frontend

### 2. Template Variable Format
Use double curly braces to mark placeholder variables:
```
{{variableName}}
```

### 3. Conditional Content
For optional sections, use conditional syntax:
```
{{#if includeImplementation}}
Implementation Cost: {{implementationCost}}
{{/if}}
```

## Available Template Variables

### Header Information
- `{{orderFormNumber}}` - Order form number (e.g., ORDER-1)
- `{{orderFormDate}}` - Date the order form was generated

### Customer Information
- `{{customerCompany}}` - Customer company name
- `{{customerName}}` - Customer contact name
- `{{customerEmail}}` - Customer email address
- `{{customerAddress}}` - Customer street address
- `{{customerCityStateZip}}` - Customer city, state, and ZIP code

### Key Terms
- `{{product}}` - Product name
- `{{program}}` - Program description
- `{{deployment}}` - Deployment type
- `{{initialTerm}}` - Initial contract term
- `{{startDate}}` - Contract start date
- `{{endDate}}` - Contract end date
- `{{licenses}}` - License information
- `{{renewal}}` - Renewal terms

### Package Summary
- `{{totalCameras}}` - Total number of cameras
- `{{subscriptionType}}` - Subscription type
- `{{packageType}}` - Package type (Core or Everything)
- `{{selectedScenarios}}` - Selected AI scenarios (bullet list format)

### Pricing Information
- `{{serverCount}}` - Number of servers
- `{{serverBaseCost}}` - Cost per server (formatted currency)
- `{{serverTotalCost}}` - Total server cost (formatted currency)
- `{{implementationCost}}` - Implementation cost (formatted currency)
- `{{speakerTotalCost}}` - Total speaker cost (formatted currency)
- `{{travelCost}}` - Travel cost (formatted currency)
- `{{annualRecurringCost}}` - Annual subscription cost (formatted currency)
- `{{totalOneTimeCost}}` - Total one-time costs (formatted currency)
- `{{totalRecurringCost}}` - Total recurring costs (formatted currency)
- `{{totalContractValue}}` - Total contract value (formatted currency)

### Conditional Variables
Use these with `{{#if}}` statements:
- `{{includeImplementation}}` - Boolean: include implementation section
- `{{includeSpeakers}}` - Boolean: include speakers section
- `{{includeTravel}}` - Boolean: include travel section

### Success Criteria & Terms
- `{{successCriteria}}` - Success criteria (numbered list format)
- `{{termsAndConditions}}` - Terms and conditions text

### Signature Information
- `{{visionifyCompany}}` - Visionify company name
- `{{visionifyAddress}}` - Visionify address
- `{{visionifySigneeName}}` - Visionify signee name
- `{{visionifySigneeTitle}}` - Visionify signee title
- `{{visionifyDate}}` - Visionify signature date
- `{{customerSignatureCompany}}` - Customer company for signature
- `{{customerSigneeName}}` - Customer signee name
- `{{customerSigneeTitle}}` - Customer signee title
- `{{customerSignatureAddress}}` - Customer address for signature
- `{{customerSignatureDate}}` - Customer signature date

## Template Editing Workflow

1. **Open Template**: Open `VisionifyLetterHead.docx` in Microsoft Word or a compatible editor
2. **Prepare Variables**: Type all your variables in a plain text editor first
3. **Add Variables**: Copy-paste variables as plain text using Ctrl+Shift+V
4. **Format Content**: Apply desired formatting, fonts, colors, and styling (but not to the variable text itself)
5. **Add Conditional Sections**: Use `{{#if variable}}...{{/if}}` for optional content
6. **Test Variables**: Select each variable to ensure it's one continuous text block
7. **Save Template**: Save the file and ensure it's in the `public/` directory
8. **Test Generation**: Generate an order form to verify the template works correctly

## Example Template Sections

### Header Section
```
VISIONIFY ORDER FORM
{{orderFormNumber}}
Date: {{orderFormDate}}
```

### Customer Information Section (Fixed Version)
```
TO: {{customerCompany}}
{{customerName}}
{{customerEmail}}
{{customerAddress}}
{{customerCityStateZip}}
```

### Conditional Implementation Section
```
{{#if includeImplementation}}
IMPLEMENTATION SERVICES
Description: {{implementationDescription}}
Cost: {{implementationCost}}
{{/if}}
```

### Pricing Summary
```
TOTAL COST SUMMARY
One-time Costs: {{totalOneTimeCost}}
Annual Subscription: {{totalRecurringCost}}
Total Contract Value: {{totalContractValue}}
```

## Troubleshooting

### Variables Showing as Just `}` Characters (MOST COMMON ISSUE)
**Problem**: Variables appear as `}` instead of being replaced with data.
**Cause**: Microsoft Word split the variable across multiple text runs.
**Solution**:
1. Delete the broken variables completely
2. Type the variable in Notepad: `{{customerCompany}}`
3. Copy it from Notepad
4. In Word, use Ctrl+Shift+V to paste as plain text
5. Test by selecting the variable - it should be one continuous selection

### Template Not Loading
- Verify the file is named exactly `VisionifyLetterHead.docx`
- Ensure the file is in the `public/` directory
- Check browser console for fetch errors

### Variables Not Replacing
- Verify variable names match exactly (case-sensitive)
- Ensure double curly braces are used: `{{variableName}}`
- Check for typos in variable names
- **Most important**: Ensure variables aren't split across text runs (see above)

### Conditional Sections Not Working
- Verify `{{#if}}` and `{{/if}}` tags are properly paired
- Ensure boolean variables are spelled correctly
- Check that the conditional content is between the tags
- Use the same plain-text pasting method for conditional tags

### Formatting Issues
- Apply formatting to the surrounding text, not to the variable itself
- Test with simple formatting first (bold, italic)
- Avoid complex styles on template variables
- Consider using basic text styles for better compatibility

### Testing Your Template
1. **Visual Test**: Select each variable in Word - it should highlight as one continuous block
2. **Generate Test**: Try generating an order form and check the console for error messages
3. **Debug Mode**: Check browser console for template data being passed to the processor

## Debugging Steps

If you're still having issues:

1. **Check Console**: Open browser developer tools and look for error messages
2. **Verify Data**: Check that the console shows the correct template data
3. **Simple Test**: Create a minimal template with just one variable to test
4. **Character Inspection**: In Word, use Show/Hide paragraph marks (¶) to see hidden characters

## Fallback Behavior

If the template file cannot be loaded or processed, the system will automatically fall back to programmatic document generation to ensure order forms can still be created. 