package com.example.app.data.remote.model.response.progress;

import com.google.gson.annotations.SerializedName;

public class ProgressResponse {
    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("duration_watched")
    private int durationWatched;

    @SerializedName("completed")
    private boolean completed;

    @SerializedName("created_at")
    private String createdAt;

    public String getUserId() {
        return userId;
    }

    public int getLessonId() {
        return lessonId;
    }

    public int getDurationWatched() {
        return durationWatched;
    }

    public boolean isCompleted() {
        return completed;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
