const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(require('child_process').exec);
const os = require('os');

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

module.exports = ({ providerVars }) => {
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

	async function convertToPdf({ inputPath, outputPath }) {
		// Check LibreOffice availability before conversion
		await checkLibreOffice();

		try {
			const outDir = path.dirname(outputPath);
			await execPromise(`libreoffice --headless --convert-to pdf --outdir "${outDir}" "${inputPath}"`);
			const baseNamePdf = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
			const convertedPdfPath = path.join(outDir, baseNamePdf);
			
			if (convertedPdfPath !== outputPath) {
				fs.renameSync(convertedPdfPath, outputPath);
			}

			// Schedule cleanup of input file
			setTimeout(() => {
				fs.rmSync(inputPath, { force: true });
			}, TIME_TO_RETAIN_FILES);
			
			return outputPath;
		} catch (error) {
			throw new Error(`Failed to convert document to PDF: ${error.message}`);
		}
	}

	return {
		convertToPdf,
		SUPPORTED_FORMATS,
		TIME_TO_RETAIN_FILES,
	};
};