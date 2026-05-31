package com.example.app.data.remote;


import android.content.Context;


import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.api.AuthApi;
import com.example.app.data.remote.api.BookMarksApi;
import com.example.app.data.remote.api.CategoryApi;
import com.example.app.data.remote.api.LessonsApi;
import com.example.app.data.remote.api.ProgressApi;
import com.example.app.data.remote.api.TranscriptBookmarksApi;
import com.example.app.data.remote.api.TranscriptProgressApi;
import com.example.app.data.remote.api.TranscriptsApi;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.api.VocabularyApi;
import com.example.app.data.remote.interceptor.AuthInterceptor;
import com.example.app.utils.Constants;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {

    private static RetrofitClient instance;
    private final Retrofit retrofit;

    private RetrofitClient(Context context) {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(new AuthInterceptor(TokenManager.getInstance(context)))
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();

        retrofit = new Retrofit.Builder()
                .baseUrl(Constants.BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }

    public static synchronized RetrofitClient getInstance(Context context) {
        if (instance == null) {
            instance = new RetrofitClient(context);
        }
        return instance;
    }

    public AuthApi getAuthApi() {return retrofit.create(AuthApi.class);}
    public LessonsApi getLessonsApi() {
        return retrofit.create(LessonsApi.class);
    }
    public CategoryApi getCategoryApi() {
        return retrofit.create(CategoryApi.class);
    }
    public UserApi getUserApi(){return retrofit.create(UserApi.class);}
    public TranscriptsApi getTranscriptsApi(){return retrofit.create(TranscriptsApi.class);}
    public VocabularyApi getVocabularyApi(){return  retrofit.create(VocabularyApi.class);}
    public TranscriptBookmarksApi getTranscriptBookmarksApi(){return retrofit.create(TranscriptBookmarksApi.class);}
    public ProgressApi getProgressApi(){return retrofit.create(ProgressApi.class);}
    public BookMarksApi getBookMarksApi(){return retrofit.create(BookMarksApi.class);}
    public TranscriptProgressApi getTranscriptProgressApi(){return retrofit.create(TranscriptProgressApi.class);}

}