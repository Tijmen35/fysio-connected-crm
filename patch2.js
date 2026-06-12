const fs = require("fs");
let code = fs.readFileSync("src/app/actions/task.ts", "utf8");

code = code.replace(
  `log("pipelineName: " + pipelineName + " currentStepIndex: " + currentStepIndex);`,
  `log("existingTask: " + JSON.stringify(existingTask));\n  log("pipelineName: " + pipelineName + " currentStepIndex: " + currentStepIndex);`
);

fs.writeFileSync("src/app/actions/task.ts", code);
