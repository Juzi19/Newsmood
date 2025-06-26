import pandas as pd
from tokenizer import Tokenizer
from vectorizer import Word2Ind
import torch

class Pipeline():
    def __init__(self, mode="train"):
        if mode == "train":
            df = pd.read_csv("./data/train.csv", encoding="cp1252")
            self.df_subset = df.iloc[:, [1, 3]]
            self.df_len = self.__get_df_len()
        elif mode == "test":
            df = pd.read_csv("./data/test.csv", encoding="iso-8859-1")
            self.df_subset = df.iloc[:, [1, 2]]
            self.df_len = self.__get_df_len()
        elif mode == "manual":
            pass
        else:
            raise Exception("No valid mode")
        
        self.x = []
        self.y = []

    def manual_set_text(self, x, y=None):
        self.x = x
        self.y = y


    def create_and_split(self):
        #print(self.df_subset.shape)
        for i in range(self.df_len):
            # copying x data
            self.x.append(self.df_subset.iloc[i][0])

            # labeling data
            if self.df_subset.iloc[i][1].strip() == 'positive':
                self.y.append(1)
            elif self.df_subset.iloc[i][1].strip() == 'negative':
                self.y.append(0)
            else:
                self.y.append(0.5)
        return self.x, self.y
    
    def __get_df_len(self):
        df_len = 0
        for i in range(self.df_subset.shape[0]):
            if isinstance(self.df_subset.iloc[i][0], str):
                df_len += 1
        #print(df_len)
        return df_len
    
    def get_overview(self):
        print("=== Overview ===")
        print("===Shape Position 0 ===")
        print(len(self.x))
        print("X data:")
        print(self.x[:10])
        print("Y data:")
        print(self.y[:10])
        print("=== End of overview ===")

    def class_imbalance(self):
        """
        Method to clalculate the class imbalance of the feature data. Note: You are supposed to run (only) create_and_split before calling this method.
        Return:
            report(str): Report string informing about class imbalance
        """
        # [negative, neutral, positive]
        classes = [0,0,0]
        if  not isinstance(self.y, list):
            print("Can't perform class imbalance method on other datatypes than python list")
            exit(1)
        for y in self.y:
            classes[int(y*2)] += 1
        
        classes_sum=(classes[0]+classes[1]+classes[2])
        return f'classes: {classes}. Negative (%): {classes[0]/classes_sum}. Neutral(%): {classes[1]/classes_sum} . Positive (%): {classes[2]/classes_sum}'

    def tokenize(self):
        self.tokenizer = Tokenizer()
        for index, element in enumerate(self.x):
            # loading each element in the tokenize
            if type(element)!=str:
                element = 'UNKNOWNEMPTY'
            self.tokenizer.load_text(element.strip())
            self.x[index] = [token for token in self.tokenizer.get_tokens() if token.strip() != '']
            # shorting the tokens to a max sequence length of 30 tokens (only for 7 edge cases)
            self.x[index] = self.x[index][:30]
            # add padding if necessary
            for i in range(30 - len(self.x[index])):
                self.x[index].append("UKNOWNEMPTY")
            self.tokenizer.reset()
        return self.x, self.y

    def vectorize(self):
        self.wti = Word2Ind()
        self.x = self.wti.encode(self.x)

    def get_tensors(self):
        self.x = torch.tensor(self.x, dtype=torch.int)
        self.y = torch.tensor(self.y, dtype=torch.float)

        return self.x, self.y
        

        
        







if __name__ == "__main__":
    mypipe = Pipeline()
    mypipe.create_and_split()
    print(mypipe.class_imbalance())
    mypipe.tokenize()
    mypipe.vectorize()
    print(mypipe.get_tensors())
    mypipe.get_overview()