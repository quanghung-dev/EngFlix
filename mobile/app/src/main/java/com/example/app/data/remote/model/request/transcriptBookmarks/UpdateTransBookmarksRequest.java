package com.example.app.data.remote.model.request.transcriptBookmarks;

import com.google.gson.annotations.SerializedName;

public class UpdateTransBookmarksRequest {
    @SerializedName("note")
    private String note;
    public UpdateTransBookmarksRequest(String note) {
        this.note = note;
    }
}
