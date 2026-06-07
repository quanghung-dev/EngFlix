package com.example.app.data.remote.model.request.progress;

import com.google.gson.annotations.SerializedName;

public class CreateProgressRequest {
    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("completed_dictation")
    private Boolean completedDictation;

    @SerializedName("completed_pronunciation")
    private Boolean completedPronunciation;

    public CreateProgressRequest(int lessonId, Boolean completedDictation, Boolean completedPronunciation) {
        this.lessonId = lessonId;
        this.completedDictation = completedDictation;
        this.completedPronunciation = completedPronunciation;
    }
}
