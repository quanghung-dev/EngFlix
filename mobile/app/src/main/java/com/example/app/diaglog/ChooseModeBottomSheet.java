package com.example.app.diaglog;


import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import com.example.app.R;



public class ChooseModeBottomSheet extends DialogFragment {
    private LinearLayout cardLuyenNoi;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_choose_mode, container, false);
    }
    @Override
    public void onStart() {
        super.onStart();
        if (getDialog() != null && getDialog().getWindow() != null) {
            getDialog().getWindow().setBackgroundDrawableResource(android.R.color.transparent);

            int width = (int) (getResources().getDisplayMetrics().widthPixels * 0.90);
            getDialog().getWindow().setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT);
        }
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        if (getArguments() != null) {
            int lessonId = getArguments().getInt("lessonId");
            String lessonTitle = getArguments().getString("lessonTitle");
            String lessonDescription = getArguments().getString("lessonDescription");
            String lessonThumbnailUrl = getArguments().getString("lessonThumbnailUrl");
            String lessonVideoUrl = getArguments().getString("lessonVideoUrl");
            int lessonDuration = getArguments().getInt("lessonDuration");
            String lessonLevel = getArguments().getString("lessonLevel");
        }

        View cardChinhTa = view.findViewById(R.id.cardChinhTa);
        cardChinhTa.setOnClickListener(v -> {
            Bundle dictationBundle = new Bundle();
            if (getArguments() != null) {
                dictationBundle.putAll(getArguments());
            }
            androidx.navigation.Navigation.findNavController(requireActivity(), R.id.nav_host_fragment)
                    .navigate(R.id.DictationFragment, dictationBundle);
            dismiss();
                });

        View cardLuyenNoi = view.findViewById(R.id.cardLuyenNoi);
        cardLuyenNoi.setOnClickListener(v -> {
           Bundle listeningBundle = new Bundle();
            if (getArguments() != null) {
                listeningBundle.putAll(getArguments());
            }
            androidx.navigation.Navigation.findNavController(requireActivity(), R.id.nav_host_fragment)
                    .navigate(R.id.ListeningFragment, listeningBundle);
        });

    }

}
