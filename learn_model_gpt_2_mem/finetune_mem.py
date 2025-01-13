from datasets import Dataset
from transformers import GPT2LMHeadModel, GPT2Tokenizer
from transformers import Trainer, TrainingArguments
import torch


data = [
    {"description": "A dog in a party hat with a cake", "caption": "When you're the life of the party, but you're also the birthday dog."},
    {"description": "A cat wearing glasses, reading a book", "caption": "This is the professor of napping."},
    # и так далее
]

# Преобразуем данные в формат Hugging Face Dataset
dataset = Dataset.from_dict({
    "text": [f"Write one (one sentence) funny caption for the image: {item['description']}\nCaption: {item['caption']}" for item in data]
})

model_name = "gpt2"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)

# Настроим токенизатор 
tokenizer.pad_token = tokenizer.eos_token  

# Функция для токенизации
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

# Применяем токенизацию к датасету
tokenized_datasets = dataset.map(tokenize_function, batched=True)
train_dataset = tokenized_datasets["train"]

training_args = TrainingArguments(
    output_dir="./gpt2_finetuned",  
    num_train_epochs=3,             
    per_device_train_batch_size=4,  
    logging_dir='./logs',           
    logging_steps=10,
    save_steps=500,
    save_total_limit=2,             
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

trainer.train()
