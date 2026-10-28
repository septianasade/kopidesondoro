import { spawn, exec } from 'child_process';

console.log("Starting standard wrangler login...");
const child = spawn('cmd.exe', ['/c', 'npx', 'wrangler', 'login'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

let opened = false;

child.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  
  const match = str.match(/https:\/\/dash\.cloudflare\.com\/oauth2\/auth\?[^\s\n\r]+/);
  if (match && !opened) {
    opened = true;
    const url = match[0];
    console.log(`\n=======================================================`);
    console.log(`>>> OPENING OAUTH IN CHROME FOR Yellowbemo10:`);
    console.log(`>>> ${url}`);
    console.log(`=======================================================\n`);
    exec(`start "" "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" "${url}"`);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`Wrangler login finished with exit code: ${code}`);
  if (code === 0) {
    console.log("\n=======================================================");
    console.log(">>> LOGIN SUKSES! LANGSUNG DEPLOY KE CLOUDFLARE PAGES <<<");
    console.log("=======================================================\n");
    const deploy = spawn('cmd.exe', ['/c', 'npx', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', 'kopidesondoro', '--commit-dirty=true'], {
      stdio: 'inherit'
    });
    deploy.on('close', (dCode) => {
      console.log(`Deploy finished with exit code: ${dCode}`);
    });
  }
});
