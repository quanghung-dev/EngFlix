package com.example.app.adapter.study;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.view.MotionEvent;
import android.view.animation.DecelerateInterpolator;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.app.R;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

public class ListLessonsAdapter extends RecyclerView.Adapter<ListLessonsAdapter.LessonsViewHolder> {

    private List<LessonsResponse> lessonsResponseList;

    public interface onLessonsItemClickListener{
        void onLessonsItemClick(LessonsResponse lesson);
    }

    private onLessonsItemClickListener listener;

    public ListLessonsAdapter(List<LessonsResponse> lessonsResponseList, onLessonsItemClickListener listener) {
        this.lessonsResponseList = lessonsResponseList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public LessonsViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_lesson_list, parent, false);
        return new LessonsViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LessonsViewHolder holder, int position) {
        LessonsResponse currentLesson = lessonsResponseList.get(position);
        holder.tvTitle.setText(currentLesson.getTitle());
        holder.tvDuration.setText(String.valueOf(currentLesson.getDuration()));
        holder.tvLevel.setText(currentLesson.getLevel());
        Glide.with(holder.itemView.getContext())
                .load(currentLesson.getThumbnailUrl())
                .placeholder(R.drawable.ic_placeholder)
                .error(R.drawable.ic_error)
                .into(holder.imgThumbnail);

        holder.cardRoot.setOnClickListener(v -> {
            if (listener != null) {
                listener.onLessonsItemClick(currentLesson);
            };
        });


        holder.cardRoot.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    v.animate().scaleX(1.04f).scaleY(1.04f)
                            .setDuration(120)
                            .setInterpolator(new DecelerateInterpolator())
                            .start();
                    break;

                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    v.animate()
                            .scaleX(1.0f)
                            .scaleY(1.0f)
                            .setDuration(120)
                            .setInterpolator(new DecelerateInterpolator())
                            .start();
                    break;
            }
            return false;
        });



    }



    @Override
    public int getItemCount() {
        if (lessonsResponseList != null){
            return lessonsResponseList.size();
        }
        return 0;
    }

    public class LessonsViewHolder extends RecyclerView.ViewHolder {
        CardView cardRoot;
        private ImageView imgThumbnail;
        private TextView tvTitle;
        private TextView tvDuration;
        private TextView tvLevel;

        public LessonsViewHolder(@NonNull View itemView) {
            super(itemView);
            cardRoot = (CardView) itemView;
            imgThumbnail = itemView.findViewById(R.id.imgThumbnail);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            tvLevel = itemView.findViewById(R.id.tvLevel);
        }
    }
}

