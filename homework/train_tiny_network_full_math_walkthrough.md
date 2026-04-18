# Full Mathematical Walkthrough of `train_tiny_network`

This note explains every step of the `train_tiny_network` function in `HW3.ipynb` and maps each line of code to the math behind it.

The goal is to make the function readable as both:

- Python code
- a complete optimization procedure for a tiny neural network

## The Function

```python
def train_tiny_network(X, y, seed, epochs=1000, eta=0.05, beta1=0.9, beta2=0.999, eps=1e-8, scale=0.5):
    rng = np.random.default_rng(seed)

    W1 = rng.normal(0, scale, size=(2, 2))
    b1 = np.zeros((1, 2))

    W2 = rng.normal(0, scale, size=(2, 1))
    b2 = np.zeros((1, 1))

    params = [W1, b1, W2, b2]
    m_params = [np.zeros_like(p) for p in params]
    v_params = [np.zeros_like(p) for p in params]
    loss_history = []

    for t in range(1, epochs + 1):
        Z1 = X.dot(W1) + b1
        A1 = relu(Z1)
        Z2 = A1.dot(W2) + b2
        A2 = sigmoid(Z2)

        loss_history.append(compute_binary_cross_entropy(y, A2))

        dZ2 = A2 - y
        dW2 = (A1.T.dot(dZ2)) / len(y)
        db2 = np.mean(dZ2, axis=0, keepdims=True)

        dA1 = dZ2.dot(W2.T)
        dZ1 = dA1 * relu_derivative(Z1)
        dW1 = (X.T.dot(dZ1)) / len(y)
        db1 = np.mean(dZ1, axis=0, keepdims=True)

        grads = [dW1, db1, dW2, db2]

        for i in range(len(params)):
            m_params[i] = beta1 * m_params[i] + (1 - beta1) * grads[i]
            v_params[i] = beta2 * v_params[i] + (1 - beta2) * (grads[i] ** 2)

            m_hat = m_params[i] / (1 - beta1 ** t)
            v_hat = v_params[i] / (1 - beta2 ** t)

            params[i] -= eta * m_hat / (np.sqrt(v_hat) + eps)

        W1, b1, W2, b2 = params

    Z1 = X.dot(W1) + b1
    A1 = relu(Z1)
    Z2 = A1.dot(W2) + b2
    A2 = sigmoid(Z2)
    predicted_classes = (A2 >= 0.5).astype(int)
    accuracy = np.mean(predicted_classes == y)

    return loss_history, accuracy
```

## 1. What the Network Is

This network has:

- 2 input features
- 2 hidden neurons with ReLU activation
- 1 output neuron with sigmoid activation

So for one training example $x^{(i)} \in \mathbb{R}^2$, the network computes:


$$
z_1^{(i)} = x^{(i)} W_1 + b_1
$$



$$
a_1^{(i)} = \mathrm{ReLU}(z_1^{(i)})
$$



$$
z_2^{(i)} = a_1^{(i)} W_2 + b_2
$$



$$
a_2^{(i)} = \sigma(z_2^{(i)})
$$


where:


$$
\mathrm{ReLU}(z) = \max(0, z)
$$



$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$


The output $a_2^{(i)}$ is the predicted probability that example $i$ belongs to class 1.

## 2. Shapes of Everything

In your homework, the dataset has 8 training examples, each with 2 features.


$$
X \in \mathbb{R}^{8 \times 2}
$$


After reshaping in the notebook:


$$
y \in \mathbb{R}^{8 \times 1}
$$


The trainable parameters are:


$$
W_1 \in \mathbb{R}^{2 \times 2}, \quad b_1 \in \mathbb{R}^{1 \times 2}
$$



$$
W_2 \in \mathbb{R}^{2 \times 1}, \quad b_2 \in \mathbb{R}^{1 \times 1}
$$


That means:

- `W1` maps 2 inputs to 2 hidden units
- `b1` gives one bias for each hidden unit
- `W2` maps 2 hidden activations to 1 output
- `b2` gives one bias for the output neuron

## 3. Loss Function Being Minimized

The function uses binary cross-entropy:

```python
def compute_binary_cross_entropy(y_true, y_pred):
    epsilon = 1e-8
    return -np.mean(y_true * np.log(y_pred + epsilon) + (1 - y_true) * np.log(1 - y_pred + epsilon))
```

Mathematically, over a batch of $m$ examples:


$$
L = -\frac{1}{m} \sum_{i=1}^{m} \left[y^{(i)} \log(a_2^{(i)} + \epsilon) + (1-y^{(i)}) \log(1-a_2^{(i)} + \epsilon)\right]
$$


Here:

- $a_2^{(i)}$ is the model prediction for example $i$
- $y^{(i)}$ is the true label
- $\epsilon$ is a tiny constant to avoid $\log(0)$

The training process tries to make this loss as small as possible.

## 4. Function Signature

```python
def train_tiny_network(X, y, seed, epochs=1000, eta=0.05, beta1=0.9, beta2=0.999, eps=1e-8, scale=0.5):
```

Each argument means:

- `X`: input matrix of training examples
- `y`: labels
- `seed`: random seed for reproducible initialization
- `epochs`: number of full training passes over the dataset
- `eta`: learning rate
- `beta1`: Adam decay rate for first moment
- `beta2`: Adam decay rate for second moment
- `eps`: numerical stabilizer for Adam
- `scale`: standard deviation used when randomly initializing the weights

Mathematically, the function is performing iterative optimization:


$$
\theta_{t+1} = \text{AdamUpdate}(\theta_t, \nabla_\theta L(\theta_t))
$$


where $\theta$ stands for all trainable parameters:


$$
\theta = \{W_1, b_1, W_2, b_2\}
$$


## 5. Random Number Generator

```python
rng = np.random.default_rng(seed)
```

This creates a random number generator whose output depends on `seed`.

Why this matters:

- if you use the same `seed`, you get the same starting weights
- if you use different seeds, you start training from different places

This matters a lot in neural networks because the loss surface is non-convex, so different initializations can lead to different training outcomes.

## 6. Parameter Initialization

### 6.1 First-layer weights

```python
W1 = rng.normal(0, scale, size=(2, 2))
```

This samples each element of $W_1$ independently from a normal distribution:


$$
(W_1)_{jk} \sim \mathcal{N}(0, \text{scale}^2)
$$


Shape:


$$
W_1 \in \mathbb{R}^{2 \times 2}
$$


Interpretation:

- each input feature connects to each hidden neuron
- because there are 2 inputs and 2 hidden neurons, `W1` needs 4 weights total

### 6.2 First-layer biases

```python
b1 = np.zeros((1, 2))
```

This sets:


$$
b_1 = \begin{bmatrix} 0 & 0 \end{bmatrix}
$$


Shape:


$$
b_1 \in \mathbb{R}^{1 \times 2}
$$


There is one bias for each hidden neuron.

### 6.3 Second-layer weights

```python
W2 = rng.normal(0, scale, size=(2, 1))
```

Each element of $W_2$ is sampled as:


$$
(W_2)_{jk} \sim \mathcal{N}(0, \text{scale}^2)
$$


Shape:


$$
W_2 \in \mathbb{R}^{2 \times 1}
$$


Interpretation:

- the 2 hidden activations feed into the single output neuron

### 6.4 Second-layer bias

```python
b2 = np.zeros((1, 1))
```

This sets:


$$
b_2 = \begin{bmatrix} 0 \end{bmatrix}
$$


Shape:


$$
b_2 \in \mathbb{R}^{1 \times 1}
$$


## 7. Grouping Parameters for Adam

```python
params = [W1, b1, W2, b2]
```

This is not a mathematical operation by itself. It is just packaging all trainable arrays into one list so they can be updated in the same loop.

You can think of it as storing:


$$
\theta = [W_1, b_1, W_2, b_2]
$$


### 7.1 Adam first-moment storage

```python
m_params = [np.zeros_like(p) for p in params]
```

For each parameter, Adam keeps a running average of gradients:


$$
m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t
$$


This line allocates a zero array of the same shape as each parameter so those running averages can be stored.

### 7.2 Adam second-moment storage

```python
v_params = [np.zeros_like(p) for p in params]
```

For each parameter, Adam also keeps a running average of squared gradients:


$$
v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2
$$


Again, this line just creates zero arrays of matching shapes.

### 7.3 Loss history

```python
loss_history = []
```

This stores the scalar loss value after each epoch.

## 8. Epoch Loop

```python
for t in range(1, epochs + 1):
```

This means the function repeats the full forward pass, loss computation, backpropagation, and parameter update `epochs` times.

Important point:

- one epoch here means one pass over the full dataset
- the code uses the entire `X` matrix at once
- so this is full-batch training, not mini-batch training

If `epochs = 1000`, then the model sees the whole dataset 1000 times.

## 9. Forward Pass

The forward pass turns inputs into predictions.

### 9.1 Hidden-layer pre-activation

```python
Z1 = X.dot(W1) + b1
```

This computes:


$$
Z_1 = X W_1 + b_1
$$


Shape check:

- $X: (m, 2)$
- $W_1: (2, 2)$
- $b_1: (1, 2)$
- $Z_1: (m, 2)$

For one example $x^{(i)} = [x_1^{(i)}, x_2^{(i)}]$, the two hidden pre-activations are:


$$
z_{1,1}^{(i)} = x_1^{(i)} w_{1,11} + x_2^{(i)} w_{1,21} + b_{1,1}
$$



$$
z_{1,2}^{(i)} = x_1^{(i)} w_{1,12} + x_2^{(i)} w_{1,22} + b_{1,2}
$$


So each hidden neuron forms a weighted sum of the two inputs plus its bias.

### 9.2 Hidden activation

```python
A1 = relu(Z1)
```

This applies ReLU elementwise:


$$
A_1 = \mathrm{ReLU}(Z_1)
$$



$$
\mathrm{ReLU}(z) = \max(0, z)
$$


So each element becomes:


$$
a_{1,j}^{(i)} = \max(0, z_{1,j}^{(i)})
$$


Interpretation:

- if a hidden pre-activation is negative, that hidden neuron outputs 0
- if it is positive, the output equals the input value

Shape:


$$
A_1 \in \mathbb{R}^{m \times 2}
$$


### 9.3 Output-layer pre-activation

```python
Z2 = A1.dot(W2) + b2
```

This computes:


$$
Z_2 = A_1 W_2 + b_2
$$


Shape check:

- $A_1: (m, 2)$
- $W_2: (2, 1)$
- $b_2: (1, 1)$
- $Z_2: (m, 1)$

For one example:


$$
z_2^{(i)} = a_{1,1}^{(i)} w_{2,1} + a_{1,2}^{(i)} w_{2,2} + b_2
$$


So the output neuron combines the two hidden activations into one scalar.

### 9.4 Output activation

```python
A2 = sigmoid(Z2)
```

This applies sigmoid elementwise:


$$
A_2 = \sigma(Z_2)
$$



$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$


For one example:


$$
a_2^{(i)} = \frac{1}{1 + e^{-z_2^{(i)}}}
$$


Interpretation:

- $a_2^{(i)}$ is a probability between 0 and 1
- it estimates $P(y=1 \mid x^{(i)})$

Shape:


$$
A_2 \in \mathbb{R}^{m \times 1}
$$


## 10. Compute and Store the Loss

```python
loss_history.append(compute_binary_cross_entropy(y, A2))
```

This evaluates:


$$
L = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)}\log(a_2^{(i)}+\epsilon)+(1-y^{(i)})\log(1-a_2^{(i)}+\epsilon)\right]
$$


and stores the scalar result.

Why store it:

- to see whether training is improving
- to plot the loss curve later

## 11. Backpropagation at the Output Layer

Backpropagation computes how the loss changes with respect to every parameter.

The starting point is the derivative with respect to $Z_2$.

### 11.1 Output-layer error

```python
dZ2 = A2 - y
```

This is:


$$
dZ_2 = \frac{\partial L}{\partial Z_2}
$$


and for sigmoid output with binary cross-entropy loss it simplifies to:


$$
\frac{\partial L}{\partial Z_2} = A_2 - y
$$


Why this is true:


$$
\frac{\partial L}{\partial Z_2}
=
\frac{\partial L}{\partial A_2}
\cdot
\frac{\partial A_2}{\partial Z_2}
$$


For binary cross-entropy:


$$
\frac{\partial L}{\partial A_2}
=
-\frac{y}{A_2} + \frac{1-y}{1-A_2}
$$


For sigmoid:


$$
\frac{\partial A_2}{\partial Z_2} = A_2(1-A_2)
$$


Multiply them:


$$
\left(-\frac{y}{A_2} + \frac{1-y}{1-A_2}\right) A_2(1-A_2)
=
-y(1-A_2) + (1-y)A_2
=
A_2 - y
$$


So the code can use the compact result:


$$
dZ_2 = A_2 - y
$$


Shape:


$$
dZ_2 \in \mathbb{R}^{m \times 1}
$$


Interpretation:

- if prediction is too high compared to the true label, the error is positive
- if prediction is too low, the error is negative

### 11.2 Gradient with respect to `W2`

```python
dW2 = (A1.T.dot(dZ2)) / len(y)
```

This is:


$$
dW_2 = \frac{\partial L}{\partial W_2} = \frac{1}{m} A_1^T dZ_2
$$


Why:

For one example,


$$
z_2^{(i)} = a_{1,1}^{(i)} w_{2,1} + a_{1,2}^{(i)} w_{2,2} + b_2
$$


Take one output weight, say $w_{2,1}$. By the chain rule:


$$
\frac{\partial L^{(i)}}{\partial w_{2,1}}
=
\frac{\partial L^{(i)}}{\partial z_2^{(i)}}
\cdot
\frac{\partial z_2^{(i)}}{\partial w_{2,1}}
$$


The first factor is:


$$
\frac{\partial L^{(i)}}{\partial z_2^{(i)}} = dZ_2^{(i)}
$$


The second factor is:


$$
\frac{\partial z_2^{(i)}}{\partial w_{2,1}} = a_{1,1}^{(i)}
$$


So:


$$
\frac{\partial L^{(i)}}{\partial w_{2,1}} = a_{1,1}^{(i)} dZ_2^{(i)}
$$


Likewise:


$$
\frac{\partial L^{(i)}}{\partial w_{2,2}} = a_{1,2}^{(i)} dZ_2^{(i)}
$$


For all examples averaged together:


$$
dW_2
=
\frac{1}{m}
\sum_{i=1}^{m}
\begin{bmatrix}
a_{1,1}^{(i)} dZ_2^{(i)} \\
a_{1,2}^{(i)} dZ_2^{(i)}
\end{bmatrix}
=
\frac{1}{m} A_1^T dZ_2
$$


Shape check:

- $A_1^T: (2, m)$
- $dZ_2: (m, 1)$
- $dW_2: (2, 1)$

which matches the shape of $W_2$.

### 11.3 Gradient with respect to `b2`

```python
db2 = np.mean(dZ2, axis=0, keepdims=True)
```

This is:


$$
db_2 = \frac{\partial L}{\partial b_2}
=
\frac{1}{m} \sum_{i=1}^{m} dZ_2^{(i)}
$$


Why:

For one example,


$$
z_2^{(i)} = a_1^{(i)} W_2 + b_2
$$


so:


$$
\frac{\partial z_2^{(i)}}{\partial b_2} = 1
$$


Therefore:


$$
\frac{\partial L^{(i)}}{\partial b_2}
=
\frac{\partial L^{(i)}}{\partial z_2^{(i)}} \cdot 1
=
dZ_2^{(i)}
$$


Averaging over the batch gives:


$$
db_2 = \frac{1}{m} \sum_{i=1}^{m} dZ_2^{(i)}
$$


## 12. Push the Error Back into the Hidden Layer

Now the code computes how the loss changes with respect to the hidden activations.

### 12.1 Gradient with respect to `A1`

```python
dA1 = dZ2.dot(W2.T)
```

This is:


$$
dA_1 = \frac{\partial L}{\partial A_1} = dZ_2 W_2^T
$$


Why:

Recall:


$$
Z_2 = A_1 W_2 + b_2
$$


For one example:


$$
z_2^{(i)} = a_{1,1}^{(i)} w_{2,1} + a_{1,2}^{(i)} w_{2,2} + b_2
$$


Take derivative with respect to the hidden activations:


$$
\frac{\partial z_2^{(i)}}{\partial a_{1,1}^{(i)}} = w_{2,1}
$$



$$
\frac{\partial z_2^{(i)}}{\partial a_{1,2}^{(i)}} = w_{2,2}
$$


By the chain rule:


$$
\frac{\partial L^{(i)}}{\partial a_{1,1}^{(i)}}
=
\frac{\partial L^{(i)}}{\partial z_2^{(i)}} \cdot w_{2,1}
=
dZ_2^{(i)} w_{2,1}
$$



$$
\frac{\partial L^{(i)}}{\partial a_{1,2}^{(i)}}
=
\frac{\partial L^{(i)}}{\partial z_2^{(i)}} \cdot w_{2,2}
=
dZ_2^{(i)} w_{2,2}
$$


Vectorizing over the full batch gives:


$$
dA_1 = dZ_2 W_2^T
$$


Shape check:

- $dZ_2: (m, 1)$
- $W_2^T: (1, 2)$
- $dA_1: (m, 2)$

### 12.2 Gradient through ReLU

```python
dZ1 = dA1 * relu_derivative(Z1)
```

This is:


$$
dZ_1 = \frac{\partial L}{\partial Z_1}
=
\frac{\partial L}{\partial A_1}
\odot
\frac{\partial A_1}{\partial Z_1}
$$


Here $\odot$ means elementwise multiplication.

Since:


$$
A_1 = \mathrm{ReLU}(Z_1)
$$


the derivative of ReLU is:


$$
\mathrm{ReLU}'(z) =
\begin{cases}
1, & z > 0 \\
0, & z \le 0
\end{cases}
$$


So:


$$
dZ_1 = dA_1 \odot \mathrm{ReLU}'(Z_1)
$$


Interpretation:

- if a hidden neuron was active, its gradient flows backward
- if its pre-activation was non-positive, ReLU blocks the gradient there

This is why inactive ReLU units can stop learning on a given example.

## 13. Gradients for the First Layer

### 13.1 Gradient with respect to `W1`

```python
dW1 = (X.T.dot(dZ1)) / len(y)
```

This is:


$$
dW_1 = \frac{\partial L}{\partial W_1} = \frac{1}{m} X^T dZ_1
$$


Why:

Recall:


$$
Z_1 = X W_1 + b_1
$$


For one example and one hidden neuron:


$$
z_{1,j}^{(i)} = x_1^{(i)} w_{1,1j} + x_2^{(i)} w_{1,2j} + b_{1,j}
$$


Take one weight, say $w_{1,1j}$. Then:


$$
\frac{\partial z_{1,j}^{(i)}}{\partial w_{1,1j}} = x_1^{(i)}
$$


By the chain rule:


$$
\frac{\partial L^{(i)}}{\partial w_{1,1j}}
=
\frac{\partial L^{(i)}}{\partial z_{1,j}^{(i)}}
\cdot
\frac{\partial z_{1,j}^{(i)}}{\partial w_{1,1j}}
=
dZ_{1,j}^{(i)} x_1^{(i)}
$$


Likewise for the second input feature:


$$
\frac{\partial L^{(i)}}{\partial w_{1,2j}}
=
dZ_{1,j}^{(i)} x_2^{(i)}
$$


Collecting these gradients over all examples and averaging gives:


$$
dW_1 = \frac{1}{m} X^T dZ_1
$$


Shape check:

- $X^T: (2, m)$
- $dZ_1: (m, 2)$
- $dW_1: (2, 2)$

which matches $W_1$.

### 13.2 Gradient with respect to `b1`

```python
db1 = np.mean(dZ1, axis=0, keepdims=True)
```

This is:


$$
db_1 = \frac{\partial L}{\partial b_1}
=
\frac{1}{m} \sum_{i=1}^{m} dZ_1^{(i)}
$$


More explicitly, each hidden bias gets the average of the hidden-layer error for that neuron across all examples:


$$
\frac{\partial L}{\partial b_{1,j}}
=
\frac{1}{m} \sum_{i=1}^{m} dZ_{1,j}^{(i)}
$$


Why:


$$
z_{1,j}^{(i)} = \cdots + b_{1,j}
$$


so:


$$
\frac{\partial z_{1,j}^{(i)}}{\partial b_{1,j}} = 1
$$


and therefore the bias gradient is just the average hidden pre-activation gradient.

## 14. Bundle the Gradients

```python
grads = [dW1, db1, dW2, db2]
```

This packages the gradients in the same order as `params`.

So the matching is:

- `params[0] = W1` and `grads[0] = dW1`
- `params[1] = b1` and `grads[1] = db1`
- `params[2] = W2` and `grads[2] = dW2`
- `params[3] = b2` and `grads[3] = db2`

This is purely organizational, but it is what makes the Adam update loop possible.

## 15. Adam Update Loop

```python
for i in range(len(params)):
```

Since `params = [W1, b1, W2, b2]`, `len(params) = 4`.

So this loop means:

- update `W1`
- update `b1`
- update `W2`
- update `b2`

one after another using the same Adam formulas.

### 15.1 Update the first moment

```python
m_params[i] = beta1 * m_params[i] + (1 - beta1) * grads[i]
```

Mathematically:


$$
m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t
$$


where:

- $g_t$ is the current gradient
- $m_t$ is the exponentially weighted moving average of gradients

Interpretation:

- this smooths the gradient over time
- it acts somewhat like momentum

### 15.2 Update the second moment

```python
v_params[i] = beta2 * v_params[i] + (1 - beta2) * (grads[i] ** 2)
```

Mathematically:


$$
v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2
$$


where $g_t^2$ is elementwise squaring.

Interpretation:

- this tracks the typical size of recent gradients
- parameters with consistently large gradients get larger $v_t$
- that later causes their effective step size to shrink

### 15.3 Bias correction for the first moment

```python
m_hat = m_params[i] / (1 - beta1 ** t)
```

Mathematically:


$$
\hat{m}_t = \frac{m_t}{1-\beta_1^t}
$$


Why:

- `m_params[i]` started at zero
- early in training, this makes the moving average biased toward zero
- bias correction removes that startup effect

### 15.4 Bias correction for the second moment

```python
v_hat = v_params[i] / (1 - beta2 ** t)
```

Mathematically:


$$
\hat{v}_t = \frac{v_t}{1-\beta_2^t}
$$


This corrects the same zero-initialization bias for the second moment estimate.

### 15.5 Parameter update

```python
params[i] -= eta * m_hat / (np.sqrt(v_hat) + eps)
```

Mathematically:


$$
\theta_t = \theta_{t-1} - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
$$


This is the Adam update rule.

What each part does:

- $\eta$: overall learning rate
- $\hat{m}_t$: preferred update direction
- $\sqrt{\hat{v}_t}$: rescales by recent gradient magnitude
- $\epsilon$: prevents division by zero

Interpretation:

- if a parameter has large recent squared gradients, Adam reduces its step
- if a parameter has smaller recent squared gradients, Adam allows a relatively larger step

So Adam is adaptive: different parameters can effectively use different step sizes.

## 16. Unpack the Updated Parameters

```python
W1, b1, W2, b2 = params
```

This does not change the math. It just copies the updated arrays back into the named variables so the next epoch uses the newest weights and biases.

## 17. Final Forward Pass After Training

After the training loop ends, the function runs one more forward pass:

```python
Z1 = X.dot(W1) + b1
A1 = relu(Z1)
Z2 = A1.dot(W2) + b2
A2 = sigmoid(Z2)
```

This is the same forward-pass math as before:


$$
Z_1 = XW_1 + b_1
$$



$$
A_1 = \mathrm{ReLU}(Z_1)
$$



$$
Z_2 = A_1W_2 + b_2
$$



$$
A_2 = \sigma(Z_2)
$$


The reason for doing it again is that after the last Adam update, the code wants predictions from the final trained parameters.

## 18. Convert Probabilities to Class Predictions

```python
predicted_classes = (A2 >= 0.5).astype(int)
```

This applies the standard binary classification threshold:


$$
\hat{y}^{(i)} =
\begin{cases}
1, & a_2^{(i)} \ge 0.5 \\
0, & a_2^{(i)} < 0.5
\end{cases}
$$


So:

- output probability at least 0.5 means class 1
- otherwise class 0

## 19. Compute Accuracy

```python
accuracy = np.mean(predicted_classes == y)
```

This computes:


$$
\text{accuracy} = \frac{1}{m} \sum_{i=1}^{m} \mathbf{1}\{\hat{y}^{(i)} = y^{(i)}\}
$$


where $\mathbf{1}\{\cdot\}$ is 1 when the statement is true and 0 otherwise.

So accuracy is the fraction of examples classified correctly.

## 20. Return Values

```python
return loss_history, accuracy
```

The function returns:

- `loss_history`: the loss value at every epoch
- `accuracy`: the final training accuracy after the last epoch

This lets the notebook:

- plot how the loss changed during training
- compare different random initializations

## 21. The Full Training Story in One Flow

Here is the entire function in mathematical order.

### Step 1: Initialize parameters


$$
W_1, W_2 \text{ random}, \quad b_1 = 0, \quad b_2 = 0
$$


### Step 2: Repeat for each epoch

Forward pass:


$$
Z_1 = XW_1 + b_1
$$



$$
A_1 = \mathrm{ReLU}(Z_1)
$$



$$
Z_2 = A_1W_2 + b_2
$$



$$
A_2 = \sigma(Z_2)
$$


Loss:


$$
L = -\frac{1}{m}\sum_{i=1}^{m} \left[y^{(i)} \log(a_2^{(i)}+\epsilon) + (1-y^{(i)}) \log(1-a_2^{(i)}+\epsilon)\right]
$$


Backward pass:


$$
dZ_2 = A_2 - y
$$



$$
dW_2 = \frac{1}{m} A_1^T dZ_2
$$



$$
db_2 = \frac{1}{m}\sum_{i=1}^{m} dZ_2^{(i)}
$$



$$
dA_1 = dZ_2 W_2^T
$$



$$
dZ_1 = dA_1 \odot \mathrm{ReLU}'(Z_1)
$$



$$
dW_1 = \frac{1}{m} X^T dZ_1
$$



$$
db_1 = \frac{1}{m}\sum_{i=1}^{m} dZ_1^{(i)}
$$


Adam update for each parameter block:


$$
m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t
$$



$$
v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2
$$



$$
\hat{m}_t = \frac{m_t}{1-\beta_1^t}
$$



$$
\hat{v}_t = \frac{v_t}{1-\beta_2^t}
$$



$$
\theta_t = \theta_{t-1} - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
$$


### Step 3: Final prediction and evaluation


$$
\hat{y} = \mathbf{1}\{A_2 \ge 0.5\}
$$



$$
\text{accuracy} = \frac{\text{number of correct predictions}}{m}
$$


## 22. Why This Whole Procedure Works

The function is implementing gradient-based learning.

At each epoch:

1. the current weights produce predictions
2. the loss measures how wrong those predictions are
3. backpropagation computes the derivative of that loss with respect to every parameter
4. Adam uses those derivatives to update the parameters in a direction that should reduce the loss

So the entire function is one repeated optimization loop:


$$
\text{predict} \rightarrow \text{measure error} \rightarrow \text{differentiate} \rightarrow \text{update}
$$


That is the core of neural network training.
