flowchart TD
    __start__["__start__"]
    __end__["__end__"]
    node1["node1"]
    node2["node2"]
    node3["node3"]
    __start__ --> node1
    node1 -->|decideMood| node2
    node1 -->|decideMood| node3
    node2 --> __end__
    node3 --> __end__