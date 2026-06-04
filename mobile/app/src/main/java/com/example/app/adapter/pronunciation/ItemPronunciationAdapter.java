package com.example.app.adapter.pronunciation;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;

import java.util.ArrayList;
import java.util.List;

public class ItemPronunciationAdapter extends RecyclerView.Adapter<ItemPronunciationAdapter.ItemPronunciationViewHolder>  {
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private OnItemClickListener listener;
    private int selectedPosition = 0;

    public interface OnItemClickListener {
        void onItemClick(int position);
    }

    public ItemPronunciationAdapter(List<TranscriptsResponse> listTranscripts, OnItemClickListener listener) {
        this.listTranscripts = listTranscripts;
        this.listener = listener;
    }

    public void setSelectedPosition(int position) {
        int previousPosition = selectedPosition;
        selectedPosition = position;

        if (previousPosition >= 0 && previousPosition < getItemCount()) {
            notifyItemChanged(previousPosition);
        }
        if (selectedPosition >= 0 && selectedPosition < getItemCount()) {
            notifyItemChanged(selectedPosition);
        }
    }

    @NonNull
    @Override
    public ItemPronunciationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_pronunciation_sentence, parent, false);
        return new ItemPronunciationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemPronunciationViewHolder holder, int position) {
        TranscriptsResponse transcript = listTranscripts.get(position);
        holder.tvEnglishSentence.setText(transcript.getContent());
        holder.tvPhonetic.setText(transcript.getPhonetic());
        holder.tvVietnameseMeaning.setText(transcript.getVietnamese());
        holder.btnSentenceNumber.setText(String.valueOf(position + 1));

        if (selectedPosition == position) {
            holder.cardPronunciation.setStrokeColor(0xFF2196F3);
            holder.cardPronunciation.setStrokeWidth(dpToPx(holder.itemView, 2));
        } else {
            holder.cardPronunciation.setStrokeWidth(0);
        }

        holder.cardPronunciation.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(position);
            }
        });

    }

    @Override
    public int getItemCount() {
        if (listTranscripts != null) {
            return listTranscripts.size();
        }
        return 0;
    }

    private int dpToPx(View view, int dp) {
        return (int) (dp * view.getResources().getDisplayMetrics().density + 0.5f);
    }

    public class ItemPronunciationViewHolder extends RecyclerView.ViewHolder {
        public ItemPronunciationViewHolder(@NonNull View itemView) {
            super(itemView);
            cardPronunciation = itemView.findViewById(R.id.cardPronunciation);
            btnSentenceNumber = itemView.findViewById(R.id.btnSentenceNumber);
            btnPause = itemView.findViewById(R.id.btnPause);
            btnScore = itemView.findViewById(R.id.btnScore);
            btnFlag = itemView.findViewById(R.id.btnFlag);
            btnUserRecording = itemView.findViewById(R.id.btnUserRecording);
            btnReplay = itemView.findViewById(R.id.btnReplay);
            btnBookmark = itemView.findViewById(R.id.btnBookmark);
            tvEnglishSentence = itemView.findViewById(R.id.tvEnglishSentence);
            tvPhonetic = itemView.findViewById(R.id.tvPhonetic);
            tvVietnameseMeaning = itemView.findViewById(R.id.tvVietnameseMeaning);
            divider = itemView.findViewById(R.id.divider);
        }
        MaterialCardView cardPronunciation;

        MaterialButton btnSentenceNumber;
        MaterialButton btnPause;
        MaterialButton btnScore;
        MaterialButton btnFlag;
        MaterialButton btnUserRecording;

        ImageButton btnReplay;
        ImageButton btnBookmark;

        TextView tvEnglishSentence;
        TextView tvPhonetic;
        TextView tvVietnameseMeaning;

        View divider;

    }
}
