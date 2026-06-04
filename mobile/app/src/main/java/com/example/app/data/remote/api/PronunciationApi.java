package com.example.app.data.remote.api;

import com.example.app.data.remote.model.request.pronunciation.ReviewRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationResponse;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public interface PronunciationApi {
    @Multipart
    @POST("pronunciation")
    Call<ApiResponse<PronunciationResponse>> createPronunciation(
            @Part MultipartBody.Part audio,
            @Part("referenceText") RequestBody referenceText
    );

}
