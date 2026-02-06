import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useActionData, useLoaderData, useSubmit } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Select,
  RangeSlider,
  Button,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  Box,
  Checkbox,
  TextField,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { getSettings, saveSettings } from "../services/settings.server";
import { getGoldPrices } from "../services/gold-price.server";
import { TickerPreview } from "../components/TickerPreview";

const ALL_KARATS = ["24", "22", "21", "18", "14"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getSettings(session.shop);

  let goldPrices = null;
  try {
    goldPrices = await getGoldPrices();
  } catch {
    // Price fetch may fail, that's OK for the admin panel
  }

  return { shop: session.shop, settings, goldPrices };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const karats = formData.getAll("karats") as string[];
  if (karats.length === 0) {
    return { success: false, error: "Select at least one karat" };
  }

  await saveSettings(session.shop, {
    karats: karats.join(","),
    colorScheme: (formData.get("colorScheme") as string) || "dark",
    bgColor: (formData.get("bgColor") as string) || "#1a1a2e",
    textColor: (formData.get("textColor") as string) || "#e8d44d",
    tickerSpeed: parseInt((formData.get("tickerSpeed") as string) || "50"),
    position: (formData.get("position") as string) || "top",
    currencySymbol: (formData.get("currencySymbol") as string) || "$",
    isActive: formData.get("isActive") === "true",
  });

  return { success: true, error: null };
};

export default function SettingsPage() {
  const { settings, goldPrices } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [karats, setKarats] = useState<string[]>(settings.karats.split(","));
  const [colorScheme, setColorScheme] = useState(settings.colorScheme);
  const [bgColor, setBgColor] = useState(settings.bgColor);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [tickerSpeed, setTickerSpeed] = useState(settings.tickerSpeed);
  const [position, setPosition] = useState(settings.position);
  const [currencySymbol, setCurrencySymbol] = useState(
    settings.currencySymbol,
  );
  const [isActive, setIsActive] = useState(settings.isActive);

  const handleKaratToggle = useCallback(
    (karat: string) => {
      setKarats((prev) => {
        if (prev.includes(karat)) {
          if (prev.length === 1) return prev; // Must keep at least one
          return prev.filter((k) => k !== karat);
        }
        return [...prev, karat].sort(
          (a, b) => parseInt(b) - parseInt(a),
        );
      });
    },
    [],
  );

  const handleColorSchemeChange = useCallback((value: string) => {
    setColorScheme(value);
    if (value === "dark") {
      setBgColor("#1a1a2e");
      setTextColor("#e8d44d");
    } else if (value === "light") {
      setBgColor("#ffffff");
      setTextColor("#b8860b");
    }
  }, []);

  const handleSave = useCallback(() => {
    const formData = new FormData();
    karats.forEach((k) => formData.append("karats", k));
    formData.set("colorScheme", colorScheme);
    formData.set("bgColor", bgColor);
    formData.set("textColor", textColor);
    formData.set("tickerSpeed", String(tickerSpeed));
    formData.set("position", position);
    formData.set("currencySymbol", currencySymbol);
    formData.set("isActive", String(isActive));
    submit(formData, { method: "post" });
  }, [
    karats,
    colorScheme,
    bgColor,
    textColor,
    tickerSpeed,
    position,
    currencySymbol,
    isActive,
    submit,
  ]);

  const previewSettings = {
    karats,
    bgColor,
    textColor,
    tickerSpeed,
    position,
    currencySymbol,
    isActive,
  };

  return (
    <Page title="Gold Price Ticker">
      {actionData?.success && (
        <Box paddingBlockEnd="400">
          <Banner tone="success" onDismiss={() => {}}>
            Settings saved successfully.
          </Banner>
        </Box>
      )}
      {actionData?.error && (
        <Box paddingBlockEnd="400">
          <Banner tone="critical" onDismiss={() => {}}>
            {actionData.error}
          </Banner>
        </Box>
      )}

      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">
                    Ticker Settings
                  </Text>
                  <Badge tone={isActive ? "success" : undefined}>
                    {isActive ? "Active" : "Disabled"}
                  </Badge>
                </InlineStack>

                <Checkbox
                  label="Enable gold price ticker on storefront"
                  checked={isActive}
                  onChange={setIsActive}
                />

                <Divider />

                <Text variant="headingSm" as="h3">
                  Gold Karats to Display
                </Text>
                <InlineStack gap="400">
                  {ALL_KARATS.map((karat) => (
                    <Checkbox
                      key={karat}
                      label={`${karat}K`}
                      checked={karats.includes(karat)}
                      onChange={() => handleKaratToggle(karat)}
                    />
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Appearance
                </Text>

                <FormLayout>
                  <Select
                    label="Color scheme"
                    options={[
                      { label: "Dark (navy & gold)", value: "dark" },
                      { label: "Light (white & dark gold)", value: "light" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={colorScheme}
                    onChange={handleColorSchemeChange}
                  />

                  {colorScheme === "custom" && (
                    <FormLayout.Group>
                      <TextField
                        label="Background color"
                        type="text"
                        value={bgColor}
                        onChange={setBgColor}
                        autoComplete="off"
                        prefix={
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              backgroundColor: bgColor,
                              border: "1px solid #ccc",
                            }}
                          />
                        }
                      />
                      <TextField
                        label="Text color"
                        type="text"
                        value={textColor}
                        onChange={setTextColor}
                        autoComplete="off"
                        prefix={
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              backgroundColor: textColor,
                              border: "1px solid #ccc",
                            }}
                          />
                        }
                      />
                    </FormLayout.Group>
                  )}

                  <Select
                    label="Position"
                    options={[
                      { label: "Top of page", value: "top" },
                      { label: "Bottom of page", value: "bottom" },
                    ]}
                    value={position}
                    onChange={setPosition}
                  />

                  <RangeSlider
                    label={`Scroll speed: ${tickerSpeed}px/s`}
                    value={tickerSpeed}
                    min={20}
                    max={100}
                    step={10}
                    onChange={(value) =>
                      setTickerSpeed(value as number)
                    }
                    output
                  />

                  <TextField
                    label="Currency symbol"
                    type="text"
                    value={currencySymbol}
                    onChange={setCurrencySymbol}
                    autoComplete="off"
                    maxLength={3}
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            <InlineStack align="end">
              <Button variant="primary" onClick={handleSave}>
                Save settings
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Preview
                </Text>
                <TickerPreview
                  settings={previewSettings}
                  prices={goldPrices?.prices || null}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Current Gold Price
                </Text>
                {goldPrices ? (
                  <>
                    <InlineStack align="space-between">
                      <Text as="span" tone="subdued">
                        Spot price
                      </Text>
                      <Text as="span" fontWeight="bold">
                        ${goldPrices.spotPrice.toLocaleString()}/oz
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" tone="subdued">
                        Source
                      </Text>
                      <Badge>
                        {goldPrices.source === "swissquote"
                          ? "SwissQuote"
                          : "GoldAPI"}
                      </Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" tone="subdued">
                        Updated
                      </Text>
                      <Text as="span">
                        {new Date(goldPrices.fetchedAt).toLocaleTimeString()}
                      </Text>
                    </InlineStack>
                    <Divider />
                    <Text variant="headingSm" as="h3">
                      Price per gram
                    </Text>
                    {Object.entries(goldPrices.prices)
                      .sort(
                        ([a], [b]) =>
                          parseInt(b) - parseInt(a),
                      )
                      .map(([karat, data]) => (
                        <InlineStack
                          key={karat}
                          align="space-between"
                        >
                          <Text as="span" tone="subdued">
                            {karat}
                          </Text>
                          <Text as="span" fontWeight="semibold">
                            {currencySymbol}
                            {data.pricePerGram.toFixed(2)}/g
                          </Text>
                        </InlineStack>
                      ))}
                  </>
                ) : (
                  <Banner tone="warning">
                    Unable to fetch gold prices. The ticker will retry
                    automatically.
                  </Banner>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Setup Guide
                </Text>
                <Text as="p" tone="subdued">
                  To display the ticker on your storefront:
                </Text>
                <BlockStack gap="200">
                  <Text as="p">
                    1. Go to <strong>Online Store &gt; Themes</strong>
                  </Text>
                  <Text as="p">
                    2. Click <strong>Customize</strong> on your active
                    theme
                  </Text>
                  <Text as="p">
                    3. Add the <strong>Gold Price Ticker</strong> app
                    block to your header section
                  </Text>
                  <Text as="p">
                    4. Save and publish your theme
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
