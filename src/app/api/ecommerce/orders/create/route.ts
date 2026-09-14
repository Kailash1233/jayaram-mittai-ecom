import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { calculateCartTotals, evaluateProductAvailability } from '@/lib/ecommerce/calculations';
import { getPaymentProvider } from '@/lib/ecommerce/payment-provider';
import { SEED_PRODUCTS, SEED_DELIVERY_ZONES, SEED_DELIVERY_RULES } from '@/lib/ecommerce/catalog-seed';
import { CartItem, JayaramMittaiPaymentMethod } from '@/lib/ecommerce/types';

interface OrderCreateRequestBody {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
    zoneId: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: JayaramMittaiPaymentMethod;
  idempotencyKey: string;
  customerNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderCreateRequestBody = await req.json();

    const { customer, address, items, paymentMethod, idempotencyKey, customerNotes } = body;

    // 1. Validation of request payload
    if (!customer?.fullName || !customer?.phone || !address?.line1 || !address?.pincode) {
      return NextResponse.json(
        { error: 'Missing required customer or delivery address information.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency key is required to prevent duplicate order creation.' },
        { status: 400 }
      );
    }

    // 2. Fetch authoritative product records from DB or Seed (Never trust client prices)
    const verifiedItems: CartItem[] = [];

    for (const item of items) {
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Item quantities must be positive integers.' },
          { status: 400 }
        );
      }

      let product = SEED_PRODUCTS.find((p) => p.id === item.productId);

      if (isSupabaseConfigured()) {
        const { data: dbProduct } = await supabase
          .from('jayaram_mittai_products')
          .select(`
            *,
            availability:jayaram_mittai_product_availability(*),
            out_of_stock:jayaram_mittai_product_out_of_stock(*)
          `)
          .eq('id', item.productId)
          .single();

        if (dbProduct) {
          const dbItem = dbProduct as any;
          product = {
            ...dbItem,
            availability: Array.isArray(dbItem.availability)
              ? dbItem.availability[0]
              : dbItem.availability,
            out_of_stock: Array.isArray(dbItem.out_of_stock)
              ? dbItem.out_of_stock[0]
              : dbItem.out_of_stock,
          };
        }
      }

      if (!product) {
        return NextResponse.json(
          { error: `Product ID "${item.productId}" was not found in active catalogue.` },
          { status: 400 }
        );
      }

      // 3. Validate product availability
      const availability = evaluateProductAvailability(product);
      if (!availability.isAvailable) {
        return NextResponse.json(
          {
            error: `"${product.name}" is currently unavailable: ${
              availability.customMessage || availability.unavailableReason
            }`,
          },
          { status: 400 }
        );
      }

      verifiedItems.push({
        product,
        quantity: item.quantity,
      });
    }

    // 4. Server-Side Price & Delivery Charge Calculation (Section 4 & Section 14)
    const matchedZone =
      SEED_DELIVERY_ZONES.find((z) => z.id === address.zoneId) || SEED_DELIVERY_ZONES[0];
    const distanceKm = matchedZone.radius_km;

    const calculation = calculateCartTotals(verifiedItems, distanceKm);

    // 5. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JM-${dateStr}-${randomSuffix}`;
    const orderId = `ord_${Date.now()}_${randomSuffix}`;

    // 6. Payment provider initialization (Abstraction)
    const paymentProvider = getPaymentProvider();
    const paymentInit = await paymentProvider.initiatePayment({
      orderId,
      orderNumber,
      amount: calculation.total,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      paymentMethod,
    });

    // 7. Store order in Supabase if configured, with snapshot columns
    if (isSupabaseConfigured()) {
      // Check idempotency first
      const { data: existingOrder } = await (supabase as any)
        .from('jayaram_mittai_orders')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({
          order: existingOrder,
          isDuplicate: true,
          message: 'Order already processed with this idempotency key.',
        });
      }

      // Insert Order Header
      const { data: createdOrder, error: orderError } = await (supabase as any)
        .from('jayaram_mittai_orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_id: customer.phone, // In guest mode uses phone reference or auth user ID
          status: 'confirmed',
          subtotal: calculation.subtotal,
          delivery_charge: calculation.deliveryCharge,
          total: calculation.total,
          payment_status: 'paid',
          payment_method: paymentMethod,
          idempotency_key: idempotencyKey,
          customer_notes: customerNotes || null,
        })
        .select()
        .single();

      if (!orderError && createdOrder) {
        // Insert Snapshot Items
        const orderItemsRows = verifiedItems.map((v) => ({
          order_id: createdOrder.id,
          product_id: v.product.id,
          product_name_snapshot: v.product.name,
          unit_price_snapshot: v.product.price,
          quantity: v.quantity,
          line_total: v.product.price * v.quantity,
        }));

        await (supabase as any).from('jayaram_mittai_order_items').insert(orderItemsRows);

        // Insert Payment Record
        await (supabase as any).from('jayaram_mittai_payments').insert({
          order_id: createdOrder.id,
          provider: paymentProvider.providerName,
          provider_reference: paymentInit.paymentSessionId,
          status: 'captured',
          amount: calculation.total,
          payment_method: paymentMethod,
          metadata: {
            customerName: customer.fullName,
            customerPhone: customer.phone,
          },
        });
      }
    }

    // 8. Sanitized response
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        subtotal: calculation.subtotal,
        deliveryCharge: calculation.deliveryCharge,
        total: calculation.total,
        status: 'confirmed',
        estimatedHours: calculation.estimatedHours,
        paymentStatus: 'paid',
        paymentMethod,
        items: verifiedItems.map((v) => ({
          name: v.product.name,
          price: v.product.price,
          unit: v.product.unit,
          quantity: v.quantity,
          lineTotal: v.product.price * v.quantity,
        })),
        customer: {
          fullName: customer.fullName,
          phone: customer.phone,
        },
        deliveryAddress: {
          line1: address.line1,
          city: address.city,
          pincode: address.pincode,
          zoneName: matchedZone.name,
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order. Please retry.' },
      { status: 500 }
    );
  }
}
