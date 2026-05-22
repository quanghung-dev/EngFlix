package com.example.app.data.remote.model.response.vocabulary;

public class VocaItemsResponse {
    private int id;
    private String deck_id;
    private int lesson_id;
    private int transcript_id;
    private String phrase;
    private String normalized_phrase;
    private String meaning;
    private String example_sentence;
    private String note;
    private String created_at;
    private String updated_at;

    public int getId() {
        return id;
    }

    public String getDeck_id() {
        return deck_id;
    }

    public int getLesson_id() {
        return lesson_id;
    }

    public int getTranscript_id() {
        return transcript_id;
    }

    public String getPhrase() {
        return phrase;
    }

    public String getNormalized_phrase() {
        return normalized_phrase;
    }

    public String getMeaning() {
        return meaning;
    }

    public String getExample_sentence() {
        return example_sentence;
    }

    public String getNote() {
        return note;
    }

    public String getCreated_at() {
        return created_at;
    }

    public String getUpdated_at() {
        return updated_at;
    }
}
