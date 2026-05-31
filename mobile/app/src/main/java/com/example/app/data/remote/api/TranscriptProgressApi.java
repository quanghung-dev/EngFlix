package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.transcriptProgress.CreateTranscriptProgressRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcriptProgress.TranscriptProgressResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface TranscriptProgressApi {
    @GET("transcript-progress/{lessonId}")
    Call<ApiResponse<List<TranscriptProgressResponse>>>
    getTranscriptProgress(@Path("lessonId") int lessonId);

    @POST("transcript-progress/{lessonId}")
    Call<ApiResponse<TranscriptProgressResponse>>
    createTranscriptProgress(@Path("lessonId") int lessonId,
                             @Body CreateTranscriptProgressRequest request);

}
