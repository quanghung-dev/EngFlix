const sdk = require("microsoft-cognitiveservices-speech-sdk");
require("dotenv").config();
const fs = require("fs");

const speechConfig =
    sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_REGION
    );

    const referenceText ="No problem. You're welcome. Don't worry about it.";

speechConfig.speechRecognitionLanguage = "en-US";
const audioBuffer = fs.readFileSync("test.wav");

const audioConfig =sdk.AudioConfig.fromWavFileInput(audioBuffer);

const recognizer =
    new sdk.SpeechRecognizer(
        speechConfig,
        audioConfig
    );

const pronunciationConfig =
    new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true
    );

pronunciationConfig.applyTo(recognizer);

recognizer.recognizeOnceAsync(result => {

    const assessment =
        sdk.PronunciationAssessmentResult.fromResult(result);

    console.log({
        accuracy: assessment.accuracyScore,
        fluency: assessment.fluencyScore,
        completeness: assessment.completenessScore,
        pronunciation: assessment.pronunciationScore
    });

    recognizer.close();
});