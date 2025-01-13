import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from datasets import load_dataset
from torch.utils.data import DataLoader
from transformers import Trainer, TrainingArguments
from sklearn.metrics import accuracy_score
from PIL import Image

# тут все тоже самое что и вдругих файлах
model_name = "Salesforce/blip-image-captioning-base"
processor = BlipProcessor.from_pretrained(model_name)
model = BlipForConditionalGeneration.from_pretrained(model_name)

# как можно было бы дообучить модель? например, используя датасет COCO
dataset = load_dataset("coco", split="train") 

# преобразуем изображения и описания в нужный формат
def preprocess_data(example):
    image = Image.open(example['image']['file_name']).convert("RGB")
    text = example['caption']
    inputs = processor(text=text, images=image, return_tensors="pt", padding=True)
    return inputs

train_dataset = dataset.map(preprocess_data, batched=False)
train_dataloader = DataLoader(train_dataset, batch_size=4, shuffle=True)

training_args = TrainingArguments(
    output_dir="./blip_finetuned",
    per_device_train_batch_size=4,
    num_train_epochs=3,
    logging_dir='./logs',
    logging_steps=10,
)

def compute_metrics(p):
    predictions, labels = p
    predicted_text = processor.decode(predictions, skip_special_tokens=True)
    labels_text = processor.decode(labels, skip_special_tokens=True)
    
    bleu_score = bleu(predicted_text, labels_text)
    return {"bleu": bleu_score}

trainer = Trainer(
    model=model,
    args=training_args,
    data_collator=None, 
    train_dataset=train_dataset,
    compute_metrics=compute_metrics,
)

trainer.train()
