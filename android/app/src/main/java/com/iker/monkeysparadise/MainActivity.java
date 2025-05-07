package com.iker.monkeysparadise;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.FullScreenContentCallback;

public class MainActivity extends BridgeActivity {

    private AdView adView;
    private InterstitialAd mInterstitialAd;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Inicializar AdMob
        MobileAds.initialize(this, initializationStatus -> {
        });
        loadInterstitialAd(); // Cargar interstitial

        // Banner
        adView = findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder().build();
        adView.loadAd(adRequest);
        adView.setVisibility(View.GONE);

        // WebView
        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient() {
            public void onPageFinished(WebView view, String url) {
                if (url.contains("index.html")) {
                    adView.setVisibility(View.VISIBLE);

                    // Reanudar la música del index
                    webView.evaluateJavascript(
                            "var music = document.getElementById('indexMusic'); if (music) { music.currentTime = 0; music.play().catch(() => {}); }",
                            null);
                } else {
                    adView.setVisibility(View.GONE);
                }
            }
        });

        // Permitir que JS llame funciones nativas
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.loadUrl("file:///android_asset/public/index.html");

        // Pantalla completa
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            final WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                            View.SYSTEM_UI_FLAG_FULLSCREEN |
                            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }
    }

    private void loadInterstitialAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        InterstitialAd.load(this, "ca-app-pub-9332413624515129/5629502093", adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(InterstitialAd ad) {
                        mInterstitialAd = ad;
                        mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                mInterstitialAd = null;
                                loadInterstitialAd();

                                if (webView != null) {
                                    webView.evaluateJavascript("showVictoryModal();", null);
                                }
                            }
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError adError) {
                        mInterstitialAd = null;
                    }
                });
    }

    private long lastBackPressedTime = 0;

    @Override
    public void onBackPressed() {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastBackPressedTime < 1000) {
            // 🔇 Parar toda la música desde JavaScript
            if (webView != null) {
                webView.evaluateJavascript(
                        "document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; });", null);
            }

            super.onBackPressed(); // Cierra la app
        } else {
            lastBackPressedTime = currentTime;
            runOnUiThread(() -> {
                android.widget.Toast
                        .makeText(this, "Pulsa 2 veces seguidas para salir", android.widget.Toast.LENGTH_SHORT)
                        .show();
            });
        }
    }

    public void showInterstitialAd() {
        runOnUiThread(() -> {
            if (mInterstitialAd != null) {
                mInterstitialAd.show(this);
            } else {
                if (webView != null) {
                    webView.evaluateJavascript("showVictoryModal();", null);
                }
            }
        });
    }

    public class WebAppInterface {
        @android.webkit.JavascriptInterface
        public void showInterstitial() {
            showInterstitialAd();
        }

        @android.webkit.JavascriptInterface
        public void hideBanner() {
            runOnUiThread(() -> {
                if (adView != null)
                    adView.setVisibility(View.GONE);
            });
        }

        @android.webkit.JavascriptInterface
        public void showBanner() {
            runOnUiThread(() -> {
                if (adView != null)
                    adView.setVisibility(View.VISIBLE);
            });
        }
    }
}
