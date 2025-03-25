const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

// Import our transcription provider directly for testing
const googleTranscriptionProvider = require('./providers/@google/transcription')({
  providerVars: {
    // Path to your Google credentials file
    keyFilename: './gcp-transcription.json',
  },
  providerName: '@google/transcription'
});

// Create a temporary directory for the test files if it doesn't exist
if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp');
}

// Paths for the test audio files
const tempAiffPath = './temp/temp-audio.aiff';
const testAudioPath = './temp/test-audio.wav';

// Text to be converted to speech
const testText = 'This is a test of the speech to text transcription service.';

async function runTest() {
  try {
    console.log('Step 1: Generating test audio file using macOS say command...');
    
    // First create an AIFF file (macOS native format)
    await execPromise(`say -v Samantha "${testText}" -o ${tempAiffPath}`);
    
    // Then convert it to WAV format with proper settings for Google Speech API
    await execPromise(`ffmpeg -y -i ${tempAiffPath} -acodec pcm_s16le -ac 1 -ar 16000 ${testAudioPath}`);
    
    console.log(`Test audio created at ${testAudioPath}`);
    console.log(`Supported formats: ${Object.keys(googleTranscriptionProvider.SUPPORTED_FORMATS).join(', ')}`);

    console.log('\nStep 2: Testing Google transcription provider...');
    console.log('Transcribing audio...');
    
    // No need to specify encoding or sample rate - they'll be auto-detected from the .wav extension
    const result = await googleTranscriptionProvider.transcribe({
      audio: testAudioPath,
      languageCode: 'en-US',
    });

    console.log('\nTranscription result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nOriginal text:');
    console.log(testText);
    
    console.log('\nTranscribed text:');
    console.log(result.text);
    
  } catch (error) {
    console.error('Error during test:', error);
    if (error.message && error.message.includes('ffmpeg')) {
      console.log('\nError: ffmpeg is required for audio conversion.');
      console.log('Install it with: brew install ffmpeg (on macOS)');
    }
  }
}

runTest(); 