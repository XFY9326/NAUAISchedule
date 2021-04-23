function scheduleHtmlParser(html) {
    // html -> 传入的课程表tbody字符串

    // NAU上课时间固定  来源：http://jwc.nau.edu.cn/coursearrangeInfosearch.aspx
    const NAUBasicSectionTimes = [
        {
            "section": 1,
            "startTime": "08:30",
            "endTime": "09:10"
        },
        {
            "section": 2,
            "startTime": "09:20",
            "endTime": "10:00"
        },
        {
            "section": 3,
            "startTime": "10:20",
            "endTime": "11:00"
        },
        {
            "section": 4,
            "startTime": "11:10",
            "endTime": "11:50"
        },
        {
            "section": 5,
            "startTime": "12:00",
            "endTime": "12:40"
        },
        {
            "section": 6,
            "startTime": "13:30",
            "endTime": "14:10"
        },
        {
            "section": 7,
            "startTime": "14:20",
            "endTime": "15:00"
        },
        {
            "section": 8,
            "startTime": "15:20",
            "endTime": "16:00"
        },
        {
            "section": 9,
            "startTime": "16:10",
            "endTime": "16:50"
        },
        {
            "section": 10,
            "startTime": "17:00",
            "endTime": "17:40"
        },
        {
            "section": 11,
            "startTime": "18:30",
            "endTime": "19:10"
        },
        {
            "section": 12,
            "startTime": "19:20",
            "endTime": "20:00"
        },
        {
            "section": 13,
            "startTime": "20:10",
            "endTime": "20:50"
        }
    ];

    // HTML字符串转DOM
    let dom = $.parseHTML(html);
    let CourseInfos = [];

    // 星期与课程时间的正则
    let weekDayCourseSectionReg = /(\d+)\D*(\d+)-(\d+)/;
    // 按课程处理
    let trTags = $(dom).children("tr[align='center']");

    for (let i = 0; i < trTags.length; i++) {
        let values = $(trTags[i]).children();
        // 课程名称
        let courseName = $(values[2]).text();
        // 任课教师
        let courseTeacher = $(values[7]).text();

        // 课程时间
        let courseTimes = $(values[8]).text().split("\n");
        // 去除课程时间中的空值
        for (let j = 0; j < courseTimes.length; j++) {
            courseTimes[j] = courseTimes[j].trim();
            if (courseTimes[j] === "") {
                courseTimes.splice(j, 1);
                j -= 1;
            }
        }

        // 判断课程时间是否存在
        if (courseTimes.length < 2) {
            throw Error("Course Time Error!");
        }

        // 处理课程时间（注意本学期课程与下学期课程的处理兼容性）
        for (let j = 0; j < courseTimes.length; j += 2) {
            let position = courseTimes[j].split("：")[1];
            let timeStr = courseTimes[j + 1].split("：")[1];

            let weekStrEnd = timeStr.indexOf("周") + 1;

            // 周数模式（0: 任意周  1: 单周  2: 双周）
            let weekMode = 0;
            let weekNumStr = null;
            // 处理不同的周数显示格式
            let weeksStr = timeStr.substring(0, weekStrEnd).trim();
            if (weeksStr.startsWith("第")) {
                weekNumStr = weeksStr.substring(1, weeksStr.length - 1).trim();
            } else if (weeksStr.indexOf("之") !== -1) {
                weekNumStr = weeksStr.substring(0, weeksStr.indexOf("之")).trim();
                if (weeksStr.indexOf("单") !== -1) {
                    weekMode = 1;
                } else if (weeksStr.indexOf("双") !== -1) {
                    weekMode = 2;
                }
            } else {
                weekNumStr = weeksStr.substring(0, weeksStr.length - 1).trim();
            }

            if (weekNumStr == null) {
                throw Error("Week Num Error!");
            }

            // 处理周数
            let weeks = [];
            let weekNumStrArr = [];
            if (weekNumStr.indexOf(",") !== -1) {
                weekNumStrArr = weekNumStr.split(",");
            } else {
                weekNumStrArr.push(weekNumStr);
            }
            for (let k = 0; k < weekNumStrArr.length; k++) {
                weekNumStrArr[k] = weekNumStrArr[k].trim();
                if (weekNumStrArr[k].indexOf("-") !== -1) {
                    let weekNumArr = weekNumStrArr[k].split("-");
                    for (let l = parseInt(weekNumArr[0]); l <= parseInt(weekNumArr[1]); l++) {
                        if (weekMode === 0) {
                            weeks.push(l);
                        } else if (weekMode === 1 && l % 2 !== 0) {
                            weeks.push(l);
                        } else if (weekMode === 2 && l % 2 === 0) {
                            weeks.push(l);
                        }
                    }
                } else {
                    weeks.push(parseInt(weekNumStrArr[k]));
                }
            }

            // 处理星期数与课程时间
            let weekDayCourseSectionStr = timeStr.substring(weekStrEnd).trim();
            let groups = weekDayCourseSectionStr.match(weekDayCourseSectionReg);

            let weekDay = parseInt(groups[1]);

            let sections = [];
            for (let k = parseInt(groups[2]); k <= parseInt(groups[3]); k++) {
                sections.push({
                    "section": k
                });
            }

            CourseInfos.push({
                "name": courseName,
                "position": position,
                "teacher": courseTeacher,
                "weeks": weeks,
                "day": weekDay,
                "sections": sections
            });
        }
    }

    return {
        "courseInfos": CourseInfos,
        "sectionTimes": NAUBasicSectionTimes
    };
}