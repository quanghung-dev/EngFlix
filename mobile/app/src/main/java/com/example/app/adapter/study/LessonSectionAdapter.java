package com.example.app.adapter.study;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.feature.study.LessonSection;

import java.util.List;

public class LessonSectionAdapter extends RecyclerView.Adapter<LessonSectionAdapter.LessonsSectionViewHolder> {
    private List<LessonSection> categories;
    public interface OnSeeAllClickListener {
        void onSeeAllClick(int categoryId, String categoryName);
    }

    public interface OnLessonClickListener {
        void onLessonClick(LessonsResponse lesson);
    }

    private OnSeeAllClickListener listener;
    private OnLessonClickListener lessonClickListener;


    public LessonSectionAdapter(List<LessonSection> categories, OnSeeAllClickListener listener, OnLessonClickListener lessonClickListener) {
        this.categories = categories;
        this.listener = listener;
        this.lessonClickListener = lessonClickListener;
    }

    @NonNull
    @Override
    public LessonsSectionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_lesson_section, parent, false);
        return new LessonsSectionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LessonsSectionViewHolder holder, int position) {
        LessonSection currentCategory = categories.get(position);

        holder.tvCategoryTitle.setText(currentCategory.getCategoryName());
        holder.tvLessonCount.setText("(" + currentCategory.getTotalLessons() + " bài học)");
        LinearLayoutManager layoutManager =
                new LinearLayoutManager(holder.itemView.getContext(), LinearLayoutManager.HORIZONTAL, false);
        holder.rvLessonCards.setLayoutManager(layoutManager);
        holder.rvLessonCards.setAdapter(new LessonsCardAdapter(currentCategory.getLesssons(),
                new LessonsCardAdapter.OnLessonClickListener() {
            @Override
            public void onLessonClick(LessonsResponse lesson) {
                if (lessonClickListener != null) {
                    lessonClickListener.onLessonClick(lesson);
                }
            }
        }));
        holder.tvSeeAll.setOnClickListener(v -> {
            if (listener != null) {
                listener.onSeeAllClick(currentCategory.getIdCategory(), currentCategory.getCategoryName());
            }
        });

    }

    @Override
    public int getItemCount() {
        if(categories != null){
            return categories.size();
        }
        return 0;
    }

    public class LessonsSectionViewHolder extends RecyclerView.ViewHolder {
        TextView tvCategoryTitle;
        TextView tvLessonCount;
        TextView tvSeeAll;
        RecyclerView rvLessonCards;
        public LessonsSectionViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCategoryTitle = itemView.findViewById(R.id.tvCategoryTitle);
            tvLessonCount = itemView.findViewById(R.id.tvLessonCount);
            tvSeeAll = itemView.findViewById(R.id.tvSeeAll);
            rvLessonCards = itemView.findViewById(R.id.rvLessonCards);

        }
    }

}
