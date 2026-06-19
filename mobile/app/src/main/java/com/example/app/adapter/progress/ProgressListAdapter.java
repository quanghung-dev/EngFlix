package com.example.app.adapter.progress;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.app.R;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.utils.BaseCallback;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProgressListAdapter extends RecyclerView.Adapter<ProgressListAdapter.ProgressViewHolder> {
    private List<LessonsResponse> lessonsResponseList;
    private OnLessonClickListener listener;
    private final Map<Integer, ProgressResponse> progressCache = new HashMap<>();

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

        // Đánh dấu tag để tránh bị lỗi hiển thị sai lệch khi view bị tái sử dụng (recycled)
        holder.itemView.setTag(currentLesson.getId());

        int lessonId = currentLesson.getId();
        if (progressCache.containsKey(lessonId)) {
            ProgressResponse progress = progressCache.get(lessonId);
            bindProgress(holder, progress);
        } else {
            resetProgressViews(holder);
            ProgressRepository progressRepository = new ProgressRepository(holder.itemView.getContext());
            progressRepository.getProgressByLesson(lessonId, new BaseCallback<ApiResponse<ProgressResponse>>() {
                @Override
                public void onSuccess(ApiResponse<ProgressResponse> response) {
                    ProgressResponse progress = (response != null) ? response.getData() : null;
                    progressCache.put(lessonId, progress);
                    
                    Object tag = holder.itemView.getTag();
                    if (tag != null && (int) tag == lessonId) {
                        bindProgress(holder, progress);
                    }
                }

                @Override
                public void onError(String message) {
                    progressCache.put(lessonId, null);
                    Object tag = holder.itemView.getTag();
                    if (tag != null && (int) tag == lessonId) {
                        bindProgress(holder, null);
                    }
                }
            });
        }
    }

    private void resetProgressViews(ProgressViewHolder holder) {
        holder.pillChinhTa.setBackgroundResource(R.drawable.bg_pill);
        holder.pillChinhTa.setBackgroundTintList(null);
        holder.radioChinhTa.setImageResource(R.drawable.ic_radio_unchecked);

        holder.pillLuyenNoi.setBackgroundResource(R.drawable.bg_pill);
        holder.pillLuyenNoi.setBackgroundTintList(null);
        holder.radioLuyenNoi.setImageResource(R.drawable.ic_radio_unchecked);
    }

    private void bindProgress(ProgressViewHolder holder, ProgressResponse progress) {
        if (progress == null) {
            resetProgressViews(holder);
            return;
        }

        Context context = holder.itemView.getContext();
        ColorStateList yellowTint = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.primary_yellow));

        // Xử lý pill Chính tả (completedDictation)
        Boolean completedDictation = progress.getCompletedDictation();
        if (completedDictation != null) {
            holder.pillChinhTa.setBackgroundTintList(yellowTint);
            if (completedDictation) {
                holder.radioChinhTa.setImageResource(R.drawable.ic_radio_checked);
            } else {
                holder.radioChinhTa.setImageResource(R.drawable.ic_radio_unchecked);
            }
        } else {
            holder.pillChinhTa.setBackgroundTintList(null);
            holder.radioChinhTa.setImageResource(R.drawable.ic_radio_unchecked);
        }

        // Xử lý pill Luyện nói (completedPronunciation)
        Boolean completedPronunciation = progress.getCompletedPronunciation();
        if (completedPronunciation != null) {
            holder.pillLuyenNoi.setBackgroundTintList(yellowTint);
            if (completedPronunciation) {
                holder.radioLuyenNoi.setImageResource(R.drawable.ic_radio_checked);
            } else {
                holder.radioLuyenNoi.setImageResource(R.drawable.ic_radio_unchecked);
            }
        } else {
            holder.pillLuyenNoi.setBackgroundTintList(null);
            holder.radioLuyenNoi.setImageResource(R.drawable.ic_radio_unchecked);
        }
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
        View pillChinhTa;
        View pillLuyenNoi;
        ImageView radioChinhTa;
        ImageView radioLuyenNoi;

        public ProgressViewHolder(@NonNull View itemView) {
            super(itemView);
            imgThumbnail = itemView.findViewById(R.id.imgThumbnail);
            tvLevel = itemView.findViewById(R.id.tvLevel);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            pillChinhTa = itemView.findViewById(R.id.pillChinhTa);
            pillLuyenNoi = itemView.findViewById(R.id.pillLuyenNoi);
            radioChinhTa = itemView.findViewById(R.id.radioChinhTa);
            radioLuyenNoi = itemView.findViewById(R.id.radioLuyenNoi);
        }
    }
}