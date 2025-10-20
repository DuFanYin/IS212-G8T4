const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');

/**
 * Generates an in-memory PDF buffer for the given report data
 * @param {Object} reportData - Report content to render in the PDF
 * @returns {Promise<Buffer>} - A buffer containing the PDF bytes
 */
exports.generatePDF = async (reportData) => {
  const doc = new PDFDocument();
  const stream = new streamBuffers.WritableStreamBuffer({
    initialSize: 100 * 1024,  // start at 100KB
    incrementAmount: 10 * 1024 // grow by 10KB as needed
  });

  doc.pipe(stream);

  // --- PDF content ---
  doc.fontSize(20).text('Team Performance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Team ID: ${reportData.teamId}`);
  doc.text(`Generated at: ${new Date().toLocaleString()}`);
  doc.moveDown();

  if (reportData.memberStats) {
    doc.text('Member Statistics:', { underline: true });
    reportData.memberStats.forEach(member => {
      doc.text(`• ${member.name || 'N/A'} - Completed: ${member.tasksCompleted || 0}`);
    });
    doc.moveDown();
  }

  if (reportData.taskSummary) {
    const { total, completed, percent } = reportData.taskSummary;
    doc.text(`Task Summary: ${completed}/${total} completed (${percent}%)`);
  }

  doc.end();

  await new Promise(resolve => doc.on('end', resolve));

  // ✅ FIX: use getContents() instead of getBuffer()
  const buffer = stream.getContents();
  if (!buffer) throw new Error('Failed to generate PDF buffer');
  return buffer;
};
