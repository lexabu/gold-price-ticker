import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import db from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * GET /api/ticker-settings
 * Fetch gold ticker settings for the authenticated shop
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const settings = await db.shopSettings.findUnique({
      where: { shop },
    });

    // Return defaults if no settings exist
    if (!settings) {
      return new Response(
        JSON.stringify({
          karats: "24,22,21,18,14",
          colorScheme: "dark",
          bgColor: "#1a1a2e",
          textColor: "#e8d44d",
          tickerSpeed: 50,
          position: "top",
          showChange: true,
          currencySymbol: "$",
          isActive: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching ticker settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch settings" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * PUT /api/ticker-settings
 * Update gold ticker settings for the authenticated shop
 */
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  if (request.method !== "PUT") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();

    // Validate karats
    if (body.karats !== undefined) {
      const validKarats = ["24", "22", "21", "18", "14"];
      const karats = body.karats.split(",").map((k: string) => k.trim());
      const invalidKarats = karats.filter((k: string) => !validKarats.includes(k));
      if (invalidKarats.length > 0) {
        return new Response(
          JSON.stringify({ error: `Invalid karats: ${invalidKarats.join(", ")}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate ticker speed
    if (body.tickerSpeed !== undefined) {
      const speed = parseInt(body.tickerSpeed);
      if (isNaN(speed) || speed < 20 || speed > 100) {
        return new Response(
          JSON.stringify({ error: "Ticker speed must be between 20 and 100" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate position
    if (body.position !== undefined && !["top", "bottom"].includes(body.position)) {
      return new Response(
        JSON.stringify({ error: "Position must be 'top' or 'bottom'" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upsert settings
    const settings = await db.shopSettings.upsert({
      where: { shop },
      update: {
        karats: body.karats,
        colorScheme: body.colorScheme,
        bgColor: body.bgColor,
        textColor: body.textColor,
        tickerSpeed: body.tickerSpeed !== undefined ? parseInt(body.tickerSpeed) : undefined,
        position: body.position,
        showChange: body.showChange,
        currencySymbol: body.currencySymbol,
        isActive: body.isActive,
      },
      create: {
        shop,
        karats: body.karats || "24,22,21,18,14",
        colorScheme: body.colorScheme || "dark",
        bgColor: body.bgColor || "#1a1a2e",
        textColor: body.textColor || "#e8d44d",
        tickerSpeed: body.tickerSpeed !== undefined ? parseInt(body.tickerSpeed) : 50,
        position: body.position || "top",
        showChange: body.showChange ?? true,
        currencySymbol: body.currencySymbol || "$",
        isActive: body.isActive ?? true,
      },
    });

    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating ticker settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update settings" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
