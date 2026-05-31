package com.example.app.data.remote.model.response.transcriptProgress;

import com.google.gson.annotations.SerializedName;

public class TranscriptProgressResponse {
    @SerializedName("user_id")
    private String userId;

    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("completed_at")
    private String completedAt;

    public String getUserId() {
        return userId;
    }

    public int getTranscriptId() {
        return transcriptId;
    }

    public int getLessonId() {
        return lessonId;
    }

    public String getCompletedAt() {
        return completedAt;
    }
}
