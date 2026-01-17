// This script requires puppeteer to be installed
// Run: npm install puppeteer
// Then: node convert_to_png.js

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHtmlToPng(htmlFile, outputFile) {
  console.log(`Converting ${htmlFile} to ${outputFile}...`);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Get the absolute path to the HTML file
  const htmlPath = path.resolve(__dirname, htmlFile);
  
  // Load the HTML file
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
  });
  
  // Wait for Mermaid diagrams to render
  await page.waitForFunction(() => {
    return document.querySelectorAll('.mermaid svg').length > 0;
  }, { timeout: 10000 });
  
  // Additional wait to ensure diagrams are fully rendered
  await page.waitForTimeout(2000);
  
  // Get the content height
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();
  
  // Set viewport to capture full content
  await page.setViewport({
    width: 1200,
    height: Math.ceil(height),
    deviceScaleFactor: 1.5, // Higher resolution
  });
  
  // Take screenshot
  await page.screenshot({
    path: path.resolve(__dirname, outputFile),
    fullPage: true,
  });
  
  await browser.close();
  console.log(`Successfully converted ${htmlFile} to ${outputFile}`);
}

async function main() {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = path.resolve(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }
    
    // Convert HTML diagrams to PNG
    await convertHtmlToPng(
      'Project_Architecture_Diagram.html',
      'images/Project_Architecture_Diagram.png'
    );
    
    await convertHtmlToPng(
      'MongoDB_Schema_Diagram.html',
      'images/MongoDB_Schema_Diagram.png'
    );
    
    console.log('All conversions completed successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

main();
