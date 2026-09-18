"""
image_detect.py  –  YOLO Pest Detection on a Single Image
----------------------------------------------------------
Usage:
    python image_detect.py                        # prompts for image path
    python image_detect.py path/to/image.jpg      # pass path as argument
"""

import os
import sys

import cv2
from ultralytics import YOLO

# ── Dynamic base path (works on any machine) ──────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "best.pt")
OUTPUT_PATH = os.path.join(BASE_DIR, "image_result.jpg")

# ── Supported image extensions ────────────────────────────────────────────────
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


def validate_image_path(path: str) -> str:
    """Return the absolute, validated image path or exit with a clear message."""
    path = path.strip()
    if not path:
        print("[ERROR] No image path provided.")
        sys.exit(1)

    abs_path = os.path.abspath(path)

    if not os.path.exists(abs_path):
        print(f"[ERROR] Image file not found: {abs_path}")
        print("        Please check the path and try again.")
        sys.exit(1)

    ext = os.path.splitext(abs_path)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        print(f"[ERROR] Unsupported file type '{ext}'.")
        print(f"        Supported types: {', '.join(sorted(IMAGE_EXTENSIONS))}")
        sys.exit(1)

    return abs_path


def get_image_path() -> str:
    """Resolve image path from CLI argument or interactive prompt."""
    if len(sys.argv) > 1:
        path = sys.argv[1]
        print(f"[INFO] Using image from argument: {path}")
        return validate_image_path(path)

    # ── Interactive prompt ────────────────────────────────────────────────────
    print("\n+---------------------------------------------------------+")
    print("|       YOLOv8 Pest Detection -- Image Mode               |")
    print("+---------------------------------------------------------+")
    print("  Default test image: test_image.jpg")

    user_input = input("\n  Enter image path (or press ENTER for default): ").strip()

    if user_input == "":
        default = os.path.join(BASE_DIR, "test_image.jpg")
        print(f"[INFO] No input given -- using default: {default}")
        return validate_image_path(default)

    return validate_image_path(user_input)


def main():
    # ── 1. Validate model ─────────────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Model file not found: {MODEL_PATH}")
        print("        Place 'best.pt' in the same folder as this script.")
        sys.exit(1)

    # ── 2. Resolve image path ─────────────────────────────────────────────────
    image_path = get_image_path()

    # ── 3. Load image via OpenCV ──────────────────────────────────────────────
    image = cv2.imread(image_path)
    if image is None:
        print(f"[ERROR] OpenCV could not read image: {image_path}")
        print("        The file may be corrupted or in an unsupported format.")
        sys.exit(1)

    print(f"\n[INFO] Image loaded  : {image_path}")
    print(f"[INFO] Resolution    : {image.shape[1]}x{image.shape[0]} px")

    # ── 4. Load YOLO model ────────────────────────────────────────────────────
    print(f"[INFO] Loading model : {MODEL_PATH}")
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        sys.exit(1)

    # ── 5. Run inference ──────────────────────────────────────────────────────
    print("[INFO] Running detection ...")
    try:
        results = model(image, verbose=False)
    except Exception as e:
        print(f"[ERROR] Inference failed: {e}")
        sys.exit(1)

    # ── 6. Annotate, save & display ───────────────────────────────────────────
    for r in results:
        annotated = r.plot()

        # Count detections
        n = len(r.boxes) if r.boxes is not None else 0
        print(f"[INFO] Detections found: {n}")

        # Save result
        cv2.imwrite(OUTPUT_PATH, annotated)
        print(f"[INFO] Result saved to : {OUTPUT_PATH}")

        # Display window (press any key to close)
        print("[INFO] Showing result -- press any key or close the window to exit.")
        cv2.imshow("Pest Detection -- Image Result", annotated)
        key = cv2.waitKey(0)    # wait indefinitely until a key is pressed
        cv2.destroyAllWindows()
        cv2.waitKey(1)          # flush destroy event on Linux/macOS

    print("[INFO] Done.")


if __name__ == "__main__":
    main()
