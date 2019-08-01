**Design Patterns Decisions**

**Inheritance**

In SuperGood I inherited several open source contracts including:

1. Ownable (OpenZeppelin)
2. SafeMath (OpenZeppelin)
3. Pausable (OpenZeppelin)
4. Factory (Gnosis)
5. PaymentSplitter(OpenZeppelin)
6. MultiSigWallet (removed) (Gnosis)

This inheritance helps me have to write less code and use tested and audited code to lend SuperGood credibility as potentially safer. The code however was also not up to 0.5.0 pragma and had to be edited. 

**Bytecode Size**

Near the end of the project I had to reduce the size of the contract. To do this I tried:
1. Auditing the contract by checking if replacing public for external or internal was suitable -- these changes showed large savings.
2. Removing getters that fetched arrays in favour of getters that fetched array length
3. Because changing the struct object in MultiSigWallet required overriding many functions, I chose to not inherit it and build a hybrid contract between my overrides and base class.
4. Reducing the use of some modifiers

Some notes on the above
1. Changing seemingly internal/external functions from public out of MultiSigWallet resulted in strange problems. In one instance the contract transacted properly in all but the transfer of the struct object to storage which it neglected.
2. Doing this means more requests to the blockchain -- not ideal.
3. This only had marginal savings.
4. Many of the modifiers were in the inherited contracts, and so I did not want to alter them.

**Circuit Braker**

I only used the circuit breaker pattern once to pause the donations to the portfolios if necessary. I figured it could help distinguish active ones in the front end. 

**Additional Service**

I did not see much use for a 3rd party service in the core functionality of SuperGood. For other projects I have used Provable HWRNG. Maybe IPFS could be used along with the future SuperGood manual 'Verifier' contract to add profile pictures for verified parties. 

**Factory**

1. Putting the Portfolio Factory inside of the MultiSigWallet (My contract GoodBoard)
 - This is expensive and not advised, I need to revisit the usefulness of integrating it as top priority

**Other** 
1. Fail early and fail loud
    - modifiers are featured heavily in inherited contracts using require to 'fail early'

2. Restricting Access
   - very little of the contract code is available to the general public

3. Auto Deprecation
   - will consider for future

4. Mortal
    - I typically use circuit breaker over selfdestruct
 
5. Withdrawal pattern
    - I try to always use this pattern, and only used withdrawal for SuperGood

6. State Machine
    - MultiSigWallet transactions behave this way, I need more understanding of when it is most useful

7. Speed Bumps
    - Very cool idea... did not use it though. 

