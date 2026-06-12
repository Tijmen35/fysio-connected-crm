"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { updatePipelineStage } from "@/app/actions/pipeline";

const COLUMNS = [
  { id: "Nieuwe lead", title: "Nieuwe Lead", color: "bg-slate-400" },
  { id: "Contactpoging", title: "Contactpoging", color: "bg-amber-400" },
  { id: "In contact", title: "In Contact", color: "bg-blue-400" },
  { id: "Gewonnen", title: "Gewonnen (Intake)", color: "bg-emerald-500" },
  { id: "Verloren", title: "Verloren", color: "bg-red-400" },
];

export default function PipelineBoard({ initialPatients, pipelineId }: { initialPatients: any[], pipelineId: string }) {
  const [patients, setPatients] = useState(initialPatients);
  const [isPending, startTransition] = useTransition();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStage = destination.droppableId;
    const patientId = draggableId;

    // Optimistic update
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, pipeline_stage: newStage } : p
    );
    setPatients(updatedPatients);

    // If moved to Verloren, we might want to ask for a reason?
    // For now, let's just update the stage via server action
    startTransition(async () => {
      // Create a server action to update the pipeline stage
      await updatePipelineStage(patientId, newStage);
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto pb-4 items-start min-h-[400px]">
        {COLUMNS.map((col) => {
          const colPatients = patients.filter(p => (p.pipeline_stage || "Nieuwe lead") === col.id);
          return (
            <div key={col.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-w-[250px] space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                  {col.title}
                </span>
                <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {colPatients.length}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[150px] rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-slate-100" : ""}`}
                  >
                    {colPatients.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center text-xs text-slate-400 py-10 border-2 border-dashed border-slate-200 rounded-xl">
                        Geen leads
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {colPatients.map((patient, index) => (
                        <Draggable key={patient.id} draggableId={patient.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-lg scale-105" : "hover:border-primary-300"}`}
                            >
                              <div className="font-bold text-sm text-slate-800 mb-1">{patient.full_name}</div>
                              {patient.phone && (
                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                                  <i className="fa-solid fa-phone text-[10px]"></i>
                                  {patient.phone}
                                </div>
                              )}
                              {patient.lost_reason && col.id === "Verloren" && (
                                <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">
                                  Reden: {patient.lost_reason}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
