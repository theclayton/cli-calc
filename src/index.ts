const readline = require("readline");
const ALLOWED_CHARS = /[0123456789\+\-\*\/\=]/; // Note: not using \d because it doens't support other languages
const VALID_OPERATORS = /[\+\-\*\/]/;
const CONSECUTIVE_OPERATORS = /[\+\-\*\/]{2,}/;
const MULTIPLE_EQUALS = /\={2,}/;
const IS_DIGIT = /[0123456789]/;
let state: number = 0;
let isClear: boolean = true;
let result: number = 0;

/**
 * Driver function
 */
function main(): void {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt("> ");

    clearState();
    rl.prompt();

    // Handle input
    rl.on("line", (line: string) => {
        switch (line) {
            case 'close':
                rl.close();
                break;
            case 'c':
                clearState();
                break;
            case '':
                showState();
                break;
            default:
                processInput(line.trim());
        }

        rl.prompt();

    }).on("close", () => process.exit(0));
}

/**
 * Display current state
 */
function showValue(value: string): void {
    process.stdout.write(value + "\n");
}


/**
 * Display current state
 */
function showState(): void {
    process.stdout.write(String(state) + "\n");
}

/**
 * Clear current state
 */
function clearState(): void {
    state = 0;
    result = 0;
    isClear = true;
    showState();
}

/**
 * Process input and update state
 * @param input equation to process
 * @returns 
 */
function processInput(input: string): void {
    try {
        validate(input);
    } catch (e) {
        showValue(e.message);
        return
    }

    // Process input
    let nStr: string = '';
    let lastNumber: string = '';
    let lastOp: string = '';
    let calcNext: boolean = false;
    let equals: boolean = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (i === 0 && !isClear && IS_DIGIT.test(char)) {
            showValue('Middle of equation, needs operator! Type "c" to clear.');
            return
        }

        if (IS_DIGIT.test(char)) {
            nStr += char;
            lastNumber = nStr;
        } else if (VALID_OPERATORS.test(char)) {
            // TODO: Chop floats to precision length
            // if (lastNumber.indexOf('.') !== -1) {
            //     lastNumber = Number(nStr).toFixed(PRECISION)
            // }

            if (isClear) {
                result = Number(nStr);
                isClear = false;
                nStr = '';
                calcNext = true
                lastOp = char;
                continue
            }

            if (calcNext) {
                result = calculate(result, lastOp, Number(nStr));
                isClear = false;
                lastNumber = nStr;
                nStr = '';
                calcNext = true;
            } else if (!nStr) {
                calcNext = true
            } else {
                result = calculate(result, char, Number(nStr));
                isClear = false;
                lastNumber = nStr;
                nStr = '';
                calcNext = false;
            }

            lastOp = char;

        } else if (char === '=') {
            equals = true;
            break; // Only 1 equals is allowed.
        } else {
            showValue('Invalid input: ' + char);
            return
        }
    }

    if (calcNext) {
        result = calculate(result, lastOp, Number(nStr));
        isClear = false;
    }

    // Update state
    state = equals ? result : Number(lastNumber);
    showState()
}

/**
 * Calculate the result of an operation.
 * @param result Result thus far. E.g. running total.
 * @param op Mathmatical operator, e.g. [+, -, *, /].
 * @param value Value to be operatoed on in relation to result.
 * @returns 
 */
function calculate(total: number, op: string, value: number): number {
    // TODO: Use interger math to avoid floating point errors
    // let totalInt = total * 10 * PRECISION; // or something
    // const valueInt = value * 10 * PRECISION;

    switch (op) {
        case '+':
            total += value;
            break;
        case '-':
            total -= value;
            break;
        case '*':
            total *= value;
            break;
        case '/':
            total /= value;
            break;
        default:
            // Should never happen
            throw new Error("Invalid operator: " + op);
    }

    return total;
}

/**
 * Validates input to make sure nothing shading gets through. Throws on error.
 * @param input String to validate
 */
function validate(input: string): void {
    if (input.length > 69) {
        throw new Error("Invalid input: too long");
    }

    if (!ALLOWED_CHARS.test(input)) {
        throw new Error("Invalid input: contains invalid characters");
    }

    if (CONSECUTIVE_OPERATORS.test(input)) {
        throw new Error("Invalid input: contains consecutive operators");
    }

    if (MULTIPLE_EQUALS.test(input)) {
        throw new Error("Invalid input: contains multiple equals");
    }
}

main();
