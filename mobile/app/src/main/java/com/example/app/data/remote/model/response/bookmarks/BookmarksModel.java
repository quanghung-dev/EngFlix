package com.example.app.data.remote.model.response.bookmarks;

import com.google.gson.annotations.SerializedName;
import java.util.List;
public class BookmarksModel {
    @SerializedName("lesson_id")
    private int lessonId;

    @SerializedName("transcripts")
    private List<Transcript> transcripts;

    public BookmarksModel(int lessonId, List<Transcript> transcripts) {
        this.lessonId = lessonId;
        this.transcripts = transcripts;
    }

    public int getLessonId() {
        return lessonId;
    }

    public List<Transcript> getTranscripts() {
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

        public Transcript(
                int transcriptId,
                String content,
                String phonetic,
                String vietnamese,
                String note,
                String createdAt
        ) {
            this.transcriptId = transcriptId;
            this.content = content;
            this.phonetic = phonetic;
            this.vietnamese = vietnamese;
            this.note = note;
            this.createdAt = createdAt;
        }

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
