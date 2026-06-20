package com.example.app.feature.vocabulary;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.vocabulary.VocaItemsAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaItemsResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.List;

public class DetailItems extends Fragment {
    private static final String TAG = "DetailItems";

    private final List<VocaItemsResponse> vocaItems = new ArrayList<>();
    private VocaItemsAdapter adapter;
    private VocabularyRepository vocabularyRepository;
    private int deckId;
    private String deckName;
    private String categoryName;
    private boolean isUserDeck;
    private ImageButton btnCreateWord;
    private TextView tvTopicTitle;
    private TextView tvHeaderTitle;
    private TextView tvCardCount;
    private RecyclerView rvWordList;
    private Button btnStartLearning;

    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_detail, container, false);
        ImageButton btnBack = view.findViewById(R.id.btnBack);
        btnCreateWord = view.findViewById(R.id.btnCreateWord);
        tvTopicTitle = view.findViewById(R.id.tvTopicTitle);
        tvHeaderTitle = view.findViewById(R.id.tvHeaderTitle);
        tvCardCount = view.findViewById(R.id.tvCardCount);
        rvWordList = view.findViewById(R.id.rvWordList);
        btnStartLearning = view.findViewById(R.id.btnStartLearning);
        vocabularyRepository = new VocabularyRepository(requireContext());

        rvWordList.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new VocaItemsAdapter(vocaItems, (position, vocaItem) -> {
            Log.d(TAG, "Clicked word: " + vocaItem.getPhrase());
            navigateToLearning(vocaItem);
        });
        rvWordList.setAdapter(adapter);

        getParentFragmentManager().setFragmentResultListener(
                AddVocabularyItemFragment.REQUEST_VOCABULARY_ITEM_CREATED,
                getViewLifecycleOwner(),
                (requestKey, result) -> fetchDeckDetails()
        );

        btnBack.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        btnCreateWord.setOnClickListener(v -> navigateToAddVocabularyItem());
        btnStartLearning.setOnClickListener(v -> {
            if (vocaItems.isEmpty()) {
                Toast.makeText(requireContext(), "Chưa có từ vựng để học", Toast.LENGTH_SHORT).show();
                return;
            }
            navigateToLearning(vocaItems.get(0));
        });

        if (getArguments() != null) {
            deckId = getArguments().getInt("deckId", -1);
            deckName = getArguments().getString("deckName", "");
            categoryName = getArguments().getString("categoryName", "");
            isUserDeck = getArguments().getBoolean("isUserDeck", false);
        }
        tvTopicTitle.setText(categoryName);
        tvHeaderTitle.setText(deckName);
        btnCreateWord.setVisibility(isUserDeck ? View.VISIBLE : View.GONE);
        if (deckId != -1) {
            fetchDeckDetails();
        }
        return view;
    }

    private void navigateToAddVocabularyItem() {
        Bundle bundle = new Bundle();
        bundle.putInt("deckId", deckId);
        bundle.putString("deckName", deckName);
        bundle.putString("categoryName", categoryName);
        Navigation.findNavController(requireView()).navigate(R.id.action_detailItemsFragment_to_addVocabularyItemFragment, bundle);
    }

    private void navigateToLearning(VocaItemsResponse vocaItem) {
        Bundle bundle = new Bundle();
        bundle.putInt("vocaItemId", vocaItem.getId());
        bundle.putString("vocaItemPhrase", vocaItem.getPhrase());
        bundle.putString("vocaItemMeaning", vocaItem.getMeaning());
        bundle.putString("vocaItemExample", vocaItem.getExample_sentence());
        bundle.putString("vocaItemNote", vocaItem.getNote());
        bundle.putString("vocaItemCategory", categoryName);
        Navigation.findNavController(requireView()).navigate(R.id.action_detailItemsFragment_to_learningFragment, bundle);
    }

    private void fetchDeckDetails() {
        vocabularyRepository.getVocabularyItemsByDeckId(deckId, new BaseCallback<ApiResponse<List<VocaItemsResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaItemsResponse>> data) {
                if (!isAdded()) {
                    return;
                }
                vocaItems.clear();
                if (data != null && data.getData() != null) {
                    vocaItems.addAll(data.getData());
                }
                adapter.notifyDataSetChanged();
                tvCardCount.setText("Thẻ mới • 0/" + vocaItems.size());
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) {
                    return;
                }
                Context context = getContext();
                if (context != null) {
                    Toast.makeText(context, "Lỗi tải dữ liệu: " + message, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
}
