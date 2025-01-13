# Функция для генерации смешной подписи
def generate_caption(description):
    prompt = f"Write one (one sentence) funny caption for the image: {description}\nCaption:"
    inputs = tokenizer(prompt, return_tensors="pt")

    outputs = model.generate(inputs['input_ids'], max_length=50, num_return_sequences=1, no_repeat_ngram_size=2)
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return generated_text.replace(prompt, "").strip()

description = "A dog wearing a birthday hat and sitting next to a cake"
caption = generate_caption(description)
print(caption)
