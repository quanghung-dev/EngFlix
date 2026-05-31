package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.TranscriptProgressApi;
import com.example.app.data.remote.model.request.transcriptProgress.CreateTranscriptProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcriptProgress.TranscriptProgressResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

public class TranscriptProgressRepository {
    private final TranscriptProgressApi transcriptProgressApi;

    public TranscriptProgressRepository(Context context) {
        this.transcriptProgressApi = RetrofitClient.getInstance(context).getTranscriptProgressApi();
    }

    public void getTranscriptProgress(int lessonId, BaseCallback<ApiResponse<List<TranscriptProgressResponse>>> callback) {
        transcriptProgressApi.getTranscriptProgress(lessonId).enqueue(new ApiCallWrapper<>(callback));
    }
    public void createTranscriptProgress(int lessonId,int transcriptId, BaseCallback<ApiResponse<TranscriptProgressResponse>> callback) {
        transcriptProgressApi.createTranscriptProgress(lessonId, new CreateTranscriptProgressRequest(transcriptId)).enqueue(new ApiCallWrapper<>(callback));
    }

}
