/**
 * 更新所有课程类别复选框的选中状态。
 *
 * 遍历所有课程类别的复选框，根据每个类别下所有课程的选中状态，更新类别复选框的选中状态。
 * 如果某类别下所有课程都被选中，则该类别复选框被选中；否则不选中。
 */
function updateCategoryCheckboxes() {
    // 变动后，所有课程类别checkbox都要重新判断
    $('input[name="x-selbox"]').each(function () {
        const category = this.value;
        let allChecked = true;
        let hasCourse = false;
        $('table:eq(1) tr:gt(0)').each(function () {
            if (
                $(this).find(`td:eq(${COL_INDEX.COURSE_CATEGORY})`).text() === category
            ) {
                hasCourse = true;
                if (!$(this).find(`td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`).prop('checked')) {
                    allChecked = false;
                }
            }
        });
        if (hasCourse) {
            $(this).prop('checked', allChecked);
        }
    });
}

/**
 * 更新所有学期复选框的选中状态。
 *
 * 遍历每个学期复选框（input[name="x-sem-checkbox"]）：
 * 1. 解析出对应的学年和学期。
 * 2. 检查表格中该学年学期的所有课程。
 * 3. 如果该学期所有课程都被选中，则学期复选框选中；
 * 4. 如果有任意一门课未被选中，则学期复选框不选中；
 * 5. 如果该学期没有课程，则不改变复选框状态。
 */
function updateSemCheckboxes() {
    // 变动后，所有学期checkbox都要重新判断
    $('input[name="x-sem-checkbox"]').each(function () {
        const [year, sem] = this.value.split('|');
        let allChecked = true;
        let hasCourse = false;
        $('table:eq(1) tr:gt(0)').each(function () {
            if (
                $(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text() === year &&
                $(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text() === sem
            ) {
                hasCourse = true;
                if (!$(this).find(`td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`).prop('checked')) {
                    allChecked = false;
                }
            }
        });
        if (hasCourse) {
            $(this).prop('checked', allChecked);
        }
    });
}

/**
 * 绑定各控件事件
 */
function bindEvents() {
    // 响应表格中的复选框
    $('input[name="x-course-select"]').change(() => {
        updateCategoryCheckboxes();
        updateSemCheckboxes();
        updateAllScores();
    });

    // 响应课程类别复选框
    $('input[name="x-selbox"]').change(e => {
        const input = e.target;
        $('table:eq(1) tr:gt(0)').each(function () {
            if (
                $(this).find(`td:eq(${COL_INDEX.COURSE_CATEGORY})`).text() ===
                input.value
            ) {
                const score = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
                );
                const checkbox = $(this).find(
                    `td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`
                );

                // 撤销课程（成绩为'W'）永远不被选中
                if (score === 'W') {
                    checkbox.prop('checked', false);
                } else {
                    checkbox.prop('checked', input.checked);
                }
            }
        });
        updateSemCheckboxes();
        updateAllScores();
    });

    // 响应学期全选复选框
    $('input[name="x-sem-checkbox"]').off('change.sem').on('change.sem', function (e) {
        const input = e.target;
        const [year, sem] = input.value.split('|');
        // 只操作本学期内的课程checkbox
        $('table:eq(1) tr:gt(0)').each(function () {
            if (
                $(this).find(`td:eq(${COL_INDEX.COURSE_YEAR})`).text() === year &&
                $(this).find(`td:eq(${COL_INDEX.COURSE_SEMESTER})`).text() === sem
            ) {
                const scoreText = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
                );
                const checkbox = $(this).find(
                    `td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`
                );
                // 撤销课程（成绩为'W'）永远不被选中
                if (scoreText === 'W') {
                    checkbox.prop('checked', false);
                } else {
                    checkbox.prop('checked', input.checked);
                }
            }
        });
        updateCategoryCheckboxes();
        updateAllScores();
    });

    // 全选/全不选
    $('#x-sel-all').click(() => {
        if ($('input[name="x-course-select"]:checked').length === 0) {
            // 全选时：选中所有非撤销课程（成绩不为'W'的课程）
            $('table:eq(1) tr:gt(0)').each(function () {
                const score = $.trim(
                    $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
                );
                const checkbox = $(this).find(
                    `td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`
                );

                if (score !== 'W' && checkbox.length > 0) {
                    checkbox.prop('checked', true);
                }
            });
            $('input[name="x-selbox"]').prop('checked', true);
            $('input[name="x-sem-checkbox"]').prop('checked', true);
            $('#x-sel-all').text('全不选');
        } else {
            // 全不选：取消选中所有课程
            $('input[name="x-course-select"]').prop('checked', false);
            $('input[name="x-selbox"]').prop('checked', false);
            $('input[name="x-sem-checkbox"]').prop('checked', false);
            $('#x-sel-all').text('全选');
        }
        updateAllScores();
    });

    // 反选
    $('#x-sel-rev').click(() => {
        let checked = $('input[name="x-course-select"]:checked');

        // 反选时：只反选非撤销课程，撤销课程（成绩为'W'）保持不选中
        $('table:eq(1) tr:gt(0)').each(function () {
            const score = $.trim(
                $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
            );
            const checkbox = $(this).find(
                `td:eq(${COL_INDEX.COURSE_CODE}) input[name="x-course-select"]`
            );

            if (checkbox.length > 0 && score !== 'W') {
                checkbox.prop('checked', !checkbox.is(':checked'));
            }
        });
        updateCategoryCheckboxes();
        updateSemCheckboxes();
        updateAllScores();
    });

    // 复原
    $('#x-sel-revert').click(() => {
        $('table:eq(1) tr:gt(0)').each(function () {
            const scoreText = $.trim(
                $(this).find(`td:eq(${COL_INDEX.COURSE_SCORE})`).text()
            );
            const checkbox = $(this).find(
                `td:eq(${COL_INDEX.COURSE_CODE}) input:checkbox`
            );

            // 撤销课程（成绩为'W'）永远不选中
            if (scoreText === 'W') {
                checkbox.prop('checked', false);
            } else {
                // 非撤销课程：成绩 >= 60分则选中，否则不选中
                const score = parseFloat(scoreText);
                if (score >= 60.0) {
                    checkbox.prop('checked', true);
                } else {
                    checkbox.prop('checked', false);
                }
            }
        });
        $('input[name="x-selbox"]').prop('checked', true);
        $('input[name="x-sem-checkbox"]').prop('checked', true);

        // 清理排序状态并恢复默认配置
        _config.lastClickedColumn = undefined;
        _config.lastClickedColumnSort = undefined;
        _config.sorts = {
            [COL_INDEX.COURSE_YEAR]: true,
            [COL_INDEX.COURSE_SEMESTER]: true,
            [COL_INDEX.COURSE_CATEGORY]: false,
        };

        // 重置所有表头图标显示
        $('.ui-jqgrid-htable tr th:visible').each(function (index, th) {
            if (index === COL_INDEX.COURSE_CODE) return;

            const $sortIcon = $(th).find('div span.s-ico');
            const isDefaultSortColumn = _config.sortOrder.includes(index);

            if (isDefaultSortColumn) {
                $sortIcon.css('display', 'inline');

                const ascElement = $sortIcon.find(`span[sort=asc]`);
                const descElement = $sortIcon.find(`span[sort=desc]`);

                ascElement.removeClass('ui-state-disabled');
                descElement.removeClass('ui-state-disabled');

                if (_config.sorts[index]) {
                    descElement.addClass('ui-state-disabled');
                } else {
                    ascElement.addClass('ui-state-disabled');
                }
            } else {
                $sortIcon.css('display', 'none');
            }
        });

        updateAllScores();
        sortScores();
    });

    // 图表
    $('#x-show-graph').click(() => {
        $('#x-modal-overlay').addClass('x-open');
        updateStatistics();
        plots = drawStatisticPlot();
    });
    // 点击modal不关闭overlay
    $('.x-modal').click(function (e) {
        e.stopPropagation();
    });
    // 点击exit icon关闭overlay
    $('.x-icon').click(() => {
        closeModal();
    });
    // 直接点击overlay
    $('#x-modal-overlay').click(function () {
        closeModal();
    });
    // 点击modal上的复原按钮将课程选项更新，并重新绘图
    $('#x-revert').click(() => {
        $('#x-sel-revert').trigger('click');
        updateStatistics();
        plots = drawStatisticPlot();
    });
}
