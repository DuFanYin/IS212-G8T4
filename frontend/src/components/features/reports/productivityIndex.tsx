'use client';

const teams = [
  { name: 'Alpha', completed: 18, overdue: 2, totalTasks: 25 },
  { name: 'Beta', completed: 12, overdue: 4, totalTasks: 20 },
  { name: 'Gamma', completed: 20, overdue: 1, totalTasks: 22 },
  { name: 'Delta', completed: 8, overdue: 3, totalTasks: 15 },
];

function getProductivityIndex(completed: number, overdue: number, totalTasks: number) {
  if (totalTasks === 0) return 0;
  return Math.max(0, ((completed - overdue) / totalTasks));
}

export default function ProductivityIndex() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8 relative">
      <h2 className="text-2xl font-semibold mb-6">Team Productivity Index</h2>
      <div className="space-y-6">
        {teams.map((team) => {
          const index = getProductivityIndex(team.completed, team.overdue, team.totalTasks);
          return (
            <div key={team.name} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{team.name}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-4 rounded flex items-center justify-center relative"
                  style={{
                    width: `${Math.min(index * 100, 100)}%`,
                    background: index > 0.7 ? '#34d399' : index > 0.4 ? '#fbbf24' : '#f87171',
                    transition: 'width 0.5s',
                  }}
                >
                  <span className="text-xs font-semibold text-white w-full absolute left-0 right-0 flex justify-end items-center pr-4">
                    {index.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}