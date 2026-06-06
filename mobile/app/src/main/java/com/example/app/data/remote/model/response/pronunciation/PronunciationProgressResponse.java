package com.example.app.data.remote.model.response.pronunciation;

import com.google.gson.annotations.SerializedName;

public class PronunciationProgressResponse {
    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("best_attempt_id")
    private Integer bestAttemptId;

    @SerializedName("best_score")
    private Double bestScore;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;
    private String feedback;
    public String getFeedback() {
        return feedback;
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

    public Integer getBestAttemptId() {
        return bestAttemptId;
    }

    public Double getBestScore() {
        return bestScore;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }
}
