import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

type CoreError = { error?: { code?: string; message?: string } };
type CoreOrder = { data?: { orderId?: string } };
type CoreCheckout = { data?: { checkoutUrl?: string } };

export async function POST(request: Request) {
  const token = (await cookies()).get("cg_session")?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to purchase an item." } },
      { status: 401 }
    );
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || !/^[A-Za-z0-9_-]{8,128}$/.test(idempotencyKey)) {
    return NextResponse.json(
      { error: { code: "INVALID_IDEMPOTENCY_KEY", message: "The purchase request is invalid. Please try again." } },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "The purchase request is invalid." } },
      { status: 400 }
    );
  }

  const input = body as { productId?: unknown; quantity?: unknown };
  if (typeof input?.productId !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.productId)
    || input.quantity !== 1) {
    return NextResponse.json(
      { error: { code: "INVALID_PURCHASE", message: "The selected item or quantity is invalid." } },
      { status: 400 }
    );
  }

  try {
    const statusResponse = await coreApiFetch("/commerce/checkout/status");
    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: { code: "CHECKOUT_DISABLED", message: "Test checkout is not configured yet." } },
        { status: 503 }
      );
    }
    const statusPayload = await parseCoreResponse(statusResponse) as { data?: { enabled?: boolean; mode?: string } };
    if (statusPayload?.data?.enabled !== true || statusPayload.data.mode !== "test") {
      return NextResponse.json(
        { error: { code: "CHECKOUT_DISABLED", message: "Test checkout is not configured yet." } },
        { status: 503 }
      );
    }

    const orderResponse = await coreApiFetch("/commerce/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        currency: "USD",
        items: [{ productId: input.productId, quantity: input.quantity }]
      })
    }, token);
    const orderPayload = await parseCoreResponse(orderResponse) as CoreOrder & CoreError;
    const orderId = orderPayload?.data?.orderId;
    if (!orderResponse.ok || typeof orderId !== "string") {
      return NextResponse.json(
        { error: { code: orderPayload?.error?.code ?? "ORDER_CREATION_FAILED", message: orderPayload?.error?.message ?? "The order could not be created." } },
        { status: orderResponse.status >= 400 && orderResponse.status < 600 ? orderResponse.status : 502 }
      );
    }

    const checkoutResponse = await coreApiFetch("/commerce/orders/" + encodeURIComponent(orderId) + "/checkout", {
      method: "POST",
      headers: { "Idempotency-Key": "checkout-" + idempotencyKey }
    }, token);
    const checkoutPayload = await parseCoreResponse(checkoutResponse) as CoreCheckout & CoreError;
    const checkoutUrl = checkoutPayload?.data?.checkoutUrl;
    if (!checkoutResponse.ok || typeof checkoutUrl !== "string") {
      return NextResponse.json(
        { error: { code: checkoutPayload?.error?.code ?? "CHECKOUT_FAILED", message: checkoutPayload?.error?.message ?? "Checkout could not be started." } },
        { status: checkoutResponse.status >= 400 && checkoutResponse.status < 600 ? checkoutResponse.status : 502 }
      );
    }

    const destination = new URL(checkoutUrl);
    if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") {
      return NextResponse.json(
        { error: { code: "INVALID_CHECKOUT_URL", message: "The checkout service returned an invalid destination." } },
        { status: 502 }
      );
    }
    return NextResponse.json({ checkoutUrl: destination.toString() }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: { code: "CHECKOUT_UNAVAILABLE", message: "Checkout is temporarily unavailable. No payment was taken." } },
      { status: 503 }
    );
  }
}
