const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(require('child_process').exec);
const os = require('os');
const { createCanvas } = require('canvas');
const fsPromises = fs.promises;

async function checkLibreOffice() {
	try {
		await execPromise('libreoffice --version');
		return true;
	} catch (error) {
		const platform = os.platform();
		let installInstructions = '';

		switch (platform) {
			case 'darwin':
				installInstructions = 'Run: brew install libreoffice';
				break;
			case 'linux':
				installInstructions = 'Run: sudo apt-get install libreoffice\n' +
					'Or for RPM-based systems: sudo dnf install libreoffice';
				break;
			case 'win32':
				installInstructions = 'Download and install from: https://www.libreoffice.org/download/download/';
				break;
			default:
				installInstructions = 'Please visit https://www.libreoffice.org/download/download/';
		}

		throw new Error(
			`LibreOffice is not installed or not accessible.\n\n` +
			`Installation instructions for ${platform}:\n${installInstructions}`
		);
	}
}

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName;
	const ENV = providerVars;
	const TIME_TO_RETAIN_FILES = 60 * 1000; // in milliseconds
	const SUPPORTED_FORMATS = {
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

	async function convertToPdf({ inputPath }) {
		// Check LibreOffice availability before conversion
		await checkLibreOffice();

		try {
			// Check if the input file exists
			if (!fs.existsSync(inputPath)) {
				throw new Error(`Input file does not exist at path: ${inputPath}`);
			}

			const outDir = path.dirname(inputPath);
			const baseNamePdf = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
			const outputPath = path.join(outDir, baseNamePdf);
			
			// Log the command for debugging
			const libreOfficeCommand = `libreoffice --headless --convert-to pdf --outdir "${outDir}" "${inputPath}"`;
			console.log(`Executing LibreOffice command: ${libreOfficeCommand}`);
			
			await execPromise(libreOfficeCommand);
			
			// Verify the PDF was created
			if (!fs.existsSync(outputPath)) {
				throw new Error(`PDF was not created at expected path: ${outputPath}`);
			}
			
			console.log(`Successfully converted to PDF: ${outputPath}`);
			return outputPath;
		} 
		catch (error) {
			console.error(`Failed to convert document to PDF: ${error.message}`);
			throw error; // Re-throw the error to be handled by the caller
		}
	}

	async function textToImage({ text, width = 1240, height = 1754 }) {
		try {
			// Create a temporary directory for our files
			const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'minapi-text-img-'));
			const pngFilePath = path.join(tempDir, 'output-image.png');
			
			// Create a canvas
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext('2d');
			
			// Set background to white
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, width, height);
			
			// Set text properties
			ctx.font = '16px sans-serif';
			ctx.fillStyle = 'black';
			
			// Split text into lines
			const lines = text.split('\n');
			
			// Add text to the canvas
			let yPos = 50;  // Start 50px from the top
			
			for (const line of lines) {
				ctx.fillText(line, 50, yPos);
				yPos += 20;  // Move down for next line
			}
			
			// Save the image
			const buffer = canvas.toBuffer('image/png');
			await fsPromises.writeFile(pngFilePath, buffer);
			
			console.log(`Successfully generated PNG image: ${pngFilePath}`);
			
			// Schedule cleanup
			setTimeout(() => {
				try {
					fs.unlinkSync(pngFilePath);
					fs.rmdirSync(tempDir);
				} catch (err) {
					console.error(`Failed to clean up temporary files: ${err.message}`);
				}
			}, TIME_TO_RETAIN_FILES);
			
			return pngFilePath;
		}
		catch (error) {
			console.error(`Failed to convert text to image: ${error.message}`);
			throw error;
		}
	}

	return {
		NAME,
		ENV,
		SUPPORTED_FORMATS,
		TIME_TO_RETAIN_FILES,
		convertToPdf,
		textToImage,
	};
};