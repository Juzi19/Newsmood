import torch
from pipeline import Pipeline
import torch.nn as nn
import torch.optim as optim
import math
import matplotlib.pyplot as plt
from mymodel import SentimentLSTM
from vectorizer import Word2Ind


class Trainer():

    def __init__(self, model, lr, weight_decay, pathname='C:/Users/justu/Documents/CS/Machine_Learning/sentiment_analysis/data/model_weights.pth'):
        self.model = model
        self.pathname = pathname
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

        #Try loading the model
        try:
            self.model.load_state_dict(torch.load(pathname))
        except FileNotFoundError:
            print("Cannot find a pretrained model")
            pass
        
        # initializing train and test pipeline
        mypipe = Pipeline("train")
        mypipe.create_and_split()
        mypipe.tokenize()
        mypipe.vectorize()

        self.train_features, self.train_targets=mypipe.get_tensors()

        #load test data
        mypipe = Pipeline("test")
        mypipe.create_and_split()
        mypipe.tokenize()
        mypipe.vectorize()

        self.test_features, self.test_targets=mypipe.get_tensors()

        # Shuffle data for training purpose
        # Note: do not use this approach for large datasets. Use framework solutions instead
        self.indices = torch.arange(0,len(self.train_targets))
        self.indices = torch.randperm(self.indices.size(0))

        # define optimizer and loss function
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr, weight_decay=weight_decay)
        self.loss_function = nn.MSELoss()  # Mean Squared Error,  our classification problems comes closer to a regression (it is far better to predict a rather negative value (still neutral) than a strictly neutral value instead)

        # initialize lists to track the models performance
        self.losses_list = []
        self.test_losses_list = []

        self.avg_losses = 0
        self.avg_losses_list = []

        self.avg_test_loss = 0
        self.avg_test_loss_list = []


    def __train_model(self, batch_size:int, noise:float, logging_frequency:int):
        
        self.model.train()
        #tracking variable
        mysum=0

        for i in range(0, len(self.train_features), batch_size):
            
            try:
                # copying labels and features to device (for each batch) (!inefficient)
                targets = torch.tensor([[self.train_targets[i]] for i in self.indices[i:i+(batch_size-1)]]).to(self.device)
                features = torch.stack([self.train_features[i] for i in self.indices[i:i+(batch_size-1)]]).to(self.device)
            except KeyError:
                # take the remaining data (smaller batch size)
                targets = torch.tensor([[self.train_targets[i]] for i in self.indices[i:]]).to(self.device)
                features = torch.stack([self.train_features[i] for i in self.indices[i:]]).to(self.device)

            # Reset gradients
            self.optimizer.zero_grad()

            # Forward Pass
            outputs = self.model.forward(features,noise=noise)

            # calculate loss
            loss = self.loss_function(outputs, targets)

            # Backward Pass
            loss.backward()

            # Optimizer Step
            self.optimizer.step()

            # Tracking logic
            mysum += loss.item()
            self.avg_losses += loss.item()

            if i%(batch_size*logging_frequency) == 0 and i != 0 :
                print("Average: ")
                print(mysum/logging_frequency)
                self.losses_list.append(mysum/logging_frequency)
                mysum = 0

        #final logging calls
        mysum = 0

        self.avg_losses_list.append(self.avg_losses/math.floor(len(self.train_features))/logging_frequency)

        self.avg_losses = 0

        # shuffles indices again for next epoch, see comment above for further information
        self.indices = torch.randperm(self.indices.size(0))

    def __test_model(self):
        mysum=0
        # reset trackers
        self.avg_test_loss = 0

        #test loop on tachsize 2
        for i in range(1,len(self.test_features),2):
            test_labels = torch.tensor([[self.test_targets[i-1]],[self.test_targets[i]]]).to(self.device)
            test_inputs = torch.stack([self.test_features[i-1], self.test_features[i]]).to(self.device)

            # set model into evalution mode
            self.model.eval()

            # Forward Pass
            test_outputs = self.model.forward(test_inputs)  # [batch_size, 1]

            # calculate loss
            test_loss = self.loss_function(test_outputs, test_labels)

            mysum += test_loss.item()
            self.avg_test_loss+= test_loss.item()
            if (i-1)%400 == 0 and i != 1 :
                print("Average: ")
                print(mysum/200)
                self.test_losses_list.append(mysum/200)
                mysum = 0
        mysum = 0


    def __print_progress(self):
        # reporting the progress
        print("AVERAGE TEST LOSS")
        print("=================")
        print(self.avg_test_loss/(len(self.test_features)*0.5))
        print("================")
        print("PREVIOUS")
        print(self.avg_test_loss_list[-1:])
        self.avg_test_loss_list.append(self.avg_test_loss/math.floor((len(self.test_features)*0.5)))
        print(self.avg_test_loss_list)
        print("END")

    def __show_plots(self):

        # show training progress graphs

        plt.plot(self.losses_list[:-1], marker='o')  
        plt.title("Loss")
        plt.xlabel("Index")
        plt.ylabel("Wert")
        plt.grid(True)
        plt.show()

        plt.plot(self.avg_losses_list[:-1], marker='o')  
        plt.title("Average Train losses")
        plt.xlabel("Index")
        plt.ylabel("Wert")
        plt.grid(True)
        plt.show()

        plt.plot(self.avg_test_loss_list[:-1], marker='o')  
        plt.title("Average test losses list")
        plt.xlabel("Index")
        plt.ylabel("Wert")
        plt.grid(True)
        plt.show()

        plt.plot(self.test_losses_list[:-1], marker='o')  
        plt.title("Test losses")
        plt.xlabel("Index")
        plt.ylabel("Wert")
        plt.grid(True)
        plt.show()


    def train_model(self, epochs:int, batch_size:int, noise:float, logging_frequency:int, early_stopping=True):
        """
        Calls internal class methods to train the model accordingly to the input parameters. Displays plot about the training/testing process after training
        """
        for e in range(epochs):
            self.__train_model(batch_size, noise, logging_frequency)
            self.__test_model()
            self.__print_progress()

            # checks of net is still learning / EARLY STOPPING, 1% tolerance
            #saving the model
            torch.save(self.model.state_dict(), self.pathname)
            if early_stopping and e>0 and self.avg_test_loss_list[-1] > self.avg_test_loss_list[-2]*1.01:
                break
        self.__show_plots()
        

    


if __name__ == "__main__":
    wti = Word2Ind()
    model = SentimentLSTM(len(wti.get_vocabulary()), 200, 128)
    trainer = Trainer(model, 0.003, 1e-5)
    trainer.train_model(20, 32, 0.6, 16,True)
    

