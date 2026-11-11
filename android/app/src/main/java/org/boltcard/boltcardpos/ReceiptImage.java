package org.boltcard.boltcardpos;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.util.Base64;

/**
 * Turns the shop's receipt logo, as downloaded by the JS side, into a bitmap
 * that the receipt printers can print.
 */
public final class ReceiptImage {

    /** Printable width, in dots, of the 58mm paper used by the supported printers. */
    static final int PAPER_WIDTH = 384;

    /**
     * Stops a tall image using a lot of paper. The Ciontek SDK also refuses
     * bitmaps taller than 500.
     */
    static final int MAX_HEIGHT = 384;

    private ReceiptImage() {}

    /**
     * @param base64 an image file (PNG, JPEG, ...) encoded as base64
     * @return the image, scaled down if needed to fit the paper and centred on
     *         a white background the full width of the paper, or null if the
     *         data is not an image that Android can decode
     */
    public static Bitmap fromBase64(String base64) {
        if (base64 == null || base64.isEmpty()) {
            return null;
        }
        try {
            byte[] data = Base64.decode(base64, Base64.DEFAULT);

            // read the dimensions first, so that a large photo is not loaded at full size
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(data, 0, data.length, options);
            if (options.outWidth <= 0 || options.outHeight <= 0) {
                return null;
            }
            int sampleSize = 1;
            while (options.outWidth / (sampleSize * 2) >= PAPER_WIDTH
                    && options.outHeight / (sampleSize * 2) >= MAX_HEIGHT) {
                sampleSize *= 2;
            }
            options.inJustDecodeBounds = false;
            options.inSampleSize = sampleSize;
            Bitmap source = BitmapFactory.decodeByteArray(data, 0, data.length, options);
            if (source == null) {
                return null;
            }

            // a small image is printed at its own size rather than enlarged
            float scale = Math.min(1f, Math.min(
                    (float) PAPER_WIDTH / source.getWidth(),
                    (float) MAX_HEIGHT / source.getHeight()));
            int width = Math.max(1, Math.round(source.getWidth() * scale));
            int height = Math.max(1, Math.round(source.getHeight() * scale));

            // the white background stops the transparent parts of a PNG printing as black
            Bitmap result = Bitmap.createBitmap(PAPER_WIDTH, height, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(result);
            canvas.drawColor(Color.WHITE);
            int left = (PAPER_WIDTH - width) / 2;
            canvas.drawBitmap(source, null, new Rect(left, 0, left + width, height),
                    new Paint(Paint.FILTER_BITMAP_FLAG));
            source.recycle();
            return result;
        } catch (IllegalArgumentException | OutOfMemoryError e) {
            // not valid base64, or an image too large to hold in memory
            return null;
        }
    }
}
