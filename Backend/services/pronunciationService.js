const fs = require("fs");
const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
const { formatPronunciationResponse } = require("../utils/formatPronunciationResponse");

const assessPronunciation = async (filePath, referenceText) => {
  return new Promise((resolve, reject) => {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(filePath)
    );

    const pronunciationConfig = new speechsdk.PronunciationAssessmentConfig(
      referenceText,
      speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
      speechsdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );

    pronunciationConfig.enableProsodyAssessment = true;

    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason !== speechsdk.ResultReason.RecognizedSpeech) {
          return reject(new Error("Speech was not recognized"));
        }

        try {
          const rawJson = result.properties.getProperty(
            speechsdk.PropertyId.SpeechServiceResponse_JsonResult
          );

          if (!rawJson) {
            return reject(new Error("Azure Speech did not return an assessment result"));
          }

          const json = JSON.parse(rawJson);

          return resolve(formatPronunciationResponse(json));
        } catch (error) {
          return reject(error);
        }
      },
      (err) => {
        recognizer.close();
        reject(err);
      }
    );
  });
};

module.exports = {
  assessPronunciation,
};
