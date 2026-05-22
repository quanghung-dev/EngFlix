package com.example.app.data.remote.model.request.vocaDecks;

import com.google.gson.annotations.SerializedName;

public class CreateVocaDeckRequest {
    @SerializedName("category_id")
    private int categoryId;
    private String name;
    private String description;
    private String level;
    @SerializedName("thumbnail_url")
    private String thumbnailUrl;

    public CreateVocaDeckRequest(int categoryId, String name, String description, String level, String thumbnailUrl) {
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.level = level;
        this.thumbnailUrl = thumbnailUrl;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}
