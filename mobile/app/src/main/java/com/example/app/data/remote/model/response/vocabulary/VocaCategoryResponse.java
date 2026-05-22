package com.example.app.data.remote.model.response.vocabulary;

public class VocaCategoryResponse {
    private int id;
    private String name;
    private String description;
    private String created_at;
    private String updated_at;

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getUpdated_at() {
        return updated_at;
    }

    public String getCreated_at() {
        return created_at;
    }
}
