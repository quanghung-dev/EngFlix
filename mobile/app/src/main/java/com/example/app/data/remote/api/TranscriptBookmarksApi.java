package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.transcriptBookmarks.CreateTransBookmarksRequest;
import com.example.app.data.remote.model.request.transcriptBookmarks.UpdateTransBookmarksRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.transcriptBookmarks.TranscriptBookmarksResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.PUT;

public interface TranscriptBookmarksApi {
    @GET("transcript-bookmarks/{lessonId}")
    Call<ApiResponse<List<TranscriptBookmarksResponse>>> getTranscriptBookmarks(
            @Path("lessonId") int lessonId
    );

    @POST("transcript-bookmarks")
    Call<ApiResponse<TranscriptBookmarksResponse>> createTranscriptBookmark(
            @Body CreateTransBookmarksRequest request
    );

    @PUT("transcript-bookmarks/{id}")
    Call<ApiResponse<TranscriptBookmarksResponse>> updateTranscriptBookmark(
            @Path("id") int id,
            @Body UpdateTransBookmarksRequest request
    );

    @DELETE("transcript-bookmarks/{id}")
    Call<ApiResponse<TranscriptBookmarksResponse>> deleteTranscriptBookmark(
            @Path("id") int id
    );
}
