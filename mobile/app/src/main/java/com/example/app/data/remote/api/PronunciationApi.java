package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.pronunciation.ReviewRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationAttemptsResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationProgressResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationResponse;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public interface PronunciationApi {
    @Multipart
    @POST("pronunciation-attempts")
    Call<ApiResponse<PronunciationResponse>> assessPronunciation(
            @Part MultipartBody.Part audio,
            @Part("referenceText") RequestBody referenceText,
            @Part("lessonId") RequestBody lessonId,
            @Part("transcriptId") RequestBody transcriptId
    );

    @DELETE("pronunciation/attempts/{attemptId}")
    Call<ApiResponse<PronunciationAttemptsResponse>> deletePronunciationAttempt(
            @Path("attemptId") int attemptId
    );

    @GET("pronunciation/progress/{lessonId}")
    Call<ApiResponse<List<PronunciationProgressResponse>>> getPronunciationProgress(
            @Path("lessonId") int lessonId
    );

   @POST("pronunciation/progress/update/{transcriptId}")
   Call<ApiResponse<PronunciationProgressResponse>> updatePronunciationProgress(
           @Path("transcriptId") int transcriptId
   );

}
