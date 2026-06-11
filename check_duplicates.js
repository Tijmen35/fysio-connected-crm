require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: patients, error } = await supabase.from('patients').select('*');
  if (error) console.error(error);
  
  const phoneMap = {};
  for (const p of patients) {
    if (!p.phone) continue;
    if (!phoneMap[p.phone]) phoneMap[p.phone] = [];
    phoneMap[p.phone].push(p);
  }
  
  for (const phone in phoneMap) {
    if (phoneMap[phone].length > 1) {
      console.log(`Duplicate phone: ${phone} -> ${phoneMap[phone].map(p => p.full_name).join(', ')}`);
    }
  }
  
  const nameMap = {};
  for (const p of patients) {
    if (!p.full_name) continue;
    if (!nameMap[p.full_name]) nameMap[p.full_name] = [];
    nameMap[p.full_name].push(p);
  }
  for (const name in nameMap) {
    if (nameMap[name].length > 1) {
      console.log(`Duplicate name: ${name} -> ${nameMap[name].map(p => p.phone).join(', ')}`);
    }
  }
}
check();
