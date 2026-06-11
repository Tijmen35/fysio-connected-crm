require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const workflows = {
  "Leadopvolging": [
    { title: "Belpoging 1 (Nieuw)", delayHours: 0, expectedStatus: "Vandaag" },
    { title: "Belpoging 2", delayHours: 3, expectedStatus: "Vandaag-Middag" },
    { title: "Belpoging 3", delayHours: 21, expectedStatus: "Vandaag" },
    { title: "Belpoging 4", delayHours: 3, expectedStatus: "Vandaag-Middag" },
    { title: "Belpoging 5 (Laatste pogingen)", delayHours: 21, expectedStatus: "Vandaag" },
    { title: "Belpoging 6 (Dag 10)", delayHours: 168, expectedStatus: "Vandaag" },
    { title: "Belpoging 7 (Laatste kans)", delayHours: 96, expectedStatus: "Vandaag", isLastStep: true }
  ],
  "No-shows & Zieken": [
    { title: "Nieuwe afspraak inplannen", delayHours: 168, expectedStatus: "Vandaag" },
    { title: "Herinnering sturen", delayHours: 24, expectedStatus: "Vandaag", isLastStep: true }
  ],
  "Nazorg (Uitbehandeld)": [
    { title: "Bedankkaartje schrijven en opsturen", delayHours: 336, expectedStatus: "Vandaag" },
    { title: "3 Maanden check", delayHours: 2160, expectedStatus: "Vandaag" },
    { title: "12 Maanden check", delayHours: 6480, expectedStatus: "Vandaag", isLastStep: true }
  ],
  "FysioFit Conversie": [
    { title: "Bedankkaartje schrijven + pasje voor 6 weken gratis", delayHours: 2, expectedStatus: "Vandaag" },
    { title: "Belpoging 2 (Na 3 dagen)", delayHours: 72, expectedStatus: "Vandaag" },
    { title: "Belpoging 3 (Laatste poging)", delayHours: 72, expectedStatus: "Vandaag", isLastStep: true }
  ]
};

async function seed() {
  for (const pipeline of Object.keys(workflows)) {
    for (let i = 0; i < workflows[pipeline].length; i++) {
      const stepIndex = i + 1; // 1-indexed
      const step = workflows[pipeline][i];
      let actionType = 'niet_opgenomen';
      if (pipeline === 'Nazorg (Uitbehandeld)' && stepIndex === 1) {
        actionType = 'kaartje_verstuurd';
      }
      
      const { error } = await supabase.from('templates').upsert({
        pipeline_name: pipeline,
        step_index: stepIndex,
        action_type: actionType,
      }, { onConflict: 'pipeline_name, step_index, action_type' });
      
      if (error) {
        console.error(`Error inserting ${pipeline} step ${stepIndex}:`, error);
      } else {
        console.log(`Ensured ${pipeline} step ${stepIndex} exists.`);
      }
    }
  }
}
seed();
