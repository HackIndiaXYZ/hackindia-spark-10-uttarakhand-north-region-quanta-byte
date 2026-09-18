"""
real_time_detect.py  –  YOLO Real-Time Pest Detection via Webcam
-----------------------------------------------------------------
Usage:
    python real_time_detect.py          # uses default webcam (device 0)
    python real_time_detect.py 1        # uses secondary webcam (device 1)

Controls:
    q   or ESC  –  quit
    Closing the window also stops detection cleanly.
"""

import os
import sys

import cv2
from ultralytics import YOLO

# ── Dynamic base path (works on any machine) ──────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")

WINDOW_NAME = "YOLOv8 Pest Detection -- Real Time"


def get_camera_index() -> int:
    """Return the webcam device index from CLI argument or default (0)."""
    if len(sys.argv) > 1:
        arg = sys.argv[1].strip()
        if arg.lstrip("-").isdigit():
            return int(arg)
        print(f"[WARNING] Unrecognised argument '{arg}' – defaulting to camera 0.")
    return 0


def main():
    # ── 1. Validate model ─────────────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Model file not found: {MODEL_PATH}")
        print("        Place 'best.pt' in the same folder as this script.")
        sys.exit(1)

    # ── 2. Load YOLO model ────────────────────────────────────────────────────
    print(f"[INFO] Loading model : {MODEL_PATH}")
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        sys.exit(1)

    # ── 3. Open webcam ────────────────────────────────────────────────────────
    cam_index = get_camera_index()
    print(f"[INFO] Opening camera (device {cam_index}) ...")

    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera (device {cam_index}).")
        print("        Make sure a webcam is connected and not used by another app.")
        sys.exit(1)

    # Optionally request a decent resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    actual_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    actual_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"[INFO] Camera resolution : {actual_w}x{actual_h}")
    print("[INFO] Press 'q' or ESC to quit.  You can also close the window.\n")

    consecutive_failures = 0
    MAX_FAILURES = 30   # give up after 30 consecutive bad reads (~1 s at 30 fps)

    # ── 4. Detection loop ─────────────────────────────────────────────────────
    try:
        while True:
            success, frame = cap.read()

            if not success:
                consecutive_failures += 1
                if consecutive_failures >= MAX_FAILURES:
                    print("[ERROR] Could not read from camera after multiple attempts. Exiting.")
                    break
                print(f"[WARNING] Failed to read frame ({consecutive_failures}/{MAX_FAILURES}). Retrying ...")
                cv2.waitKey(100)
                continue

            consecutive_failures = 0   # reset on a good frame

            # Run YOLOv8 inference
            try:
                results = model(frame, verbose=False)
            except Exception as e:
                print(f"[WARNING] Inference error: {e}")
                continue

            # Annotate and display
            annotated = results[0].plot()
            cv2.imshow(WINDOW_NAME, annotated)

            # ── Key / window-close handling ───────────────────────────────────
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), 27):   # 'q' or ESC
                print("[INFO] Quit key pressed.")
                break

            # Detect window closed via X button
            try:
                if cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE) < 1:
                    print("[INFO] Window closed by user.")
                    break
            except cv2.error:
                pass  # property not supported on this backend — safe to ignore

    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by Ctrl+C.")

    # ── 5. Release resources ──────────────────────────────────────────────────
    cap.release()
    cv2.destroyAllWindows()
    cv2.waitKey(1)   # flush destroy on Linux/macOS
    print("[INFO] Camera released. Exiting.")


if __name__ == "__main__":
    main()
