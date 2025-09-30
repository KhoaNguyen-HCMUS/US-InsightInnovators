from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image
import torch
import io
from .labels import labels

# Load model and processor
MODEL_NAME = "prithivMLmods/Food-101-93M"
model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)  # type: ignore
model.eval()

def classify_food(image_bytes):
    """Predicts the type of food in the image."""  
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    predictions = {labels[str(i)]: round(probs[i], 3) for i in range(len(probs))}
    # Sort by descending probability
    top5 = dict(sorted(predictions.items(), key=lambda item: item[1], reverse=True)[:5])
    
    return {"top5": top5}
