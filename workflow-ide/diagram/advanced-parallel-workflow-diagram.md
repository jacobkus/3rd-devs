flowchart TD
    __start__["\_\___start__\_\_"]
    __end__["\_\___end__\_\_"]
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