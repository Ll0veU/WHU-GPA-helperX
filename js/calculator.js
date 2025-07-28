/**
 * 计算传入课程的总学分数，平均GPA，平均分
 * @param {number[][3]} scores 包含需要计算的每门课程的[学分，GPA，成绩]的 float 数组
 * @returns 返回一个含三个元素的数组，分别对应总学分数，平均GPA，平均分
 */
function calcGPA(scores) {
    let totalCredits = 0,
        totalGPA = 0,
        totalScore = 0;
    $(scores).each(function () {
        let credit = parseFloat($(this)[0]);
        let GPA = parseFloat($(this)[1]);
        let score = parseFloat($(this)[2]);

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

    function padIntPart(numStr, width = 3) {
        const [intPart, decPart] = numStr.split('.');
        return intPart.padStart(width, ' ');
    }
    const creditRaw = Number(totalCredits).toFixed(1);
    const gpaRaw = Number(GPAMean).toFixed(3);
    const avgScoreRaw = Number(scoreMean).toFixed(3);
    const credit = `${padIntPart(creditRaw, 3)}.${creditRaw.split('.')[1]}`;
    const gpa = `${padIntPart(gpaRaw, 3)}.${gpaRaw.split('.')[1]}`;
    const avgScore = `${padIntPart(avgScoreRaw, 3)}.${avgScoreRaw.split('.')[1]}`;
    return [credit, gpa, avgScore];
}

/**
 * 计算某学年某学期的总学分数，平均GPA，平均分
 * @param {string} year 学年
 * @param {number} sem 整型数据，范围为[1, 3]，对应第几个学期
 * @returns 返回一个含三个元素的数组，分别对应学年学期总学分数，平均GPA，平均分
 */
function calcSemGPA(year, sem) {
    let scores = [];
    $('table:eq(1) tr:gt(0)').each(function () {
        if (
            $(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text() === year &&
            parseInt(
                $(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text()
            ) === Number(sem)
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
                scores.push(row);
            }
        }
    });

    return calcGPA(scores);
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
 * @param {number} sem 整型数据，范围为[1, 3]，对应第几个学期
 */
function updateSemScore(year, sem) {
    let info = calcSemGPA(year, sem);
    $('#x-sem-credits-' + year + '-' + sem).text(info[0]);
    $('#x-sem-gpa-' + year + '-' + sem).text(info[1]);
    $('#x-sem-avgscore-' + year + '-' + sem).text(info[2]);
}

/**
 * 更新每学期的成绩信息
 */
function updateAllSemScores() {
    let time = ['', 0];
    $('table:eq(1)')
        .find('tr:gt(0)')
        .each(function () {
            let year = $(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text();
            let sem = parseInt(
                $(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text()
            );
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
