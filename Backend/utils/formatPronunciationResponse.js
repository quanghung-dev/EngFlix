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

const getWordFeedback = (weakPhonemes) => {
  if (!weakPhonemes.length) {
    return "Ph\u00e1t \u00e2m t\u1ed1t.";
  }

  const phonemes = weakPhonemes.map((p) => `/${p.phoneme}/`).join(", ");

  return `C\u1ea7n ph\u00e1t \u00e2m r\u00f5 h\u01a1n \u00e2m ${phonemes}.`;
};

const formatPronunciationResponse = (azureResult) => {
  const nbest = azureResult.NBest?.[0];
  const recognizedText = azureResult.DisplayText || nbest?.Display || "";
  const scores = nbest?.PronunciationAssessment || {};
  const words = nbest?.Words || [];

  const formattedWords = words.map((word) => {
    const phonemes = word.Phonemes || [];

    const weakPhonemes = phonemes
      .filter((phoneme) => {
        const score = phoneme.PronunciationAssessment?.AccuracyScore ?? 100;
        return score < 80;
      })
      .map((phoneme) => ({
        phoneme: phoneme.Phoneme,
        score: phoneme.PronunciationAssessment?.AccuracyScore ?? 0,
      }));

    return {
      word: word.Word,
      score: word.PronunciationAssessment?.AccuracyScore ?? 0,
      feedback: getWordFeedback(weakPhonemes),
      weakPhonemes,
    };
  });

  const weakWords = formattedWords.filter((word) => word.weakPhonemes.length > 0);

  return {
    text: recognizedText,
    overallScore: scores.PronScore ?? 0,
    scores: {
      accuracy: scores.AccuracyScore ?? 0,
      fluency: scores.FluencyScore ?? 0,
      completeness: scores.CompletenessScore ?? 0,
      prosody: scores.ProsodyScore ?? 0,
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
