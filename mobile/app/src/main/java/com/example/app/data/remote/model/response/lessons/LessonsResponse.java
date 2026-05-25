package com.example.app.data.remote.model.response.lessons;

import com.google.gson.annotations.SerializedName;

public class LessonsResponse {

    @SerializedName("category_id")
    private int categoryId ;
    @SerializedName("created_at")
    private String createdAt ;
    @SerializedName("description")
    private String description ;
    @SerializedName("duration")
    private int duration ;
    @SerializedName("id")
    private int id ;
    @SerializedName("level")
    private String level ;
    @SerializedName("thumbnail_url")
    private String thumbnailUrl ;
    @SerializedName("title")
    private String title ;
    @SerializedName("video_url")
    private String videoUrl ;
    @SerializedName("is_completed")
    private Boolean isCompleted;

    public String getDescription() {
        return description;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public int getDuration() {
        return duration;
    }

    public int getId() {
        return id;
    }

    public String getLevel() {
        return level;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getTitle() {
        return title;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public Boolean is_completed() {
        return isCompleted;
    }
}
