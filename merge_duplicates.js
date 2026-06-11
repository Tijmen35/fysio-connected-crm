require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function merge() {
  const { data: patients } = await supabase.from('patients').select('*');
  
  const phoneMap = {};
  for (const p of patients) {
    if (!p.phone) continue;
    if (!phoneMap[p.phone]) phoneMap[p.phone] = [];
    phoneMap[p.phone].push(p);
  }
  
  for (const phone in phoneMap) {
    const list = phoneMap[phone];
    if (list.length > 1) {
      const primary = list[0];
      for (let i = 1; i < list.length; i++) {
        const dup = list[i];
        console.log(`Merging ${dup.id} into ${primary.id}`);
        // Move tasks
        await supabase.from('tasks').update({ patient_id: primary.id }).eq('patient_id', dup.id);
        // Delete dup
        await supabase.from('patients').delete().eq('id', dup.id);
      }
    }
  }
  console.log("Merge complete");
}
merge();
