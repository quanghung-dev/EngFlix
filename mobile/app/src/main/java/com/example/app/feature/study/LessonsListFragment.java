package com.example.app.feature.study;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.widget.Toolbar;

import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.navigation.Navigator;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.study.ListLessonsAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.repository.LessonsRepository;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.diaglog.ChooseModeBottomSheet;

import java.util.ArrayList;
import java.util.List;

public class LessonsListFragment extends Fragment {
    private ProgressRepository progressRepository;
    private int countDone;
    private int countLearning;
    Toolbar toolbar;
    private String currentCategoryName;
    private int currentCategoryId = -1;
    private List<LessonsResponse> lessonsResponseList = new ArrayList<>();
    private ListLessonsAdapter adapter;
    private LessonsRepository repository;
    private TextView CountNotStarted;
    private TextView CountLearning;
    private TextView CountDone;


    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_lesson_list, container, false);
        RecyclerView recyclerView = view.findViewById(R.id.rvLessons);
        CountDone = view.findViewById(R.id.tvCountDone);
        CountLearning = view.findViewById(R.id.tvCountLearning);
        CountNotStarted = view.findViewById(R.id.tvCountNotStarted);
        toolbar = view.findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> {
            Navigation.findNavController(v).popBackStack();
        });

        if (getArguments() != null) {
            currentCategoryId = getArguments().getInt("categoryId", -1);
            currentCategoryName = getArguments().getString("categoryName", "Danh mục");
        }
        LinearLayoutManager layoutManager = new LinearLayoutManager(getContext());
        recyclerView.setLayoutManager(layoutManager);
        adapter = new ListLessonsAdapter(lessonsResponseList, new ListLessonsAdapter.onLessonsItemClickListener(){
            @Override
            public void onLessonsItemClick(LessonsResponse lesson) {
                showBottomSheet(lesson);
            }
        });
        toolbar.setTitle(currentCategoryName);
        repository = new LessonsRepository(requireContext());
        recyclerView.setAdapter(adapter);
        fetchLessons();
        return view;
    }

    public void fetchLessons(){
        if (currentCategoryId == -1) return;
        repository.getLessons(100, 1,null, currentCategoryId, null,
                new LessonsRepository.lessonsCallback<ApiResponse<List<LessonsResponse>>>(){
                    @Override
                    public void onSuccess(ApiResponse<List<LessonsResponse>> response) {
                        lessonsResponseList.clear();
                        if (response != null && response.getData() != null) {
                            lessonsResponseList.addAll(response.getData());
                        }
                        adapter.notifyDataSetChanged();
                        int totallessons = 0;
                        if (response != null && response.getMeta() != null) {
                            totallessons = response.getMeta().getTotal();
                        }
                        int done = 0;
                        int learning = 0;
                        CountNotStarted.setText(String.valueOf(totallessons - done - learning));
                    }
                    @Override
                    public void onError(String message) {
                        Toast.makeText(requireContext(), "Lỗi tải dữ liệu: " + message, android.widget.Toast.LENGTH_SHORT).show();
                    }
        });
    }

    public void showBottomSheet(LessonsResponse lesson){
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

}
