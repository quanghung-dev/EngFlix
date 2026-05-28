package com.example.app.utils;

import android.content.Context;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class YouTubeWebViewManager {
    private final WebView webView;

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

        String embedUrl = lessonVideoUrl;
        if (embedUrl.startsWith("http://")) {
            embedUrl = embedUrl.replaceFirst("http://", "https://");
        }

        if (embedUrl.contains("watch?v=")) {
            embedUrl = embedUrl.replace("watch?v=", "embed/");
        } else if (embedUrl.contains("youtu.be/")) {
            embedUrl = "https://www.youtube.com/embed/" + embedUrl.substring(embedUrl.lastIndexOf("/") + 1);
        }

        embedUrl = embedUrl.replace("youtube.com", "youtube-nocookie.com");

        String appOrigin = "https://" + context.getPackageName();
        String youtubeParams = "controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=" + appOrigin;

        if (embedUrl.contains("?")) {
            embedUrl += "&" + youtubeParams;
        } else {
            embedUrl += "?" + youtubeParams;
        }

        String html = "<!DOCTYPE html>" +
                "<html style='margin:0;padding:0;height:100%;'>" +
                "<body style='margin:0;padding:0;height:100%;background:#000;'>" +
                "<iframe width='100%' height='100%' style='display:block;' src='" + embedUrl + "' " +
                "allow='autoplay; encrypted-media; fullscreen' referrerpolicy='strict-origin-when-cross-origin' frameborder='0' allowfullscreen>" +
                "</iframe>" +
                "</body></html>";

        webView.loadDataWithBaseURL(appOrigin, html, "text/html", "utf-8", null);
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
        callYouTubeCommand("setPlaybackRate", String.valueOf(speed));
    }

    public void seekTo(float seconds) {
        callYouTubeCommand("seekTo", seconds + ", true");
    }

    public void playVideo() {
        callYouTubeCommand("playVideo", "");
    }

    public void pauseVideo() {
        callYouTubeCommand("pauseVideo", "");
    }

    public void stopVideo() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.onPause();
        }
    }

    public void destroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.onPause();
            webView.removeAllViews();
            webView.destroy();
        }
    }
}
