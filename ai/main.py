from transformers import BlipProcessor, BlipForConditionalGeneration, GPT2LMHeadModel, GPT2Tokenizer
from PIL import Image
import uvicorn
from fastapi import FastAPI, File, UploadFile
from io import BytesIO

app = FastAPI()

local_blip_path = "./models/blip"
local_gpt2_path = "./models/gpt2"

try:
    # Загрузка BLIP из локального пути
    processor = BlipProcessor.from_pretrained(local_blip_path)
    model = BlipForConditionalGeneration.from_pretrained(local_blip_path)

    # Загрузка GPT-2 из локального пути
    tokenizer = GPT2Tokenizer.from_pretrained(local_gpt2_path)
    text_model = GPT2LMHeadModel.from_pretrained(local_gpt2_path)
except:
    # 1. Установим BLIP для генерации описания картинки
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

    # 2. Установим GPT-2 для генерации креативных подписей
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    text_model = GPT2LMHeadModel.from_pretrained("gpt2")
    processor.save_pretrained(local_blip_path)
    model.save_pretrained(local_blip_path)
    tokenizer.save_pretrained(local_gpt2_path)
    text_model.save_pretrained(local_gpt2_path)


def generate_image_caption(image):
    # Генерация описания картинки
    inputs = processor(image, return_tensors="pt")
    caption_ids = model.generate(**inputs)
    description = processor.decode(caption_ids[0], skip_special_tokens=True)
    return description


def enhance_caption(description):
    # Генерация шутливой подписи на основе описания
    #prompt = f"Write one (one sentence) funny caption for the image: {description}\nCaption:"
    prompt = f"""You are an imaginative and humorous AI tasked with making people laugh with your creative, funny captions. 
Below is a description of an image. Use your wit and humor to generate a single funny caption that perfectly matches the image. 
Image Description: {description}\nCaption:"""

    inputs = tokenizer(prompt, return_tensors="pt", max_new_tokens=200, truncation=True)
    outputs = text_model.generate(**inputs, max_new_tokens=200, num_return_sequences=1, no_repeat_ngram_size=2)
    caption = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return caption.split("Caption:")[-1].strip().split("'")[0].split(".")[0].split("\n")[0]

@app.post("/generate-caption/")
async def generate_caption(file: UploadFile = File(...)):
    # Чтение загруженного файла изображения
    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")

    # Генерация подписи
    description = generate_image_caption(image)
    caption = enhance_caption(description)

    return {"caption": caption}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)