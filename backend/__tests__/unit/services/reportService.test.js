const ReportService = require('../../../src/services/reportService');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const pdfGenerator = require('../../../src/utils/pdfGenerator');

jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/utils/pdfGenerator');

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateTeamReport returns structured report', async () => {
    const fakeTeamId = 'team123';
    const fakeManagerId = 'manager123';

    UserRepository.prototype.findUsersByTeam.mockResolvedValue([
      { _id: 'user1', name: 'Alice' },
      { _id: 'user2', name: 'Bob' }
    ]);

    TaskRepository.prototype.aggregateTeamStats.mockResolvedValue([
      { _id: 'user1', totalTasks: 5, completed: 3, ongoing: 2, overdue: 0 }
    ]);

    const result = await ReportService.generateTeamReport(fakeTeamId, fakeManagerId);

    expect(result).toHaveProperty('teamId', fakeTeamId);
    expect(result).toHaveProperty('generatedBy', fakeManagerId);
    expect(result).toHaveProperty('memberStats');
    expect(result.totalMembers).toBe(2);
  });

  test('exportTeamReportPDF returns a PDF buffer', async () => {
    const fakeTeamId = 'team123';
    const fakeManagerId = 'manager123';

    const mockBuffer = Buffer.from('PDF content');
    pdfGenerator.generatePDF.mockResolvedValue(mockBuffer);

    jest.spyOn(ReportService, 'generateTeamReport').mockResolvedValue({
      teamId: fakeTeamId,
      generatedBy: fakeManagerId,
      generatedAt: new Date(),
      memberStats: []
    });

    const pdf = await ReportService.exportTeamReportPDF(fakeTeamId, fakeManagerId);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.toString()).toContain('PDF content');
  });
});
