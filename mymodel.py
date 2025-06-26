import torch
import torch.nn as nn
from vectorizer import Word2Ind
import torch.optim as optim
from pipeline import Pipeline
import matplotlib.pyplot as plt
import math

class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size:int, embedding_dim:int, hidden_dim:int):
        super(SentimentLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.embedding = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x, noise=0):
        # Initiate lstm state at 0 for every new batch (reseting memory)
        h_0 = torch.zeros(1, x.size(0), self.hidden_dim).to(x.device)  # Initial hidden state
        c_0 = torch.zeros(1, x.size(0), self.hidden_dim).to(x.device)  # Initial cell state
        
        embedded = self.embedding(x)  # [batch, seq_len, emb_dim]
        embedded_noisy = embedded + torch.randn_like(embedded) * noise #add some noise
        lstm_out, (hidden, cell) = self.lstm(embedded_noisy, (h_0, c_0))  # [batch, seq_dim, embedding_dim] -> [batch, hidden_dim]
        out = self.fc(hidden[-1])  # [batch, hidden_dim] -> [batch, 1]
        
        return self.sigmoid(out)
    


if __name__ == "__main__":


    mysum = 0
    wti = Word2Ind()
    #swap calculations to cuda/gpu if possible
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # instanciate model
    model = SentimentLSTM(len(wti.get_vocabulary()), 200, 128).to(device)
    print(f"Using device {device}")

    #Try loading the model
    try:
        model.load_state_dict(torch.load('C:/Users/justu/Documents/CS/Machine_Learning/sentiment_analysis/data/model_weights.pth'))
    except FileNotFoundError:
        pass

    # load training data
    mypipe = Pipeline("train")
    mypipe.create_and_split()
    mypipe.tokenize()
    # adding noise to the training data
    mypipe.vectorize()
    print(mypipe.get_tensors())
    mypipe.get_overview()

    encoded_tokens, y_labels=mypipe.get_tensors()

    # load test data
    test_pipe = Pipeline("test")
    test_pipe.create_and_split()
    test_pipe.tokenize()
    test_pipe.vectorize()
    print(test_pipe.get_tensors())
    test_pipe.get_overview()

    test_encoded_tokens, test_y_labels=test_pipe.get_tensors()

    # Shuffle data for training purpose
    indices = torch.arange(0,len(y_labels))
    print("Shuffled indices:")
    indices = torch.randperm(indices.size(0))
    print(indices)


    # define optimizer (Adam)
    optimizer = optim.Adam(model.parameters(), lr=0.003)
    loss_function = nn.MSELoss()  # Mean Squared Error,  since 3 classes to classificate

    losses_list = []
    test_losses_list = []

    avg_losses = 0
    avg_losses_list = []

    avg_test_loss = 0
    avg_test_loss_list = []
    # epochs to train
    for x  in range(20):

        print("NEW EPOCH", x)


        # training loop
        for i in range(0,len(encoded_tokens),32):
            try:
                #batch size 32
                labels = torch.tensor([[y_labels[i]] for i in indices[i:i+31]]).to(device)
                inputs = torch.stack([encoded_tokens[i] for i in indices[i:i+31]]).to(device)
            except KeyError:
                print("Key Error")
                continue

            # set model into training mode
            model.train()

            # zero gradient
            optimizer.zero_grad()

            # Forward Pass
            outputs = model.forward(inputs,noise=0.28)  # [batch_size, 1]

            # calculate loss
            loss = loss_function(outputs, labels)

            # Backward Pass
            loss.backward()

            # Optimizer Step
            optimizer.step()

            mysum += loss.item()
            avg_losses += loss.item()
            if i%480 == 0 and i != 0 :
                print("Average: ")
                print(mysum/16)
                losses_list.append(mysum/16)
                mysum = 0

        mysum = 0


        avg_losses_list.append(avg_losses/math.floor((len(encoded_tokens)*(1/32))))
        avg_losses = 0

        # shuffles indices again for next epoch
        indices = torch.randperm(indices.size(0))



        print("STARTING TEST LOOP")

        #test loop
        for i in range(1,len(test_encoded_tokens),2):
            test_labels = torch.tensor([[test_y_labels[i-1]],[test_y_labels[i]]]).to(device)
            test_inputs = torch.stack([test_encoded_tokens[i-1], test_encoded_tokens[i]]).to(device)

            # set model into evalution mode
            model.eval()

            # Forward Pass
            test_outputs = model.forward(test_inputs)  # [batch_size, 1]

            # calculate loss
            test_loss = loss_function(test_outputs, test_labels)

            mysum += test_loss.item()
            avg_test_loss+= test_loss.item()
            if (i-1)%400 == 0 and i != 1 :
                print("Average: ")
                print(mysum/200)
                test_losses_list.append(mysum/200)
                mysum = 0
            
        # reporting the progress
        print("AVERAGE TEST LOSS")
        print("=================")
        print(avg_test_loss/(len(test_encoded_tokens)*0.5))
        print("================")
        print("PREVIOUS")
        print(avg_test_loss_list[-1:])
        avg_test_loss_list.append(avg_test_loss/math.floor((len(test_encoded_tokens)*0.5)))
        print("END")

        # checks of net is still learning / EARLY STOPPING, 1% tolerance
        print(avg_test_loss_list)
        #saving the model
        torch.save(model.state_dict(), 'C:/Users/justu/Documents/CS/Machine_Learning/sentiment_analysis/data/model_weights.pth')
        if x>0 and avg_test_loss_list[-1] > avg_test_loss_list[-2]*1.01:
            break

        mysum = 0
        avg_test_loss = 0


    # show training progress graphs

    plt.plot(losses_list[:-1], marker='o')  
    plt.title("Loss")
    plt.xlabel("Index")
    plt.ylabel("Wert")
    plt.grid(True)
    plt.show()

    plt.plot(avg_losses_list[:-1], marker='o')  
    plt.title("Average Train losses")
    plt.xlabel("Index")
    plt.ylabel("Wert")
    plt.grid(True)
    plt.show()

    plt.plot(avg_test_loss_list[:-1], marker='o')  
    plt.title("Average test losses list")
    plt.xlabel("Index")
    plt.ylabel("Wert")
    plt.grid(True)
    plt.show()

    plt.plot(test_losses_list[:-1], marker='o')  
    plt.title("Test losses")
    plt.xlabel("Index")
    plt.ylabel("Wert")
    plt.grid(True)
    plt.show()

            
    # save model
    #torch.save(model.state_dict(), 'C:/Users/justu/Documents/CS/Machine_Learning/sentiment_analysis/data/model_weights.pth')
