package com.example.app.feature.study;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.app.R;
import com.example.app.adapter.study.LessonSectionAdapter;
import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.api.UserApi;
import com.example.app.data.remote.model.request.category.CreateCategoryRequest;
import com.example.app.data.remote.model.request.vocaDecks.CreateVocaDeckRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.remote.model.response.user.UserResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.repository.CategoriesRepository;
import com.example.app.data.repository.LessonsRepository;
import com.example.app.data.repository.UserRepository;
import com.example.app.diaglog.ChooseModeBottomSheet;
import com.example.app.feature.vocabulary.VocabularyDecksPageFragment;
import com.example.app.utils.BaseCallback;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudyFragment extends Fragment {
    private int currentSessionId = 0;
    private CategoriesRepository categoriesRepository;
    TextView UserName ;
    private ImageButton btnCreate;
    private RecyclerView rvLessonSections;
    private TokenManager tokenManager;
    private LessonSectionAdapter sectionAdapter;
    private List<LessonSection> sectionList;
    private String UserRole;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_study, container, false);
        btnCreate = view.findViewById(R.id.btnCreate);
        tokenManager = TokenManager.getInstance(requireContext());
        UserRole = tokenManager.getUserRole();
        categoriesRepository = new CategoriesRepository(requireContext());
        if ("admin".equals(UserRole)) {
            btnCreate.setVisibility(View.VISIBLE);
        } else {
            btnCreate.setVisibility(View.GONE);
        }
        btnCreate.setOnClickListener(v -> {
            showCreatePersonalFolderDialog();
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
        currentSessionId++;
        final int sessionId = currentSessionId;
        LessonsRepository lessonsRepo = new LessonsRepository(requireContext());
        categoriesRepository.getCategory(10, 1, new CategoriesRepository.categoryCallback<List<CategoryResponse>>() {
            @Override
            public void onSuccess(List<CategoryResponse> response) {
                if (!isAdded() || sessionId != currentSessionId) {
                    return;
                }
                if (response != null) {
                    List<LessonSection> tempSections = new ArrayList<>();
                    for (CategoryResponse category : response) {
                        tempSections.add(new LessonSection(category.getId(), category.getName(), 0, new ArrayList<>()));
                    }
                    sectionList.clear();
                    sectionList.addAll(tempSections);
                    sectionAdapter.notifyDataSetChanged();

                    for (CategoryResponse category : response) {
                        int categoryId = category.getId();
                        lessonsRepo.getLessons(10, 1, null, categoryId, null, new LessonsRepository.lessonsCallback<ApiResponse<List<LessonsResponse>>>() {
                            @Override
                            public void onSuccess(ApiResponse<List<LessonsResponse>> lessonResponse) {
                                if (!isAdded() || sessionId != currentSessionId) {
                                    return;
                                }
                                if (lessonResponse != null && lessonResponse.getData() != null) {
                                    int index = -1;
                                    for (int i = 0; i < sectionList.size(); i++) {
                                        if (sectionList.get(i).getIdCategory() == categoryId) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    if (index != -1) {
                                        int totalLessons = lessonResponse.getMeta() != null
                                                ? lessonResponse.getMeta().getTotal()
                                                : lessonResponse.getData().size();
                                        LessonSection updatedSection = new LessonSection(
                                                categoryId,
                                                category.getName(),
                                                totalLessons,
                                                lessonResponse.getData()
                                        );
                                        sectionList.set(index, updatedSection);
                                        sectionAdapter.notifyItemChanged(index);
                                    }
                                }
                            }

                            @Override
                            public void onError(String message) {
                                if (!isAdded() || sessionId != currentSessionId) {
                                    return;
                                }
                                Context context = getContext();
                                if (context != null) {
                                    Toast.makeText(context, "Lỗi tải bài học: " + message, Toast.LENGTH_SHORT).show();
                                }
                            }
                        });
                    }
                }
            }

            @Override
            public void onError(String message) {
                if (!isAdded() || sessionId != currentSessionId) {
                    return;
                }
                Context context = getContext();
                if (context != null) {
                    Toast.makeText(context, "Lỗi tải danh mục: " + message, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showCreatePersonalFolderDialog() {
        View dialogView = LayoutInflater.from(requireContext())
                .inflate(R.layout.dialog_create_vocabulary_folder, null);
        TextView tvDialogTitle = dialogView.findViewById(R.id.tvDialogTitle);
        tvDialogTitle.setText("Tạo danh mục bài học");
        EditText inputFolderName = dialogView.findViewById(R.id.etFolderName);
        inputFolderName.setHint("Tên danh mục");
        Button btnCancel = dialogView.findViewById(R.id.btnCancelCreateFolder);
        Button btnConfirm = dialogView.findViewById(R.id.btnConfirmCreateFolder);

        androidx.appcompat.app.AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .create();

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnConfirm.setOnClickListener(v -> {
            String categoriesName = inputFolderName.getText().toString().trim();
            if (categoriesName.isEmpty()) {
                inputFolderName.setError("Vui lòng nhập tên danh mục");
                return;
            }
            btnConfirm.setEnabled(false);
            createPersonalFolder(categoriesName, dialog, btnConfirm);
        });

        dialog.show();
        Window window = dialog.getWindow();
        if (window != null) {
            window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }
    }

    private void createPersonalFolder(String categoriesName, AlertDialog dialog, Button btnConfirm) {
        CreateCategoryRequest request = new CreateCategoryRequest(categoriesName);
        categoriesRepository.createCategory(request, new CategoriesRepository.categoryCallback<ApiResponse<CategoryResponse>>() {
            @Override
            public void onSuccess(ApiResponse<CategoryResponse> data) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Đã tạo thư mục: " + categoriesName, Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                sectionList.clear();
                sectionAdapter.notifyDataSetChanged();
                loadDataFromApi();
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) return;
                btnConfirm.setEnabled(true);
                Toast.makeText(requireContext(), "Lỗi tạo danh mục: " + message, Toast.LENGTH_SHORT).show();
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
