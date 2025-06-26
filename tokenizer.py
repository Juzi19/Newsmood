
class Tokenizer():
    def __init__(self):
        self.text = ''
        self.tokens = []
    
    def get_tokens(self):
        return self.tokens
      
    def load_text(self, text):
        # Reset tokens
        self.tokens = []
        self.text = text
        self.__tokenize()
        return self.tokens
    
    def reset(self):
        self.text = ''
        self.tokens = []
    
    def __tokenize(self):
        chunk = ''
        for char in self.text:
            #add word to the token list, if there is a space
            if char.strip() == '':
                self.tokens.append(chunk)
                #reset chunk
                chunk = ''
            elif char in '!,"?:;.=)(/&%$§+*#-_<>|@^}°)' or char in "'{[\´`~]":
                #ignore any other characters
                continue
            else:
                chunk += char
        #add remaining string
        self.tokens.append(chunk)

if __name__ == "__main__":
    text = "I am, a small man"
    mytokenizer = Tokenizer()
    print(mytokenizer.load_text(text))
