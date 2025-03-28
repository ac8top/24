// 用于记录计时器启动后到结束的成功答题数量
        let successCountDuringTimer = 0;
        // 用于记录每个数字按钮及其在输入框中的位置
        let buttonPositions = [];

        // 生成1到10之间的随机整数
        function generateRandomNumber() {
            return Math.floor(Math.random() * 13) + 1;
        }

        // 生成数字的所有排列
        function permutations(arr) {
            if (arr.length === 0) return [[]];
            let result = [];
            for (let i = 0; i < arr.length; i++) {
                const current = arr[i];
                const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
                const remainingPermutations = permutations(remaining);
                for (let j = 0; j < remainingPermutations.length; j++) {
                    const newPermutation = [current, ...remainingPermutations[j]];
                    result.push(newPermutation);
                }
            }
            return result;
        }

        // 计算两个数的所有可能运算结果
        function calculate(a, b) {
            return [a + b, a - b, b - a, a * b, a / b, b / a].filter(num =>!isNaN(num) && isFinite(num));
        }

        // 判断给定的四个数字是否能通过四则运算得到24
        function hasSolution(numbers) {
            const allPermutations = permutations(numbers);
            const operators = ['+', '-', '*', '/'];
            for (const perm of allPermutations) {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        for (let k = 0; k < 4; k++) {
                            const results1 = calculate(perm[0], perm[1]);
                            for (const res1 of results1) {
                                const results2 = calculate(res1, perm[2]);
                                for (const res2 of results2) {
                                    const results3 = calculate(res2, perm[3]);
                                    for (const res3 of results3) {
                                        if (Math.abs(res3 - 24) < 1e-9) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

        // 生成包含四个数字的24点题目，确保题目有解
        function generateQuestion() {
            let numbers;
            do {
                numbers = [
                    generateRandomNumber(),
                    generateRandomNumber(),
                    generateRandomNumber(),
                    generateRandomNumber()
                ];
            } while (!hasSolution(numbers));
            return numbers;
        }

        // 计算24点答案（采用穷举运算组合方式，可优化）
        function calculate24(numbers) {
            // 生成数字的全排列
            function permute(nums) {
                const result = [];
                const backtrack = (path, used) => {
                    if (path.length === nums.length) {
                        result.push([...path]);
                        return;
                    }
                    for (let i = 0; i < nums.length; i++) {
                        if (used[i]) continue;
                        path.push(nums[i]);
                        used[i] = true;
                        backtrack(path, used);
                        path.pop();
                        used[i] = false;
                    }
                };
                backtrack([], new Array(nums.length).fill(false));
                return result;
            }

            const operators = ['+', '-', '*', '/'];
            const allPermutations = permute(numbers);

            for (const perm of allPermutations) {
                for (let a = 0; a < 4; a++) {
                    for (let b = 0; b < 4; b++) {
                        for (let c = 0; c < 4; c++) {
                            const expressions = [
                                `(((${perm[0]}${operators[a]}${perm[1]})${operators[b]}${perm[2]})${operators[c]}${perm[3]})`,
                                `((${perm[0]}${operators[a]}(${perm[1]}${operators[b]}${perm[2]}))${operators[c]}${perm[3]})`,
                                `(${perm[0]}${operators[a]}(${perm[1]}${operators[b]}${perm[2]})${operators[c]}${perm[3]})`,
                                `(${perm[0]}${operators[a]}(((${perm[1]}${operators[b]}${perm[2]})${operators[c]}${perm[3]})))`,
                                `(${perm[0]}${operators[a]}(${perm[1]}${operators[b]}(${perm[2]}${operators[c]}${perm[3]})))`
                            ];
                            for (const expression of expressions) {
                                try {
                                    if (eval(expression) === 24) {
                                        return expression;
                                    }
                                } catch (error) {
                                    // 忽略计算错误情况（比如除数为0）
                                }
                            }
                        }
                    }
                }
            }
            return '无解';
        }

        // 从localStorage中加载成功次数
        function loadSuccessCount() {
            const successCount = parseInt(localStorage.getItem('successCount')) || 0;
            document.getElementById('success-count').textContent = successCount;
            updateTitle();
            return successCount;
        }

        // 将成功次数保存到localStorage
        function saveSuccessCount() {
            const successCount = parseInt(document.getElementById('success-count').textContent);
            localStorage.setItem('successCount', successCount);
        }

        // 检查答案是否正确，考虑运算优先级
        function checkAnswer() {
            const questionButtonsDiv = document.getElementById('question-buttons');
            const buttons = questionButtonsDiv.querySelectorAll('.question-button');
            let hasVisibleButtons = false;

            // 遍历所有数字按钮，检查是否有未消失（可见）的按钮
            buttons.forEach(button => {
                if (button.style.display!== 'none') {
                    hasVisibleButtons = true;
                }
            });

            if (hasVisibleButtons) {
                alert('还没有完成计算，题目框中还有未使用的数字，请继续使用或清空后再提交答案。');
                return;
            }

            const userAnswer = document.getElementById('user-answer').value;
            const questionButtons = document.querySelectorAll('.question-button');
            const numbers = Array.from(questionButtons).map(button => parseInt(button.textContent));
            try {
                if (eval(userAnswer) === 24) {
                    const resultDiv = document.getElementById('result-section');
                    resultDiv.textContent = '回答正确！';
                    // 重置标记，确保每次提交答案时可以重新计数
                    updateChallengeSuccess.isCounted = false;
                    updateChallengeSuccess();
                    updateTitle();
                    saveSuccessCount(); // 保存数据
                    // 如果计时器正在运行，增加成功答题数量
                    if (startTimer.currentTimer) {
                        successCountDuringTimer++;
                    }
                    // 清空答案框
                    document.getElementById('user-answer').value = '';
                    buttonPositions = [];
                } else {
                    const resultDiv = document.getElementById('result-section');
                    resultDiv.textContent = '回答错误，请重新尝试。';
                }
            } catch (error) {
                const resultDiv = document.getElementById('result-section');
                resultDiv.textContent = '输入表达式有误，请检查。';
            }
        }

        // 更新挑战成功次数
        function updateChallengeSuccess() {
            if (updateChallengeSuccess.isCounted) {
                return;
            }
            const successCountSpan = document.getElementById('success-count');
            const currentSuccess = parseInt(successCountSpan.textContent);
            successCountSpan.textContent = currentSuccess + 1;
            updateChallengeSuccess.isCounted = true;
        }
        // 初始化标记
        updateChallengeSuccess.isCounted = false;

        // 根据成功次数更新称号（简单示例，可完善规则）
        function updateTitle() {
            const successCount = parseInt(document.getElementById('success-count').textContent);
            let title = '小学一年级';
            if (successCount >= 30) {
                title = '小学二年级';
            }
            if (successCount >= 60) {
                title = '小学三年级';
            }
            if (successCount >= 90) {
                title = '小学四年级';
            }
            if (successCount >= 120) {
                title = '小学五年级';
            }
            if (successCount >= 150) {
                title = '小学六年级';
            }
            if (successCount >= 180) {
                title = '初一';
            }
            if (successCount >= 240) {
                title = '初二';
            }
            if (successCount >= 320) {
                title = '初三';
            }
            if (successCount >= 420) {
                title = '高一';
            }
            if (successCount >= 540) {
                title = '高二';
            }
            if (successCount >= 690) {
                title = '高三';
            }
            if (successCount >= 750) {
                title = '大一';
            }

            document.getElementById('user-title').textContent = title;
        }

        document.getElementById('generate-question').addEventListener('click', () => {
            const newQuestion = generateQuestion();
            const questionButtonsDiv = document.getElementById('question-buttons');
            questionButtonsDiv.innerHTML = '';
            buttonPositions = [];
            newQuestion.forEach(num => {
                const button = document.createElement('button');
                button.classList.add('question-button');
                button.textContent = num;
                button.addEventListener('click', function () {
                    const inputBox = document.getElementById('user-answer');
                    const currentValue = inputBox.value;
                    const lastChar = currentValue.slice(-1);
                    if (/[0-9]/.test(lastChar)) {
                        alert('不能连续输入两个数字按钮');
                        return;
                    }
                    const startIndex = inputBox.value.length;
                    inputBox.value += num;
                    const endIndex = inputBox.value.length;
                    buttonPositions.push({ button, startIndex, endIndex });
                    button.style.display = 'none';
                });
                questionButtonsDiv.appendChild(button);
            });
            document.getElementById('result-section').textContent = '';
            document.getElementById('user-answer').value = '';
        });

        document.getElementById('submit-answer').addEventListener('click', checkAnswer);

        // 显示答案提示按钮点击事件
        document.getElementById('show-hint').addEventListener('click', () => {
            const questionButtons = document.querySelectorAll('.question-button');
            const numbers = Array.from(questionButtons).map(button => parseInt(button.textContent));
            const hintAnswer = calculate24(numbers);
            const resultDiv = document.getElementById('result-section');
            resultDiv.textContent = `答案提示：${hintAnswer}`;
        });

        let timer;
        // 开始挑战按钮点击事件
        document.getElementById('start-challenge').addEventListener('click', () => {
            // 重置计时器启动后的成功答题数量
            successCountDuringTimer = 0;
            const newQuestion = generateQuestion();
            const questionButtonsDiv = document.getElementById('question-buttons');
            questionButtonsDiv.innerHTML = '';
            buttonPositions = [];
            newQuestion.forEach(num => {
                const button = document.createElement('button');
                button.classList.add('question-button');
                button.textContent = num;
                button.addEventListener('click', function () {
                    const inputBox = document.getElementById('user-answer');
                    const currentValue = inputBox.value;
                    const lastChar = currentValue.slice(-1);
                    if (/[0-9]/.test(lastChar)) {
                        alert('不能连续输入两个数字按钮');
                        return;
                    }
                    const startIndex = inputBox.value.length;
                    inputBox.value += num;
                    const endIndex = inputBox.value.length;
                    buttonPositions.push({ button, startIndex, endIndex });
                    button.style.display = 'none';
                });
                questionButtonsDiv.appendChild(button);
            });
            document.getElementById('result-section').textContent = '';
            const selectedTime = parseInt(document.getElementById('timer-select').value);
            startTimer(selectedTime);
        });

        // 运算符按钮点击事件处理
        document.querySelectorAll('.operator-button').forEach(function (button) {
            button.addEventListener('click', function () {
                const inputBox = document.getElementById('user-answer');
                inputBox.value += this.value;
            });
        });

        // 返回原题目按钮点击事件
        document.getElementById('reset-question').addEventListener('click', () => {
            const questionButtonsDiv = document.getElementById('question-buttons');
            const questionButtons = questionButtonsDiv.querySelectorAll('button');
            questionButtons.forEach(button => {
                button.style.display = 'block';
            });
            document.getElementById('user-answer').value = '';
            buttonPositions = [];
            const questionFrame = document.getElementById('question-frame');
            questionFrame.style.flexDirection = 'row';
        });

        // 退格按钮点击事件
        document.getElementById('backspace-button').addEventListener('click', () => {
            const inputBox = document.getElementById('user-answer');
            let currentValue = inputBox.value;
            if (currentValue.length > 0) {
                const lastChar = currentValue.slice(-1);
                if (/[0-9]/.test(lastChar)) {
                    const lastButtonPosition = buttonPositions.pop();
                    if (lastButtonPosition) {
                        currentValue = currentValue.slice(0, lastButtonPosition.startIndex);
                        lastButtonPosition.button.style.display = 'block';
                    }
                } else {
                    currentValue = currentValue.slice(0, -1);
                }
                inputBox.value = currentValue;
            }
        });

        // 启动定时器
        function startTimer(seconds) {
            // 清除之前的定时器
            if (startTimer.currentTimer) {
                clearInterval(startTimer.currentTimer);
            }

            const timerDisplay = document.getElementById('timer-value');
            let remainingSeconds = seconds;
            timerDisplay.textContent = remainingSeconds;

            // 设置新的定时器并存储 ID 到函数属性
            startTimer.currentTimer = setInterval(() => {
                remainingSeconds--;
                timerDisplay.textContent = remainingSeconds;
                if (remainingSeconds === 0) {
                    clearInterval(startTimer.currentTimer);
                    alert('时间到！挑战结束。');
                    document.getElementById('result-section').textContent = `本次挑战正确题目数量：${successCountDuringTimer}`;
                    // 计时结束后，重置计时期间的成功答题数量
                    successCountDuringTimer = 0;
                }
            }, 1000);
        }

        // 页面加载时加载成功次数
        window.addEventListener('load', loadSuccessCount);
