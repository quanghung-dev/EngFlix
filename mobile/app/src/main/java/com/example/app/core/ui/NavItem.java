package com.example.app.core.ui;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.DecelerateInterpolator;

public class NavItem extends View {

    private Paint bgPaint, textPaint;
    private RectF bgRect = new RectF();
    private float animProgress = 0f;
    private String label = "";
    private Drawable icon;
    private boolean isActive = false;

    private static final int COLOR_ACTIVE_BG   = 0xFFF0F0F0;
    private static final int COLOR_ACTIVE_TEXT  = 0xFF111111;
    private static final int COLOR_ICON_ACTIVE  = 0xFF111111;
    private static final int COLOR_ICON_MUTED   = 0xFFC0C0C0;

    public NavItem(Context context) { super(context); init(); }
    public NavItem(Context context, AttributeSet attrs) { super(context, attrs); init(); }
    public NavItem(Context context, AttributeSet attrs, int def) { super(context, attrs, def); init(); }

    private void init() {
        bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(COLOR_ACTIVE_BG);

        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(COLOR_ACTIVE_TEXT);
        textPaint.setTextSize(dpToPx(14));
        textPaint.setLetterSpacing(-0.02f);
    }

    public void setLabel(String label) { this.label = label; invalidate(); }
    public void setIcon(Drawable icon) { this.icon = icon; invalidate(); }
    public boolean isItemActive() { return isActive; }

    public void setActive(boolean active) {
        if (this.isActive == active) return;
        this.isActive = active;
        ValueAnimator anim = ValueAnimator.ofFloat(animProgress, active ? 1f : 0f);
        anim.setDuration(380);
        anim.setInterpolator(new DecelerateInterpolator(2f));
        anim.addUpdateListener(a -> {
            animProgress = (float) a.getAnimatedValue();
            invalidate();
        });
        anim.start();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        int w = getWidth(), h = getHeight();
        int iconSize = dpToPx(22);
        int paddingH = dpToPx(12);

        // Pill background với scale animation
        bgPaint.setAlpha((int)(animProgress * 255));
        float scaleX = 0.88f + 0.12f * animProgress;
        float scaleY = 0.80f + 0.20f * animProgress;
        float bgW = w * scaleX;
        float bgH = h * scaleY;
        bgRect.set((w - bgW) / 2f, (h - bgH) / 2f,
                (w + bgW) / 2f, (h + bgH) / 2f);
        canvas.drawRoundRect(bgRect, h / 2f, h / 2f, bgPaint);

        // Tính tổng width để căn giữa icon + label
        float textW = animProgress > 0.01f
                ? textPaint.measureText(label) * animProgress : 0;
        float gap = animProgress > 0.01f ? dpToPx(7) * animProgress : 0;
        float totalW = iconSize + gap + textW;
        float startX = (w - totalW) / 2f;

        // Icon
        if (icon != null) {
            int iconTop = (h - iconSize) / 2;
            int iconLeft = (int) startX;
            icon.setBounds(iconLeft, iconTop, iconLeft + iconSize, iconTop + iconSize);
            icon.setTint(blendColor(COLOR_ICON_MUTED, COLOR_ICON_ACTIVE, animProgress));
            icon.draw(canvas);
        }

        // Label slide in
        if (animProgress > 0.01f) {
            textPaint.setAlpha((int)(animProgress * 255));
            float labelX = startX + iconSize + gap
                    - dpToPx(5) * (1f - animProgress);
            float labelY = h / 2f
                    - (textPaint.ascent() + textPaint.descent()) / 2f;
            canvas.drawText(label, labelX, labelY, textPaint);
        }
    }

    private int blendColor(int from, int to, float r) {
        float f = 1f - r;
        int rr = (int)(((from>>16)&0xFF)*f + ((to>>16)&0xFF)*r);
        int gg = (int)(((from>>8) &0xFF)*f + ((to>>8) &0xFF)*r);
        int bb = (int)(( from     &0xFF)*f + ( to     &0xFF)*r);
        return 0xFF000000|(rr<<16)|(gg<<8)|bb;
    }

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }
}