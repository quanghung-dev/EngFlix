package com.example.app.data.remote.model.request.transcriptBookmarks;

import com.google.gson.annotations.SerializedName;

public class CreateTransBookmarksRequest {
    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("note")
    private String note;

    public CreateTransBookmarksRequest(int transcriptId, String note) {
        this.transcriptId = transcriptId;
        this.note = note;
    }
}
