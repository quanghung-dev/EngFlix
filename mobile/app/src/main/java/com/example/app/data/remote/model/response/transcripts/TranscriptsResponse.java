package com.example.app.data.remote.model.response.transcripts;

import com.google.gson.annotations.SerializedName;

public class TranscriptsResponse {
    private String content;
    @SerializedName("end_timestamp")
    private float endTimestamp;
    private int id;
    private int lesson_id;
    private String phonetic;
    private int sequence;
    @SerializedName("start_timestamp")
    private float startTimestamp;
    private String vietnamese;

    public String getContent() {
        return content;
    }

    public float getEndTimestamp() {
        return endTimestamp;
    }

    public int getId() {
        return id;
    }

    public int getLesson_id() {
        return lesson_id;
    }

    public String getPhonetic() {
        return phonetic;
    }

    public int getSequence() {
        return sequence;
    }

    public float getStartTimestamp() {
        return startTimestamp;
    }

    public String getVietnamese() {
        return vietnamese;
    }
}
