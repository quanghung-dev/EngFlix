package com.example.app.feature.study;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.study.LessonSectionAdapter;
import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.remote.model.response.user.UserResponse;
import com.example.app.data.repository.CategoriesRepository;
import com.example.app.data.repository.LessonsRepository;
import com.example.app.data.repository.UserRepository;
import com.example.app.diaglog.ChooseModeBottomSheet;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudyFragment extends Fragment {
    UserRepository userApi;

    TextView UserName ;
    private ImageButton btnCreate;
    private RecyclerView rvLessonSections;
    private TokenManager tokenManager;
    private LessonSectionAdapter sectionAdapter;
    private List<LessonSection> sectionList;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_study, container, false);
        btnCreate = view.findViewById(R.id.btnCreate);
        btnCreate.setOnClickListener(v -> {

        });
        tokenManager = TokenManager.getInstance(requireContext());
        String name = tokenManager.getUserName();
        UserName = view.findViewById(R.id.tvUserName);
        rvLessonSections = view.findViewById(R.id.rvLessonSections);
        rvLessonSections.setLayoutManager(new LinearLayoutManager(getContext()));
        sectionList = new ArrayList<>();
        sectionAdapter = new LessonSectionAdapter(sectionList,
                new LessonSectionAdapter.OnSeeAllClickListener() {
                    @Override
                    public void onSeeAllClick(int categoryId, String categoryName) {
                        Bundle bundle = new Bundle();
                        bundle.putInt("categoryId", categoryId);
                        bundle.putString("categoryName", categoryName);
                        Navigation.findNavController(requireView())
                                .navigate(R.id.action_StudyFragment_to_LessonsListFragment, bundle);
                    }
                }, new LessonSectionAdapter.OnLessonClickListener() {
            @Override
            public void onLessonClick(LessonsResponse lesson) {
                showBottomSheet(lesson);
            }
        });
        rvLessonSections.setAdapter(sectionAdapter);


        if(name != null && !name.isEmpty() && !name.equals("null")){
            UserName.setText(tokenManager.getUserName());
        }
        else {
            UserName.setText("Người dùng mới");
        }
        loadDataFromApi();
        return view;
    }

    private void loadDataFromApi() {
        CategoriesRepository categoryRepo = new CategoriesRepository(requireContext());
        LessonsRepository lessonsRepo = new LessonsRepository(requireContext());
        categoryRepo.getCategory(10,1, new CategoriesRepository.categoryCallback<List<CategoryResponse>>() {
            @Override
            public void onSuccess(List<CategoryResponse> response) {
                if (response != null ) {
                    for (CategoryResponse category : response) {
                        int categoryId = category.getId();
                        lessonsRepo.getLessons(10, 1, null, categoryId, null, new LessonsRepository.lessonsCallback<ApiResponse<List<LessonsResponse>>>() {
                            @Override
                            public void onSuccess(ApiResponse<List<LessonsResponse>> lessonResponse) {
                                if (!isAdded() || getView() == null) {
                                    return;
                                }
                                if (lessonResponse != null && lessonResponse.getData() != null) {
                                    int totalLessons = lessonResponse.getMeta() != null
                                            ? lessonResponse.getMeta().getTotal()
                                            : lessonResponse.getData().size();
                                    LessonSection newSection = new LessonSection(
                                            categoryId,
                                            category.getName(),
                                            totalLessons,
                                            lessonResponse.getData()
                                    );
                                    sectionList.add(newSection);
                                    sectionAdapter.notifyDataSetChanged();
                                }
                            }
                            @Override
                            public void onError(String message) {
                                if (isAdded()) {
                                    Toast.makeText(requireContext(), "Lỗi tải danh mục: " + message, Toast.LENGTH_SHORT).show();
                                }
                            }
                        });

                    }

                }
            }

            @Override
            public void onError(String message) {
                if (isAdded()) {
                    Toast.makeText(requireContext(), "Lỗi tải danh mục: " + message, Toast.LENGTH_SHORT).show();
                }
            }
        });

    }

    private void showBottomSheet(LessonsResponse lesson){
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
