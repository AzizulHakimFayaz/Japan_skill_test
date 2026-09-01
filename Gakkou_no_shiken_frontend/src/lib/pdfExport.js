'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports the Official Score Certificate DOM element to a single-page A4 PDF.
 * Captures exclusively the certificate card exactly as styled.
 * 
 * @param {string|HTMLElement} target - Element ID or HTMLElement to capture
 * @param {Object} options - Export options (filename, title)
 */
export async function exportToPdf(target, options = {}) {
  const {
    filename = 'GakkouNoShiken_Result.pdf',
    title = 'Official Score Report',
  } = options;

  const element = typeof target === 'string' ? document.getElementById(target) : target;

  if (!element) {
    throw new Error('Scorecard certificate element not found');
  }

  // Capture canvas with 2x high resolution and consistent desktop layout width
  const canvas = await html2canvas(element, {
    scale: 2, // 2x Retina resolution for sharp text and vectors
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById('official-score-certificate');
      if (clonedElement) {
        // Guarantee consistent desktop-grade layout width regardless of user viewport
        clonedElement.style.width = '800px';
        clonedElement.style.maxWidth = '800px';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.backgroundColor = '#ffffff';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Standard A4 portrait in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  
  const margin = 10; // 10mm margins
  const maxContentWidth = pdfWidth - (margin * 2); // 190 mm
  const maxContentHeight = pdfHeight - (margin * 2); // 277 mm

  // Maintain aspect ratio and scale to fit cleanly on 1 single page
  const imgRatio = canvas.width / canvas.height;
  let renderWidth = maxContentWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > maxContentHeight) {
    renderHeight = maxContentHeight;
    renderWidth = renderHeight * imgRatio;
  }

  // Center horizontally and vertically on the A4 page
  const posX = (pdfWidth - renderWidth) / 2;
  const posY = (pdfHeight - renderHeight) / 2;

  pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

  // Metadata
  pdf.setProperties({
    title: title,
    subject: 'JFT-Basic & SSW CBT Examination Score Report Certificate',
    author: 'Gakkou No Shiken (学校の試験)',
    creator: 'Gakkou No Shiken Exam Portal',
  });

  pdf.save(filename);
  return true;
}

