package com.example.app.feature.progress;

import static android.content.ContentValues.TAG;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.progress.ProgressListAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.remote.model.response.progress.ProgressResponse;
import com.example.app.data.repository.LessonsRepository;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.diaglog.ChooseModeBottomSheet;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProgressFragmentCompleted extends Fragment {
    private LessonsRepository lessonsRepository;
    private ProgressRepository progressRepository;
    private List<LessonsResponse> lessonsResponseList = new ArrayList<>();
    private RecyclerView rvInProgress;
    private ProgressListAdapter adapter;
    private LinearLayout layout_empty;
    private TextView btn_start;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_progress_completed, container, false);
        rvInProgress = view.findViewById(R.id.rv_in_progress);
        layout_empty = view.findViewById(R.id.layout_empty);
        lessonsRepository = new LessonsRepository(requireContext());
        progressRepository = new ProgressRepository(requireContext());
        btn_start = view.findViewById(R.id.btn_start);
        btn_start.setOnClickListener(v -> {
            Navigation.findNavController(requireActivity(), R.id.nav_host_fragment).navigate(R.id.action_ProgressFragment_to_studyFragment);
        });
        LinearLayoutManager layoutManager = new LinearLayoutManager(requireContext());
        rvInProgress.setLayoutManager(layoutManager);
        adapter = new ProgressListAdapter(lessonsResponseList, new ProgressListAdapter.OnLessonClickListener() {
            @Override
            public void onLessonClick(LessonsResponse lesson) {
                ChooseModeBottomSheet bottomSheet = new ChooseModeBottomSheet();
                Bundle bundle = new Bundle();
                bundle.putInt("lessonId", lesson.getId());
                bundle.putString("lessonTitle", lesson.getTitle());
                bundle.putString("lessonDescription", lesson.getDescription());
                bundle.putString("lessonThumbnailUrl", lesson.getThumbnailUrl());
                bundle.putString("lessonVideoUrl", lesson.getVideoUrl());
                bundle.putInt("lessonDuration", lesson.getDuration());
                bundle.putString("lessonLevel", lesson.getLevel());

                bottomSheet.setArguments(bundle);
                bottomSheet.show(getChildFragmentManager(), "ChooseModeBottomSheet");
            }
        });
        rvInProgress.setAdapter(adapter);
        fetchProgress();
        return view;
    }

    public void fetchProgress() {
        progressRepository.getProgressFinished(new BaseCallback<ApiResponse<List<ProgressResponse>>>() {
            @Override
            public void onError(String message) {
                Log.e(TAG, "Lỗi tải dữ liệu progress!: " + message);
                rvInProgress.setVisibility(View.GONE);
                layout_empty.setVisibility(View.VISIBLE);
            }

            @Override
            public void onSuccess(ApiResponse<List<ProgressResponse>> data) {
                if (data == null || data.getData() == null || data.getData().isEmpty()) {
                    rvInProgress.setVisibility(View.GONE);
                    layout_empty.setVisibility(View.VISIBLE);
                    return;
                }
                rvInProgress.setVisibility(View.VISIBLE);
                layout_empty.setVisibility(View.GONE);
                lessonsResponseList.clear();
                Set<Integer> requestedLessonIds = new HashSet<>();
                for (ProgressResponse progress : data.getData()) {
                    if (!Boolean.TRUE.equals(progress.getCompletedDictation()) || !Boolean.TRUE.equals(progress.getCompletedPronunciation())) {
                        continue;
                    }
                    int lessonId = progress.getLessonId();
                    if (!requestedLessonIds.add(lessonId)) {
                        continue;
                    }
                    lessonsRepository.getLessonsDetail(lessonId, new LessonsRepository.lessonsCallback<LessonsResponse>() {
                        @Override
                        public void onSuccess(LessonsResponse data) {
                            if (containsLesson(data.getId())) {
                                return;
                            }
                            lessonsResponseList.add(data);
                            if (adapter != null) {
                                adapter.notifyDataSetChanged();
                            }
                        }

                        @Override
                        public void onError(String message) {
                            Log.e(TAG, "Lỗi tải dữ liệu lessons!: " + message);
                        }
                    });
                }
                if (requestedLessonIds.isEmpty()) {
                    rvInProgress.setVisibility(View.GONE);
                    layout_empty.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private boolean containsLesson(int lessonId) {
        for (LessonsResponse lesson : lessonsResponseList) {
            if (lesson.getId() == lessonId) {
                return true;
            }
        }
        return false;
    }
}
