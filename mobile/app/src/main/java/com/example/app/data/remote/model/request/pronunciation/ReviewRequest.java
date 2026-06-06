package com.example.app.data.remote.model.request.pronunciation;

public class ReviewRequest {
    private String referenceText;
    private int lessonId;
    private int transcriptId;

    public ReviewRequest(String referenceText, int lessonId, int transcriptId) {
        this.referenceText = referenceText;
        this.lessonId = lessonId;
        this.transcriptId = transcriptId;
    }
}
