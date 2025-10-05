export function OrgSelectors(props: {
  teams: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  selectedTeamId: string | null;
  selectedDepartmentId: string | null;
  onTeamChange: (id: string) => void;
  onDepartmentChange: (id: string) => void;
  currentTeamName: string;
  currentDepartmentName: string;
}) {
  const { teams, departments, selectedTeamId, selectedDepartmentId, onTeamChange, onDepartmentChange, currentTeamName, currentDepartmentName } = props;
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
        <label className="text-xs text-gray-700">Team</label>
        {teams.length > 0 ? (
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1 w-56"
            value={selectedTeamId ?? ''}
            onChange={(e) => onTeamChange(e.target.value)}
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-gray-700 px-2 py-1 w-56 border border-gray-300 rounded bg-gray-50">{currentTeamName}</div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
        <label className="text-xs text-gray-700">Department</label>
        {departments.length > 0 ? (
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1 w-56"
            value={selectedDepartmentId ?? ''}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-gray-700 px-2 py-1 w-56 border border-gray-300 rounded bg-gray-50">{currentDepartmentName}</div>
        )}
      </div>
    </div>
  );
}


