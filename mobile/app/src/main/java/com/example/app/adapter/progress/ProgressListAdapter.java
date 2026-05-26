package com.example.app.adapter.progress;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.study.LessonsCardAdapter;
import com.example.app.adapter.study.ListLessonsAdapter;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;

import java.util.List;

public class ProgressListAdapter extends RecyclerView.Adapter<ProgressListAdapter.ProgressViewHolder> {
    private List<LessonsResponse> lessonsResponseList;
    private LessonsCardAdapter.OnLessonClickListener listener;
    public interface OnLessonClickListener {
        void onLessonClick(LessonsResponse lessons);
    }

    public ProgressListAdapter(List<LessonsResponse> lessonsResponseList, LessonsCardAdapter.OnLessonClickListener listener) {
        this.lessonsResponseList = lessonsResponseList;
        this.listener = listener;
    }


    @NonNull
    @Override
    public ProgressViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.fragment_progress_uncompleted, parent, false);
        return new ProgressViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProgressViewHolder holder, int position) {
        LessonsResponse currentLesson = lessonsResponseList.get(position);
        LinearLayoutManager layoutManager =
                new LinearLayoutManager(holder.itemView.getContext(), LinearLayoutManager.HORIZONTAL, false);
        holder.rvLessonCards.setLayoutManager(layoutManager);
        holder.rvLessonCards.setAdapter(new ListLessonsAdapter(lessonsResponseList,new ListLessonsAdapter.onLessonsItemClickListener() {
            @Override
            public void onLessonsItemClick(LessonsResponse lesson) {
                if (listener != null) {
                    listener.onLessonClick(lesson);
                }
            }
        }));
        holder.rvLessonCards.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (listener != null) {
                    listener.onLessonClick(currentLesson);
                };
            }
        });
    }

    @Override
    public int getItemCount() {
        if(lessonsResponseList != null){
            return lessonsResponseList.size();
        }
        return 0;
    }

    public class ProgressViewHolder extends RecyclerView.ViewHolder {
        public ProgressViewHolder(@NonNull View itemView) {
            super(itemView);
            rvLessonCards = itemView.findViewById(R.id.rvLessonCards);
        }
        RecyclerView rvLessonCards;

    }
}
