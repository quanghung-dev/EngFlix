package com.example.app.data.remote.model.response.bookmarks;

import com.google.gson.annotations.SerializedName;

public class BookmarksResponse {
    @SerializedName("user_id")
    private String userId;

    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("category_id")
    private int categoryId;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("video_url")
    private String videoUrl;

    @SerializedName("thumbnail_url")
    private String thumbnailUrl;

    @SerializedName("level")
    private String level;

    @SerializedName("duration")
    private int duration;

    public BookmarksResponse(
            String userId,
            int lessonId,
            String createdAt,
            int categoryId,
            String title,
            String description,
            String videoUrl,
            String thumbnailUrl,
            String level,
            int duration
    ) {
        this.userId = userId;
        this.lessonId = lessonId;
        this.createdAt = createdAt;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.videoUrl = videoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.level = level;
        this.duration = duration;
    }

    public String getUserId() {
        return userId;
    }

    public int getLessonId() {
        return lessonId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getLevel() {
        return level;
    }

    public int getDuration() {
        return duration;
    }
}
