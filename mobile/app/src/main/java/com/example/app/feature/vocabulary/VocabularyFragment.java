package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.example.app.R;
import com.example.app.adapter.vocabulary.VocabularyPagerAdapter;
import com.example.app.data.remote.model.request.vocaDecks.CreateVocaDeckRequest;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.vocabulary.VocaDecksResponse;
import com.example.app.data.repository.VocabularyRepository;
import com.example.app.utils.BaseCallback;

public class VocabularyFragment extends Fragment {
    private LinearLayout tabAvailableDecks;
    private LinearLayout tabUserDecks;
    private ViewPager2 viewPager;
    private ImageView btnCreateFolder;
    private VocabularyRepository vocabularyRepository;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_page, container, false);
        tabAvailableDecks = view.findViewById(R.id.tab_available_decks);
        tabUserDecks = view.findViewById(R.id.tab_user_decks);
        viewPager = view.findViewById(R.id.view_pager);
        btnCreateFolder = view.findViewById(R.id.btnCreateFolder);
        vocabularyRepository = new VocabularyRepository(requireContext());

        viewPager.setAdapter(new VocabularyPagerAdapter(this));
        btnCreateFolder.setOnClickListener(v -> showCreatePersonalFolderDialog());
        tabAvailableDecks.setOnClickListener(v -> viewPager.setCurrentItem(0));
        tabUserDecks.setOnClickListener(v -> viewPager.setCurrentItem(1));
        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                updateSelectedTab(position);
            }
        });
        updateSelectedTab(0);
        return view;
    }

    private void updateSelectedTab(int position) {
        if (position == 0) {
            tabAvailableDecks.setBackgroundResource(R.drawable.bg_tab_selected);
            tabUserDecks.setBackgroundResource(R.drawable.bg_tab_unselected);
        } else {
            tabAvailableDecks.setBackgroundResource(R.drawable.bg_tab_unselected);
            tabUserDecks.setBackgroundResource(R.drawable.bg_tab_selected);
        }
    }

    private void showCreatePersonalFolderDialog() {
        EditText inputFolderName = new EditText(requireContext());
        inputFolderName.setHint("Tên thư mục");
        inputFolderName.setSingleLine(true);
        int horizontalPadding = (int) (20 * getResources().getDisplayMetrics().density);
        inputFolderName.setPadding(horizontalPadding, 0, horizontalPadding, 0);

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setTitle("Tạo thư mục cá nhân")
                .setView(inputFolderName)
                .setPositiveButton("Create", null)
                .setNegativeButton("Huỷ", (dialogInterface, which) -> dialogInterface.dismiss())
                .create();

        dialog.setOnShowListener(dialogInterface -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String folderName = inputFolderName.getText().toString().trim();
            if (folderName.isEmpty()) {
                inputFolderName.setError("Vui lòng nhập tên thư mục");
                return;
            }
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(false);
            createPersonalFolder(folderName, dialog);
        }));
        dialog.show();
    }

    private void createPersonalFolder(String folderName, AlertDialog dialog) {
        CreateVocaDeckRequest request = new CreateVocaDeckRequest(
                0,
                folderName,
                "Bộ từ vựng cá nhân",
                null,
                null
        );
        vocabularyRepository.createVocaDeck(request, new BaseCallback<ApiResponse<VocaDecksResponse>>() {
            @Override
            public void onSuccess(ApiResponse<VocaDecksResponse> data) {
                Toast.makeText(requireContext(), "Đã tạo thư mục: " + folderName, Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                viewPager.setCurrentItem(1, true);
                getChildFragmentManager().setFragmentResult(
                        VocabularyDecksPageFragment.REQUEST_REFRESH_USER_DECKS,
                        new Bundle()
                );
            }

            @Override
            public void onError(String message) {
                dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(true);
                Toast.makeText(requireContext(), "Lỗi tạo thư mục: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
