package com.example.app.feature.vocubulary;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.app.R;
import com.example.app.data.remote.RetrofitClient;
import com.example.app.data.remote.api.LessonsApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VocubularyFragment extends Fragment {
    private TextView textView;
    private static final String TAG = "VocabularyFragment";
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary, container, false);
        textView = view.findViewById(R.id.Test);
        textView.setText("Vocabulary");
        return(view);
    }


}
