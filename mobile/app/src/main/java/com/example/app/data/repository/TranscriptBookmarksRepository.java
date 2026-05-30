package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.TranscriptBookmarksApi;
import com.example.app.data.remote.model.request.transcriptBookmarks.CreateTransBookmarksRequest;
import com.example.app.data.remote.model.request.transcriptBookmarks.UpdateTransBookmarksRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcriptBookmarks.TranscriptBookmarksResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

public class TranscriptBookmarksRepository {
    private final TranscriptBookmarksApi transcriptBookmarksApi;

    public TranscriptBookmarksRepository(Context context) {
        this.transcriptBookmarksApi = RetrofitClient.getInstance(context).getTranscriptBookmarksApi();
    }
    public void getTranscriptBookmarks(int lessonId, BaseCallback<ApiResponse<List<TranscriptBookmarksResponse>>> callback) {
        transcriptBookmarksApi.getTranscriptBookmarks(lessonId).enqueue(new ApiCallWrapper<>(callback));
    }
    public void createTranscriptBookmark(CreateTransBookmarksRequest request, BaseCallback<ApiResponse<TranscriptBookmarksResponse>> callback) {
        transcriptBookmarksApi.createTranscriptBookmark(request).enqueue(new ApiCallWrapper<>(callback));
    }
    public void updateTranscriptBookmark(int id, UpdateTransBookmarksRequest request, BaseCallback<ApiResponse<TranscriptBookmarksResponse>> callback) {
        transcriptBookmarksApi.updateTranscriptBookmark(id, request).enqueue(new ApiCallWrapper<>(callback));
    }
    public void deleteTranscriptBookmark(int id, BaseCallback<ApiResponse<TranscriptBookmarksResponse>> callback){
        transcriptBookmarksApi.deleteTranscriptBookmark(id).enqueue(new ApiCallWrapper<>(callback));
    }


}
