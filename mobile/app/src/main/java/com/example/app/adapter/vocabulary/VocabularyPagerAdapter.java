package com.example.app.adapter.vocabulary;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.example.app.feature.vocabulary.VocabularyAvailableDecksFragment;
import com.example.app.feature.vocabulary.VocabularyUserDecksFragment;

public class VocabularyPagerAdapter extends FragmentStateAdapter {
    public VocabularyPagerAdapter(@NonNull Fragment fragment) {
        super(fragment);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        if (position == 1) {
            return new VocabularyUserDecksFragment();
        }
        return new VocabularyAvailableDecksFragment();
    }

    @Override
    public int getItemCount() {
        return 2;
    }
}
