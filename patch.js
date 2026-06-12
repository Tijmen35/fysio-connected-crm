const fs = require("fs");
let code = fs.readFileSync("src/app/actions/task.ts", "utf8");

code = code.replace(
  `export async function advanceWorkflow(taskId: string, outcome: string, scheduleDate?: string) {`,
  `export async function advanceWorkflow(taskId: string, outcome: string, scheduleDate?: string) {\n  const log = (msg: string) => require("fs").appendFileSync("debug_advance.txt", new Date().toISOString() + " | " + msg + "\\n");\n  log("--- START advanceWorkflow ---");\n  log("taskId: " + taskId + " outcome: " + outcome);`
);

code = code.replace(
  `const pipelineName = existingTask.pipeline?.name;`,
  `const pipelineName = existingTask.pipeline?.name;\n  log("PipelineName: " + pipelineName);`
);

code = code.replace(
  `if (!pipelineName || !WORKFLOWS[pipelineName]) {`,
  `if (!pipelineName || !WORKFLOWS[pipelineName]) {\n    log("EARLY RETURN: pipelineName or WORKFLOWS falsy");`
);

code = code.replace(
  `const { data: stepTemplate } = await supabase`,
  `log("Fetching template for: " + pipelineName + " step: " + currentStepIndex + " outcome: " + outcome);\n    const { data: stepTemplate, error: stepErr } = await supabase`
);

code = code.replace(
  `.single();`,
  `.single();\n    log("Template query error: " + JSON.stringify(stepErr) + " | template: " + JSON.stringify(stepTemplate));`
);

code = code.replace(
  `if (stepTemplate?.whatsapp_template && existingTask.patient?.phone) {`,
  `log("Evaluating whatsapp check...");\n    if (stepTemplate?.whatsapp_template && existingTask.patient?.phone) {`
);

code = code.replace(
  `if (currentStepIndex < flow.length) {`,
  `log("Checking flow progression: " + currentStepIndex + " < " + flow.length);\n    if (currentStepIndex < flow.length) {`
);

code = code.replace(
  `await supabase.from("tasks").insert({`,
  `log("Inserting next task: " + nextStep.title);\n      const {error: insertErr} = await supabase.from("tasks").insert({`
);

code = code.replace(
  `step_index: currentStepIndex + 1\n      });`,
  `step_index: currentStepIndex + 1\n      });\n      log("Insert error: " + JSON.stringify(insertErr));`
);

fs.writeFileSync("src/app/actions/task.ts", code);
