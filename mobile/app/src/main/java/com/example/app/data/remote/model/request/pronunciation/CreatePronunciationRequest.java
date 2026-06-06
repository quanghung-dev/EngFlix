package com.example.app.data.remote.model.request.pronunciation;

import com.google.gson.annotations.SerializedName;

public class CreatePronunciationRequest {
    private int transcript_id;

    public CreatePronunciationRequest(int transcript_id) {
        this.transcript_id = transcript_id;
    }
}
