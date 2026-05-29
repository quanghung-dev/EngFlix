package com.example.app.data.remote.model.request.bookmarks;

import com.google.gson.annotations.SerializedName;

public class CreateBookMarksRequest {
    @SerializedName("transcriptId")
    private int transcriptId;

    @SerializedName("note")
    private String note;

    public CreateBookMarksRequest(int transcriptId, String note) {
        this.transcriptId = transcriptId;
        this.note = note;
    }

    public int getTranscriptId() {
        return transcriptId;
    }

    public String getNote() {
        return note;
    }
}
