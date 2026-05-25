package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.vocabulary.VocabularyCardAdapter;
import com.example.app.adapter.vocabulary.VocabularySectionAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VocabularyFragment extends Fragment {
    private List<VocaCategoryResponse> categoryList = new ArrayList<>();
    private Map<Integer, List<VocaDecksResponse>> decksMap = new HashMap<>();
    LinearLayoutManager layoutManager;
    private RecyclerView rv_vocabulary_sections;
    private VocabularySectionAdapter sectionAdapter;
    private VocabularyRepository vocabularyRepository ;
    private static final String TAG = "VocabularyFragment";
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_page, container, false);
        rv_vocabulary_sections = view.findViewById(R.id.rv_vocabulary_sections);
        layoutManager = new LinearLayoutManager(getContext(), LinearLayoutManager.VERTICAL, false);
        rv_vocabulary_sections.setLayoutManager(layoutManager);
        vocabularyRepository = new VocabularyRepository(requireContext());
        fetchCategories();
        sectionAdapter = new VocabularySectionAdapter(categoryList, new VocabularyCardAdapter.OnClickListener() {
            @Override
            public void onClick(int position, VocaDecksResponse vocaCategory) {
                Bundle bundle = new Bundle();
                bundle.putInt("deckId", vocaCategory.getId());
                bundle.putString("deckName", vocaCategory.getName());
                bundle.putString("categoryName", categoryList.get(position).getName());
                Navigation.findNavController(requireActivity(), R.id.nav_host_fragment).navigate(R.id.action_vocabularyFragment_to_detailItems, bundle);
            }
        });
        rv_vocabulary_sections.setAdapter(sectionAdapter);

        return(view);
    }

    private void fetchCategories() {
        vocabularyRepository.getVocabularyCategories(new BaseCallback<ApiResponse<List<VocaCategoryResponse>>>() {
            @Override
            public void onSuccess(ApiResponse<List<VocaCategoryResponse>> response) {
                if(response != null && response.getData() != null){
                    categoryList.clear();
                    categoryList = response.getData();
                    Log.d(TAG, "Tải thành công " + categoryList.size() + " Categories.");
                    fetchDecksForCategories();
                }
            }

            @Override
            public void onError(String message) {
                Log.e(TAG, "Lỗi tải Categories: " + message);
                Toast.makeText(requireContext(), "Lỗi tải dữ liệu danh mục!", Toast.LENGTH_SHORT).show();
            }
        });
    }
    private void fetchDecksForCategories(){
        if (categoryList.isEmpty()) {
            sectionAdapter.setData(categoryList, decksMap);
            return;
        }
        decksMap.clear();
        for (VocaCategoryResponse category : categoryList) {
            final int currentCategoryId = category.getId();
            vocabularyRepository.getVocabularyDecks(currentCategoryId, new BaseCallback<ApiResponse<List<VocaDecksResponse>>>() {
                @Override
                public void onSuccess(ApiResponse<List<VocaDecksResponse>> data) {
                    if(data != null && data.getData() != null){
                        decksMap.put(currentCategoryId, data.getData());
                        sectionAdapter.setData(categoryList, decksMap);
                    };
                }
                @Override
                public void onError(String message) {
                    Log.e(TAG, "Lỗi tải Deck cho Category ID " + category.getId() + ": " + message);
                }
            });
        }
    }

}
