const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

module.exports = ({ providerVars }) => {

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

	return {
		convertToPdf,
	}
};