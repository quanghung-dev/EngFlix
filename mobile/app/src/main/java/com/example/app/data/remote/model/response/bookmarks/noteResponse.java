package com.example.app.data.remote.model.response.bookmarks;

import com.google.gson.annotations.SerializedName;

public class noteResponse {
    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("content")
    private String content;

    @SerializedName("phonetic")
    private String phonetic;

    @SerializedName("vietnamese")
    private String vietnamese;

    @SerializedName("note")
    private String note;

    @SerializedName("created_at")
    private String createdAt;


    public int getTranscriptId() {
        return transcriptId;
    }

    public String getContent() {
        return content;
    }

    public String getPhonetic() {
        return phonetic;
    }

    public String getVietnamese() {
        return vietnamese;
    }

    public String getNote() {
        return note;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
