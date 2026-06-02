package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VocabularySectionAdapter extends RecyclerView.Adapter<VocabularySectionAdapter.VocabularySectionViewHolder> {

    private List<VocaCategoryResponse> vocaCategories = new ArrayList<>();
    private Map<Integer, List<VocaDecksResponse>> decksMap = new HashMap<>();

    public interface OnClickListener {
        void onClick(int position, VocaCategoryResponse vocaCategory);
    }
    private VocabularyCardAdapter.OnClickListener cardListener;

    public void setData(List<VocaCategoryResponse> vocaCategories, Map<Integer, List<VocaDecksResponse>> decksMap) {
        this.vocaCategories = vocaCategories;
        this.decksMap = decksMap;
        notifyDataSetChanged();
    }

    public VocabularySectionAdapter(List<VocaCategoryResponse> vocaCategories, VocabularyCardAdapter.OnClickListener cardListener) {
        this.vocaCategories = vocaCategories;
        this.cardListener = cardListener;
    }

    @NonNull
    @Override
    public VocabularySectionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.fragment_vocabulary_section, parent, false);
        return new VocabularySectionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VocabularySectionViewHolder holder, int position) {
        VocaCategoryResponse vocaCategory = vocaCategories.get(position);
        holder.tv_category_name.setText(vocaCategory.getName());

        List<VocaDecksResponse> decks = new ArrayList<>();
        if (decksMap != null && decksMap.containsKey(vocaCategory.getId())) {
            decks = decksMap.get(vocaCategory.getId());
        }
        
        holder.tv_category_count.setText(String.valueOf(decks.size()));

        final int sectionPosition = position;
        boolean folderMode = vocaCategory.getId() == 0;
        VocabularyCardAdapter cardAdapter = new VocabularyCardAdapter(decks, new VocabularyCardAdapter.OnClickListener() {
            @Override
            public void onClick(int position, VocaDecksResponse vocaCategory) {
                if (cardListener != null) {
                    cardListener.onClick(sectionPosition, vocaCategory);
                }
            }
        }, folderMode);
        holder.rv_vocab_cards.setAdapter(cardAdapter);
        
        holder.itemView.setOnClickListener(v -> {
            int currentPosition = holder.getBindingAdapterPosition();

        });
    }

    @Override
    public int getItemCount() {
        if(vocaCategories != null){
            return vocaCategories.size();
        }
        return 0;
    }

    public static class VocabularySectionViewHolder extends RecyclerView.ViewHolder {
        public VocabularySectionViewHolder(@NonNull View itemView) {
            super(itemView);
            tv_category_name = itemView.findViewById(R.id.tv_category_name);
            tv_category_count = itemView.findViewById(R.id.tv_category_count);
            rv_vocab_cards = itemView.findViewById(R.id.rv_vocab_cards);
            GridLayoutManager layoutManager = new GridLayoutManager(itemView.getContext(), 2, LinearLayoutManager.VERTICAL, false);
            rv_vocab_cards.setLayoutManager(layoutManager);
        }
        TextView tv_category_name;
        TextView tv_category_count;
        RecyclerView rv_vocab_cards;
    }
}
