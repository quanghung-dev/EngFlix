const authService = require('../services/authService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');

const ownProfilePayload = (user, counts) => ({
    ...user,
    name: user.name?.trim() || user.email?.split('@')[0] || 'Học viên EngFlex',
    ...counts
});

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 400, 'Email and password are required');
        }

        const token = await authService.signInWithFirebase({ email, password });
        return dataResponse(res, 200, token);
    } catch (error) {
        console.error('Error logging in with Firebase:', error);
        next(error);
    }
};

const syncUser = async (req, res, next) => {
    try {
        const { uid, email, name, avatarUrl, phone } = req.user;

        if (!uid || !email) {
            return errorResponse(res, 400, 'Authenticated Firebase user must have uid and email');
        }

        const user = await authService.syncUser({ uid, email, name, avatarUrl, phone });
        return dataResponse(res, 200, user);
    } catch (error) {
        console.error('Error syncing user:', error);
        next(error);
    }
};

const getOwnProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const [user, counts] = await Promise.all([
            authService.getUserByUid(uid),
            authService.getUserProfileCounts(uid)
        ]);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        return dataResponse(res, 200, ownProfilePayload(user, counts));
    } catch (error) {
        console.error('Error getting own profile:', error);
        next(error);
    }
};

const getPublicProfile = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const [user, counts] = await Promise.all([
            authService.getUserByUid(uid),
            authService.getUserProfileCounts(uid)
        ]);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const publicName = user.name && user.name !== user.email
            ? user.name
            : 'Học viên EngFlex';

        return dataResponse(res, 200, {
            uid: user.uid,
            name: publicName,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            ...counts
        });
    } catch (error) {
        console.error('Error getting public profile:', error);
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { name, phone } = req.body;

        if (!uid) {
            return errorResponse(res, 401, 'Unauthorized');
        }

        if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
            return errorResponse(res, 400, 'name must be a non-empty string');
        }
        if (typeof name === 'string' && name.trim().length > 255) {
            return errorResponse(res, 400, 'name must be at most 255 characters');
        }
        if (phone !== undefined && phone !== null && typeof phone !== 'string') {
            return errorResponse(res, 400, 'phone must be a string');
        }
        if (typeof phone === 'string' && phone.trim().length > 20) {
            return errorResponse(res, 400, 'phone must be at most 20 characters');
        }

        const [user, counts] = await Promise.all([
            authService.updateUser(uid, {
                name: typeof name === 'string' ? name.trim() : name,
                phone: typeof phone === 'string' ? phone.trim() : phone
            }),
            authService.getUserProfileCounts(uid)
        ]);
        return dataResponse(res, 200, ownProfilePayload(user, counts));
    } catch (error) {
        console.error('Error updating user profile:', error);
        next(error);
    }
};

// Cập nhật avatar URL (nhận URL từ Firebase Storage do frontend upload)
const updateAvatar = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { avatarUrl } = req.body;

        if (!uid) {
            return errorResponse(res, 401, 'Unauthorized');
        }

        if (typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
            return errorResponse(res, 400, 'avatarUrl is required');
        }
        if (avatarUrl.trim().length > 500) {
            return errorResponse(res, 400, 'avatarUrl must be at most 500 characters');
        }

        const [user, counts] = await Promise.all([
            authService.updateUser(uid, { avatarUrl: avatarUrl.trim() }),
            authService.getUserProfileCounts(uid)
        ]);
        return dataResponse(res, 200, ownProfilePayload(user, counts));
    } catch (error) {
        console.error('Error updating avatar:', error);
        next(error);
    }
};

module.exports = {
    login,
    syncUser,
    getOwnProfile,
    getPublicProfile,
    updateProfile,
    updateAvatar
};
