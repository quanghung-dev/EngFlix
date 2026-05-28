package com.example.app.data.remote.model.request.bookmarks;

import com.google.gson.annotations.SerializedName;

public class CreateBookMarksRequest {
    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("created_at")
    private String createdAt;

    public CreateBookMarksRequest(String userId, int lessonId, String createdAt) {
        this.userId = userId;
        this.lessonId = lessonId;
        this.createdAt = createdAt;
    }
}
