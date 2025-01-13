import nltk
nltk.download('punkt')
from nltk.translate.bleu_score import corpus_bleu

def bleu(predicted_texts, references_texts):
    predicted_tokens = [nltk.word_tokenize(t) for t in predicted_texts]
    references_tokens = [[nltk.word_tokenize(t)] for t in references_texts]
    return corpus_bleu(references_tokens, predicted_tokens)
