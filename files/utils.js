const fs = require('fs');
const path = require('path');
const os = require('os');

const TIME_TO_RETAIN_FILES = 60 * 1000 //in milliseconds

async function processDocument({ name, inputKey, outputBasename, outputFormat = 'png', convertToPdf, sharp }) {
  return await processDocumentAsMany({ 
    name, 
    inputKey, 
    outputBasename, 
    outputFormat, 
    convertToPdf,
    sharp
  });
}

async function processDocumentAsMany({ 
  name, 
  inputKey, 
  outputBasename, 
  outputFormat, 
  downloadFile, 
  uploadFile, 
  convertToPdf, 
  sharp,
  libreoffice // Add libreoffice provider to get its SUPPORTED_FORMATS
}) {
  if (!downloadFile) {
    throw new Error('downloadFile() by storage provider is required');
  }
  if (!uploadFile) {
    throw new Error('uploadFile() by storage provider is required');
  }
  if (!libreoffice) {
    throw new Error('libreoffice provider is required');
  }
  if (!sharp) {
    throw new Error('sharp provider is required');
  }

  const timestamp = Date.now();
  const tempDir = path.join(os.tmpdir(), `${Date.now()}-${inputKey}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const sourceExt = path.extname(inputKey).toLowerCase();
  const supportedFormats = {
    ...libreoffice.SUPPORTED_FORMATS,
    ...sharp.SUPPORTED_FORMATS
  };

  if (!supportedFormats[sourceExt]) {
    throw new Error(`Unsupported input format: ${sourceExt}. Supported formats are: ${Object.keys(supportedFormats).join(', ')}`);
  }

  const tempSourcePath = path.join(tempDir, `source${sourceExt}`);
  const tempPdfPath = path.join(tempDir, 'source.pdf');

  try {
    await downloadFile({
      key: inputKey, 
      localPath: tempSourcePath
    });

    let pdfPath = tempSourcePath;
    if (sourceExt !== '.pdf') {
      pdfPath = await convertToPdf({
        inputPath: tempSourcePath,
        outputPath: tempPdfPath
      });
    }
    
    let flattenedPages = await sharp.convertPdfToImages({
      pdfPath,
      outputDir: tempDir,
    });
    
    if (!flattenedPages.length) {
      throw new Error('No images were generated from the PDF');
    }

    let pages = [];
    for (let p in flattenedPages) {
      const tempImagePath = flattenedPages[p];
      const pageSize = fs.statSync(tempImagePath).size;
      const pageNumber = String(parseInt(p)+1);
      const pageSuffix = pageNumber.padStart(4, '0');
      const pageBasename = `${outputBasename}-${pageSuffix}`;
      const pageExtension = `.${outputFormat}`;
      const pageFilename = `${pageBasename}${pageExtension}`;
      const contentType = `image/${outputFormat.toLowerCase()}`;

      const url = await uploadFile({
        key: pageFilename,
        filepath: tempImagePath,
        contentType,
      });

      pages.push({
        url,
        filename: pageFilename,
        extension: pageExtension,
        type: contentType,
        name: `${name} (Page ${pageNumber})`,
        description: `Page ${pageNumber} of ${flattenedPages.length}`,
        size: pageSize,
        uploaded_at: new Date().toISOString(),
      });
    }

    // setTimeout(() => {
    //   fs.rmSync(tempDir, { recursive: true, force: true });
    // }, TIME_TO_RETAIN_FILES);
    
    return pages;

  } catch (error) {
    console.error(error);
    // setTimeout(() => {
    //   fs.rmSync(tempDir, { recursive: true, force: true });
    // }, TIME_TO_RETAIN_FILES);
    return [];
  }
}

function removeFilepath({ filepath }) {
  fs.rmSync(filepath, { recursive: true, force: true });
}

module.exports = { 
  TIME_TO_RETAIN_FILES,
  processDocument, 
  processDocumentAsMany,
  removeFilepath,
};
