import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { resolveProductImage, getSharedImageLibraryMap } from '@/lib/ecommerce/image-resolver';
import { SEED_PRODUCTS } from '@/lib/ecommerce/catalog-seed';

interface UpdateImageRequestBody {
  productId: string;
  imageUrl: string | null;
  adminId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdateImageRequestBody = await req.json();
    const { productId, imageUrl, adminId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required to update product image override.' },
        { status: 400 }
      );
    }

    const cleanUrl = imageUrl && imageUrl.trim().length > 0 ? imageUrl.trim() : null;

    if (isSupabaseConfigured()) {
      // 1. Update product table directly (per-product / per-tenant override)
      const { data: updatedProduct, error: updateError } = await (supabase as any)
        .from('jayaram_mittai_products')
        .update({
          image_url: cleanUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: `Database update failed: ${updateError.message}` },
          { status: 500 }
        );
      }

      // 2. Audit log
      await (supabase as any).from('jayaram_mittai_audit_logs').insert({
        actor_id: adminId || 'admin_desk',
        action: 'product_image_override',
        entity_type: 'jayaram_mittai_products',
        entity_id: productId,
        metadata: {
          previousUrl: null,
          newUrl: cleanUrl,
          timestamp: new Date().toISOString(),
        },
      });

      const sharedMap = await getSharedImageLibraryMap();
      const resolvedImage = resolveProductImage(
        updatedProduct.name,
        updatedProduct.image_url,
        sharedMap
      );

      return NextResponse.json({
        success: true,
        product: {
          ...updatedProduct,
          image_url: resolvedImage,
        },
        message: cleanUrl
          ? 'Custom product image override applied successfully.'
          : 'Reverted to canonical shared library image.',
      });
    }

    // In local seed/fallback mode
    const existing = SEED_PRODUCTS.find((p) => p.id === productId);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found in catalog.' }, { status: 404 });
    }

    existing.image_url = cleanUrl;
    const resolvedImage = resolveProductImage(existing.name, existing.image_url);

    return NextResponse.json({
      success: true,
      product: {
        ...existing,
        image_url: resolvedImage,
      },
      message: cleanUrl
        ? 'Custom product image override applied successfully (local mode).'
        : 'Reverted to canonical shared library image (local mode).',
    });
  } catch (error: any) {
    console.error('Failed to update product image override:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating product image.' },
      { status: 500 }
    );
  }
}
