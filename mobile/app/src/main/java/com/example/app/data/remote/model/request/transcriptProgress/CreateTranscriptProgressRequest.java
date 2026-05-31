package com.example.app.data.remote.model.request.transcriptProgress;

import com.google.gson.annotations.SerializedName;

public class CreateTranscriptProgressRequest {
    @SerializedName("transcript_id")
    private int transcriptId;

    public CreateTranscriptProgressRequest(int transcriptId) {
        this.transcriptId = transcriptId;
    }
}
