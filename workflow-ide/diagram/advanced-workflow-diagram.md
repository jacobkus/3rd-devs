flowchart TD
    __start__["\_\___start__\_\_"]
    __end__["\_\___end__\_\_"]
    a["a"]
    b["b"]
    c["c"]
    d["d"]
    e["e"]
    f["f"]
    __start__ --> a
    a -->|firstDecide| b
    a -->|firstDecide| c
    a -->|firstDecide| d
    b --> __end__
    c --> e
    e --> a
    d -->|secondDecide| e
    d -->|secondDecide| f
    f --> __end__