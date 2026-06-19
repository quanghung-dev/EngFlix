package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.lessons.CreateLessonRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface LessonsApi {

    @GET("lessons")
    Call<ApiResponse<List<LessonsResponse>>> getLessons(
        @Query("limit") int limit,
        @Query("page") int page,
        @Query("search") String search,
        @Query("category_id") Integer categoryId,
        @Query("level") String level
    );

    @GET("lessons/{lessonId}")
    Call<ApiResponse<LessonsResponse>>getLessonsDetail(
            @Path("lessonId") int lessonId
    );

    @POST("admin/lessons/youtube")
    Call<ApiResponse<LessonsResponse>> createLesson(@Body CreateLessonRequest request);




}
