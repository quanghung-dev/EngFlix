package com.example.app.data.repository;

import android.content.Context;

import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.PronunciationApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationAttemptsResponse;
import com.example.app.data.remote.model.response.pronunciation.PronunciationResponse;
import com.example.app.utils.ApiCallWrapper;
import com.example.app.utils.BaseCallback;

import java.io.File;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;

public class PronunciationAttemptsRepository {
    private final PronunciationApi pronunciationApi;

    public PronunciationAttemptsRepository(Context context) {
        this.pronunciationApi = RetrofitClient.getInstance(context).getPronunciationApi();
    }

    public void assessPronunciation(
            File audioFile,
            String referenceText,
            int lessonId,
            int transcriptId,
            BaseCallback<ApiResponse<PronunciationResponse>> callback
    ) {
        if (audioFile == null || !audioFile.exists()) {
            callback.onError("Audio file does not exist");
            return;
        }
        if (referenceText == null || referenceText.trim().isEmpty()) {
            callback.onError("Reference text is required");
            return;
        }

        RequestBody audioBody = RequestBody.create(MediaType.parse("audio/wav"), audioFile);
        MultipartBody.Part audioPart = MultipartBody.Part.createFormData(
                "audio",
                audioFile.getName(),
                audioBody
        );
        RequestBody referenceTextBody = RequestBody.create(
                MediaType.parse("text/plain"),
                referenceText.trim()
        );
        RequestBody lessonIdBody = RequestBody.create(
                MediaType.parse("text/plain"),
                String.valueOf(lessonId)
        );
        RequestBody transcriptIdBody = RequestBody.create(
                MediaType.parse("text/plain"),
                String.valueOf(transcriptId)
        );

        pronunciationApi.assessPronunciation(audioPart, referenceTextBody,lessonIdBody,transcriptIdBody)
                .enqueue(new ApiCallWrapper<>(callback));
    }

    public void deletePronunciationAttempt(int attemptId, BaseCallback<ApiResponse<PronunciationAttemptsResponse>> callback) {
        pronunciationApi.deletePronunciationAttempt(attemptId).enqueue(new ApiCallWrapper<>(callback));
    };

}
