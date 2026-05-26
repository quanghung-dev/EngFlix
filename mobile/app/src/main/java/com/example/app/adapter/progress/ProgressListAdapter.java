package com.example.app.adapter.progress;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.app.R;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

public class ProgressListAdapter extends RecyclerView.Adapter<ProgressListAdapter.ProgressViewHolder> {
    private List<LessonsResponse> lessonsResponseList;
    private OnLessonClickListener listener;

    public interface OnLessonClickListener {
        void onLessonClick(LessonsResponse lesson);
    }

    public ProgressListAdapter(List<LessonsResponse> lessonsResponseList, OnLessonClickListener listener) {
        this.lessonsResponseList = lessonsResponseList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ProgressViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_progress_list, parent, false);
        return new ProgressViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProgressViewHolder holder, int position) {
        LessonsResponse currentLesson = lessonsResponseList.get(position);

        holder.tvTitle.setText(currentLesson.getTitle());
        holder.tvLevel.setText(currentLesson.getLevel());
        holder.tvDuration.setText(String.valueOf(currentLesson.getDuration()));
        Glide.with(holder.itemView.getContext())
                .load(currentLesson.getThumbnailUrl())
                .placeholder(R.drawable.ic_placeholder)
                .error(R.drawable.ic_error)
                .into(holder.imgThumbnail);
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onLessonClick(currentLesson);
            }
        });

    }

    @Override
    public int getItemCount() {
        return lessonsResponseList != null ? lessonsResponseList.size() : 0;
    }

    public static class ProgressViewHolder extends RecyclerView.ViewHolder {
        ImageView imgThumbnail;
        TextView tvLevel;
        TextView tvTitle;
        TextView tvDuration;

        public ProgressViewHolder(@NonNull View itemView) {
            super(itemView);
            imgThumbnail = itemView.findViewById(R.id.imgThumbnail);
            tvLevel = itemView.findViewById(R.id.tvLevel);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
        }
    }
}