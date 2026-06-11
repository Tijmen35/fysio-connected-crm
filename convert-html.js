const fs = require('fs');

const html = fs.readFileSync('prototype.html', 'utf8');

// Extract the body content
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) {
  console.log('No body found');
  process.exit(1);
}

let bodyContent = bodyMatch[1];

// Remove script tags from body
bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Replace class= with className=
bodyContent = bodyContent.replace(/class=/g, 'className=');

// Replace for= with htmlFor=
bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');

// Remove on[Event]=
bodyContent = bodyContent.replace(/on[a-z]+="[^"]*"/g, '');

// Replace style="width: 0%" with style={{width: '0%'}}
bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, p1) => {
  const styles = p1.split(';').filter(s => s.trim() !== '');
  let styleObj = {};
  styles.forEach(s => {
    let [key, value] = s.split(':');
    if(key && value) {
        key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styleObj[key] = value.trim();
    }
  });
  return `style={${JSON.stringify(styleObj)}}`;
});

// Self-close tags: img, input, hr, br
bodyContent = bodyContent.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
bodyContent = bodyContent.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
bodyContent = bodyContent.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');
bodyContent = bodyContent.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');

// Replace HTML comments
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

const reactComponent = `
import Script from 'next/script';

export default function Dashboard() {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      ${bodyContent}
    </>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', reactComponent);
console.log('Done!');
