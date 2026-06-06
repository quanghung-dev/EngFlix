package com.example.app.data.remote.model.response.pronunciation;

import com.google.gson.annotations.SerializedName;

public class PronunciationAttemptsResponse {
    @SerializedName("id")
    private int id;

    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("reference_text")
    private String referenceText;

    @SerializedName("overall_score")
    private double overallScore;

    @SerializedName("accuracy_score")
    private double accuracyScore;

    @SerializedName("fluency_score")
    private double fluencyScore;

    @SerializedName("completeness_score")
    private double completenessScore;

    @SerializedName("prosody_score")
    private double prosodyScore;

    @SerializedName("created_at")
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

    public String getReferenceText() {
        return referenceText;
    }

    public double getOverallScore() {
        return overallScore;
    }

    public double getAccuracyScore() {
        return accuracyScore;
    }

    public double getFluencyScore() {
        return fluencyScore;
    }

    public double getCompletenessScore() {
        return completenessScore;
    }

    public double getProsodyScore() {
        return prosodyScore;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
