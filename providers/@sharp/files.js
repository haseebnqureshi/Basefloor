const sharp = require('sharp');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const path = require('path');
const os = require('os');

const MAX_FILE_SIZE = Math.round(5 * 1024 * 1024 * 2/3); // 5MB in bytes
const MAX_DIMENSION_FOR_RESIZE = 1500; //in pixels
const TIME_TO_RETAIN_FILES = 60 * 1000; // in milliseconds

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
				.toFile(outputPath);
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
	const metadata = await sharp(inputPath).metadata();
	if (!metadata) { throw new Error('Could not read metadata from inputPath'); }
	let { width, height } = metadata;
	const scale = maxDimension / (width > height ? width : height);
	if (scale >= 1) { return false; }
	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
	};
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
			.toFile(outputPath);
	} catch (error) {
		console.error('Failed to resize image:', error);
		throw new Error(`Image resize failed: ${error.message}`);
	}
}

async function convertPdfToImages({ pdfPath, outputDir }) {
	// Check Ghostscript availability before conversion
	await checkGhostscript();

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
				inputPath: imagePath,
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

module.exports = ({ providerVars, providerName }) => {
	const NAME = providerName
	const ENV = providerVars
	return {
		NAME,
		ENV,
		MAX_FILE_SIZE,
		MAX_DIMENSION_FOR_RESIZE,
		SUPPORTED_FORMATS,
		TIME_TO_RETAIN_FILES,
		sharp,
		optimizeImage,
		getNewDimensions,
		resizeImage,
		convertPdfToImages,
	};
};