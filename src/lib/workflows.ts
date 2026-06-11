export interface WorkflowStep {
  title: string;
  delayHours: number; // How many hours to wait before this task should be shown in 'Vandaag' or 'Vandaag-Middag'
  expectedStatus: "Vandaag" | "Vandaag-Middag" | "Morgen" | "Later";
  isLastStep?: boolean;
  task_type?: "call" | "send_card" | "manual_check";
}

export const WORKFLOWS: Record<string, WorkflowStep[]> = {
  "Leadopvolging": [
    { title: "Belpoging 1 (Nieuw)", delayHours: 0, expectedStatus: "Vandaag" },
    { title: "Belpoging 2", delayHours: 3, expectedStatus: "Vandaag-Middag" }, // +3 hours
    { title: "Belpoging 3", delayHours: 21, expectedStatus: "Vandaag" }, // Next morning (approx 24h from start)
    { title: "Belpoging 4", delayHours: 3, expectedStatus: "Vandaag-Middag" },
    { title: "Belpoging 5 (Laatste pogingen)", delayHours: 21, expectedStatus: "Vandaag" }, // Day 3
    { title: "Belpoging 6 (Dag 10)", delayHours: 168, expectedStatus: "Vandaag" }, // +7 days
    { title: "Belpoging 7 (Laatste kans)", delayHours: 96, expectedStatus: "Vandaag", isLastStep: true } // +4 days = Day 14
  ],
  "No-shows & Zieken": [
    { title: "Nieuwe afspraak inplannen", delayHours: 168, expectedStatus: "Vandaag" }, // 7 days after trigger
    { title: "Herinnering sturen", delayHours: 24, expectedStatus: "Vandaag", isLastStep: true } // +1 day
  ],
  "Nazorg (Uitbehandeld)": [
    { title: "Bedankkaartje schrijven en opsturen", delayHours: 336, expectedStatus: "Vandaag" }, // 14 days after trigger
    { title: "3 Maanden check", delayHours: 2160, expectedStatus: "Vandaag" }, // +90 days (3 months)
    { title: "12 Maanden check", delayHours: 6480, expectedStatus: "Vandaag", isLastStep: true } // +9 months
  ],
  "FysioFit Conversie": [
    { title: "Bedankkaartje schrijven + pasje voor 6 weken gratis", delayHours: 2, expectedStatus: "Vandaag" }, // 2 hours after trigger
    { title: "Belpoging 2 (Na 3 dagen)", delayHours: 72, expectedStatus: "Vandaag" }, // +3 days
    { title: "Belpoging 3 (Laatste poging)", delayHours: 72, expectedStatus: "Vandaag", isLastStep: true } // +3 days
  ]
};

export function calculateNextScheduledDate(delayHours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() + delayHours);
  return date;
}
