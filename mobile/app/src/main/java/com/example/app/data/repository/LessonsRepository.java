package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.LessonsApi;
import com.example.app.data.remote.model.request.lessons.CreateLessonRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LessonsRepository {

    private LessonsApi lessonsApi;

    public LessonsRepository(Context context) {
        this.lessonsApi = RetrofitClient.getInstance(context).getLessonsApi();
    }

    public interface lessonsCallback<T> {
        void onSuccess(T data);

        void onError(String message);
    }

    public void getLessons(int limit, int page, String search, int categoryId, String level, lessonsCallback<ApiResponse<List<LessonsResponse>>> callback) {
        lessonsApi.getLessons(limit, page, search, categoryId, level).enqueue(new Callback<ApiResponse<List<LessonsResponse>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<LessonsResponse>>> call, Response<ApiResponse<List<LessonsResponse>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    try {
                        String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                        callback.onError(errorDetail);
                    } catch (Exception e) {
                        callback.onError(e.getMessage());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<LessonsResponse>>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }

    public void getLessonsDetail(int lessonId, lessonsCallback<LessonsResponse> callback) {
        lessonsApi.getLessonsDetail(lessonId).enqueue(new Callback<ApiResponse<LessonsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<LessonsResponse>> call, Response<ApiResponse<LessonsResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LessonsResponse lessonData = response.body().getData();
                    callback.onSuccess(lessonData);
                } else {
                    try {
                        String errorDetail = response.errorBody() != null ? response.errorBody().string() : "Lỗi không xác định";
                        callback.onError(errorDetail);
                    } catch (Exception e){
                        callback.onError(e.getMessage());
                    }
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<LessonsResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }
    public void createLesson(CreateLessonRequest request, lessonsCallback<ApiResponse<LessonsResponse>> callback) {
        lessonsApi.createLesson(request).enqueue(new Callback<ApiResponse<LessonsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<LessonsResponse>> call, Response<ApiResponse<LessonsResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<LessonsResponse>> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
    }
}
