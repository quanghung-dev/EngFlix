package com.example.app.data.remote.model.response.bookmarks;

import com.google.gson.annotations.SerializedName;
import java.util.List;
public class BookmarksModel {
    @SerializedName("lesson_id")
    private int lessonId;
    @SerializedName("lesson_title")
    private String lessonTitle;

    @SerializedName("transcripts")
    private List<noteResponse> transcripts;

    public BookmarksModel(int lessonId, List<noteResponse> transcripts) {
        this.lessonId = lessonId;
        this.transcripts = transcripts;
    }

    public int getLessonId() {
        return lessonId;
    }
    public String getLessonTitle() {
        return lessonTitle;
    }

    public List<noteResponse> getTranscripts() {
        return transcripts;
    }

    public static class Transcript {

        @SerializedName("transcript_id")
        private int transcriptId;

        @SerializedName("content")
        private String content;

        @SerializedName("phonetic")
        private String phonetic;

        @SerializedName("vietnamese")
        private String vietnamese;

        @SerializedName("note")
        private String note;

        @SerializedName("created_at")
        private String createdAt;


        public int getTranscriptId() {
            return transcriptId;
        }

        public String getContent() {
            return content;
        }

        public String getPhonetic() {
            return phonetic;
        }

        public String getVietnamese() {
            return vietnamese;
        }

        public String getNote() {
            return note;
        }

        public String getCreatedAt() {
            return createdAt;
        }
    }
}
