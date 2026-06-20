package com.example.app.data.remote.model.response.user;

import com.google.gson.annotations.SerializedName;

public class UserResponse {
        private String uid;
        private String email;
        private String name;
        private String phone;

        @SerializedName("user_role")
        private String userRole;

        @SerializedName("avatar_url")
        private String avatarUrl;

        @SerializedName("created_at")
        private String createdAt;

        public String getUid() {
            return uid;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public String getUserRole() {
            return userRole;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public String getPhone() {
        return phone;
        }
}
