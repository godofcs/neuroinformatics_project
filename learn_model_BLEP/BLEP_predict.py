# предсказание модели
model.eval()
predictions = []
references = []

for batch in train_dataloader:
    images = batch['pixel_values'].to(model.device)
    captions = batch['input_ids']
    outputs = model.generate(images)
    generated_text = processor.decode(outputs[0], skip_special_tokens=True)
    true_caption = processor.decode(captions[0], skip_special_tokens=True)

    predictions.append(generated_text)
    references.append(true_caption)

# оценка с использованием BLEU
score = bleu(predictions, references)
print(f"BLEU score: {score}")
