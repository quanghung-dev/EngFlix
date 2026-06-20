package com.example.app.feature.setting;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.bumptech.glide.Glide;
import com.example.app.R;
import com.example.app.data.local.TokenManager;
import com.example.app.data.remote.model.request.auth.UpdateProfileRequest;
import com.example.app.data.remote.model.response.user.UserResponse;
import com.example.app.data.repository.UserRepository;

import de.hdodenhof.circleimageview.CircleImageView;

public class ProfileFragment extends Fragment {
    private TokenManager tokenManager;
    private UserRepository userRepository;
    private EditText etFullName;
    private EditText etEmail;
    private EditText etPhone;
    private CircleImageView ivAvatar;
    private FrameLayout btnBack;
    private FrameLayout btnEditAvatar;
    private Button btnSave;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_edit_profile, container, false);
        
        tokenManager = TokenManager.getInstance(requireContext());
        userRepository = new UserRepository(requireContext());
        
        etFullName = view.findViewById(R.id.et_full_name);
        etEmail = view.findViewById(R.id.et_email);
        etPhone = view.findViewById(R.id.et_phone);
        ivAvatar = view.findViewById(R.id.iv_avatar);
        btnBack = view.findViewById(R.id.btn_back);
        btnEditAvatar = view.findViewById(R.id.btn_edit_avatar);
        btnSave = view.findViewById(R.id.btn_save);

        // Bind data from local TokenManager
        etFullName.setText(tokenManager.getUserName());
        etEmail.setText(tokenManager.getUserEmail());
        etPhone.setText(tokenManager.getUserPhone());
        
        // Load avatar if exists
        String avatarUrl = tokenManager.getAvatarUrl();
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            Glide.with(this)
                    .load(avatarUrl)
                    .placeholder(R.drawable.img_placeholder_thumbnail)
                    .error(R.drawable.img_placeholder_thumbnail)
                    .into(ivAvatar);
        } else {
            ivAvatar.setImageResource(R.drawable.img_placeholder_thumbnail);
        }

        // Email field is read-only (fixed, cannot be edited)
        etEmail.setEnabled(false);
        etEmail.setFocusable(false);

        // Set click listeners
        btnBack.setOnClickListener(v -> Navigation.findNavController(v).popBackStack());
        
        ivAvatar.setOnClickListener(v -> 
            Toast.makeText(requireContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show()
        );
        
        btnEditAvatar.setOnClickListener(v -> 
            Toast.makeText(requireContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show()
        );

        btnSave.setOnClickListener(v -> saveProfile());

        return view;
    }

    private void saveProfile() {
        String name = etFullName.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();

        if (name.isEmpty()) {
            etFullName.setError("Họ và tên không được để trống");
            return;
        }

        btnSave.setEnabled(false);
        btnSave.setText("ĐANG LƯU...");

        UpdateProfileRequest request = new UpdateProfileRequest(name, phone);
        userRepository.updateProfile(request, new UserRepository.userCallBack<UserResponse>() {
            @Override
            public void onSuccess(UserResponse data) {
                if (!isAdded() || getView() == null) {
                    return;
                }
                
                // Update local token manager
                tokenManager.saveUserInfo(
                        data.getUid(),
                        data.getEmail(),
                        data.getName(),
                        data.getAvatarUrl(),
                        data.getUserRole(),
                        data.getPhone()
                );

                Toast.makeText(requireContext(), "Cập nhật hồ sơ thành công", Toast.LENGTH_SHORT).show();
                
                // Reset save button state
                btnSave.setEnabled(true);
                btnSave.setText("SAVE");
                
                // Navigate back
                Navigation.findNavController(getView()).popBackStack();
            }

            @Override
            public void onError(String message) {
                if (!isAdded()) {
                    return;
                }
                btnSave.setEnabled(true);
                btnSave.setText("SAVE");
                Toast.makeText(requireContext(), "Lỗi cập nhật: " + message, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
