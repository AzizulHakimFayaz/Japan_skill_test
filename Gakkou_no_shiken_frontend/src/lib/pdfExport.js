'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a specific DOM element to an A4 PDF file using html2canvas and jsPDF.
 * 
 * @param {string|HTMLElement} target - Element ID or HTMLElement to capture
 * @param {Object} options - Export options (filename, title, orientation)
 */
export async function exportToPdf(target, options = {}) {
  const {
    filename = 'GakkouNoShiken_Result.pdf',
    title = 'Official Score Report',
    quality = 2,
  } = options;

  const element = typeof target === 'string' ? document.getElementById(target) : target;

  if (!element) {
    throw new Error('PDF export target element not found');
  }

  // Temporary container styling or cloned capture for crisp rendering
  const canvas = await html2canvas(element, {
    scale: quality, // 2x high-resolution capture
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024, // Consistent layout width for A4
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const margin = 8; // 8mm margin
  const contentWidth = pdfWidth - (margin * 2);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  if (contentHeight <= pdfHeight - (margin * 2)) {
    // Single page centered/top-aligned
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
  } else {
    // Multi-page handling
    let heightLeft = contentHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - (margin * 2));

    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - (margin * 2));
    }
  }

  // Set document metadata
  pdf.setProperties({
    title: title,
    subject: 'JFT-Basic & SSW CBT Examination Score Report',
    author: 'Gakkou No Shiken (学校の試験)',
    keywords: 'JFT-Basic, SSW, CBT, Score Report, Japanese Exam',
    creator: 'Gakkou No Shiken Exam Portal',
  });

  pdf.save(filename);
  return true;
}
