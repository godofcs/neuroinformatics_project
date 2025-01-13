from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments

model = GPT2LMHeadModel.from_pretrained("gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# пример
train_data = [
    {"text": "Write one (one sentence) funny caption for the image: A dog wearing a party hat.\nCaption: When you're the life of the party, but you're also the birthday dog."},
]

# преобразование
train_texts = [item['text'] for item in train_data]
encoding = tokenizer(train_texts, return_tensors='pt', padding=True, truncation=True)

training_args = TrainingArguments(
    output_dir="./gpt2_finetuned",
    per_device_train_batch_size=1,
    num_train_epochs=3,
    logging_dir='./logs',
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoding,
)

trainer.train()
