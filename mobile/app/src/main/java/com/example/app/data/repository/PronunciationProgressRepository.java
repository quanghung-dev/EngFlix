package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.PronunciationApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationProgressResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

public class PronunciationProgressRepository {
    private final PronunciationApi pronunciationApi;

    public PronunciationProgressRepository(Context context) {
        this.pronunciationApi = RetrofitClient.getInstance(context).getPronunciationApi();
    }
    public void getPronunciationProgress(int lessonId, BaseCallback<ApiResponse<List<PronunciationProgressResponse>>> callback) {
        pronunciationApi.getPronunciationProgress(lessonId).enqueue(new ApiCallWrapper<>(callback));
    }
    public void updatePronunciationProgress(int transcriptId, BaseCallback<ApiResponse<PronunciationProgressResponse>> callback) {
        pronunciationApi.updatePronunciationProgress(transcriptId).enqueue(new ApiCallWrapper<>(callback));
    }
}
