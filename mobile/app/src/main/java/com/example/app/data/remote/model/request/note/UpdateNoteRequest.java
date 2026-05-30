package com.example.app.data.remote.model.request.note;

import com.google.gson.annotations.SerializedName;

public class UpdateNoteRequest {
    @SerializedName("note")
    private String note;

    public UpdateNoteRequest(String note) {
        this.note = note;
    }
}
