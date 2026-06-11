export function KanbanColumn({
  title,
  count,
  tasks,
  dotColor,
  onTaskClick,
}: {
  title: string;
  count: number;
  tasks: Array<any>;
  dotColor: string;
  onTaskClick?: (id: string) => void;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 min-w-[250px] space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
          {title}
        </span>
        <span className="bg-slate-200/60 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
          {count}
        </span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-3 rounded-xl shadow-card border border-slate-100 hover:border-primary-300 transition-all cursor-grab active:cursor-grabbing group relative"
            onClick={() => onTaskClick?.(task.id)}
          >
            {/* Exact card layout from prototype.html */}
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                task.pipeline === "Leadopvolging" ? "bg-amber-100 text-amber-700" :
                task.pipeline === "No-shows" ? "bg-red-100 text-red-700" :
                task.pipeline === "Nazorg" ? "bg-emerald-100 text-emerald-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {task.pipeline}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{task.patientName}</h4>
            {task.action && (
              <p className="text-[10px] text-slate-500 font-semibold mb-3 mt-1 flex items-start gap-1">
                <i className="fa-solid fa-align-left mt-0.5 opacity-50"></i>
                {task.action}
              </p>
            )}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <i className="fa-regular fa-clock"></i>
                <span>Vandaag</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                {task.avatarInitials}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <span className="text-xs font-semibold">Geen taken</span>
          </div>
        )}
      </div>
    </div>
  );
}
