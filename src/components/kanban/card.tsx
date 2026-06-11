import { MoreHorizontal, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CardProps = {
  patientName: string;
  pipeline: string;
  action: string;
  avatarInitials: string;
  isUrgent?: boolean;
};

export function Card({ patientName, pipeline, action, avatarInitials, isUrgent }: CardProps) {
  // Determine badge colors based on pipeline
  let badgeColor = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  if (pipeline === "Leadopvolging") badgeColor = "bg-primary-100 text-primary-700 hover:bg-primary-200";
  if (pipeline === "No-shows") badgeColor = "bg-rose-100 text-rose-700 hover:bg-rose-200";
  if (pipeline === "Nazorg") badgeColor = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";

  return (
    <div className="bg-white p-4 rounded-xl shadow-card border border-slate-100 hover:border-primary-300 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="secondary" className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor} border-0`}>
          {pipeline}
        </Badge>
        <button className="text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-bold text-slate-800 text-sm mb-1">{patientName}</h4>
      <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        {action}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
          {avatarInitials}
        </div>
        {isUrgent && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
    </div>
  );
}
