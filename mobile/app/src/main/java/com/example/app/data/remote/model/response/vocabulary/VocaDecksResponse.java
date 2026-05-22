package com.example.app.data.remote.model.response.vocabulary;

import com.google.gson.annotations.SerializedName;

public class VocaDecksResponse {
    private int id;

    @SerializedName("user_id")
    private String userId; // Chuẩn camelCase

    @SerializedName("category_id")
    private int categoryId;

    private String name;
    private String description;

    @SerializedName("thumbnail_url")
    private String thumbnailUrl;

    private String level;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    @SerializedName("is_default")
    private boolean isDefault;

    public String getUserId() {
        return userId;
    }

    public int getId() {
        return id;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getLevel() {
        return level;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public boolean isDefault() {
        return isDefault;
    }
}
