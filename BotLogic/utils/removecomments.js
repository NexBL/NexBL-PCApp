const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get the file path from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Please provide a file path as an argument');
  console.log('Usage: node removecomments.js <filePath>');
  process.exit(1);
}

const filePath = args[0];

// Check if the file exists
if (!fs.existsSync(filePath)) {
  console.error(`Error: File ${filePath} does not exist`);
  process.exit(1);
}

// Read the file line by line
async function processFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  let removedCount = 0;
  let totalLines = 0;
  
  // Read all lines and filter out comments
  for await (const line of rl) {
    totalLines++;
    
    // Skip lines that start with // (comments)
    if (line.trim().startsWith('//')) {
      removedCount++;
      continue;
    }
    
    // Keep the line (including blank lines)
    lines.push(line);
  }
  
  // Write the filtered content back to the file
  try {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Processed ${filePath}`);
    console.log(`Removed ${removedCount} comment lines out of ${totalLines} total lines`);
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
  }
}

// Process the file
processFile(filePath).catch(err => {
  console.error(`Error processing file: ${err.message}`);
  process.exit(1);
});
