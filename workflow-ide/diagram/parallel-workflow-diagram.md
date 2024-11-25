flowchart TD
    __start__["__start__"]
    __end__["__end__"]
    processAudio["processAudio"]
    processRetrieval["processRetrieval"]
    rerank["rerank"]
    processSearch["processSearch"]
    removeLinks["removeLinks"]
    buildContext["buildContext"]
    answer["answer"]
    __start__ ==>|parallel| processAudio
    __start__ ==>|parallel| processRetrieval
    __start__ ==>|parallel| processSearch
    processAudio --> buildContext
    processRetrieval --> rerank
    rerank --> buildContext
    processSearch --> removeLinks
    removeLinks --> buildContext
    buildContext --> answer
    answer --> __end__