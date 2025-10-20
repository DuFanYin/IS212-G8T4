const pdfGenerator = require('../../../src/utils/pdfGenerator');

describe('pdfGenerator', () => {
  test('should generate a PDF buffer from data', async () => {
    const fakeReport = {
      teamId: 'team123',
      generatedBy: 'manager123',
      generatedAt: new Date(),
      totalMembers: 2,
      memberStats: [{ _id: 'user1', totalTasks: 3, completed: 2 }]
    };

    const buffer = await pdfGenerator.generatePDF(fakeReport);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
