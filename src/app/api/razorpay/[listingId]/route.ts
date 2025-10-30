import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST(req: NextRequest, context: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId } = await context.params;
    const body = await req.json();
    const { startDate, endDate, totalAmount, itemId } = body;

    // Validate required fields
    if (!startDate || !endDate || !totalAmount || !itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `rent_${listingId}_${Date.now()}`,
      notes: {
        itemId,
        startDate,
        endDate,
        listingId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_ID, // Return the correct key for frontend
      },
    });
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment initialization failed" },
      { status: 500 }
    );
  }
}
