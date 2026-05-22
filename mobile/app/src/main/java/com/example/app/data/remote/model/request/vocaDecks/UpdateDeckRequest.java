package com.example.app.data.remote.model.request.vocaDecks;

import com.google.gson.annotations.SerializedName;

public class UpdateDeckRequest {
    @SerializedName("name")
    private String name;

    @SerializedName("description")
    private String description;

    @SerializedName("level")
    private String level;

    @SerializedName("thumbnail_url")
    private String thumbnailUrl;

    public UpdateDeckRequest(String name,
                                 String description,
                                 String level,
                                 String thumbnailUrl) {
        this.name = name;
        this.description = description;
        this.level = level;
        this.thumbnailUrl = thumbnailUrl;
    }
}
