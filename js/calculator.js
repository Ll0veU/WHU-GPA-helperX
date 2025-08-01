/**
 * 计算传入课程的总学分数，平均GPA，平均分
 * @param {string[][3]} course_data 包含需要计算的每门课程的[学分，GPA，成绩]的 string 数组
 * @returns 返回一个含三个元素的数组，分别对应总学分数，平均GPA，平均分
 */
function calcGPA(course_data) {
    let totalCredits = 0,
        totalGPA = 0,
        totalScore = 0;
    $(course_data).each(function () {
        let credit = parseFloat(Number($(this)[0]));
        let GPA = parseFloat(Number($(this)[1]));
        let score = parseFloat(Number($(this)[2]));

        if (score) {
            // if not NaN
            totalGPA += GPA * credit;
            totalScore += score * credit;
        }
        totalCredits += credit;
    });

    let GPAMean = 0,
        scoreMean = 0;

    if (totalCredits !== 0) {
        GPAMean = totalGPA / totalCredits;
        scoreMean = totalScore / totalCredits;
    }

    function padIntPart(numStr, int_width = 3) {
        const [intPart, decPart] = numStr.split('.');
        return `${intPart.padStart(int_width, ' ')}.${decPart}`;
    }
    const credit = padIntPart(Number(totalCredits).toFixed(1), 3);
    const gpa = padIntPart(Number(GPAMean).toFixed(3), 1);
    const avgScore = padIntPart(Number(scoreMean).toFixed(3), 3);
    return [credit, gpa, avgScore];
}

/**
 * 计算某学年某学期的总学分数，平均GPA，平均分
 * @param {string} year 学年
 * @param {string} sem 范围为{'1', '2', '3'}，对应第几个学期
 * @returns 返回一个含三个元素的数组，分别对应学年学期总学分数，平均GPA，平均分
 */
function calcSemGPA(year, sem) {
    let sem_courses_data = [];
    $('table:eq(1) tr:gt(0)[role="row"]').each(function () {
        if (
            $.trim($(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text()) === $.trim(year) &&
            $.trim($(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text()) === $.trim(sem)
        ) {
            // 学分，GPA，成绩
            let row = [];
            if ($(this).find('input[name="x-course-select"]').is(':checked')) {
                let credit = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_CREDITS})`).text()
                ); // 学分
                let gpa = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_GPA})`).text()
                ); // GPA
                let score = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
                ); // 成绩
                row = [credit, gpa, score];
                sem_courses_data.push(row);
            }
        }
    });

    return calcGPA(sem_courses_data);
}

/**
 * 更新头部（总）成绩信息
 */
function updateHeaderScores() {
    let scores = [];
    $('table tr:gt(0)').each(function () {
        let row = [];
        if ($(this).find('input[name="x-course-select"]').is(':checked')) {
            let credit = $.trim(
                $(this).find(`td:eq(${COL_INDEX.COURSE_CREDITS})`).text()
            ); // 学分
            let gpa = $.trim(
                $(this).find(`td:eq(${COL_INDEX.COURSE_GPA})`).text()
            ); // GPA
            let score = $.trim(
                $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
            ); // 成绩
            row = [credit, gpa, score];
            scores.push(row);
        }
    });

    let info = calcGPA(scores);
    $('#x-credits').text(info[0]);
    $('#x-gpa').text(info[1]);
    $('#x-average-score').text(info[2]);
    if ($('input[name="x-course-select"]:checked').length > 0) {
        $('#x-sel-all').text('全不选');
    } else {
        $('#x-sel-all').text('全选');
    }
}

/**
 * 更新一个学期的成绩信息
 * @param {string} year 学年
 * @param {string} sem 范围为{'1', '2', '3'}，对应第几个学期
 */
function updateSemScore(year, sem) {
    let info = calcSemGPA(year, sem);
    $('#x-sem-credits-' + year + '-' + sem).html(info[0]);
    $('#x-sem-gpa-' + year + '-' + sem).html(info[1]);
    $('#x-sem-avgscore-' + year + '-' + sem).html(info[2]);
}

/**
 * 更新每学期的成绩信息
 */
function updateAllSemScores() {
    let time = ['', ''];
    $('table:eq(1)')
        .find('tr:gt(0)')
        .each(function () {
            let year = $.trim($(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text());
            if (year.length !== 9) {
                return;
            }
            let sem = $.trim($(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text());
            if (!['1', '2', '3'].includes(sem)) {
                return;
            }
            if (time[0] !== year || time[1] !== sem) {
                updateSemScore(year, sem);
            }
            time = [year, sem];
        });
}

/**
 * 更新界面上的所有成绩信息
 */
function updateAllScores() {
    updateHeaderScores();
    updateAllSemScores();
}
