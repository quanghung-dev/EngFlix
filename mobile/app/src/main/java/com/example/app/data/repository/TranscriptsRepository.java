package com.example.app.data.repository;

import android.app.ActivityManager;
import android.content.Context;

import androidx.annotation.NonNull;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.TranscriptsApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TranscriptsRepository {
    private final TranscriptsApi transcriptsApi;

    public TranscriptsRepository(Context context) {
        this.transcriptsApi = RetrofitClient.getInstance(context).getTranscriptsApi();
    }

    public interface TranscriptsCallback {
        void onSuccess(List<TranscriptsResponse> data);

        void onError(String message);
    }

    public void getTranscripts(int lessonId, TranscriptsCallback callback) {
        transcriptsApi.getTranscripts(lessonId).enqueue(new Callback<ApiResponse<List<TranscriptsResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<TranscriptsResponse>>> call, Response<ApiResponse<List<TranscriptsResponse>>> response) {
                if (response.isSuccessful() && response.body() != null  ){
                    List<TranscriptsResponse> transcriptsData = response.body().getData();
                    callback.onSuccess(transcriptsData);
                }
                else {
                    try {
                        String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                        callback.onError(errorDetail);
                    } catch (Exception e){
                        callback.onError(e.getMessage());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<TranscriptsResponse>>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });

    }
}
