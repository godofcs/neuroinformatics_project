import math

# Функция вычисления perplexity
def calculate_perplexity(text):
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, labels=inputs['input_ids'])
        loss = outputs.loss
        perplexity = math.exp(loss.item())
    return perplexity


generated_text = generate_caption("A cat wearing a space suit")
print(f"Perplexity: {calculate_perplexity(generated_text)}")
