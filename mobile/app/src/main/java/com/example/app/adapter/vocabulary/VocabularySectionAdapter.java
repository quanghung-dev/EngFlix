package com.example.app.adapter.vocabulary;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.vocabulary.VocaCategoryResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;

import java.util.ArrayList;
import java.util.List;

public class VocabularySectionAdapter extends RecyclerView.Adapter<VocabularySectionAdapter.VocabularySectionViewHolder> {

    private List<VocaCategoryResponse> vocaCategories = new ArrayList<>();
    public interface OnClickListener{
        void onClick(int position, VocaCategoryResponse vocaCategory);
    }
    private OnClickListener listener;

    public VocabularySectionAdapter(List<VocaCategoryResponse> vocaCategories, OnClickListener listener) {
        this.vocaCategories = vocaCategories;
        this.listener = listener;
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
        LinearLayoutManager layoutManager =
                new LinearLayoutManager(holder.itemView.getContext(), LinearLayoutManager.HORIZONTAL, false);
        holder.rv_vocab_cards.setLayoutManager(layoutManager);


    }

    @Override
    public int getItemCount() {
        if(vocaCategories != null){
            return vocaCategories.size();
        }
        return 0;
    }

    public class VocabularySectionViewHolder extends RecyclerView.ViewHolder {
        public VocabularySectionViewHolder(@NonNull View itemView) {
            super(itemView);
            tv_category_name = itemView.findViewById(R.id.tv_category_name);
            tv_category_count = itemView.findViewById(R.id.tv_category_count);
            rv_vocab_cards = itemView.findViewById(R.id.rv_vocab_cards);
        }
        TextView tv_category_name;
        TextView tv_category_count;
        RecyclerView rv_vocab_cards;

    }
}
