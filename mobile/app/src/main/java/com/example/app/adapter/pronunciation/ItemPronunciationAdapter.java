package com.example.app.adapter.pronunciation;

import android.content.res.ColorStateList;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.pronunciation.PronunciationProgressResponse;
import com.example.app.data.remote.model.response.transcripts.TranscriptsResponse;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ItemPronunciationAdapter extends RecyclerView.Adapter<ItemPronunciationAdapter.ItemPronunciationViewHolder>  {
    private List<TranscriptsResponse> listTranscripts = new ArrayList<>();
    private Map<Integer, PronunciationProgressResponse> pronunciationProgressMap = new HashMap<>();
    private String vietnameseText = "";
    private double score = -1;
    private String feedback = "";
    private OnItemClickListener listener;
    private int selectedPosition = 0;
    public void setVietNamese(String vietnameseText) {
     this.vietnameseText = vietnameseText;
     notifyDataSetChanged();
    }
    public void setSore(double score) {
     this.score = score;
     notifyDataSetChanged();
    }
    public void setFeedback(String feedback) {
        this.feedback = feedback;
        notifyDataSetChanged();
    }
    public void setPronunciationProgressList(List<PronunciationProgressResponse> progressList) {
        pronunciationProgressMap.clear();
        if (progressList != null) {
            for (PronunciationProgressResponse progress : progressList) {
                pronunciationProgressMap.put(progress.getTranscriptId(), progress);
            }
        }
        notifyDataSetChanged();
    }
    public void updatePronunciationProgress(PronunciationProgressResponse progress) {
        if (progress == null) {
            return;
        }
        pronunciationProgressMap.put(progress.getTranscriptId(), progress);
        notifyDataSetChanged();
    }

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

        PronunciationProgressResponse progress = pronunciationProgressMap.get(transcript.getId());

        if (progress != null && transcript.getVietnamese() != null && !transcript.getVietnamese().trim().isEmpty()) {
            holder.tvVietnameseMeaning.setText(transcript.getVietnamese());
            holder.tvVietnameseMeaning.setVisibility(View.VISIBLE);
        } else {
            holder.tvVietnameseMeaning.setText("");
            holder.tvVietnameseMeaning.setVisibility(View.GONE);
        }

        if (progress != null && progress.getFeedback() != null && !progress.getFeedback().trim().isEmpty()) {
            holder.tvFeedBack.setText(progress.getFeedback());
            holder.tvFeedBack.setVisibility(View.VISIBLE);
        } else {
            holder.tvFeedBack.setText("");
            holder.tvFeedBack.setVisibility(View.GONE);
        }

        if (progress != null && progress.getBestScore() != null) {
            double bestScore = progress.getBestScore();
            holder.btnScore.setText(String.format("%.0f", bestScore) + "%");
            if (bestScore < 50) {
                holder.btnScore.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#FBE4E8")));
                holder.btnScore.setTextColor(Color.parseColor("#F04452"));
            } else {
                holder.btnScore.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#E6F4EA")));
                holder.btnScore.setTextColor(Color.parseColor("#34A853"));
            }
            holder.btnScore.setVisibility(View.VISIBLE);
        }else {
            holder.btnScore.setVisibility(View.GONE);
        }


        holder.btnSentenceNumber.setText(String.valueOf(position + 1));

        if (selectedPosition == position) {
            holder.cardPronunciation.setStrokeColor(0xFF2196F3);
            holder.cardPronunciation.setStrokeWidth(dpToPx(holder.itemView, 2));
        } else {
            holder.cardPronunciation.setStrokeWidth(0);
        }

        holder.cardPronunciation.setOnClickListener(v -> {
            if (listener != null) {
                int adapterPos = holder.getBindingAdapterPosition();
                if (adapterPos != RecyclerView.NO_POSITION) {
                    listener.onItemClick(adapterPos);
                }
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
            btnUserRecording = itemView.findViewById(R.id.btnUserRecording);
            btnReplay = itemView.findViewById(R.id.btnReplay);
            btnBookmark = itemView.findViewById(R.id.btnBookmark);
            tvEnglishSentence = itemView.findViewById(R.id.tvEnglishSentence);
            tvPhonetic = itemView.findViewById(R.id.tvPhonetic);
            tvFeedBack = itemView.findViewById(R.id.tvFeedBack);
            tvVietnameseMeaning = itemView.findViewById(R.id.tvVietnameseMeaning);
            divider = itemView.findViewById(R.id.divider);
        }
        MaterialCardView cardPronunciation;

        MaterialButton btnSentenceNumber;
        MaterialButton btnPause;
        MaterialButton btnScore;
        MaterialButton btnUserRecording;

        ImageButton btnReplay;
        ImageButton btnBookmark;

        TextView tvEnglishSentence;
        TextView tvPhonetic;
        TextView tvFeedBack;
        TextView tvVietnameseMeaning;

        View divider;

    }
}
