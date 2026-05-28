package com.example.app.feature.progress;

import static android.content.ContentValues.TAG;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.example.app.R;
import com.example.app.adapter.progress.ProgressPagerAdapter;
import com.example.app.data.remote.model.response.ApiResponse;
import com.example.app.data.remote.model.response.progress.ProgressSumaryResponse;
import com.example.app.data.repository.ProgressRepository;
import com.example.app.utils.BaseCallback;

public class ProgressFragment extends Fragment {
    private ProgressRepository progressRepository;
    LinearLayout tab_completed;
    LinearLayout tab_uncompleted;
    TextView tv_uncompleted_count;
    TextView tv_completed_count;
    ViewPager2 view_pager;


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_progress, container, false);
        progressRepository = new ProgressRepository(requireContext());
        tab_uncompleted = view.findViewById(R.id.tab_uncompleted);
        tab_completed = view.findViewById(R.id.tab_completed);
        tv_uncompleted_count = view.findViewById(R.id.tv_uncompleted_count);
        tv_completed_count = view.findViewById(R.id.tv_completed_count);
        view_pager = view.findViewById(R.id.view_pager);
        view_pager.setAdapter(new ProgressPagerAdapter(this));
        fetchProgressSummary();
        tab_uncompleted.setOnClickListener(v -> {
            view_pager.setCurrentItem(0);
        });
        tab_completed.setOnClickListener(v -> {
            view_pager.setCurrentItem(1);
        });
        view_pager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                if (position == 0) {
                    tab_uncompleted.setBackgroundResource(R.drawable.bg_tab_selected);
                    tab_completed.setBackgroundResource(R.drawable.bg_tab_unselected);
                } else {
                    tab_uncompleted.setBackgroundResource(R.drawable.bg_tab_unselected);
                    tab_completed.setBackgroundResource(R.drawable.bg_tab_selected);
                }
            }
        });
        return view;
    }
    public void fetchProgressSummary() {
        progressRepository.getProgressSummary(new BaseCallback<ApiResponse<ProgressSumaryResponse>>() {
            @Override
            public void onSuccess(ApiResponse<ProgressSumaryResponse> data) {
                if(data != null && data.getData() != null) {
                    tv_uncompleted_count.setText(data.getData().getUnfinishedCount() + "");
                    tv_completed_count.setText(data.getData().getCompletedCount() + "");
                }
                else {
                    tv_uncompleted_count.setText("0");
                    tv_completed_count.setText("0");
                }
            }
            @Override
            public void onError(String message) {
                Log.e(TAG, "Lỗi tải summary: " + message);
            }
        });
    }
}
