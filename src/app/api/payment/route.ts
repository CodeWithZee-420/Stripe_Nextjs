import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
} as any);

interface BodyData {
  name: string;
  price: number;
}

export async function POST(request: NextRequest) {
  console.log('Received payment request');
  
  try {
    // Parse request body
    let data: BodyData;
    try {
      data = await request.json();
      console.log('Parsed request data:', data);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name || typeof data.price !== 'number' || data.price <= 0) {
      console.error('Invalid product data:', data);
      return NextResponse.json(
        { error: 'Invalid product data. Name and valid price are required.' },
        { status: 400 }
      );
    }

    // Create checkout session
    try {
      console.log('Creating Stripe checkout session...');
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: 'payment',
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cancel`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: data.name,
                description: `Purchase of ${data.name}`,
              },
              unit_amount: Math.round(data.price * 100),
            },
            quantity: 1,
          },
        ],
      });

      console.log('Checkout session created:', session.id);
      return NextResponse.json({ 
        url: session.url,
        sessionId: session.id
      });
      
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { 
          error: 'Payment processing error',
          details: stripeError instanceof Error ? stripeError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in payment endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
