import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/lib/ecommerce/catalog-seed';
import { resolveProductImage } from '@/lib/ecommerce/image-resolver';

interface ExcelMenuRow {
  category?: any;
  item?: any;
  qty_or_grams?: any;
  price?: any;
  [key: string]: any;
}

interface RejectedRowInfo {
  rowNumber: number;
  item?: string;
  category?: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const adminId = (formData.get('adminId') as string) || 'admin_desk';

    if (!file) {
      return NextResponse.json(
        { error: 'No Excel file was uploaded. Please attach a .xlsx or .xls file.' },
        { status: 400 }
      );
    }

    const filename = file.name || 'menu_upload.xlsx';
    if (!filename.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload an Excel (.xlsx or .xls) file.' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded Excel workbook contains no readable sheets.' },
        { status: 400 }
      );
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Parse raw rows as JSON objects
    const rawRows: ExcelMenuRow[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
    });

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json(
        { error: 'The Excel sheet is empty. Please add rows before uploading.' },
        { status: 400 }
      );
    }

    // Normalize header keys of first row to verify exact column schema:
    // Schema required: category, item, qty_or_grams, price (No image column)
    const firstRow = rawRows[0];
    const normalizedKeys = Object.keys(firstRow).map((k) =>
      k.trim().toLowerCase().replace(/[\s\-_]+/g, '_')
    );

    const hasCategory = normalizedKeys.some((k) => k === 'category');
    const hasItem = normalizedKeys.some((k) => k === 'item' || k === 'dish' || k === 'dish_name');
    const hasQty = normalizedKeys.some(
      (k) => k === 'qty_or_grams' || k === 'qty' || k === 'quantity' || k === 'unit' || k === 'grams'
    );
    const hasPrice = normalizedKeys.some((k) => k === 'price' || k === 'rate' || k === 'amount');

    if (!hasCategory || !hasItem || !hasPrice) {
      return NextResponse.json(
        {
          error:
            'Excel file must contain the exact columns: "category", "item", "qty_or_grams", and "price". Please download the sample template.',
        },
        { status: 400 }
      );
    }

    const validRowsToProcess: Array<{
      rowNumber: number;
      category: string;
      item: string;
      qty_or_grams: string;
      price: number;
    }> = [];

    const rejectedRows: RejectedRowInfo[] = [];

    // 1. Row-level validation
    rawRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 considering 1-based index and header row

      // Find values dynamically matching normalized keys
      let categoryVal = '';
      let itemVal = '';
      let qtyVal = '1 portion';
      let priceVal: any = null;

      Object.entries(row).forEach(([key, val]) => {
        const norm = key.trim().toLowerCase().replace(/[\s\-_]+/g, '_');
        const strVal = String(val).trim();

        if (norm === 'category') categoryVal = strVal;
        else if (norm === 'item' || norm === 'dish' || norm === 'dish_name') itemVal = strVal;
        else if (
          norm === 'qty_or_grams' ||
          norm === 'qty' ||
          norm === 'quantity' ||
          norm === 'unit' ||
          norm === 'grams'
        ) {
          if (strVal) qtyVal = strVal;
        } else if (norm === 'price' || norm === 'rate' || norm === 'amount') {
          priceVal = strVal;
        }
      });

      if (!categoryVal) {
        rejectedRows.push({
          rowNumber,
          item: itemVal || '(Empty)',
          category: categoryVal,
          reason: 'Missing "category" value.',
        });
        return;
      }

      if (!itemVal) {
        rejectedRows.push({
          rowNumber,
          item: itemVal,
          category: categoryVal,
          reason: 'Missing "item" (dish name) value.',
        });
        return;
      }

      const parsedPrice = parseFloat(String(priceVal).replace(/[^0-9.]/g, ''));
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        rejectedRows.push({
          rowNumber,
          item: itemVal,
          category: categoryVal,
          reason: `Invalid price "${priceVal}". Price must be a positive number.`,
        });
        return;
      }

      validRowsToProcess.push({
        rowNumber,
        category: categoryVal,
        item: itemVal,
        qty_or_grams: qtyVal,
        price: parsedPrice,
      });
    });

    let createdCount = 0;
    let updatedCount = 0;
    const createdItems: string[] = [];
    const updatedItems: string[] = [];

    // 2. Perform upserts into categories & products
    if (isSupabaseConfigured()) {
      // Fetch existing categories and products
      const { data: dbCategories } = await (supabase as any)
        .from('jayaram_mittai_categories')
        .select('*');

      const { data: dbProducts } = await (supabase as any)
        .from('jayaram_mittai_products')
        .select('*');

      const categoryMap = new Map<string, any>();
      (dbCategories || []).forEach((c: any) => {
        categoryMap.set(c.name.toLowerCase().trim(), c);
      });

      for (const row of validRowsToProcess) {
        const normCatName = row.category.toLowerCase().trim();
        let targetCategory = categoryMap.get(normCatName);

        // Upsert Category if not existing
        if (!targetCategory) {
          const { data: newCat, error: catError } = await (supabase as any)
            .from('jayaram_mittai_categories')
            .insert({
              name: row.category.trim(),
              sort_order: categoryMap.size + 1,
              is_active: true,
            })
            .select()
            .single();

          if (!catError && newCat) {
            targetCategory = newCat;
            categoryMap.set(normCatName, newCat);
          } else {
            rejectedRows.push({
              rowNumber: row.rowNumber,
              item: row.item,
              category: row.category,
              reason: `Failed to create category "${row.category}".`,
            });
            continue;
          }
        }

        // Match existing product by name within that category (case-insensitive)
        const normItemName = row.item.toLowerCase().trim();
        const existingProduct = (dbProducts || []).find(
          (p: any) =>
            p.category_id === targetCategory.id &&
            p.name.toLowerCase().trim() === normItemName
        );

        if (existingProduct) {
          // Update product
          await (supabase as any)
            .from('jayaram_mittai_products')
            .update({
              price: row.price,
              unit: row.qty_or_grams.trim(),
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProduct.id);

          updatedCount++;
          updatedItems.push(row.item);
        } else {
          // Insert new product with image_url = NULL (so Section 2 image resolution applies automatically!)
          const { data: newProduct, error: prodError } = await (supabase as any)
            .from('jayaram_mittai_products')
            .insert({
              category_id: targetCategory.id,
              name: row.item.trim(),
              description: `Authentic ${row.category} freshly prepared.`,
              price: row.price,
              unit: row.qty_or_grams.trim(),
              image_url: null, // Resolves via shared library
              is_active: true,
            })
            .select()
            .single();

          if (!prodError && newProduct) {
            // Ensure availability record
            await (supabase as any)
              .from('jayaram_mittai_product_availability')
              .insert({
                product_id: newProduct.id,
                is_available: true,
                available_start_time: '09:00:00',
                available_end_time: '21:00:00',
              });

            createdCount++;
            createdItems.push(row.item);
          } else {
            rejectedRows.push({
              rowNumber: row.rowNumber,
              item: row.item,
              category: row.category,
              reason: `Database error creating product: ${prodError?.message || 'Unknown'}`,
            });
          }
        }
      }

      // 3. Log to audit logs
      await (supabase as any).from('jayaram_mittai_audit_logs').insert({
        actor_id: adminId,
        action: 'excel_menu_upload',
        entity_type: 'jayaram_mittai_products',
        entity_id: 'bulk_upload',
        metadata: {
          filename,
          totalRowsInFile: rawRows.length,
          validRowsCount: validRowsToProcess.length,
          createdCount,
          updatedCount,
          rejectedCount: rejectedRows.length,
          rejectedRows,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // In local catalog mode
      for (const row of validRowsToProcess) {
        const normCatName = row.category.toLowerCase().trim();
        let targetCategory = SEED_CATEGORIES.find(
          (c) => c.name.toLowerCase().trim() === normCatName
        );

        if (!targetCategory) {
          targetCategory = {
            id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: row.category.trim(),
            sort_order: SEED_CATEGORIES.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          SEED_CATEGORIES.push(targetCategory);
        }

        const normItemName = row.item.toLowerCase().trim();
        const existingProduct = SEED_PRODUCTS.find(
          (p) =>
            p.category_id === targetCategory!.id &&
            p.name.toLowerCase().trim() === normItemName
        );

        if (existingProduct) {
          existingProduct.price = row.price;
          existingProduct.unit = row.qty_or_grams.trim();
          existingProduct.updated_at = new Date().toISOString();
          updatedCount++;
          updatedItems.push(row.item);
        } else {
          SEED_PRODUCTS.push({
            id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            category_id: targetCategory.id,
            name: row.item.trim(),
            description: `Authentic ${row.category} freshly prepared.`,
            price: row.price,
            unit: row.qty_or_grams.trim(),
            image_url: null, // Resolves via shared library
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          createdCount++;
          createdItems.push(row.item);
        }
      }
    }

    return NextResponse.json({
      success: true,
      filename,
      totalRowsInFile: rawRows.length,
      createdCount,
      updatedCount,
      rejectedCount: rejectedRows.length,
      createdItems,
      updatedItems,
      rejectedRows,
      message: `Menu upload complete: ${createdCount} items created, ${updatedCount} items updated, ${rejectedRows.length} rows rejected.`,
    });
  } catch (error: any) {
    console.error('Excel upload processing error:', error);
    return NextResponse.json(
      { error: `Failed to process Excel menu upload: ${error?.message || 'Server error'}` },
      { status: 500 }
    );
  }
}
