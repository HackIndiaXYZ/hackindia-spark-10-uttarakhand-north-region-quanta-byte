"""
video_detect.py  –  YOLO Pest Detection on a Video File
--------------------------------------------------------
Usage:
    python video_detect.py                         # prompts for video path
    python video_detect.py path/to/video.mp4       # pass path as argument
    python video_detect.py 0                       # use webcam (device 0)
"""

import os
import sys

import cv2
from ultralytics import YOLO

# ── Dynamic base path (works on any machine) ──────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "best.pt")
OUTPUT_PATH = os.path.join(BASE_DIR, "result.mp4")

# ── Supported video extensions ────────────────────────────────────────────────
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"}


def get_video_source():
    """
    Returns (source, label) where source is an int (webcam index)
    or a validated string path to a video file.
    """
    raw = None

    if len(sys.argv) > 1:
        raw = sys.argv[1].strip()
        print(f"[INFO] Using source from argument: {raw}")
    else:
        print("\n+---------------------------------------------------------+")
        print("|       YOLOv8 Pest Detection -- Video Mode               |")
        print("+---------------------------------------------------------+")
        print("  Options:")
        print("    • Enter a video file path  (e.g. test_video.mp4)")
        print("    • Enter 0  to use the default webcam")
        print("    • Press ENTER to use default: test_video.mp4")

        raw = input("\n  Enter video source: ").strip()

    # Default
    if raw == "":
        raw = os.path.join(BASE_DIR, "test_video.mp4")
        print(f"[INFO] No input given -- using default: {raw}")

    # Webcam index
    if raw.lstrip("-").isdigit():
        cam_index = int(raw)
        print(f"[INFO] Webcam mode selected (device index: {cam_index})")
        return cam_index, f"Webcam ({cam_index})"

    # File path
    abs_path = os.path.abspath(raw)
    if not os.path.exists(abs_path):
        print(f"[ERROR] Video file not found: {abs_path}")
        print("        Check the path and try again.")
        sys.exit(1)

    ext = os.path.splitext(abs_path)[1].lower()
    if ext not in VIDEO_EXTENSIONS:
        print(f"[ERROR] Unsupported file type '{ext}'.")
        print(f"        Supported types: {', '.join(sorted(VIDEO_EXTENSIONS))}")
        sys.exit(1)

    return abs_path, abs_path


def main():
    # ── 1. Validate model ─────────────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Model file not found: {MODEL_PATH}")
        print("        Place 'best.pt' in the same folder as this script.")
        sys.exit(1)

    # ── 2. Resolve video source ───────────────────────────────────────────────
    video_source, source_label = get_video_source()

    # ── 3. Load YOLO model ────────────────────────────────────────────────────
    print(f"[INFO] Loading model : {MODEL_PATH}")
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        sys.exit(1)

    # ── 4. Open video / webcam ────────────────────────────────────────────────
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video source: {source_label}")
        if isinstance(video_source, int):
            print("        Make sure a webcam is connected and not in use.")
        sys.exit(1)

    # ── 5. Read video properties ──────────────────────────────────────────────
    fps    = cap.get(cv2.CAP_PROP_FPS) or 20.0
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[INFO] Source      : {source_label}")
    print(f"[INFO] Resolution  : {width}x{height} @ {fps:.1f} fps")
    if total > 0:
        print(f"[INFO] Total frames: {total}")
    print(f"[INFO] Output file : {OUTPUT_PATH}")
    print("[INFO] Press 'q' to stop early.\n")

    # ── 6. Set up video writer ────────────────────────────────────────────────
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out    = cv2.VideoWriter(OUTPUT_PATH, fourcc, fps, (width, height))

    if not out.isOpened():
        print("[ERROR] Could not initialise video writer.")
        cap.release()
        sys.exit(1)

    frame_count = 0

    # ── 7. Detection loop ─────────────────────────────────────────────────────
    try:
        while cap.isOpened():
            success, frame = cap.read()

            if not success:
                # End of file or unrecoverable camera error
                if frame_count == 0:
                    print("[ERROR] Could not read any frames from the source.")
                else:
                    print("[INFO] End of video reached.")
                break

            frame_count += 1

            # Run YOLOv8 inference
            try:
                results = model(frame, verbose=False)
            except Exception as e:
                print(f"[WARNING] Inference error on frame {frame_count}: {e}")
                continue

            # Annotate frame
            annotated = results[0].plot()

            # Safety resize (should never be needed, but prevents writer crash)
            if annotated.shape[1] != width or annotated.shape[0] != height:
                annotated = cv2.resize(annotated, (width, height))

            # Write to output file
            out.write(annotated)

            # Display
            cv2.imshow("YOLOv8 Pest Detection -- Video", annotated)

            # ── Window-close / 'q' handling ───────────────────────────────────
            # cv2.waitKey returns -1 if window was closed via the X button
            # on most platforms.  We also honour ESC (27) and 'q' (113).
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), 27):
                print("[INFO] Stopped early by user (key press).")
                break

            # Check if the display window was closed by the user
            # getWindowProperty returns -1 when the window no longer exists
            try:
                if cv2.getWindowProperty(
                    "YOLOv8 Pest Detection -- Video",
                    cv2.WND_PROP_VISIBLE
                ) < 1:
                    print("[INFO] Stopped early by user (window closed).")
                    break
            except cv2.error:
                pass  # property not supported on this backend — safe to ignore

    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by Ctrl+C.")

    # ── 8. Release resources ──────────────────────────────────────────────────
    print(f"[INFO] Processed {frame_count} frames.")
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    cv2.waitKey(1)   # flush destroy on Linux/macOS

    print(f"[INFO] Result saved to : {OUTPUT_PATH}")
    print("[INFO] Done.")


if __name__ == "__main__":
    main()
