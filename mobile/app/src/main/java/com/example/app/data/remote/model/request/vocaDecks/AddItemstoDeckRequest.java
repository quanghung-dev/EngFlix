package com.example.app.data.remote.model.request.vocaDecks;

import com.google.gson.annotations.SerializedName;

public class AddItemsToDeckRequest {
    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("transcript_id")
    private int transcriptId;

    @SerializedName("phrase")
    private String phrase;

    @SerializedName("normalized_phrase")
    private String normalizedPhrase;

    @SerializedName("meaning")
    private String meaning;

    @SerializedName("example_sentence")
    private String exampleSentence;

    @SerializedName("note")
    private String note;

    public AddItemsToDeckRequest(int lessonId, int transcriptId, String phrase,
                         String normalizedPhrase, String meaning,
                         String exampleSentence, String note) {
        this.lessonId = lessonId;
        this.transcriptId = transcriptId;
        this.phrase = phrase;
        this.normalizedPhrase = normalizedPhrase;
        this.meaning = meaning;
        this.exampleSentence = exampleSentence;
        this.note = note;
    }
}
