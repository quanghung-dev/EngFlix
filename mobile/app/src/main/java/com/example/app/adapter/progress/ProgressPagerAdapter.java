package com.example.app.adapter.progress;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.example.app.feature.progress.ProgressFragmentCompleted;
import com.example.app.feature.progress.ProgressFragmentUncompleted;

public class ProgressPagerAdapter extends FragmentStateAdapter {
    public ProgressPagerAdapter(@NonNull Fragment fragment) {
        super(fragment);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position) {
            case 0:
                return new ProgressFragmentUncompleted();
            case 1:
                return new ProgressFragmentCompleted();
            default:
                return new ProgressFragmentUncompleted();
        }
    }

    @Override
    public int getItemCount() {
        return 2;
    }
}
