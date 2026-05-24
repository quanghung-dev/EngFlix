package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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


    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_detail, container, false);
        btnBack = view.findViewById(R.id.btnBack);
        tvTopicTitle = view.findViewById(R.id.tvTopicTitle);
        tvHeaderTitle = view.findViewById(R.id.tvHeaderTitle);
        tvCardCount = view.findViewById(R.id.tvCardCount);
        rvWordList = view.findViewById(R.id.rvWordList);
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
            }
        });
        rvWordList.setAdapter(adapter);
        return view;
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
