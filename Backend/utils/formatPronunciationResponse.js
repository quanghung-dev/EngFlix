const buildFeedback = ({ overallScore, prosodyScore, weakWords }) => {
  const feedback = [];

  if (overallScore >= 90) {
    feedback.push("B\u1ea1n ph\u00e1t \u00e2m r\u1ea5t t\u1ed1t.");
  } else if (overallScore >= 80) {
    feedback.push("B\u1ea1n ph\u00e1t \u00e2m kh\u00e1 t\u1ed1t.");
  } else if (overallScore >= 60) {
    feedback.push("B\u1ea1n c\u1ea7n luy\u1ec7n ph\u00e1t \u00e2m r\u00f5 h\u01a1n.");
  } else {
    feedback.push("B\u1ea1n c\u1ea7n luy\u1ec7n l\u1ea1i c\u00e2u n\u00e0y nhi\u1ec1u h\u01a1n.");
  }

  if (prosodyScore && prosodyScore < 75) {
    feedback.push("Ng\u1eef \u0111i\u1ec7u c\u00f2n h\u01a1i \u0111\u1ec1u, c\u1ea7n nh\u1ea5n nh\u00e1 t\u1ef1 nhi\u00ean h\u01a1n.");
  }

  if (weakWords.length > 0) {
    feedback.push("M\u1ed9t s\u1ed1 \u00e2m trong c\u00e2u ph\u00e1t \u00e2m ch\u01b0a r\u00f5.");
  }

  return feedback.join(" ");
};

const getWordFeedback = (weakPhonemes, syllables) => {
  const feedback = [];

  if (weakPhonemes.length > 0) {
    const phonemes = weakPhonemes.map((p) => `/${p.phoneme}/`).join(", ");
    feedback.push(`Cần phát âm rõ hơn âm ${phonemes}.`);
  }

  const stressError = syllables.find(s => s.stressStatus === "UnexpectedStress" || s.stressStatus === "MissingStress");
  if (stressError) {
    if (stressError.stressStatus === "MissingStress") {
      feedback.push(`Cần nhấn trọng âm vào âm tiết "${stressError.syllable}".`);
    } else {
      feedback.push(`Không cần nhấn trọng âm vào âm tiết "${stressError.syllable}".`);
    }
  }

  if (feedback.length === 0) {
    return "Phát âm tốt.";
  }

  return feedback.join(" ");
};

const formatPronunciationResponse = (azureResult) => {
  const nbest = azureResult.NBest?.[0];
  const recognizedText = azureResult.DisplayText || nbest?.Display || "";
  const scores = nbest?.PronunciationAssessment || {};
  const words = nbest?.Words || [];

  const formattedWords = words.map((word) => {
    const phonemes = word.Phonemes || [];
    const rawSyllables = word.Syllables || [];

    const weakPhonemes = phonemes
      .filter((phoneme) => {
        const score = phoneme.PronunciationAssessment?.AccuracyScore ?? 100;
        return score < 80;
      })
      .map((phoneme) => ({
        phoneme: phoneme.Phoneme,
        score: phoneme.PronunciationAssessment?.AccuracyScore ?? 0,
      }));

    const syllables = rawSyllables.map((s) => ({
      syllable: s.Syllable,
      score: s.PronunciationAssessment?.AccuracyScore ?? 0,
      stressStatus: s.PronunciationAssessment?.StressStatus ?? "Correct",
    }));

    return {
      word: word.Word,
      score: word.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: word.PronunciationAssessment?.ErrorType ?? "None",
      feedback: getWordFeedback(weakPhonemes, syllables),
      weakPhonemes,
      syllables,
    };
  });

  const weakWords = formattedWords.filter((word) => word.weakPhonemes.length > 0);

  const firstWord = words[0];
  const lastWord = words[words.length - 1];
  let wpm = 0;
  if (firstWord && lastWord) {
    const duration100ns = (lastWord.Offset + lastWord.Duration) - firstWord.Offset;
    const durationSeconds = duration100ns / 10000000;
    if (durationSeconds > 0) {
      wpm = Math.round((words.length / durationSeconds) * 60);
    }
  }

  return {
    text: recognizedText,
    overallScore: scores.PronScore ?? 0,
    scores: {
      accuracy: scores.AccuracyScore ?? 0,
      fluency: scores.FluencyScore ?? 0,
      completeness: scores.CompletenessScore ?? 0,
      prosody: scores.ProsodyScore ?? 0,
      speakingRate: wpm,
    },
    feedback: buildFeedback({
      overallScore: scores.PronScore ?? 0,
      prosodyScore: scores.ProsodyScore ?? 0,
      weakWords,
    }),
    words: formattedWords,
  };
};

module.exports = {
  formatPronunciationResponse,
};
