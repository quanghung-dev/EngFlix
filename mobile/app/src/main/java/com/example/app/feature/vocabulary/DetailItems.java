package com.example.app.feature.vocabulary;

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
    VocaItemsAdapter adapter;
    private List<VocaItemsResponse> vocaItems = new ArrayList<>();
    private VocabularyRepository vocabularyRepository;
    private int deckId;
    private String deckName;
    private String categoryName;
    private ImageButton btnBack;
    private TextView tvTopicTitle;
    private TextView tvHeaderTitle;
    private TextView tvCardCount;
    private RecyclerView rvWordList;
    private Button btnStartLearning;

    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_detail, container, false);
        btnBack = view.findViewById(R.id.btnBack);
        tvTopicTitle = view.findViewById(R.id.tvTopicTitle);
        tvHeaderTitle = view.findViewById(R.id.tvHeaderTitle);
        tvCardCount = view.findViewById(R.id.tvCardCount);
        rvWordList = view.findViewById(R.id.rvWordList);
        btnStartLearning = view.findViewById(R.id.btnStartLearning);
        LinearLayoutManager layoutManager = new LinearLayoutManager(requireContext());
        rvWordList.setLayoutManager(layoutManager);
        btnBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Navigation.findNavController(v).popBackStack();
            }
        });
        if(getArguments() != null){
            deckId = getArguments().getInt("deckId",-1);
            deckName = getArguments().getString("deckName","");
            categoryName = getArguments().getString("categoryName","");
            Log.d("DetailItems", "Đã nhận Deck - ID: " + deckId + ", Name: " + deckName);
            tvTopicTitle.setText(categoryName);
            tvHeaderTitle.setText(deckName);
            if (deckId != -1) {
                fetchDeckDetails();
            }
        }
        adapter = new VocaItemsAdapter(vocaItems, new VocaItemsAdapter.OnClickCardListener(){
            @Override
            public void onClick(int position, VocaItemsResponse vocaItem) {
                Log.d("DetailItems", "Clicked word: " + vocaItem.getPhrase());
                navigateToLearning(vocaItem);
            }
        });
        rvWordList.setAdapter(adapter);
        btnStartLearning.setOnClickListener(v -> {
            if (vocaItems.isEmpty()) {
                Toast.makeText(requireContext(), "Chưa có từ vựng để học", Toast.LENGTH_SHORT).show();
                return;
            }
            navigateToLearning(vocaItems.get(0));
        });
        return view;
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
        vocabularyRepository = new VocabularyRepository(requireContext());
        vocabularyRepository.getVocabularyItemsByDeckId(deckId, new BaseCallback<ApiResponse<List<VocaItemsResponse>>>(){
            @Override
            public void onSuccess(ApiResponse<List<VocaItemsResponse>> data) {
                if(data != null && data.getData() != null){
                    vocaItems.clear();
                    vocaItems.addAll(data.getData());
                    adapter.notifyDataSetChanged();
                    tvCardCount.setText("Thẻ mới • 0/" + vocaItems.size());

                }
            }

            @Override
            public void onError(String message) {
                Toast.makeText(requireContext(), "Lỗi tải dữ liệu: " + message, Toast.LENGTH_SHORT).show();
            }
        });

    }
}
