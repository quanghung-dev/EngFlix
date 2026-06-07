package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.ProgressApi;
import com.example.app.data.remote.model.request.progress.CreateProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;
import com.example.app.data.remote.model.response.progress.ProgressSumaryResponse;
import com.example.app.data.remote.model.response.progress.ProgressSumarysResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.util.List;

public class ProgressRepository {
    private final ProgressApi progressApi;

    public ProgressRepository(Context context) {
        this.progressApi = RetrofitClient.getInstance(context).getProgressApi();
    }
    public void getProgress(BaseCallback<ApiResponse<List<ProgressResponse>>> callback) {
        progressApi.getProgress().enqueue(new ApiCallWrapper<>(callback));
    }
    public void createProgress(CreateProgressRequest request, BaseCallback<ApiResponse<ProgressResponse>> callback) {
        progressApi.createProgress(request).enqueue(new ApiCallWrapper<>(callback));
    }
    public void getProgressFinished(BaseCallback<ApiResponse<List<ProgressResponse>>> callback) {
        progressApi.getProgressFinished().enqueue(new ApiCallWrapper<>(callback));
    }

    public void getProgressUnfinished(BaseCallback<ApiResponse<List<ProgressResponse>>> callback) {
        progressApi.getProgressUnfinished().enqueue(new ApiCallWrapper<>(callback));
    }
    public void getProgressSummary(BaseCallback<ApiResponse<ProgressSumaryResponse>> callback) {
        progressApi.getProgressSummary().enqueue(new ApiCallWrapper<>(callback));
    }
    public void getProgressSumarys(int lessonId, BaseCallback<ApiResponse<ProgressSumarysResponse>> callback) {
        progressApi.getProgressSumarys(lessonId).enqueue(new ApiCallWrapper<>(callback));
    }

}
