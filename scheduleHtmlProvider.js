function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    try{
        // 获取内部Frame
        let innerFrame = dom.getElementById("FrameContent");
        let frameSrc = innerFrame.getAttribute('src');
        // 判断当前内部Frame是否是课程表页面
        if (frameSrc === "MyCourseScheduleTable.aspx" || frameSrc === "MyCourseScheduleTableNext.aspx") {
            // 获取课程表Table
            return innerFrame.contentDocument.getElementById("content").innerHTML;
        }
    } catch(err) {
        throw Error("Error ScheduleTable Page!");
    }
}