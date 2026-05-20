package com.example.app.data.remote.api;

import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface TranscriptsApi {
    @GET("lessons/{lessonId}/transcripts")
    Call<ApiResponse<List<TranscriptsResponse>>> getTranscripts(
            @Path("lessonId") int lessonId
    );
}
