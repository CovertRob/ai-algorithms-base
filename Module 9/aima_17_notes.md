# Additional Notes from AIMA Chapter 17

- For a given policy $\pi$, the Bellman equation gives a recursive set of constraints that the value funtion for that policy must satisfy
- for the optimal policy, the Bellman optimality equation gives the recursive constaints that the optimal value function must satisfy

## Bellman expectation equation
For a fixed policy $\pi$,
$$V^\pi(s)=\sum_a \pi(a\mid s)\sum_{s'} P(s'\mid s,a)\left[R(s,a,s')+\gamma V^\pi(s')\right]$$
This means that if I commit to policy $\pi$, then the value of each state must be consistent with following that policy now and in the future.
This is a recursive constraint for **policy evaluation**, not necessarily optimality.
## Bellman optimality equation
For the optimal value function,
$$V^*(s)=\max_a \sum_a \sum_{s'} P(s' \mid s,a)\left[R(s,a,s')+\gamma V^*(s')\right]$$
This means the optimal value at a state must equal the value of the best possible action, assuming optimal behavior continues afterward.
This is the recursive constraint tied to **optimality**.

## Value iteration
- In Bellman Optimality equation, max is not linear -- doesn't abide by additivity. In Bellman Expectation it is linear
- Iterating the expectation equation just gives you value for a fixed policy, must use argmax in optimality to find the optimal policy
- V function is value only, Q function is state plus action

The $Q$ function is the value of taking a particular action in a particular state.
While $V(s)$ asks "How good is state $s$ overall?", $Q(s,a)$ asks "How good is it to take action $a$ in state $s$?"
Formally, $Q^\pi(s,a)$ is the expected total discounted reward if you start in state $s$, take action $a$ now, and then follow policy $\pi$ afterward.
The connection is:
$$V^\pi(s)=\sum_a \pi(a\mid s)Q^\pi(s,a)$$
For a deterministic policy:
$$V^\pi(s)=Q^\pi(s,\pi(s))$$
For the optimal case:
$$V^*(s)=\max_a Q^*(s,a)$$
and
$$\pi^*(s)=\arg\max_a Q^*(s,a)$$
So $V^*(s)$ tells you the best value of the state, and $Q^*(s,a)$ tells you which action gives that value.
The Bellman optimality equation for $Q$ is:
$$Q^*(s,a)=\sum_{s'} P(s'\mid s,a)\left[R(s,a,s')+\gamma \max_{a'} Q^*(s',a')\right]$$
This says the value of taking action $a$ in state $s$ equals the immediate reward plus the discounted value of the best next action from the next state.

- The values are iterated at each individual state - since each state depends on neighbor values based on the discount, the values propagate as neighbors also get updated