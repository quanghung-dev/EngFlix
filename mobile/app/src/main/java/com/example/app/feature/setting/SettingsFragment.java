package com.example.app.feature.setting;

import androidx.appcompat.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.app.R;
import com.example.app.data.local.TokenManager;
import com.google.firebase.auth.FirebaseAuth;

public class SettingsFragment extends Fragment {

    private TokenManager tokenManager;
    private TextView tvTitle;
    private TextView tvSubtitle;
    private CardView cardLogin;
    private CardView cardLogout;
    private LinearLayout rowNotes;
    private LinearLayout cardProfile;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_settings, container, false);
        cardProfile = view.findViewById(R.id.cardProfile);
        tokenManager = TokenManager.getInstance(requireContext());
        tvTitle = view.findViewById(R.id.tvTitle);
        tvSubtitle = view.findViewById(R.id.tvSubtitle);
        cardLogin = view.findViewById(R.id.cardLogin);
        cardLogout = view.findViewById(R.id.cardLogout);
        rowNotes = view.findViewById(R.id.rowNotes);
        cardProfile.setOnClickListener(v -> navigateToProfileOrLogin(v));
        rowNotes.setOnClickListener(v -> navigateToNotesOrLogin(v));
        setupMenuRows(view);
        setupLogout();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        updateProfileUI();
    }

    private void updateProfileUI() {
        if (tokenManager.hasToken()) {
            String userName = tokenManager.getUserName();
            String userEmail = tokenManager.getUserEmail();

            tvTitle.setText(userName != null
                    && !userName.isEmpty() ? userName : "Người dùng");
            tvSubtitle.setText(userEmail != null ? userEmail : "");

            cardLogin.setOnClickListener(v -> {
                Navigation.findNavController(v)
                        .navigate(R.id.action_settingsFragment_to_ProfileFragment);
            });
            cardLogout.setVisibility(View.VISIBLE);

        } else {
            tvTitle.setText("Đăng nhập");
            tvSubtitle.setText("Đồng bộ tiến độ của bạn trên các thiết bị");

            cardLogin.setOnClickListener(v -> {
                Navigation.findNavController(v)
                        .navigate(R.id.action_settingsFragment_to_loginFragment);
            });

            cardLogout.setVisibility(View.GONE);
        }
    }

    private void setupMenuRows(View view) {
        view.findViewById(R.id.rowProgress).setOnClickListener(v -> {
            Navigation.findNavController(v).navigate(R.id.progressFragment);
        });

        view.findViewById(R.id.rowMyVocabulary).setOnClickListener(v -> {
            Navigation.findNavController(v).navigate(R.id.vocabularyFragment);
        });
    }

    private void setupLogout() {
        cardLogout.setOnClickListener(v -> showLogoutDialog());
    }

    private void navigateToProfileOrLogin(View view) {
        Navigation.findNavController(view).navigate(
                tokenManager.hasToken()
                        ? R.id.action_settingsFragment_to_ProfileFragment
                        : R.id.action_settingsFragment_to_loginFragment
        );
    }

    private void navigateToNotesOrLogin(View view) {
        Navigation.findNavController(view).navigate(
                tokenManager.hasToken()
                        ? R.id.action_settingsFragment_to_myNotesFragment
                        : R.id.action_settingsFragment_to_loginFragment
        );
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(requireActivity())
                .setTitle("Đăng xuất")
                .setMessage("Bạn có chắc muốn đăng xuất không?")
                .setPositiveButton("Đăng xuất", (dialog, which) -> {
                    performLogout();
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void performLogout() {
        FirebaseAuth.getInstance().signOut();
        tokenManager.clear();
        updateProfileUI();
    }
}
