package com.example.app.utils;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.List;

public class YouTubeWebViewManager {
    private final WebView webView;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable stopSegmentRunnable;
    private float playbackSpeed = 1.0f;

    public YouTubeWebViewManager(WebView webView) {
        this.webView = webView;
    }

    public void setupYoutubeWebView(Context context, String lessonVideoUrl) {
        if (webView == null || lessonVideoUrl == null || lessonVideoUrl.isEmpty()) {
            return;
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        String defaultUA = settings.getUserAgentString();
        String fakedUA = defaultUA.replace("; wv", "");
        settings.setUserAgentString(fakedUA);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());

        String embedUrl = buildEmbedUrl(lessonVideoUrl);

        String appOrigin = "https://" + context.getPackageName();
        String youtubeParams = "controls=0"
                + "&disablekb=1"
                + "&fs=0"
                + "&iv_load_policy=3"
                + "&cc_load_policy=0"
                + "&modestbranding=1"
                + "&rel=0"
                + "&playsinline=1"
                + "&enablejsapi=1"
                + "&origin=" + appOrigin;

        if (embedUrl.contains("?")) {
            embedUrl += "&" + youtubeParams;
        } else {
            embedUrl += "?" + youtubeParams;
        }

        String html = "<!DOCTYPE html>" +
                "<html style='margin:0;padding:0;height:100%;'>" +
                "<body style='margin:0;padding:0;height:100%;background:#000;'>" +
                "<iframe width='100%' height='100%' style='display:block;' src='" + embedUrl + "' " +
                "allow='autoplay; encrypted-media' referrerpolicy='strict-origin-when-cross-origin' frameborder='0'>" +
                "</iframe>" +
                "</body></html>";

        webView.loadDataWithBaseURL(appOrigin, html, "text/html", "utf-8", null);
    }

    private String buildEmbedUrl(String lessonVideoUrl) {
        String url = lessonVideoUrl.trim();
        if (url.startsWith("http://")) {
            url = url.replaceFirst("http://", "https://");
        }

        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host != null) {
                String lowerHost = host.toLowerCase();
                String path = uri.getPath();
                if (lowerHost.contains("youtube.com") || lowerHost.contains("youtube-nocookie.com")) {
                    if (path != null && path.startsWith("/embed/")) {
                        return url.replace("youtube.com", "youtube-nocookie.com");
                    }
                    String videoId = uri.getQueryParameter("v");
                    if (!isBlank(videoId)) {
                        return "https://www.youtube-nocookie.com/embed/" + videoId;
                    }
                } else if (lowerHost.contains("youtu.be")) {
                    List<String> segments = uri.getPathSegments();
                    if (segments != null && !segments.isEmpty() && !isBlank(segments.get(0))) {
                        return "https://www.youtube-nocookie.com/embed/" + segments.get(0);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return url.replace("watch?v=", "embed/")
                .replace("youtube.com", "youtube-nocookie.com");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void callYouTubeCommand(String functionName, String args) {
        if (webView == null) return;
        String jsCommand = "javascript:(function() { " +
                "var iframe = document.querySelector('iframe'); " +
                "if(iframe && iframe.contentWindow) { " +
                "   iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: '" + functionName + "', args: [" + args + "]}), '*'); " +
                "} " +
                "})()";
        webView.evaluateJavascript(jsCommand, null);
    }

    public void changeSpeed(float speed) {
        if (speed <= 0) {
            return;
        }
        playbackSpeed = speed;
        callYouTubeCommand("setPlaybackRate", String.valueOf(speed));
    }

    public void seekTo(float seconds) {
        callYouTubeCommand("seekTo", seconds + ", true");
    }

    public void playVideo() {
        callYouTubeCommand("playVideo", "");
    }

    public void playFromTo(float startTime, float endTime) {
        if (webView == null) return;
        if (endTime <= startTime) return;

        cancelSegmentPlayback();

        float safeStartTime = Math.max(0, startTime);
        long durationMs = (long) (((endTime - safeStartTime) * 1000) / Math.max(0.25f, playbackSpeed));

        seekTo(safeStartTime);
        playVideo();

        stopSegmentRunnable = () -> pauseVideo();
        handler.postDelayed(stopSegmentRunnable, durationMs);
    }

    public void cancelSegmentPlayback() {
        if (stopSegmentRunnable != null) {
            handler.removeCallbacks(stopSegmentRunnable);
            stopSegmentRunnable = null;
        }
    }

    public void pauseVideo() {
        callYouTubeCommand("pauseVideo", "");
    }

    public void stopVideo() {
        cancelSegmentPlayback();
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.onPause();
        }
    }

    public void destroy() {
        cancelSegmentPlayback();
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.onPause();
            webView.removeAllViews();
            webView.destroy();
        }
    }
}
