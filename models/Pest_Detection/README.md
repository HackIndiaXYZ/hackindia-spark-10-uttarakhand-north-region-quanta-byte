# PestVision — Flask YOLOv8 Pest Detection Web App

## Project Structure

```
pest-detection/
├── app.py                  # Flask backend
├── best.pt                 # YOLOv8 trained model
├── requirements.txt
├── templates/
│   └── index.html          # Frontend UI
├── static/                 # (CSS/JS if needed)
├── uploads/                # Temp uploaded files (auto-created)
└── outputs/                # Detection results (auto-created)
```

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Make sure best.pt is in the same folder as app.py

### 3. Run the app
```bash
python app.py
```

### 4. Open browser
```
http://localhost:5000
```

## Usage

1. Select **Image** or **Video** tab
2. Drag & drop or click to upload a file
   - Images: JPG, PNG, BMP, WEBP
   - Videos: MP4, AVI, MOV, MKV, WEBM
3. Click **Run Detection**
4. View annotated results with bounding boxes and confidence scores
5. Download the output file

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve main UI |
| POST | `/detect/image` | Run image detection |
| POST | `/detect/video` | Run video detection |
| GET | `/outputs/<filename>` | Serve output file |
