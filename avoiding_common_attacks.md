**Avoiding Common Attacks**

**Re-entracy Attacks**

All logic is done before transferring ether to protect against re-entrancy.

External calls sit behind a voting mechanism in the multi-signature 'GoodBoard' contract.

All transfers are pull rather than push.


**Transaction Ordering and Timestamp Dependence**

Timestamps are not used.

**Integer Overflow and Underflow**

SafeMath is used in situations of risk.

**Denial of Service**

Do not rely on outside services other than Metamask which can sometimes cause friction with gas limit estimation but that is fixable.

**Denial of Service by Block Gas Limit (or startGas)**

My contract SuperGood is huge. There is a good chance it is susceptible to this, it also barely squeaks around EIP-170 (https://github.com/ethereum/EIPs/issues/170). I will look into overcoming it in the future.

**Force Sending Ether**

Some parts ofSuperGood do use this.balance. However the parts that do are inherited from Open Source and Audited code from Open Zeppelin. While this does not eliminate the risk it lessens it.