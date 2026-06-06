const fs = require("fs");
const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
const pool = require("../db/index");
const { formatPronunciationResponse } = require("../utils/formatPronunciationResponse");

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildAttemptValues = ({ userId, lessonId, transcriptId, referenceText, assessment }) => [
  userId,
  lessonId,
  transcriptId,
  referenceText,
  assessment.overallScore ?? 0,
  assessment.scores?.accuracy ?? 0,
  assessment.scores?.fluency ?? 0,
  assessment.scores?.completeness ?? 0,
  assessment.scores?.prosody ?? 0,
  JSON.stringify(assessment.words ?? []),
];

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

const savePronunciationAttempt = async (payload) => {
  const query = `
    WITH target_transcript AS (
      SELECT id, lesson_id FROM transcripts WHERE id = $3 AND lesson_id = $2
    )
    INSERT INTO pronunciation_attempts (
      user_id, lesson_id, transcript_id, reference_text,
      overall_score, accuracy_score, fluency_score, completeness_score,
      prosody_score, words_json
    )
    SELECT $1, lesson_id, id, $4, $5, $6, $7, $8, $9, $10::jsonb
    FROM target_transcript
    RETURNING *
  `;

  const result = await pool.query(query, buildAttemptValues(payload));
  if (!result.rows[0]) {
    throw createHttpError("Transcript not found for this lesson", 404);
  }
  return result.rows[0];
};

const createPronunciationAttempt = async ({
  filePath,
  referenceText,
  user_id,
  lessonId,
  transcriptId,
}) => {
  const assessment = await assessPronunciation(filePath, referenceText);
  const savedAttempt = await savePronunciationAttempt({
    userId: user_id,
    lessonId,
    transcriptId,
    referenceText,
    assessment,
  });

  return {
    ...assessment,
    attempt: {
      id: savedAttempt.id,
      userId: savedAttempt.user_id,
      lessonId: savedAttempt.lesson_id,
      transcriptId: savedAttempt.transcript_id,
      createdAt: savedAttempt.created_at,
    },
  };
};

module.exports = {
  createPronunciationAttempt,
};
