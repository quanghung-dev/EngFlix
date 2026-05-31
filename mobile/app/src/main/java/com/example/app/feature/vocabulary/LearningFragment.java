package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.app.R;

public class LearningFragment extends Fragment {
    private ImageView ivWordImage;
    private TextView tvCategory;
    private TextView tvFlashWord;
    private TextView tvDefinition;
    private LinearLayout layoutExample;
    private TextView tvExampleEn;
    private TextView tvExampleVi;
    private ImageButton btnClose;

    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_learning, container, false);
        ivWordImage = view.findViewById(R.id.ivWordImage);
        tvCategory = view.findViewById(R.id.tvCategory);
        tvFlashWord = view.findViewById(R.id.tvFlashWord);
        tvDefinition = view.findViewById(R.id.tvDefinition);
        layoutExample = view.findViewById(R.id.layoutExample);
        tvExampleEn = view.findViewById(R.id.tvExampleEn);
        tvExampleVi = view.findViewById(R.id.tvExampleVi);
        btnClose = view.findViewById(R.id.btnClose);
        btnClose.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        Bundle bundle = getArguments();
        if (bundle != null) {
            String vocaItemPhrase = bundle.getString("vocaItemPhrase");
            String vocaItemMeaning = bundle.getString("vocaItemMeaning");
            String vocaItemExample = bundle.getString("vocaItemExample");
            String vocaItemNote = bundle.getString("vocaItemNote");
            String vocaItemCategory = bundle.getString("vocaItemCategory");
            tvCategory.setText(vocaItemCategory);
            tvFlashWord.setText(vocaItemPhrase);
            tvDefinition.setText(vocaItemMeaning);
            tvExampleEn.setText(vocaItemExample);
            tvExampleVi.setText(vocaItemNote);
            layoutExample.setVisibility(
                    isBlank(vocaItemExample) && isBlank(vocaItemNote) ? View.GONE : View.VISIBLE
            );
        }
        return view;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
