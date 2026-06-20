package com.example.app.feature.study;

import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
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
import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.model.request.category.CreateCategoryRequest;
import com.example.app.data.remote.model.request.lessons.CreateLessonRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.categories.CategoryResponse;
import com.example.app.data.remote.model.response.lessons.LessonsResponse;
import com.example.app.data.repository.CategoriesRepository;
import com.example.app.data.repository.LessonsRepository;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.diaglog.ChooseModeBottomSheet;

import java.util.ArrayList;
import java.util.List;

public class LessonsListFragment extends Fragment {
    private ProgressRepository progressRepository;
    private CategoriesRepository categoriesRepository;
    private ImageButton btnCreate;
    private int countDone;
    private int countLearning;
    Toolbar toolbar;
    private String currentCategoryName;
    private int currentCategoryId = -1;
    private List<LessonsResponse> lessonsResponseList = new ArrayList<>();
    private ListLessonsAdapter adapter;
    private LessonsRepository lessonsRepository;
    private TextView CountNotStarted;
    private TextView CountLearning;
    private TextView CountDone;
    private ImageButton btnDelete;
    private String userRole;


    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_lesson_list, container, false);
        RecyclerView recyclerView = view.findViewById(R.id.rvLessons);
        categoriesRepository = new CategoriesRepository(requireContext());
        TokenManager tokenManager = TokenManager.getInstance(requireContext());
        btnCreate = view.findViewById(R.id.btnCreate);
        userRole = tokenManager.getUserRole();
        Log.d("userRole", String.valueOf(userRole));
        if ("admin".equals(userRole)) {
            btnCreate.setVisibility(View.VISIBLE);
            view.findViewById(R.id.btnDelete).setVisibility(View.VISIBLE);
        } else {
            view.findViewById(R.id.btnDelete).setVisibility(View.GONE);
            btnCreate.setVisibility(View.GONE);
        }
        CountDone = view.findViewById(R.id.tvCountDone);
        CountLearning = view.findViewById(R.id.tvCountLearning);
        CountNotStarted = view.findViewById(R.id.tvCountNotStarted);
        toolbar = view.findViewById(R.id.toolbar);
        btnCreate.setOnClickListener(v -> {
            showCreateLesson();

        });
        btnDelete = view.findViewById(R.id.btnDelete);
        btnDelete.setOnClickListener(v -> {
            new AlertDialog.Builder(requireContext())
                    .setTitle("Xác nhận")
                    .setMessage("Bạn có muốn xóa không?")
                    .setPositiveButton("Xóa", (dialog, which) -> {
                        categoriesRepository.deleteCategory(currentCategoryId, new CategoriesRepository.categoryCallback<ApiResponse<CategoryResponse>>() {
                            @Override
                            public void onSuccess(ApiResponse<CategoryResponse> data) {
                                Toast.makeText(requireContext(), "Xóa thành công", Toast.LENGTH_SHORT).show();
                                Navigation.findNavController(requireView()).popBackStack();
                            }

                            @Override
                            public void onError(String message) {
                                Toast.makeText(requireContext(), "Xóa thất bại", Toast.LENGTH_SHORT).show();
                            }
                        });
                    })
                    .setNegativeButton("Hủy", null)
                    .show();
        });

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
        lessonsRepository = new LessonsRepository(requireContext());
        recyclerView.setAdapter(adapter);
        fetchLessons();
        return view;
    }

    public void fetchLessons(){
        if (currentCategoryId == -1) return;
        lessonsRepository.getLessons(100, 1,null, currentCategoryId, null,
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

    private void showCreateLesson() {
        View dialogView = LayoutInflater.from(requireContext())
                .inflate(R.layout.dialog_create_vocabulary_folder, null);
        TextView tvDialogTitle = dialogView.findViewById(R.id.tvDialogTitle);
        tvDialogTitle.setText("Tạo bài học");
        EditText inputFolderName = dialogView.findViewById(R.id.etFolderName);
        inputFolderName.setHint("Link youtube bài học");
        Button btnCancel = dialogView.findViewById(R.id.btnCancelCreateFolder);
        Button btnConfirm = dialogView.findViewById(R.id.btnConfirmCreateFolder);

        androidx.appcompat.app.AlertDialog dialog = new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .create();

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnConfirm.setOnClickListener(v -> {
            String youtubeLink = inputFolderName.getText().toString().trim();
            if (youtubeLink.isEmpty()) {
                inputFolderName.setError("Vui lòng nhập link youtube bài học");
                return;
            }
            btnConfirm.setEnabled(false);
            createLesson(youtubeLink, currentCategoryId, dialog, btnConfirm);
        });

        dialog.show();
        Window window = dialog.getWindow();
        if (window != null) {
            window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }
    }

    private void createLesson(String youtubeLink, int categoryId, androidx.appcompat.app.AlertDialog dialog, Button btnConfirm) {
        CreateLessonRequest request = new CreateLessonRequest(categoryId, youtubeLink);
        lessonsRepository.createLesson(request, new LessonsRepository.lessonsCallback<ApiResponse<LessonsResponse>>() {
            @Override
            public void onSuccess(ApiResponse<LessonsResponse> data) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Đã tạo bài học: " + youtubeLink, Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                fetchLessons();
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) return;
                btnConfirm.setEnabled(true);
                Toast.makeText(requireContext(), "Lỗi tạo bài học: " + message, Toast.LENGTH_SHORT).show();
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
