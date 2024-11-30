flowchart TD
    __start__["\_\___start__\_\_"]
    __end__["\_\___end__\_\_"]
    node1["node1"]
    node2["node2"]
    node3["node3"]
    __start__ --> node1
    node1 -->|decideMood| node2
    node1 -->|decideMood| node3
    node2 --> __end__
    node3 --> __end__