import { useEffect, useState, useCallback } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface TickerSettings {
  karats: string;
  colorScheme: string;
  bgColor: string;
  textColor: string;
  tickerSpeed: number;
  position: string;
  showChange: boolean;
  currencySymbol: string;
  isActive: boolean;
}

const DEFAULT_SETTINGS: TickerSettings = {
  karats: "24,22,21,18,14",
  colorScheme: "dark",
  bgColor: "#1a1a2e",
  textColor: "#e8d44d",
  tickerSpeed: 50,
  position: "top",
  showChange: true,
  currencySymbol: "$",
  isActive: true,
};

const KARATS_OPTIONS = [
  { value: "24", label: "24K (99.9% pure)" },
  { value: "22", label: "22K (91.6% pure)" },
  { value: "21", label: "21K (87.5% pure)" },
  { value: "18", label: "18K (75% pure)" },
  { value: "14", label: "14K (58.3% pure)" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function Index() {
  const { shop } = useLoaderData<typeof loader>();
  const [settings, setSettings] = useState<TickerSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    fetch("/api/ticker-settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/ticker-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Handle karat toggle
  const toggleKarat = (karat: string) => {
    const currentKarats = settings.karats.split(",").filter(Boolean);
    const newKarats = currentKarats.includes(karat)
      ? currentKarats.filter((k) => k !== karat)
      : [...currentKarats, karat];

    // Ensure at least one karat is selected
    if (newKarats.length === 0) return;

    setSettings({ ...settings, karats: newKarats.join(",") });
  };

  // Preview styles
  const previewStyle: React.CSSProperties = {
    backgroundColor: settings.bgColor,
    color: settings.textColor,
    padding: "12px 16px",
    borderRadius: "4px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    marginTop: "12px",
  };

  if (loading) {
    return (
      <s-page heading="Gold Price Ticker">
        <s-section>
          <s-text>Loading settings...</s-text>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Gold Price Ticker">
      {error && (
        <s-section>
          <s-banner tone="critical">
            <s-text>{error}</s-text>
          </s-banner>
        </s-section>
      )}

      {success && (
        <s-section>
          <s-banner tone="success">
            <s-text>{success}</s-text>
          </s-banner>
        </s-section>
      )}

      {/* Enable/Disable Toggle */}
      <s-section heading="Status">
        <s-stack gap="base">
          <s-stack direction="inline" gap="base">
            <input
              type="checkbox"
              id="ticker-enabled"
              checked={settings.isActive}
              onChange={() => setSettings({ ...settings, isActive: !settings.isActive })}
              style={{ width: "18px", height: "18px" }}
            />
            <label htmlFor="ticker-enabled">
              <s-text>Enable Gold Price Ticker</s-text>
            </label>
          </s-stack>
          <s-paragraph>
            {settings.isActive
              ? "The ticker bar is active and will display on your storefront."
              : "The ticker bar is disabled and hidden from your storefront."}
          </s-paragraph>
        </s-stack>
      </s-section>

      {/* Karat Selection */}
      <s-section heading="Gold Karats">
        <s-stack gap="base">
          <s-paragraph>Select which gold karats to display in the ticker.</s-paragraph>
          <s-stack gap="base">
            {KARATS_OPTIONS.map((option) => (
              <s-stack key={option.value} direction="inline" gap="base">
                <input
                  type="checkbox"
                  id={`karat-${option.value}`}
                  checked={settings.karats.split(",").includes(option.value)}
                  onChange={() => toggleKarat(option.value)}
                  style={{ width: "18px", height: "18px" }}
                />
                <label htmlFor={`karat-${option.value}`}>
                  <s-text>{option.label}</s-text>
                </label>
              </s-stack>
            ))}
          </s-stack>
        </s-stack>
      </s-section>

      {/* Position */}
      <s-section heading="Position">
        <s-stack gap="base">
          <s-paragraph>Where should the ticker bar appear on your store?</s-paragraph>
          <s-stack direction="inline" gap="base">
            <s-stack direction="inline" gap="base">
              <input
                type="radio"
                id="position-top"
                name="position"
                checked={settings.position === "top"}
                onChange={() => setSettings({ ...settings, position: "top" })}
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="position-top">
                <s-text>Top of page</s-text>
              </label>
            </s-stack>
            <s-stack direction="inline" gap="base">
              <input
                type="radio"
                id="position-bottom"
                name="position"
                checked={settings.position === "bottom"}
                onChange={() => setSettings({ ...settings, position: "bottom" })}
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="position-bottom">
                <s-text>Bottom of page</s-text>
              </label>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-section>

      {/* Colors */}
      <s-section heading="Appearance">
        <s-stack gap="base">
          <s-stack direction="inline" gap="base">
            <s-box>
              <s-text><strong>Background Color</strong></s-text>
              <div style={{ marginTop: "8px" }}>
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                  style={{ width: "60px", height: "36px", cursor: "pointer" }}
                />
              </div>
            </s-box>
            <s-box>
              <s-text><strong>Text Color</strong></s-text>
              <div style={{ marginTop: "8px" }}>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  style={{ width: "60px", height: "36px", cursor: "pointer" }}
                />
              </div>
            </s-box>
          </s-stack>

          <s-box>
            <s-text><strong>Scroll Speed: {settings.tickerSpeed} px/s</strong></s-text>
            <div style={{ marginTop: "8px" }}>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={settings.tickerSpeed}
                onChange={(e) => setSettings({ ...settings, tickerSpeed: parseInt(e.target.value) })}
                style={{ width: "200px" }}
              />
            </div>
          </s-box>

          <s-box>
            <s-text><strong>Currency Symbol</strong></s-text>
            <div style={{ marginTop: "8px" }}>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value.slice(0, 3) })}
                maxLength={3}
                style={{ width: "60px", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </s-box>
        </s-stack>
      </s-section>

      {/* Preview */}
      <s-section heading="Preview">
        <s-stack gap="base">
          <s-paragraph>This is how your ticker bar will appear on the storefront.</s-paragraph>
          <div style={previewStyle}>
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", fontSize: "13px" }}>
              {settings.karats
                .split(",")
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((karat) => (
                  <span key={karat} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>{karat}K</span>
                    <span style={{ fontWeight: 700 }}>{settings.currencySymbol}XX.XX</span>
                    <span style={{ color: "#ffffff", opacity: 0.6, fontSize: "11px" }}>/g</span>
                  </span>
                ))}
            </div>
          </div>
        </s-stack>
      </s-section>

      {/* Save Button */}
      <s-section>
        <s-button variant="primary" onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </s-button>
      </s-section>

      {/* Enable Instructions */}
      <s-section heading="How to Enable">
        <s-stack gap="base">
          <s-paragraph>
            After saving your settings, you need to enable the ticker bar in your theme:
          </s-paragraph>
          <s-ordered-list>
            <s-list-item>Go to <strong>Online Store &gt; Themes</strong></s-list-item>
            <s-list-item>Click <strong>Customize</strong> on your active theme</s-list-item>
            <s-list-item>In the sidebar, click <strong>App embeds</strong></s-list-item>
            <s-list-item>Toggle on <strong>Gold Price Ticker</strong></s-list-item>
            <s-list-item>Click <strong>Save</strong></s-list-item>
          </s-ordered-list>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
