# Vectorized Backpropagation for Q3 Part C

This note explains how the backpropagation code in Part C works in matrix/vector form, and how each line of code corresponds to the underlying math.

The network in Part C is:

- Input layer: 2 features
- Hidden layer: 2 neurons with ReLU
- Output layer: 1 neuron with sigmoid

In code, the main forward pass is:

```python
Z1 = X.dot(W1) + b1
A1 = relu(Z1)
Z2 = A1.dot(W2) + b2
A2 = sigmoid(Z2)
```

The backpropagation block is:

```python
dZ2 = A2 - y
dW2 = (A1.T.dot(dZ2)) / len(y)
db2 = np.mean(dZ2, axis=0, keepdims=True)

dA1 = dZ2.dot(W2.T)
dZ1 = dA1 * relu_derivative(Z1)
dW1 = (X.T.dot(dZ1)) / len(y)
db1 = np.mean(dZ1, axis=0, keepdims=True)
```

## 1. Notation

Let:

- $m$ = number of training examples
- $X \in \mathbb{R}^{m \times 2}$ = input matrix
- $W_1 \in \mathbb{R}^{2 \times 2}$ = weights from input to hidden layer
- $b_1 \in \mathbb{R}^{1 \times 2}$ = hidden-layer bias
- $W_2 \in \mathbb{R}^{2 \times 1}$ = weights from hidden to output layer
- $b_2 \in \mathbb{R}^{1 \times 1}$ = output bias

Forward-pass quantities:

- $Z_1 = XW_1 + b_1$
- $A_1 = \text{ReLU}(Z_1)$
- $Z_2 = A_1W_2 + b_2$
- $A_2 = \sigma(Z_2)$

where:

- $\text{ReLU}(z) = \max(0, z)$
- $\sigma(z) = \frac{1}{1 + e^{-z}}$

The labels are:

- $y \in \mathbb{R}^{m \times 1}$

The binary cross-entropy loss over the full batch is:

$$
L = -\frac{1}{m}\sum_{i=1}^{m} \left(y^{(i)} \log A_2^{(i)} + (1-y^{(i)}) \log (1-A_2^{(i)})\right)
$$

## 2. Forward Pass in Math and Shapes

### Step 1: Input to hidden layer

$$
Z_1 = XW_1 + b_1
$$

Shape check:

- $X: (m, 2)$
- $W_1: (2, 2)$
- $b_1: (1, 2)$
- $Z_1: (m, 2)$

Each row of $Z_1$ contains the pre-activation values for the 2 hidden neurons for one example.

### Step 2: Hidden activation

$$
A_1 = \text{ReLU}(Z_1)
$$

Shape:

- $A_1: (m, 2)$

Each row of $A_1$ contains the 2 hidden activations for one example.

### Step 3: Hidden to output

$$
Z_2 = A_1W_2 + b_2
$$

Shape:

- $A_1: (m, 2)$
- $W_2: (2, 1)$
- $b_2: (1, 1)$
- $Z_2: (m, 1)$

There is 1 output neuron, so each example gets a single scalar pre-activation.

### Step 4: Output activation

$$
A_2 = \sigma(Z_2)
$$

Shape:

- $A_2: (m, 1)$

Each entry is the predicted probability of class 1 for one training example.

## 3. What Backpropagation Is Computing

Backpropagation computes the gradient of the loss with respect to every trainable parameter:

$$
\frac{\partial L}{\partial W_2}, \quad
\frac{\partial L}{\partial b_2}, \quad
\frac{\partial L}{\partial W_1}, \quad
\frac{\partial L}{\partial b_1}
$$

These gradients tell us how changing each parameter would change the loss.

The optimizer then uses those gradients to update the parameters.

## 4. Output Layer Backpropagation

### 4.1 Compute the output-layer error

Code:

```python
dZ2 = A2 - y
```

Math:

$$
dZ_2 = \frac{\partial L}{\partial Z_2}
$$

For sigmoid output with binary cross-entropy loss, this simplifies to:

$$
\frac{\partial L}{\partial Z_2} = A_2 - y
$$

This is why the code can use:

$$
dZ_2 = A_2 - y
$$

Shape:

- $dZ_2: (m, 1)$

Interpretation:

- If prediction is too high, the error is positive.
- If prediction is too low, the error is negative.

### 4.2 Gradient with respect to $W_2$

Code:

```python
dW2 = (A1.T.dot(dZ2)) / len(y)
```

Math:

$$
dW_2 = \frac{\partial L}{\partial W_2}
= \frac{1}{m} A_1^T dZ_2
$$

Shape check:

- $A_1^T: (2, m)$
- $dZ_2: (m, 1)$
- $dW_2: (2, 1)$

This matches the shape of $W_2$.

### Why this is the gradient

For one example, the output pre-activation is:

$$
z_2 = a_1^T w_2 + b_2
$$

If:

$$
a_1 =
\begin{bmatrix}
a_{1,1} \\
a_{1,2}
\end{bmatrix},
\quad
w_2 =
\begin{bmatrix}
w_{2,1} \\
w_{2,2}
\end{bmatrix}
$$

then:

$$
z_2 = a_{1,1} w_{2,1} + a_{1,2} w_{2,2} + b_2
$$

By the chain rule, for one weight:

$$
\frac{\partial L}{\partial w_{2,j}}
=
\frac{\partial L}{\partial z_2}
\frac{\partial z_2}{\partial w_{2,j}}
=
d z_2 \cdot a_{1,j}
$$

So each output weight gradient is:

- hidden activation times output error

Stacked across the full batch and averaged:

$$
dW_2 = \frac{1}{m} A_1^T dZ_2
$$

This is exactly what the code computes.

### 4.3 Gradient with respect to $b_2$

Code:

```python
db2 = np.mean(dZ2, axis=0, keepdims=True)
```

Math:

$$
db_2 = \frac{\partial L}{\partial b_2}
= \frac{1}{m} \sum_{i=1}^{m} dZ_2^{(i)}
$$

Because the bias is added to every example, its gradient is the average output-layer error.

Shape:

- $db_2: (1, 1)$

## 5. Push the Error Back to the Hidden Layer

### 5.1 Gradient with respect to $A_1$

Code:

```python
dA1 = dZ2.dot(W2.T)
```

Math:

$$
dA_1 = \frac{\partial L}{\partial A_1}
= dZ_2 W_2^T
$$

Shape check:

- $dZ_2: (m, 1)$
- $W_2^T: (1, 2)$
- $dA_1: (m, 2)$

Interpretation:

This distributes the output-layer error back across the 2 hidden neurons according to the output weights.

## 6. Pass Through the ReLU Nonlinearity

### 6.1 Gradient with respect to $Z_1$

Code:

```python
dZ1 = dA1 * relu_derivative(Z1)
```

Math:

$$
dZ_1 = \frac{\partial L}{\partial Z_1}
= dA_1 \odot \text{ReLU}'(Z_1)
$$

where $\odot$ means elementwise multiplication.

For ReLU:

$$
\text{ReLU}'(z) =
\begin{cases}
1 & \text{if } z > 0 \\
0 & \text{if } z \le 0
\end{cases}
$$

So:

- if a hidden neuron was active, gradient flows through
- if a hidden neuron was inactive, the gradient becomes 0 there

Shape:

- $dZ_1: (m, 2)$

## 7. Hidden Layer Parameter Gradients

### 7.1 Gradient with respect to $W_1$

Code:

```python
dW1 = (X.T.dot(dZ1)) / len(y)
```

Math:

$$
dW_1 = \frac{\partial L}{\partial W_1}
= \frac{1}{m} X^T dZ_1
$$

Shape check:

- $X^T: (2, m)$
- $dZ_1: (m, 2)$
- $dW_1: (2, 2)$

This matches the shape of $W_1$.

### Why this is the gradient

For one hidden neuron $j$:

$$
z_{1,j} = x_1 w_{1,1j} + x_2 w_{1,2j} + b_{1,j}
$$

By the chain rule:

$$
\frac{\partial L}{\partial w_{1,kj}}
=
\frac{\partial L}{\partial z_{1,j}}
\frac{\partial z_{1,j}}{\partial w_{1,kj}}
=
d z_{1,j} \cdot x_k
$$

So each first-layer weight gradient is:

- input value times hidden-layer error

For all examples at once:

$$
dW_1 = \frac{1}{m} X^T dZ_1
$$

### 7.2 Gradient with respect to $b_1$

Code:

```python
db1 = np.mean(dZ1, axis=0, keepdims=True)
```

Math:

$$
db_1 = \frac{\partial L}{\partial b_1}
= \frac{1}{m} \sum_{i=1}^{m} dZ_1^{(i)}
$$

Shape:

- $db_1: (1, 2)$

This matches the shape of $b_1$.

## 8. Why the Transposes Appear

The transposes are not arbitrary. They are there because matrix multiplication must line up dimensions, and because the batch gradient formulas naturally take this form:

$$
dW_2 = \frac{1}{m} A_1^T dZ_2
$$

$$
dW_1 = \frac{1}{m} X^T dZ_1
$$

Interpretation:

- activations or inputs are arranged row-by-row by example
- transposing them turns them into column groups by neuron or feature
- multiplying by the error matrix accumulates the gradient contributions over the whole batch

## 9. Element-by-Element View vs Vectorized View

The code is vectorized, but it represents the same math as doing each example and each weight one at a time.

For example, $dW_2 = \frac{1}{m}A_1^T dZ_2$ is the compact version of:

$$
\frac{\partial L}{\partial w_{2,j}}
=
\frac{1}{m}
\sum_{i=1}^{m}
a_{1,j}^{(i)} d z_2^{(i)}
$$

And $dW_1 = \frac{1}{m}X^T dZ_1$ is the compact version of:

$$
\frac{\partial L}{\partial w_{1,kj}}
=
\frac{1}{m}
\sum_{i=1}^{m}
x_k^{(i)} d z_{1,j}^{(i)}
$$

So the vectorized formulas are not changing the gradient definition. They are just computing all the partial derivatives at once.

## 10. Full Backpropagation Summary

Forward pass:

$$
Z_1 = XW_1 + b_1
$$
$$
A_1 = \text{ReLU}(Z_1)
$$
$$
Z_2 = A_1W_2 + b_2
$$
$$
A_2 = \sigma(Z_2)
$$

Loss:

$$
L = -\frac{1}{m}\sum_{i=1}^{m} \left(y^{(i)} \log A_2^{(i)} + (1-y^{(i)}) \log (1-A_2^{(i)})\right)
$$

Backpropagation:

$$
dZ_2 = A_2 - y
$$
$$
dW_2 = \frac{1}{m} A_1^T dZ_2
$$
$$
db_2 = \frac{1}{m}\sum dZ_2
$$
$$
dA_1 = dZ_2 W_2^T
$$
$$
dZ_1 = dA_1 \odot \text{ReLU}'(Z_1)
$$
$$
dW_1 = \frac{1}{m} X^T dZ_1
$$
$$
db_1 = \frac{1}{m}\sum dZ_1
$$

## 11. Intuition in Plain Language

- The output layer first measures how wrong the predictions are.
- That output error tells us how to adjust $W_2$ and $b_2$.
- Then we pass that error backward through the output weights.
- ReLU decides where hidden-layer gradients are allowed to flow.
- That hidden-layer error tells us how to adjust $W_1$ and $b_1$.

The entire process is the chain rule written in a compact matrix form.

## 12. Mapping to the Part C Code

Code:

```python
dZ2 = A2 - y
```

Math:

$$
\frac{\partial L}{\partial Z_2}
$$

Code:

```python
dW2 = (A1.T.dot(dZ2)) / len(y)
```

Math:

$$
\frac{\partial L}{\partial W_2}
= \frac{1}{m} A_1^T dZ_2
$$

Code:

```python
db2 = np.mean(dZ2, axis=0, keepdims=True)
```

Math:

$$
\frac{\partial L}{\partial b_2}
$$

Code:

```python
dA1 = dZ2.dot(W2.T)
```

Math:

$$
\frac{\partial L}{\partial A_1}
$$

Code:

```python
dZ1 = dA1 * relu_derivative(Z1)
```

Math:

$$
\frac{\partial L}{\partial Z_1}
$$

Code:

```python
dW1 = (X.T.dot(dZ1)) / len(y)
```

Math:

$$
\frac{\partial L}{\partial W_1}
= \frac{1}{m} X^T dZ_1
$$

Code:

```python
db1 = np.mean(dZ1, axis=0, keepdims=True)
```

Math:

$$
\frac{\partial L}{\partial b_1}
$$

This is the full vectorized backpropagation pipeline used by your Part C implementation.
