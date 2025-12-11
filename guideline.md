这是一个GRE的备考系统，针对Verbal Reasoning的篇章阅读部分做一个测试

测试的流程如下：
    用户开始测试
    从后端挑选一个passage以及它对应的若干问题返回给前端
    用户做测试题
    提交后进行analyse环节
    做错的题目要传给llm，有一个mistake analyse prompt来分析用户的问题，并给出coach hints
    用户对错题进行重做（在每道错题的coach hints旁边有一个retry按钮，点击后可以重新选择）
    如果第二次还是错了，当下直接传入mistake analyse prompt来分析，同样给出coach hints
    用户不能进行第二次重做，但可以查看正确答案（点击按钮后查看）
    重做模式结束之后，将本次测试的数据传入summarise prompt，给出一个对测试的反馈

