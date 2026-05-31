package com.example.app.feature.vocabulary;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.example.app.R;
import com.example.app.adapter.vocabulary.VocabularyPagerAdapter;

public class VocabularyFragment extends Fragment {
    private LinearLayout tabAvailableDecks;
    private LinearLayout tabUserDecks;
    private ViewPager2 viewPager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vocabulary_page, container, false);
        tabAvailableDecks = view.findViewById(R.id.tab_available_decks);
        tabUserDecks = view.findViewById(R.id.tab_user_decks);
        viewPager = view.findViewById(R.id.view_pager);

        viewPager.setAdapter(new VocabularyPagerAdapter(this));
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
}
