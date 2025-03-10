const sharp = require('sharp');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const path = require('path');
const os = require('os');

const MAX_FILE_SIZE = Math.round(3 * 1024 * 1024); // 3MB in bytes
const MAX_DIMENSION_FOR_RESIZE = 1500; //in pixels

const SUPPORTED_FORMATS = {
	'.pdf': 'pdf',
	'.png': 'image',
	'.jpg': 'image',
	'.jpeg': 'image',
	'.gif': 'image',
	'.webp': 'image',
	'.tiff': 'image',
	'.bmp': 'image',
};

async function checkGhostscript() {
	try {
		await execPromise('gs --version');
		return true;
	} catch (error) {
		const platform = os.platform();
		let installInstructions = '';

		switch (platform) {
			case 'darwin':
				installInstructions = 'Run: brew install ghostscript';
				break;
			case 'linux':
				installInstructions = 'Run: sudo apt-get install ghostscript\n' +
					'Or for RPM-based systems: sudo dnf install ghostscript';
				break;
			case 'win32':
				installInstructions = 'Download and install from: https://ghostscript.com/releases/gsdnld.html';
				break;
			default:
				installInstructions = 'Please visit https://ghostscript.com/releases/gsdnld.html';
		}

		throw new Error(
			`Ghostscript is not installed or not accessible.\n\n` +
			`Installation instructions for ${platform}:\n${installInstructions}`
		);
	}
}

const getFileSize = (filepath) => {
  const stats = fs.statSync(filepath)
  const int = stats.size
  const kb = Math.round(100 * int / 1024)/100
	const mb = Math.round(100 * kb / 1024)/100
  return { int, kb, mb }
}

const switchExtension = (filepath, extension) => {
	return path.basename(filepath, path.extname(filepath)) + extension
}

async function getDimensions({ inputPath }) {
	const metadata = await sharp(inputPath).metadata()
	if (!metadata) { 
		throw new Error('Could not read metadata from inputPath')
	}
	return {
		width: metadata.width,
		height: metadata.height,
	}
}

async function getNewDimensions({ inputPath, maxDimension = MAX_DIMENSION_FOR_RESIZE }) {
	const metadata = await sharp(inputPath).metadata()
	if (!metadata) { 
		throw new Error('Could not read metadata from inputPath')
	}
	let { width, height } = metadata
	const scale = maxDimension / (width > height ? width : height)
	if (scale >= 1) { 
		return false
	}
	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
	}
}

async function resizeImage({ inputPath, outputPath, width, height }) {
	try {

		if (!outputPath) {
			outputPath = switchExtension(inputPath, '.png')
		}

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
			.toFile(outputPath);
	} catch (error) {
		console.error('Failed to resize image:', error);
		throw new Error(`Image resize failed: ${error.message}`);
	}
}

async function optimizeImage({ inputPath, outputPath, maxSize = MAX_FILE_SIZE }) {

	if (!outputPath) {
		outputPath = switchExtension(inputPath, '.png')
	}

	let { width, height } = await getDimensions({ inputPath })
	const initSize = getFileSize(inputPath)
	if (initSize.int <= maxSize) {
		fs.renameSync(inputPath, outputPath)
		return {
			message: `Image already optimized at ${width} x ${height} at ${initSize.mb} mb`,
			success: true,
			width,
			height,
			size: initSize.int,
		}
	}

	let params = { inputPath, outputPath, width, height }
	const scale = 0.8
	let optimized = false
	let finished = false

	while (!finished && params.width > 100 && params.height > 100) {
		try {
			const maxDimension = params.width*scale > params.height*scale ? params.width*scale : params.height*scale
			const newDimensions = await getNewDimensions({ inputPath, maxDimension })
			params.width = newDimensions.width
			params.height = newDimensions.height
			await resizeImage(params)
			const size = getFileSize(outputPath)
			if (size.int <= maxSize) {
				optimized = true
				finished = true
			}
		}
		catch (err) {
			finished = true
		}
	}
	const finalSize = getFileSize(outputPath)
	const message = `${optimized ? 'Optimized' : 'Not optimized'} image at ${params.width} x ${params.height} at ${finalSize.mb} mb`
	return { 
		message,
		success: optimized, 
		width: params.width, 
		height: params.height,
		size: finalSize.int,
	}
}

async function convertPdfToImages({ pdfPath, outputDir }) {

	//checking Ghostscript availability before conversion
	await checkGhostscript()

	try {
		// Check if the PDF file exists
		if (!fs.existsSync(pdfPath)) {
			throw new Error(`PDF file does not exist at path: ${pdfPath}`);
		}

		//ensuring our output directory
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}
		
		// Log the command for debugging
		const gsCommand = `gs -dQuiet -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r200 -dFirstPage=1 -dLastPage=999999 -sOutputFile="${outputDir}/page-%d.png" "${pdfPath}"`;
		console.log(`Executing Ghostscript command: ${gsCommand}`);
		
		//pdf to images with ghostscript
		await execPromise(gsCommand);

		//filtering and ordering images from pdf
		const files = fs.readdirSync(outputDir)
		const imageFiles = files.filter(f => f.startsWith('page-') && f.endsWith('.png'))
			.sort((a, b) => {
				const pageA = parseInt(a.match(/\d+/)[0])
				const pageB = parseInt(b.match(/\d+/)[0])
				return pageA - pageB
			})
			.map(f => path.join(outputDir, f))

		if (imageFiles.length === 0) {
			throw new Error(`No images were generated from PDF: ${pdfPath}`);
		}

		//now ensuring each image is optimized accordingly
		for (const inputPath of imageFiles) {
			const optimizedPath = switchExtension(inputPath, '.png')
			const imageResponse = await optimizeImage({
				inputPath,
				outputPath: optimizedPath,
			})
			fs.renameSync(optimizedPath, inputPath)
		}

		//finally returning our images
		return {
			success: true,
			images: imageFiles,
		}

	} catch (error) {
		console.error(`Failed to convert PDF to images: ${error.message}`)
		throw error; // Re-throw the error to be handled by the caller
	}
}

module.exports = ({ providerVars, providerName }) => {
	const NAME = providerName
	const ENV = providerVars
	return {
		NAME,
		ENV,
		MAX_FILE_SIZE,
		MAX_DIMENSION_FOR_RESIZE,
		SUPPORTED_FORMATS,
		sharp,
		getFileSize,
		switchExtension,
		getDimensions,
		getNewDimensions,
		resizeImage,
		optimizeImage,
		convertPdfToImages,
	};
};