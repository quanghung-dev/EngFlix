package com.example.app.data.remote.model.request.lessons;

public class CreateLessonRequest {
    private int category_id;
    private String youtube_url;

    public CreateLessonRequest(int category_id, String youtube_url) {
        this.category_id = category_id;
        this.youtube_url = youtube_url;
    }
}
