flowchart TD
    __start__["__start__"]
    __end__["__end__"]
    processAudio["processAudio"]
    processRetrieval["processRetrieval"]
    rerank["rerank"]
    processSearch["processSearch"]
    removeLinks["removeLinks"]
    buildContext["buildContext"]
    query["query"]
    answer["answer"]
    __start__ ==>|parallel| processAudio
    __start__ ==>|parallel| processRetrieval
    __start__ ==>|parallel| processSearch
    processAudio --> buildContext
    processRetrieval --> rerank
    rerank -->|shouldQueryOrRecall| query
    rerank -->|shouldQueryOrRecall| processRetrieval
    rerank -->|shouldQueryOrRecall| buildContext
    query --> buildContext
    processSearch --> removeLinks
    removeLinks --> buildContext
    buildContext --> answer
    answer --> __end__