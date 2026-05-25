package com.example.app.data.remote.model.response.transcriptBookmarks;

import com.google.gson.annotations.SerializedName;

public class TranscriptBookmarksResponse {
    private int id;
    @SerializedName("user_id")
    private String userId;

    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("note")
    private String note;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public int getTranscriptId() {
        return transcriptId;
    }

    public String getNote() {
        return note;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
