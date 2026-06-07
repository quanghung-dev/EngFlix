package com.example.app.data.remote.model.response.progress;

import com.google.gson.annotations.SerializedName;

public class ProgressResponse {
    @SerializedName("id")
    private int id;

    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("completed_dictation")
    private Boolean completedDictation;

    @SerializedName("completed_pronunciation")
    private Boolean completedPronunciation;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    public int getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public int getLessonId() {
        return lessonId;
    }

    public Boolean getCompletedDictation() {
        return completedDictation;
    }

    public Boolean getCompletedPronunciation() {
        return completedPronunciation;
    }

    public boolean isCompleted() {
        return Boolean.TRUE.equals(completedDictation) && Boolean.TRUE.equals(completedPronunciation);
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }
}
