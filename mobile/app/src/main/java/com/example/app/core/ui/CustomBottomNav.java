package com.example.app.core.ui;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.widget.LinearLayout;

import androidx.core.content.ContextCompat;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.NavOptions;

import com.example.app.R;

import java.util.ArrayList;
import java.util.List;

public class CustomBottomNav extends LinearLayout {

    private final List<NavItem> items = new ArrayList<>();
    private final List<Integer> destinations = new ArrayList<>();
    private NavController navController;

    public CustomBottomNav(Context context) {
        super(context); init();
    }
    public CustomBottomNav(Context context, AttributeSet attrs) {
        super(context, attrs); init();
    }
    public CustomBottomNav(Context context, AttributeSet attrs, int def) {
        super(context, attrs, def); init();
    }

    private void init() {
        setOrientation(HORIZONTAL);
    }

    public void setup(NavController navController) {
        this.navController = navController;

        // Thêm từng tab — đổi icon và destinationId cho đúng với nav_graph của bạn
        addTab(R.drawable.ic_study, "Học tập", R.id.StudyFragment);
        addTab(R.drawable.ic_vocab,    "Từ vựng",  R.id.vocabularyFragment);
        addTab(R.drawable.ic_progress, "Tiến độ",  R.id.progressFragment);
        addTab(R.drawable.ic_settings, "Cài đặt",  R.id.settingsFragment);

        // Active tab đầu tiên
        if (!items.isEmpty()) items.get(0).setActive(true);

        // Sync khi navigate bằng back button
        navController.addOnDestinationChangedListener((ctrl, dest, args) -> {
            for (int i = 0; i < destinations.size(); i++) {
                items.get(i).setActive(destinations.get(i) == dest.getId());
            }
        });
    }

    private void addTab(int iconRes, String label, int destinationId) {
        NavItem item = new NavItem(getContext());

        // Weight đều nhau để chia đều thanh ngang
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                0, LayoutParams.MATCH_PARENT, 1f);
        item.setLayoutParams(params);

        Drawable icon = ContextCompat.getDrawable(getContext(), iconRes);
        item.setIcon(icon);
        item.setLabel(label);
        item.setOnClickListener(v -> {
            if (navController == null) {
                return;
            }

            NavDestination currentDestination = navController.getCurrentDestination();
            if (currentDestination != null && currentDestination.getId() == destinationId) {
                return;
            }

            NavOptions navOptions = new NavOptions.Builder()
                    .setLaunchSingleTop(true)
                    .setRestoreState(true)
                    .setPopUpTo(navController.getGraph().getStartDestinationId(), false, true)
                    .build();
            navController.navigate(destinationId, null, navOptions);
        });

        addView(item);
        items.add(item);
        destinations.add(destinationId);
    }
}
