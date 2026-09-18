import os
import uuid
import logging
from pathlib import Path

from flask import Flask, request, jsonify, render_template, send_from_directory

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.DEBUG, format='[%(levelname)s] %(message)s')
log = logging.getLogger(__name__)

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 MB

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'best.pt')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUT_DIR = os.path.join(BASE_DIR, 'outputs')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

ALLOWED_IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
ALLOWED_VIDEO_EXT = {'.mp4', '.avi', '.mov', '.mkv', '.webm'}

# ── Lazy-load YOLO model ──────────────────────────────────────────────────────
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        from ultralytics import YOLO
        log.info(f"Loading YOLO model from: {MODEL_PATH}")
        _model = YOLO(MODEL_PATH)
    return _model


def check_extension(filename: str, allowed: set):
    ext = Path(filename).suffix.lower()
    if ext not in allowed:
        return False, f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(allowed))}"
    return True, ""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


# ─── IMAGE DETECTION ──────────────────────────────────────────────────────────

@app.route('/detect/image', methods=['POST'])
def detect_image():
    import cv2

    temp_file = None
    try:
        uploaded_file = request.files.get('image_file')
        if not uploaded_file or not uploaded_file.filename:
            return jsonify({'error': 'No image file provided.'}), 400

        ok, err = check_extension(uploaded_file.filename, ALLOWED_IMAGE_EXT)
        if not ok:
            return jsonify({'error': err}), 400

        ext       = Path(uploaded_file.filename).suffix.lower()
        temp_name = f"{uuid.uuid4().hex}{ext}"
        temp_file = os.path.join(UPLOAD_DIR, temp_name)
        uploaded_file.save(temp_file)
        log.info(f"Image saved: {temp_file}")

        image = cv2.imread(temp_file)
        if image is None:
            return jsonify({'error': 'Could not read image. Make sure it is a valid image file.'}), 400

        model   = get_model()
        results = model(image)

        out_name = f"result_{uuid.uuid4().hex}.jpg"
        out_path = os.path.join(OUTPUT_DIR, out_name)
        annotated = results[0].plot()
        cv2.imwrite(out_path, annotated)
        log.info(f"Image result saved: {out_path}")

        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label  = model.names[cls_id]
                conf   = float(box.conf[0])
                detections.append({'label': label, 'confidence': round(conf * 100, 1)})

        # Sort by confidence desc
        detections.sort(key=lambda x: x['confidence'], reverse=True)

        return jsonify({
            'success'   : True,
            'type'      : 'image',
            'result_url': f'/outputs/{out_name}',
            'detections': detections,
            'count'     : len(detections),
        })

    except FileNotFoundError as e:
        log.error(str(e))
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        log.exception("Error during image detection")
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass


# ─── VIDEO DETECTION ──────────────────────────────────────────────────────────

@app.route('/detect/video', methods=['POST'])
def detect_video():
    import cv2

    temp_file = None
    try:
        uploaded_file = request.files.get('video_file')
        if not uploaded_file or not uploaded_file.filename:
            return jsonify({'error': 'No video file provided.'}), 400

        ok, err = check_extension(uploaded_file.filename, ALLOWED_VIDEO_EXT)
        if not ok:
            return jsonify({'error': err}), 400

        ext       = Path(uploaded_file.filename).suffix.lower()
        temp_name = f"{uuid.uuid4().hex}{ext}"
        temp_file = os.path.join(UPLOAD_DIR, temp_name)
        uploaded_file.save(temp_file)
        log.info(f"Video saved: {temp_file}")

        cap = cv2.VideoCapture(temp_file)
        if not cap.isOpened():
            return jsonify({'error': 'Could not open video file.'}), 400

        fps    = cap.get(cv2.CAP_PROP_FPS) or 20.0
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        log.info(f"Video: {width}x{height} @ {fps:.1f}fps, {total} frames")

        out_name = f"result_{uuid.uuid4().hex}.mp4"
        out_path = os.path.join(OUTPUT_DIR, out_name)

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(out_path, fourcc, fps, (width, height))
        if not writer.isOpened():
            cap.release()
            return jsonify({'error': 'Could not create output video writer.'}), 500

        model       = get_model()
        frame_count = 0
        all_labels  = {}

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            frame_count += 1
            results   = model(frame, verbose=False)
            annotated = results[0].plot()
            if annotated.shape[1] != width or annotated.shape[0] != height:
                annotated = cv2.resize(annotated, (width, height))
            writer.write(annotated)
            for box in results[0].boxes:
                label = model.names[int(box.cls[0])]
                all_labels[label] = all_labels.get(label, 0) + 1

        cap.release()
        writer.release()
        log.info(f"Video result saved: {out_path} ({frame_count} frames)")

        detections = sorted(
            [{'label': k, 'count': v} for k, v in all_labels.items()],
            key=lambda x: x['count'], reverse=True
        )

        return jsonify({
            'success'   : True,
            'type'      : 'video',
            'result_url': f'/outputs/{out_name}',
            'frames'    : frame_count,
            'detections': detections,
        })

    except FileNotFoundError as e:
        log.error(str(e))
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        log.exception("Error during video detection")
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass


# ─── Serve output files ───────────────────────────────────────────────────────

@app.route('/outputs/<filename>')
def serve_output(filename):
    return send_from_directory(OUTPUT_DIR, filename)


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    if not os.path.exists(MODEL_PATH):
        log.warning(f"WARNING: Model not found at {MODEL_PATH}. Place best.pt in the same folder as app.py.")
    app.run(debug=True, host='0.0.0.0', port=5000)
