package com.example.app.adapter.study;

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

public class LessonsCardAdapter extends RecyclerView.Adapter<LessonsCardAdapter.LessonsCardViewHolder> {

    private List<LessonsResponse> lessonsResponseList;
    private OnLessonClickListener listener;
    public interface OnLessonClickListener {
        void onLessonClick(LessonsResponse lessons);
    }


    public LessonsCardAdapter(List<LessonsResponse> lessonsResponseList, OnLessonClickListener listener) {
        this.lessonsResponseList = lessonsResponseList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public LessonsCardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_lesson_card, parent, false);
        return new LessonsCardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LessonsCardViewHolder holder, int position) {
        LessonsResponse currentLesson = lessonsResponseList.get(position);
        holder.tvLevel.setText(currentLesson.getLevel());
        holder.tvTitle.setText(currentLesson.getTitle());
        holder.tvDuration.setText(String.valueOf(currentLesson.getDuration()));
        Glide.with(holder.itemView.getContext())
                .load(currentLesson.getThumbnailUrl())
                .placeholder(R.drawable.ic_placeholder)
                .error(R.drawable.ic_error)
                .into(holder.imgThumbnail);
        holder.itemView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (listener != null) {
                    listener.onLessonClick(currentLesson);
                }
            }
        });

    }

    @Override
    public int getItemCount() {
        if(lessonsResponseList != null){
            return Math.min(lessonsResponseList.size(),5);
        }
        return 0;
    }

    public class LessonsCardViewHolder extends RecyclerView.ViewHolder {
        public LessonsCardViewHolder(@NonNull View itemView) {
            super(itemView);
            imgThumbnail = itemView.findViewById(R.id.imgThumbnail);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            tvLevel = itemView.findViewById(R.id.tvLevel);
        }
        ImageView imgThumbnail;
        TextView tvTitle;
        TextView tvDuration;
        TextView tvLevel;

    }

}
