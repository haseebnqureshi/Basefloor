
const { S3 } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

const SUPPORTED_FORMATS = {
    '.pdf': 'pdf',
    '.doc': 'word',
    '.docx': 'word',
    '.ppt': 'powerpoint',
    '.pptx': 'powerpoint',
    '.odp': 'powerpoint',
    '.odt': 'word',
    '.rtf': 'word',
    '.txt': 'word'
};

const spacesEndpoint = new S3({
  endpoint: process.env.DIGITALOCEAN_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.DIGITALOCEAN_STORAGE_SECRET_KEY
  },
  region: process.env.DIGITALOCEAN_STORAGE_REGION
});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function downloadFromSpace(key, localPath) {
  const response = await spacesEndpoint.getObject({
    Bucket: process.env.DIGITALOCEAN_STORAGE_BUCKET,
    Key: key
  });

  const buffer = await streamToBuffer(response.Body);
  fs.writeFileSync(localPath, buffer);
  return localPath;
}

async function uploadToSpace(key, localPath, contentType) {
  const fileBuffer = fs.readFileSync(localPath);
  
  await spacesEndpoint.putObject({
    Bucket: process.env.DIGITALOCEAN_STORAGE_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read'
  });

  return `https://${process.env.DIGITALOCEAN_STORAGE_BUCKET}.${process.env.DIGITALOCEAN_STORAGE_ENDPOINT}/${key}`;
}

async function convertToPdf(inputPath, outputPath) {
  try {
    await execPromise('libreoffice --version');
  } catch (error) {
    throw new Error('LibreOffice is not installed. Please install it to convert non-PDF documents.');
  }
  
  try {
    const outDir = path.dirname(outputPath);
    await execPromise(`libreoffice --headless --convert-to pdf --outdir "${outDir}" "${inputPath}"`);
    const baseNamePdf = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
    const convertedPdfPath = path.join(outDir, baseNamePdf);
    
    if (convertedPdfPath !== outputPath) {
      fs.renameSync(convertedPdfPath, outputPath);
    }
    
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to convert document to PDF: ${error.message}`);
  }
}

async function convertPdfToImages(pdfPath, outputDir) {
  try {
    // Check if Ghostscript is installed
    await execPromise('gs --version');
  } catch (error) {
    throw new Error('Ghostscript is not installed. Please install it to convert PDFs to images.');
  }

  try {
    // Convert PDF to PNG using Ghostscript
    const gsCommand = `gs -dQuiet -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r300 -dFirstPage=1 -dLastPage=999999 -sOutputFile="${outputDir}/page-%d.png" "${pdfPath}"`;
    
    await execPromise(gsCommand);

    // Get all generated PNG files
    const files = fs.readdirSync(outputDir);
    const imageFiles = files
      .filter(f => f.startsWith('page-') && f.endsWith('.png'))
      .sort((a, b) => {
        const pageA = parseInt(a.match(/\d+/)[0]);
        const pageB = parseInt(b.match(/\d+/)[0]);
        return pageA - pageB;
      })
      .map(f => path.join(outputDir, f));

    return imageFiles;

  } catch (error) {
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
}

async function processDocument(sourceKey, destKey, format = 'jpg', quality = 80) {
  const tempDir = path.join(process.cwd(), 'temp');
  fs.mkdirSync(tempDir, { recursive: true });

  const sourceExt = path.extname(sourceKey).toLowerCase();
  if (!SUPPORTED_FORMATS[sourceExt]) {
    throw new Error(`Unsupported input format: ${sourceExt}. Supported formats are: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`);
  }

  const tempSourcePath = path.join(tempDir, `source${sourceExt}`);
  const tempPdfPath = path.join(tempDir, 'converted.pdf');
  const tempImagePath = path.join(tempDir, `output.${format}`);

  try {
    await downloadFromSpace(sourceKey, tempSourcePath);

    let pdfPath = tempSourcePath;
    if (sourceExt !== '.pdf') {
      pdfPath = await convertToPdf(tempSourcePath, tempPdfPath);
    }
    
    const imageFiles = await convertPdfToImages(pdfPath, tempDir);

    const firstImageMetadata = await sharp(imageFiles[0]).metadata();
    const totalHeight = firstImageMetadata.height * imageFiles.length;

    await sharp({
      create: {
        width: firstImageMetadata.width,
        height: totalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite(imageFiles.map((file, index) => ({
      input: file,
      top: index * firstImageMetadata.height,
      left: 0
    })))
    [format.toLowerCase()]({ quality })
    .toFile(tempImagePath);

    let publicUrl = await uploadToSpace(
      destKey, 
      tempImagePath, 
      `image/${format.toLowerCase()}`
    );

    publicUrl = process.env.DIGITALOCEAN_STORAGE_CDN_ENDPOINT + '/' + destKey;

    fs.rmSync(tempDir, { recursive: true, force: true });

    return publicUrl;
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

module.exports = { 
  processDocument, 
  downloadFromSpace, 
  uploadToSpace, 
  convertToPdf, 
  convertPdfToImages 
};