package com.example.app.data.remote.model.response.pronunciation;

import java.util.List;

public class PronunciationResponse {
    private String text;
    private double overallScore;
    private Scores scores;
    private String feedback;
    private List<Words> words;
    private Attempts attempt;

    public Attempts getAttempt() {
        return attempt;
    }

    public String getText() {
        return text;
    }

    public double getOverallScore() {
        return overallScore;
    }

    public Scores getScores() {
        return scores;
    }

    public String getFeedback() {
        return feedback;
    }

    public List<Words> getWords() {
        return words;
    }
    public static class Attempts {
        private int id;
        private String userId;
        private int lessonId;
        private int transcriptId;
        private String createdAt;

        public int getId() {
            return id;
        }

        public String getUserId() {
            return userId;
        }

        public int getLessonId() {
            return lessonId;
        }

        public int getTranscriptId() {
            return transcriptId;
        }

        public String getCreatedAt() {
            return createdAt;
        }
    }

    public static class Words{
        private String word;
        private double score;
        private String feedback;
        private List<WeakPhonemes> weakPhonemes;

        public String getWord() {
            return word;
        }

        public double getScore() {
            return score;
        }

        public String getFeedback() {
            return feedback;
        }

        public List<WeakPhonemes> getWeakPhonemes() {
            return weakPhonemes;
        }
    }
    public static class WeakPhonemes{
        private String phoneme;
        private double score;

        public String getPhoneme() {
            return phoneme;
        }

        public double getScore() {
            return score;
        }
    }
    public static class Scores{
        private double accuracy;
        private double fluency;
        private double completeness;
        private double prosody;

        public double getAccuracy() {
            return accuracy;
        }

        public double getFluency() {
            return fluency;
        }

        public double getCompleteness() {
            return completeness;
        }

        public double getProsody() {
            return prosody;
        }
    };
}
