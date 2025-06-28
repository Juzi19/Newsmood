import torch
import torch.nn as nn
import requests
import numpy as np

class OneHot():
    def __init__(self):
        url = 'https://www.mit.edu/~ecprice/wordlist.10000'
        response = requests.get(url)
        if response.status_code == 200:
            self.vocabulary = response.text.splitlines()
            print(self.vocabulary[:20])  # prints first 10 words
        else:
            print(f"Fehler beim Laden: Statuscode {response.status_code}")
    def onehot(self,text:list):
        """
        Given a text of words, the method creates embedding them using the one-hot mechanism.
        
        Parameters:
            text(list): List full of token
        
        Returns:
            embedding(torch.tensor): Tensor full of vectors/encoding for each input token. dim: (len(words), len(vocab))
        """
        embedding = torch.zeros(((len(text), len(text[0])), len(self.vocabulary)))
        print(embedding)
        for ind, row in text:
            # creates embedding for every word/token, extracted from the token array
            for i, word in enumerate(row):
                embedding[ind][i][self.__binary_search_position(word)] = 1
        return embedding

    def __binary_search_position(self, word)->int:
        """
        Performs a binary search to find the position of a word in the sorted vocabulary list.

        Parameters:
            word (str): The word to search for.

        Returns:
            int: The position of the word in the vocabulary, index starting at 1.
                Returns 0 if the word is not found.
        """
        word = word.lower()

        left = 0
        right = len(self.vocabulary) - 1

        while left <= right:
            mid = (left + right) // 2
            mid_word = self.vocabulary[mid]

            if mid_word == word:
                return mid + 1
            elif mid_word < word:
                left = mid + 1
            else:
                right = mid - 1

        return 0  # Wort not found
    

class Word2Ind():
    """
    The Word2Ind Class offers methods to convert text, based on a vocab of the 10000 most frequetly used English words, into key-inedex vectors.
    """
    def __init__(self):
        self.vocabulary = {}
        url = 'https://www.mit.edu/~ecprice/wordlist.10000'
        response = requests.get(url)
        if response.status_code == 200:
            self.words = response.text.splitlines()
            # print(self.words[:20])  # prints first 10 words
        else:
            print(f"Fehler beim Laden: Statuscode {response.status_code}")
        #loading the words in the vocab dict
        for i, word in enumerate(self.words):
            self.vocabulary[word] = i+1

    def encode(self, seq:list):
        """
        Encodes a list of tokens(words) / a sequence by using the key-value method

        Parameters:
            tokens(list): List ok tkoens/words which are used to transform them into vectors
        Returns:
            vector(torch.tensor): Tensor with the proper ecoding
        """
        #vector = torch.zeros((len(seq), len(seq[0])), dtype=torch.int32)
        vector = torch.zeros((len(seq), max(30,len(seq[0]))), dtype=torch.int32)
        #print(vector.shape)
        for ind, row in enumerate(seq):
            for i, token in enumerate(row):
                try:
                    vector[ind][i] = self.vocabulary[token.lower()]
                except KeyError:
                    # 0 as default value for unknown words
                    vector[ind][i] = 0
        return vector
    
    def get_vocabulary(self):
        return self.vocabulary
    

        
if __name__ == "__main__":
    vec = OneHot()
    tokens = [['I', 'am', 'a', 'small', 'man'],["I", "like", "this", "book"]]
    wti = Word2Ind()
    print(wti.encode(tokens))
    print(len(wti.vocabulary))
    embedding_layer = nn.Embedding(num_embeddings=len(wti.get_vocabulary()),embedding_dim=4)
    input_indices = wti.encode(tokens)
    output = embedding_layer(input_indices)
    print(output)