require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
console.log("Middleware exists:", fs.existsSync('./src/middleware.ts'));
console.log("App files:", fs.readdirSync('./src/app'));
