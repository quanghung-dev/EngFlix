package com.example.app.data.remote.model.response.categories;

import com.google.gson.annotations.SerializedName;

public class CategoryResponse {
    private int id;
    private String name;
    @SerializedName("created_at")
    private String createdAt;

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
