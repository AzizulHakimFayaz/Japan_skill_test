'use client';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Exports the Official Score Certificate DOM element to a single-page A4 PDF.
 * Guarantees a consistent, pristine desktop-grade certificate layout on both mobile and desktop.
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

  // Capture canvas with 2x high resolution and simulated desktop viewport
  const canvas = await html2canvas(element, {
    scale: 2, // 2x Retina resolution for sharp text and vectors
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200, // Simulate desktop viewport
    windowHeight: 900,
    scrollY: 0,
    scrollX: 0,
    onclone: (clonedDoc) => {
      // Force the virtual document body to desktop width
      if (clonedDoc.documentElement) clonedDoc.documentElement.style.width = '1200px';
      if (clonedDoc.body) clonedDoc.body.style.width = '1200px';

      const cert = clonedDoc.getElementById('official-score-certificate');
      if (cert) {
        // Enforce fixed desktop certificate proportions
        cert.style.width = '860px';
        cert.style.maxWidth = '860px';
        cert.style.minWidth = '860px';
        cert.style.margin = '0 auto';
        cert.style.padding = '36px 40px';
        cert.style.boxShadow = 'none';
        cert.style.backgroundColor = '#ffffff';

        // 1. Force Header to horizontal desktop layout
        const headerBlock = cert.querySelector('.border-b-2');
        if (headerBlock) {
          const topHeader = headerBlock.firstElementChild;
          if (topHeader) {
            topHeader.style.display = 'flex';
            topHeader.style.flexDirection = 'row';
            topHeader.style.alignItems = 'center';
            topHeader.style.justifyContent = 'space-between';
            topHeader.style.gap = '16px';

            const titleEl = topHeader.querySelector('h2');
            if (titleEl) {
              titleEl.style.fontSize = '20px';
              titleEl.style.whiteSpace = 'nowrap';
            }
          }

          // Force metadata ribbon to 4 columns
          const ribbon = headerBlock.lastElementChild;
          if (ribbon) {
            ribbon.style.display = 'grid';
            ribbon.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
            ribbon.style.gap = '16px';
            ribbon.style.padding = '14px 18px';
          }
        }

        // 2. Force Total Score & Range summary to 2 columns
        const scoreBlock = cert.children[1];
        if (scoreBlock) {
          scoreBlock.style.display = 'grid';
          scoreBlock.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
          scoreBlock.style.gap = '24px';
          scoreBlock.style.alignItems = 'start';
        }

        // 3. Force section breakdown rows to 3-column grid
        const sectionBlock = cert.children[3];
        if (sectionBlock) {
          const sectionRows = sectionBlock.querySelectorAll('.grid');
          sectionRows.forEach((row) => {
            row.style.display = 'grid';
            row.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            row.style.alignItems = 'center';
            row.style.gap = '24px';
          });
        }

        // 4. Force footer to horizontal flex layout
        const footer = cert.children[4];
        if (footer) {
          footer.style.display = 'flex';
          footer.style.flexDirection = 'row';
          footer.style.alignItems = 'center';
          footer.style.justifyContent = 'space-between';
          footer.style.textAlign = 'left';
        }
      }
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Standard A4 portrait in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  
  const margin = 12; // 12mm margins
  const maxContentWidth = pdfWidth - (margin * 2); // 186 mm
  const maxContentHeight = pdfHeight - (margin * 2); // 273 mm

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
  const posY = Math.max(margin, (pdfHeight - renderHeight) / 2);

  pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

  // Document metadata
  pdf.setProperties({
    title: title,
    subject: 'JFT-Basic & SSW CBT Examination Score Report Certificate',
    author: 'Gakkou No Shiken (学校の試験)',
    creator: 'Gakkou No Shiken Exam Portal',
  });

  pdf.save(filename);
  return true;
}



