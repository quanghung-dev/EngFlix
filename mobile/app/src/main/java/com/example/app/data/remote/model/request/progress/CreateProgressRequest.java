package com.example.app.data.remote.model.request.progress;

import com.google.gson.annotations.SerializedName;

public class CreateProgressRequest {
    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("duration_watched")
    private int durationWatched;

    @SerializedName("completed")
    private boolean completed;

    public CreateProgressRequest(int lessonId, int durationWatched, boolean completed) {
        this.lessonId = lessonId;
        this.durationWatched = durationWatched;
        this.completed = completed;
    }
}
