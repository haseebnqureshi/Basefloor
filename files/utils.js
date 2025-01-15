
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

const TIME_TO_RETAIN_FILES = 60 * 1000 //in milliseconds
const MAX_FILE_SIZE = Math.round(5 * 1024 * 1024 * 2/3); // 5MB in bytes
const MAX_DIMENSION_FOR_RESIZE = 1500; //in pixels
const SUPPORTED_FORMATS = {
    '.pdf': 'pdf',
    '.doc': 'word',
    '.docx': 'word',
    '.ppt': 'powerpoint',
    '.pptx': 'powerpoint',
    '.odp': 'powerpoint',
    '.odt': 'word',
    '.rtf': 'word',
    '.txt': 'word',
    '.xls': 'excel',
    '.xlsx': 'excel',
    '.csv': 'excel',
};

async function createFileHash({ user_id, size, type, name }) {
  return API.Utils.hashObject({
    user_id: user_id.toString(),
    size,
    type,
    name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
  }, {
    algorithm: 'md5'
  })
}

function createFileParams({ hash, name, endpoint }) {
  const [,extension] = name.match(/(\.[a-z0-9]+)$/)
  const filename = `${hash}${extension}`
  const url = `${endpoint}/${filename}`
  const uploaded_at = null
  const created_at = new Date().toISOString()
  return { extension, filename, url, uploaded_at, created_at }  
}

async function convertToPdf({ inputPath, outputPath }) {
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

async function optimizeImage({ inputPath, outputPath, maxSize = MAX_FILE_SIZE }) {
  let metadata;
  try {
    metadata = await sharp(inputPath).metadata();
  } catch (error) {
    return {
      success: false,
      error: `Failed to read image metadata: ${error.message}`
    };
  }
  
  const { width, height } = metadata;
  let currentWidth = width;
  let currentHeight = height;
  
  while (currentWidth > 100 && currentHeight > 100) {
    currentWidth = Math.floor(currentWidth * 0.8);
    currentHeight = Math.floor(currentHeight * 0.8);
    try {
      await sharp(inputPath)
        .resize(currentWidth, currentHeight, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toFormat('png')
        .toFile(outputPath)
      const stats = fs.statSync(outputPath);
      if (stats.size <= maxSize) {
        console.log(`Optimized image at ${currentWidth}x${currentHeight}`);
        return { success: true };
      }
    } catch (error) {
      console.error(`Failed attempt at ${currentWidth}x${currentHeight}:`, error);
    }
  }
  
  return {
    success: false,
    error: 'Unable to optimize image to target size with acceptable quality'
  };
}

async function getNewDimensions({ inputPath, maxDimension = MAX_DIMENSION_FOR_RESIZE }) {
  const metadata = await sharp(inputPath).metadata()
  if (!metadata) { throw new Error('Could not read metadata from inputPath') }
  let { width, height } = metadata
  const scale = maxDimension / (width > height ? width : height)
  if (scale >= 1) { return false } //longest size is already max = maxDimension, therefore no resize needed
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

async function resizeImageSimple({ inputPath, outputPath, width, height }) {
  return await sharp(inputPath)
    .resize(width, height, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFormat('png')
    .toFile(outputPath)
}

async function resizeImage({ inputPath, outputPath, width, height }) {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    
    console.log(`Attempting to resize image:
      - Input path: ${inputPath}
      - Output path: ${outputPath}
      - Target dimensions: ${width}x${height}
      - Input file size: ${inputBuffer.length} bytes`);

    const image = sharp(inputBuffer, {
      failOn: 'none',
      limitInputPixels: false
    });

    return await image
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toFormat('png', {
        compression: 6,
        adaptiveFiltering: true,
        palette: false
      })
      .toFile(outputPath)
      .catch(err => {
        console.error('Detailed resize error:', err);
        throw err;
      });
  } catch (error) {
    console.error('Failed to resize image:', error);
    throw new Error(`Image resize failed: ${error.message}`);
  }
}

async function convertPdfToImages({ pdfPath, outputDir }) {
  try {
    await execPromise('gs --version');
  } catch (error) {
    throw new Error('Ghostscript is not installed. Please install it to convert PDFs to images.');
  }

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const gsCommand = `gs -dQuiet -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r200 -dFirstPage=1 -dLastPage=999999 -sOutputFile="${outputDir}/page-%d.png" "${pdfPath}"`;
    
    await execPromise(gsCommand);

    const files = fs.readdirSync(outputDir);
    const imageFiles = files
      .filter(f => f.startsWith('page-') && f.endsWith('.png'))
      .sort((a, b) => {
        const pageA = parseInt(a.match(/\d+/)[0]);
        const pageB = parseInt(b.match(/\d+/)[0]);
        return pageA - pageB;
      })
      .map(f => path.join(outputDir, f));

    for (const imagePath of imageFiles) {  
      let stats = fs.statSync(imagePath);
      const filename = path.basename(imagePath);
      const optimizedPath = path.join(outputDir, 'optimized-' + filename);
      const newDimensions = await getNewDimensions({ 
        inputPath: imagePath
      });

      if (newDimensions || stats.size >= MAX_FILE_SIZE) {
        console.log(`Image too large in dimensions or size, attempting to optimize...`);

        await resizeImage({ 
          inputPath: imagePath,
          outputPath: optimizedPath,
          width: newDimensions.width,
          height: newDimensions.height,
        });
        console.log(`Resized image...`, optimizedPath);
        fs.renameSync(optimizedPath, imagePath);
      }
    }
    return imageFiles;
  } catch (error) {
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
}

async function processDocument({ name, inputKey, outputBasename, outputFormat = 'png', storage }) {
  return await processDocumentAsMany({ 
    name, 
    inputKey, 
    outputBasename, 
    outputFormat, 
    storage 
  });
}

async function processDocumentAsMany({ name, inputKey, outputBasename, outputFormat, downloadFile, uploadFile }) {
  if (!downloadFile) {
    throw new Error('downloadFile() by storage provider is required');
  }
  if (!uploadFile) {
    throw new Error('uploadFile() by storage provider is required');
  }

  const timestamp = Date.now();
  const tempDir = path.join(process.cwd(), 'temp-' + timestamp);
  fs.mkdirSync(tempDir, { recursive: true });

  const sourceExt = path.extname(inputKey).toLowerCase();
  if (!SUPPORTED_FORMATS[sourceExt]) {
    throw new Error(`Unsupported input format: ${sourceExt}. Supported formats are: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`);
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
    
    let flattenedPages = await convertPdfToImages({
      pdfPath,
      outputDir: tempDir
    });
    
    if (!flattenedPages.length) {
      throw new Error('No images were generated from the PDF');
    }

    let pages = []
    for (let p in flattenedPages) {
      const tempImagePath = flattenedPages[p]
      const pageSize = fs.statSync(tempImagePath).size
      const pageNumber = String(parseInt(p)+1)
      const pageSuffix = pageNumber.padStart(4, '0')
      const pageBasename = `${outputBasename}-${pageSuffix}`
      const pageExtension = `.${outputFormat}`
      const pageFilename = `${pageBasename}${pageExtension}`
      const contentType = `image/${outputFormat.toLowerCase()}`

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

    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, TIME_TO_RETAIN_FILES);
    
    return pages;

  } catch (error) {
    console.error(error);

    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, TIME_TO_RETAIN_FILES);

    return [];
  }
}

function removeFilepath({ filepath }) {
  fs.rmSync(filepath, { recursive: true, force: true });
}

module.exports = { 
  TIME_TO_RETAIN_FILES,
  MAX_FILE_SIZE,
  MAX_DIMENSION_FOR_RESIZE,
  SUPPORTED_FORMATS,
  createFileHash,
  createFileParams,
  processDocument, 
  convertToPdf, 
  convertPdfToImages,
  removeFilepath,
};
