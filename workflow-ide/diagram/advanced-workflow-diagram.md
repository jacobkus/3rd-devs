flowchart TD
    __start__["__start__"]
    __end__["__end__"]
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