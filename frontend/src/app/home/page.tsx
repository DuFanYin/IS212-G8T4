'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { storage } from '@/lib/utils/storage';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
// Project selector removed; scope selector rendered inline here
import { OrgSelectors } from '@/components/timeline/OrgSelectors';
import { Legend } from '@/components/timeline/Legend';
import { TimelineRows } from '@/components/timeline/TimelineRows';
import { TimelineGrid } from '@/components/timeline/TimelineGrid';
import { useTimeline, type TimelineItem } from '@/lib/hooks/useTimeline';
import { useRouter } from 'next/navigation';
// getItemDates moved to TimelineGrid component
import { loadOrgSelectors } from '@/lib/utils/orgAccess';
import { type Department, type Team } from '@/lib/services/organization';
import ProductivityIndex from '@/components/features/reports/productivityIndex';
import ProductivityMetric from '@/components/features/reports/productivityMetric';
import TasksMetric from '@/components/features/reports/tasksMetric';
import Card from '@/components/layout/Cards';
// UseTasks hook
import { useMetrics } from '@/lib/hooks/useMetrics';
// Report PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ========================= Local Types (can be moved to types file) =========================
type TimelineRow = { type: 'project' | 'task' | 'subtask'; item?: TimelineItem; projectName?: string };

// ========================= Local Utils (can be moved to separate utils) =========================
// no-op

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) { next.delete(value); } else { next.add(value); }
  return next;
}

// Status colors handled in TimelineGrid

// ========================= Local Hook (can be moved to hooks/useTimelineBounds.ts) =========================
function useTimelineBounds(items: TimelineItem[]) {
  const bounds = useMemo(() => {
    if (items.length === 0) return { start: new Date(), end: new Date() };
    const allDates = items.flatMap(item => [new Date(item.createdAt), new Date(item.dueDate)]);
    const minDate = Math.min(...allDates.map(d => d.getTime()));
    const maxDate = Math.max(...allDates.map(d => d.getTime()));
    const start = new Date(minDate - (7 * 24 * 60 * 60 * 1000));
    start.setHours(0, 0, 0, 0);
    const end = new Date(maxDate + (7 * 24 * 60 * 60 * 1000));
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [items]);

  const todayLinePosition = useMemo(() => {
    const totalMs = bounds.end.getTime() - bounds.start.getTime();
    const todayMs = Date.now() - bounds.start.getTime();
    return Math.max(0, Math.min(100, (todayMs / totalMs) * 100));
  }, [bounds]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const dateHeaderLabels = useMemo<ReactNode[]>(() => {
    const labels: ReactNode[] = [];
    const totalMs = bounds.end.getTime() - bounds.start.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    let lastRenderedLeft = -Infinity;
    const minGapPercent = 8;
    for (let i = 0; i < totalMs; i += weekMs) {
      const left = (i / totalMs) * 100;
      if (left - lastRenderedLeft < minGapPercent) continue;
      lastRenderedLeft = left;
      const date = new Date(bounds.start.getTime() + i);
      labels.push(
        <div key={`hdr-${i}`} className="absolute text-[11px] leading-4 text-gray-600 font-medium bg-white/80 px-1 rounded" style={{ left: `${left}%`, transform: 'translateX(-50%)', top: '4px' }}>
          {formatDate(date)}
        </div>
      );
    }
    return labels;
  }, [bounds]);

  const verticalGridLines = useMemo<ReactNode[]>(() => {
    const lines: ReactNode[] = [];
    const totalMs = bounds.end.getTime() - bounds.start.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < totalMs; i += weekMs) {
      const left = (i / totalMs) * 100;
      lines.push(<div key={`vl-${i}`} className="absolute top-0 bottom-0 w-px bg-gray-200 z-10" style={{ left: `${left}%` }} />);
    }
    return lines;
  }, [bounds]);

  return { timelineBounds: bounds, todayLinePosition, dateHeaderLabels, verticalGridLines };
}

// ========================= Page Wrapper =========================
export default function HomePage() {
  const { user }: { user: User | null } = useUser();
  useEffect(() => { storage.getToken(); }, []);
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  return <TimelineView />;
}

// ========================= Main TimelineView (can be moved to own file) =========================
function TimelineView() {
  const { user }: { user: User | null } = useUser();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const token = user?.token;

  // Load org selectors + projects
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {

        const res = await loadOrgSelectors({ token, user });
        setDepartments(res.departments as Department[]);
        setTeams(res.teams as Team[]);
        if (res.selectedTeam) setSelectedTeamId(res.selectedTeam);
        if (res.selectedDepartment) setSelectedDepartmentId(res.selectedDepartment);
      } catch {
        // ignore
      }
    };
    load();
  }, [token, user]);


  // Default selections from user
  useEffect(() => {
    if (!user) return;
    if (user.teamId) setSelectedTeamId(user.teamId);
    if (user.departmentId) setSelectedDepartmentId(user.departmentId);
  }, [user]);

  const { timelineItems, loading, error, visibleProjects, projectSpans } = useTimeline({
    selectedTeamId,
    selectedDepartmentId,
    teams,
  });

  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [assigneeOnly, setAssigneeOnly] = useState<boolean>(false);
  const [collaboratorOnly, setCollaboratorOnly] = useState<boolean>(false);

  // Filter by selected project (when set) before grouping
  const filteredItems = useMemo(() => {
    if (!assigneeOnly && !collaboratorOnly) return timelineItems;
    const currentUserId = user?.id;
    return timelineItems.filter(item => {
      if (assigneeOnly && item.assigneeId === currentUserId) return true;
      if (collaboratorOnly && (item.collaborators || []).includes(currentUserId || '')) return true;
      return false;
    });
  }, [timelineItems, assigneeOnly, collaboratorOnly, user?.id]);

  // Build rows grouped by project → task → subtasks
  const rows = useMemo<TimelineRow[]>(() => {
    const tasks = filteredItems.filter(i => i.type === 'task');
    const subtasks = filteredItems.filter(i => i.type === 'subtask');
    const byProject = new Map<string, TimelineItem[]>();
    tasks.forEach(t => {
      const key = t.projectName ?? 'No Project';
      const list = byProject.get(key) ?? [];
      list.push(t);
      byProject.set(key, list);
    });
    const projectNames = (visibleProjects.length > 0
      ? visibleProjects.map(p => p.name ?? 'No Project')
      : Array.from(byProject.keys())
    ).sort((a, b) => a.localeCompare(b));
    const result: TimelineRow[] = [];
    projectNames.forEach(project => {
      result.push({ type: 'project', projectName: project });
      if (expandedProjects.has(project)) return; // collapsed
      const projectTasks = (byProject.get(project) ?? [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      projectTasks.forEach(task => {
        result.push({ type: 'task', item: task });
        if (expandedTasks.has(task.id)) {
          const taskSubs = subtasks
            .filter(s => s.parentTaskId === task.id)
            .sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
          taskSubs.forEach(st => result.push({ type: 'subtask', item: st }));
        }
      });
    });
    const taskIds = new Set(tasks.map(t => t.id));
    const orphans = subtasks
      .filter(s => !taskIds.has(s.parentTaskId ?? ''))
      .sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
    if (orphans.length > 0) {
      result.push({ type: 'project', projectName: 'Other' });
      orphans.forEach(st => result.push({ type: 'subtask', item: st }));
    }
    return result;
  }, [filteredItems, expandedTasks, expandedProjects, visibleProjects]);

  const router = useRouter();

  const currentTeamName = useMemo(() => {
    return teams.find(t => t.id === (selectedTeamId ?? ''))?.name ?? user?.teamName ?? 'No team';
  }, [teams, selectedTeamId, user?.teamName]);

  const currentDepartmentName = useMemo(() => {
    return departments.find(d => d.id === (selectedDepartmentId ?? ''))?.name ?? user?.departmentName ?? 'No department';
  }, [departments, selectedDepartmentId, user?.departmentName]);

  //For Metrics
  const { teamStats, loading: metricsLoading } = useMetrics({ teams, departments, currentTeamName });

  const toggleTaskExpansion = (taskId: string) => setExpandedTasks(prev => toggleSet(prev, taskId));
  const toggleProjectExpansion = (projectName: string) => setExpandedProjects(prev => toggleSet(prev, projectName));

  const { timelineBounds, todayLinePosition, dateHeaderLabels, verticalGridLines } = useTimelineBounds(timelineItems);

  // Layout sizes
  const taskRowHeight = 40;
  const subtaskRowHeight = 20;
  const rowHeights = useMemo(() => rows.map(r => (r.type === 'subtask' ? subtaskRowHeight : taskRowHeight)), [rows]);
  const rowOffsets = useMemo(() => {
    let offset = 0; return rowHeights.map(h => { const y = offset; offset += h; return y; });
  }, [rowHeights]);
  const totalHeight = useMemo(() => rowHeights.reduce((a, b) => a + b, 0), [rowHeights]);
  const itemsCount = useMemo(() => rows.reduce((acc, r) => acc + (r.type !== 'project' ? 1 : 0), 0), [rows]);

  const handleClick = (item: TimelineItem) => {
    if (item.type === 'task') {
      const hasSubtasks = filteredItems.some(s => s.type === 'subtask' && s.parentTaskId === item.id);
      if (hasSubtasks) toggleTaskExpansion(item.id); else router.push(`/projects-tasks/task/${item.id}`);
    } else {
      router.push(`/projects-tasks/task/${item.parentTaskId}`);
    }
  };

  const handleExportReport = async () => {
    try {
      const element = document.getElementById('report-section');
      if (!element) {
        alert('Report section not found.');
        return;
      }

      // 1️⃣ Clone node and expand it
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.width = `${element.scrollWidth}px`;
      clone.style.height = `${element.scrollHeight}px`;
      clone.style.overflow = 'visible';
      clone.style.background = '#ffffff';

      // Render it offscreen
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 1000));

      // Project Button
      clone.querySelectorAll('button[aria-label="Collapse project"]').forEach(el => {
        const elem = el as HTMLElement;
        elem.style.color = '#000';
        elem.style.opacity = '1';
        elem.style.overflow = 'visible';
      });

      // Tasks Button
      clone.querySelectorAll('button[title]').forEach(el => {
        const elem = el as HTMLElement;
        elem.style.color = '#000';
        elem.style.opacity = '1';
        elem.style.overflow = 'visible';
      });

      // 3️⃣ Capture clone instead of visible element
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      // 4️⃣ Clean up
      document.body.removeChild(wrapper);

      // 5️⃣ Convert to multi-page PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      let header = "";
      if (user?.role == "hr") {
        header = "Individual Report"
      }
      else if (user?.role == "manager") {
        header = "Team Report"
      }
      else if (user?.role == "director") {
        header = "Department Report"
      }
      else {
        header = "Individual Report"
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(header, pdfWidth / 2, 15, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, 22, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${header}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  if (loading || metricsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="text-gray-800">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Task Timeline
                </h1>
                <p className="text-sm text-gray-500">Visualize your tasks and subtasks with interactive timeline view</p>
              </div>

              <div className="flex flex-col gap-3 w-full lg:w-auto">
                {/* Row 1: selectors + buttons */}
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                  <div className="flex-1">
                    <OrgSelectors
                      teams={teams}
                      departments={departments}
                      selectedTeamId={selectedTeamId}
                      selectedDepartmentId={selectedDepartmentId}
                      onTeamChange={setSelectedTeamId}
                      onDepartmentChange={setSelectedDepartmentId}
                      currentTeamName={currentTeamName}
                      currentDepartmentName={currentDepartmentName}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
                    <button
                      className={`px-2 py-1 text-xs rounded ${assigneeOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setAssigneeOnly(v => !v)}
                    >
                      Is Assignee
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${collaboratorOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setCollaboratorOnly(v => !v)}
                    >
                      Is Collaborator
                    </button>
                  </div>
                </div>
                {/* Row 2: legend */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <Legend />
                  </div>

                  {/* Control button styled to look like a subtle icon button */}
                  <div className="flex-shrink-0 ml-3">
                    <button
                      type="button"
                      title="Timeline controls"
                      aria-label="Open timeline controls"
                      className="inline-flex items-center justify-center p-2 border border-gray-200 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
                      onClick={handleExportReport}
                    >
                      <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500">No items match your current filter criteria.</p>
          </div>
        ) : (
          <>
            <div id="report-section">
              <div className="p-6 overflow-x-auto">
                <div className="flex w-full">
                  <TimelineRows
                    rows={rows}
                    rowHeights={rowHeights}
                    rowOffsets={rowOffsets}
                    totalHeight={totalHeight}
                    itemsCount={itemsCount}
                    expandedProjects={expandedProjects}
                    onToggleProject={toggleProjectExpansion}
                    expandedTasks={expandedTasks}
                    onToggleTask={toggleTaskExpansion}
                    timelineItems={timelineItems}
                    handleClick={handleClick}
                  />
                  <TimelineGrid
                    rows={rows}
                    rowHeights={rowHeights}
                    rowOffsets={rowOffsets}
                    totalHeight={totalHeight}
                    dateHeaderLabels={dateHeaderLabels}
                    todayLinePosition={todayLinePosition}
                    verticalGridLines={verticalGridLines}
                    projectSpans={projectSpans}
                    timelineBounds={timelineBounds}
                    handleClick={handleClick}
                  />
                </div>
              </div>

              <Card>
                <TasksMetric tasks={teamStats} />
                <ProductivityMetric tasks={teamStats} />
                <ProductivityIndex tasks={teamStats} />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
