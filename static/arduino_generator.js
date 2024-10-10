// static/arduino_generator.js
Blockly.Arduino = new Blockly.Generator('Arduino');

Blockly.Arduino.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Arduino.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Arduino.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Arduino.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Arduino.ORDER_ADDITIVE = 4;       // + -
Blockly.Arduino.ORDER_SHIFT = 5;          // << >>
Blockly.Arduino.ORDER_RELATIONAL = 6;     // is is! >= > <= 
Blockly.Arduino.ORDER_EQUALITY = 7;       // == != === !==
Blockly.Arduino.ORDER_BITWISE_AND = 8;    // &
Blockly.Arduino.ORDER_BITWISE_XOR = 9;    // ^
Blockly.Arduino.ORDER_BITWISE_OR = 10;    // |
Blockly.Arduino.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Arduino.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Arduino.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Blockly.Arduino.ORDER_ASSIGNMENT = 14;    // = += -= *= /= ~/= %= <<= >>= &= ^= |=
Blockly.Arduino.ORDER_YIELD = 15;         // yield
Blockly.Arduino.ORDER_COMMA = 16;         // ,
Blockly.Arduino.ORDER_NONE = 99;          // (...)

Blockly.Arduino.reset = function() {
    Blockly.Arduino.definitions_ = Object.create(null);
    Blockly.Arduino.setups_ = Object.create(null);
    Blockly.Arduino.loop_ = Object.create(null);
};

Blockly.Arduino.init = function(workspace) {
  Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());
  Blockly.Arduino.reset();

  // Create a dictionary of definitions to be printed before setups.
  Blockly.Arduino.definitions_ = Object.create(null);
  // Create a dictionary of setups to be printed before the code.
  Blockly.Arduino.setups_ = Object.create(null);
  // Create a dictionary of variable definitions to be printed after setups.
  Blockly.Arduino.variables_ = Object.create(null);
  // Create a dictionary of functions from the code.
  Blockly.Arduino.functions_ = Object.create(null);
  // Create a dictionary of functions from the header.
  Blockly.Arduino.headerFunctions_ = Object.create(null);
  // Create a dictionary of functions from the user.
  Blockly.Arduino.userFunctions_ = Object.create(null);
  
};

Blockly.Arduino.finish = function(code) {
  // Convert the setups dictionary into a list.
  const setups = [];
  for (const name in Blockly.Arduino.setups_) {
    setups.push(Blockly.Arduino.setups_[name]);
  }
  // Convert the variable definitions dictionary into a list.
  const variables = [];
  for (const name in Blockly.Arduino.variables_) {
    variables.push(Blockly.Arduino.variables_[name]);
  }
  // Convert the functions dictionary into a list.
  const functions = [];
  for (const name in Blockly.Arduino.functions_) {
    functions.push(Blockly.Arduino.functions_[name]);
  }

  // Clean up temporary data.
  delete Blockly.Arduino.definitions_;
  delete Blockly.Arduino.setups_;
  delete Blockly.Arduino.variables_;
  delete Blockly.Arduino.functions_;
  Blockly.Arduino.reset();

  return setups.join('\n') + '\n' + variables.join('\n') + '\n' + functions.join('\n') + '\n\n' + code;
};

Blockly.Arduino.scrub_ = function(block, code) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = Blockly.Arduino.blockToCode(nextBlock);
  return code + nextCode;
};

Blockly.Arduino.blockToCode = function(block) {
  if (!block) {
    return '';
  }

  if (block.isEnabled() && !block.hasDisabledReason()) {
    var func = this[block.type];
    if (typeof func !== 'function') {
      throw Error('Language "Arduino" does not know how to generate code for block type "' + block.type + '".');
    }
    var code = func.call(this, block);

    if (Array.isArray(code)) {
      return code[0] + this.scrub_(block, code[1]);
    } else {
      return this.scrub_(block, code);
    }
  } else {
    return this.scrub_(block, '');
  }
};


Blockly.Arduino.workspaceToCode = function(workspace) {
  if (!workspace) {
    console.warn('Blockly.Arduino.workspaceToCode was called with an invalid workspace.');
    return '';
  }
  let code = [];
  this.init(workspace);
  const blocks = workspace.getTopBlocks(true);
  for (let i = 0, block; block = blocks[i]; i++) {
    let line = this.blockToCode(block);
    if (line) {
      if (Array.isArray(line)) {
        line = line[0];
      }
      code.push(line);
    }
  }
  code = code.join('\n');
  code = this.finish(code);
  return code;
};

Blockly.Arduino.prefixLines = function(text, prefix) {
    return prefix + text.replace(/\n/g, '\n' + prefix);
};

//Arduino
Blockly.Arduino['arduino_setup'] = function(block) {
    var statements_setup = Blockly.Arduino.statementToCode(block, 'SETUP');
    statements_setup = Blockly.Arduino.addLoopTrap(statements_setup, block.id) || '';
    statements_setup = Blockly.Arduino.prefixLines(statements_setup, '  ');  // Add indentation
    var code = 'void setup() {\n' + statements_setup + '\n}\n';
    
    // Adiciona o código dos blocos conectados
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock) {
        code += Blockly.Arduino.blockToCode(nextBlock);
    }

    return code;
};

Blockly.Arduino['arduino_loop'] = function(block) {
    var statements_loop = Blockly.Arduino.statementToCode(block, 'LOOP');
    statements_loop = Blockly.Arduino.addLoopTrap(statements_loop, block.id) || '';
    statements_loop = Blockly.Arduino.prefixLines(statements_loop, '  ');  // Add indentation
    var code = 'void loop() {\n' + statements_loop + '\n}\n';
    
    // Adiciona o código dos blocos conectados
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock) {
        code += Blockly.Arduino.blockToCode(nextBlock);
    }

    return code;
};

Blockly.Arduino['serial_begin'] = function(block) {
    var baudRate = block.getFieldValue('BAUD_RATE');
    var code = 'Serial.begin(' + baudRate + ');\n';
    return code;
};

Blockly.Arduino['analog_read'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var code = 'analogRead(' + pin + ');\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['digital_read'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var code = 'digitalRead(' + pin + ');\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['digital_write'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var state = block.getFieldValue('STATE');
    var code = 'digitalWrite(' + pin + ', ' + state + ');\n';
    return code;
};

Blockly.Arduino['pin_mode'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var mode = block.getFieldValue('MODE');
    var code = 'pinMode(' + pin + ', ' + mode + ');\n';
    return code;
};

Blockly.Arduino['analog_write'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var value = block.getFieldValue('VALUE');
    var code = 'analogWrite(' + pin + ', ' + value + ');\n';
    return code;
};

Blockly.Arduino['analog_reference'] = function(block) {
    var type = block.getFieldValue('TYPE');
    var code = 'analogReference(' + type + ');\n';
    return code;
};

Blockly.Arduino['delay'] = function(block) {
    var time = block.getFieldValue('TIME');
    var code = 'delay(' + time + ');\n';
    return code;
};

Blockly.Arduino['delay_microseconds'] = function(block) {
    var time = block.getFieldValue('TIME');
    var code = 'delayMicroseconds(' + time + ');\n';
    return code;
};

Blockly.Arduino['micros'] = function(block) {
    var code = 'micros();\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['millis'] = function(block) {
    var code = 'millis();\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['no_tone'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var code = 'noTone(' + pin + ');\n';
    return code;
};

Blockly.Arduino['tone'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var frequency = block.getFieldValue('FREQUENCY');
    var duration = block.getFieldValue('DURATION');
    var code = 'tone(' + pin + ', ' + frequency + ', ' + duration + ');\n';
    return code;
};

Blockly.Arduino['pulse_in'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var state = block.getFieldValue('STATE');
    var code = 'pulseIn(' + pin + ', ' + state + ');\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['pulse_in_long'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var state = block.getFieldValue('STATE');
    var code = 'pulseInLong(' + pin + ', ' + state + ');\n';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

//END ARDUINO



/*
  NATIVES BLOCKS
*/

Blockly.Arduino['controls_if'] = function (block) {
    var n = 0;
    var code = '', branchCode, conditionCode;
    do {
        conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
        branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);
        code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' + branchCode + '}';
        n++;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        branchCode = Blockly.Arduino.statementToCode(block, 'ELSE');
        code += ' else {\n' + branchCode + '}';
    }

    return code + '\n';
};

Blockly.Arduino['logic_compare'] = function (block) {
    var OPERATORS = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };
    var operator = OPERATORS[block.getFieldValue('OP')];
    var order = Blockly.Arduino.ORDER_RELATIONAL;
    var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

Blockly.Arduino['logic_operation'] = function (block) {
    var operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
    var order = (operator === '&&') ? Blockly.Arduino.ORDER_LOGICAL_AND : Blockly.Arduino.ORDER_LOGICAL_OR;
    var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || 'false';
    var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || 'false';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

Blockly.Arduino['logic_negate'] = function (block) {
    var order = Blockly.Arduino.ORDER_LOGICAL_NOT;
    var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL', order) || 'false';
    var code = '!' + argument0;
    return [code, order];
};

Blockly.Arduino['logic_boolean'] = function (block) {
    var code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['logic_null'] = function (block) {
    return ['NULL', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['logic_ternary'] = function (block) {
    var value_if = Blockly.Arduino.valueToCode(block, 'IF', Blockly.Arduino.ORDER_CONDITIONAL) || 'false';
    var value_then = Blockly.Arduino.valueToCode(block, 'THEN', Blockly.Arduino.ORDER_CONDITIONAL) || 'null';
    var value_else = Blockly.Arduino.valueToCode(block, 'ELSE', Blockly.Arduino.ORDER_CONDITIONAL) || 'null';
    var code = value_if + ' ? ' + value_then + ' : ' + value_else;
    return [code, Blockly.Arduino.ORDER_CONDITIONAL];
};

Blockly.Arduino['controls_repeat_ext'] = function (block) {
    var repeats = Blockly.Arduino.valueToCode(block, 'TIMES', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var branch = Blockly.Arduino.statementToCode(block, 'DO');
    var code = 'for (int count = 0; count < ' + repeats + '; count++) {\n' + branch + '}\n';
    return code;
};

Blockly.Arduino['controls_whileUntil'] = function (block) {
    var until = block.getFieldValue('MODE') === 'UNTIL';
    var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL', until ? Blockly.Arduino.ORDER_LOGICAL_NOT : Blockly.Arduino.ORDER_NONE) || 'false';
    var branch = Blockly.Arduino.statementToCode(block, 'DO');
    if (until) {
        argument0 = '!' + argument0;
    }
    return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Arduino['controls_for'] = function (block) {
    var variable0 = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    var argument0 = Blockly.Arduino.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'TO', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
    var increment = Blockly.Arduino.valueToCode(block, 'BY', Blockly.Arduino.ORDER_ASSIGNMENT) || '1';
    var branch = Blockly.Arduino.statementToCode(block, 'DO');
    var code = 'for (int ' + variable0 + ' = ' + argument0 + '; ' + variable0 + ' <= ' + argument1 + '; ' + variable0;
    code += ' += ' + increment + ') {\n' + branch + '}\n';
    return code;
};

Blockly.Arduino['controls_forEach'] = function (block) {
    var variable0 = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    var argument0 = Blockly.Arduino.valueToCode(block, 'LIST', Blockly.Arduino.ORDER_ATOMIC) || '[]';
    var branch = Blockly.Arduino.statementToCode(block, 'DO');
    var code = 'for (int ' + variable0 + ' : ' + argument0 + ') {\n' + branch + '}\n';
    return code;
};

Blockly.Arduino['controls_flow_statements'] = function (block) {
    var xfix = '';
    if (Blockly.Arduino.STATEMENT_PREFIX) {
        xfix += Blockly.Arduino.injectId(Blockly.Arduino.STATEMENT_PREFIX, block);
    }
    if (Blockly.Arduino.STATEMENT_SUFFIX) {
        xfix += Blockly.Arduino.injectId(Blockly.Arduino.STATEMENT_SUFFIX, block);
    }
    if (Blockly.Arduino.STATEMENT_PREFIX) {
        var loop = Blockly.Arduino.nameDB_.getName(block.getFieldValue('LOOP'), Blockly.PROCEDURE_CATEGORY_NAME);
        var code = loop ? 'continue;\n' : 'break;\n';
    } else {
        var code = block.getFieldValue('FLOW') === 'BREAK' ? 'break;\n' : 'continue;\n';
    }
    return xfix + code;
};

// MATH
Blockly.Arduino['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Arduino.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.Arduino.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
    'POWER': [null, Blockly.Arduino.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in Arduino requires a special case since it has no operator.
  if (!operator) {
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Arduino['math_single'] = function (block) {
    var operator = block.getFieldValue('OP');
    var code;
    var arg;
    if (operator === 'NEG') {
        arg = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_UNARY_NEGATION) || '0';
        code = '-' + arg;
        return [code, Blockly.Arduino.ORDER_UNARY_NEGATION];
    }
    arg = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
    switch (operator) {
        case 'ROOT':
            code = 'sqrt(' + arg + ')';
            break;
        case 'ABS':
            code = 'abs(' + arg + ')';
            break;
        case 'LN':
            code = 'log(' + arg + ')';
            break;
        case 'EXP':
            code = 'exp(' + arg + ')';
            break;
        case 'POW10':
            code = 'pow(10, ' + arg + ')';
            break;
        default:
            throw Error('Unknown math operator: ' + operator);
    }
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_trig'] = function (block) {
    var operator = block.getFieldValue('OP');
    var code;
    var arg;
    if (operator === 'NEG') {
        arg = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_UNARY_NEGATION) || '0';
        code = '-' + arg;
        return [code, Blockly.Arduino.ORDER_UNARY_NEGATION];
    }
    arg = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
    switch (operator) {
        case 'SIN':
            code = 'sin(' + arg + ')';
            break;
        case 'COS':
            code = 'cos(' + arg + ')';
            break;
        case 'TAN':
            code = 'tan(' + arg + ')';
            break;
        case 'ASIN':
            code = 'asin(' + arg + ')';
            break;
        case 'ACOS':
            code = 'acos(' + arg + ')';
            break;
        case 'ATAN':
            code = 'atan(' + arg + ')';
            break;
        default:
            throw Error('Unknown math operator: ' + operator);
    }
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_constant'] = function (block) {
    var CONSTANTS = {
        'PI': ['PI', Blockly.Arduino.ORDER_ATOMIC],
        'E': ['M_E', Blockly.Arduino.ORDER_ATOMIC],
        'GOLDEN_RATIO': ['1.61803398875', Blockly.Arduino.ORDER_ATOMIC],
        'SQRT2': ['M_SQRT2', Blockly.Arduino.ORDER_ATOMIC],
        'SQRT1_2': ['M_SQRT1_2', Blockly.Arduino.ORDER_ATOMIC]
    };
    return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Arduino['math_number_property'] = function (block) {
    var number_to_check = Blockly.Arduino.valueToCode(block, 'NUMBER_TO_CHECK', Blockly.Arduino.ORDER_MODULUS) || '0';
    var dropdown_property = block.getFieldValue('PROPERTY');
    var code;
    if (dropdown_property === 'PRIME') {
        code = 'isPrime(' + number_to_check + ')';
    } else if (dropdown_property === 'EVEN') {
        code = number_to_check + ' % 2 == 0';
    } else if (dropdown_property === 'ODD') {
        code = number_to_check + ' % 2 == 1';
    } else if (dropdown_property === 'WHOLE') {
        code = number_to_check + ' % 1 == 0';
    } else if (dropdown_property === 'POSITIVE') {
        code = number_to_check + ' > 0';
    } else if (dropdown_property === 'NEGATIVE') {
        code = number_to_check + ' < 0';
    } else if (dropdown_property === 'DIVISIBLE_BY') {
        var divisor = Blockly.Arduino.valueToCode(block, 'DIVISOR', Blockly.Arduino.ORDER_MODULUS) || '0';
        code = number_to_check + ' % ' + divisor + ' == 0';
    }
    return [code, Blockly.Arduino.ORDER_LOGICAL_NOT];
};

Blockly.Arduino['math_round'] = function (block) {
    var operator = block.getFieldValue('OP');
    var arg = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
    var code;
    if (operator === 'ROUND') {
        code = 'round(' + arg + ')';
    } else if (operator === 'ROUNDUP') {
        code = 'ceil(' + arg + ')';
    } else if (operator === 'ROUNDDOWN') {
        code = 'floor(' + arg + ')';
    } else {
        throw Error('Unknown math operator: ' + operator);
    }
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_on_list'] = function (block) {
    var func = block.getFieldValue('OP');
    var list = Blockly.Arduino.valueToCode(block, 'LIST', Blockly.Arduino.ORDER_NONE) || '[]';
    var code;
    switch (func) {
        case 'SUM':
            code = list + '.reduce((x, y) => x + y, 0)';
            break;
        case 'MIN':
            code = 'Math.min.apply(null, ' + list + ')';
            break;
        case 'MAX':
            code = 'Math.max.apply(null, ' + list + ')';
            break;
        case 'AVERAGE':
            code = list + '.reduce((x, y) => x + y, 0) / ' + list + '.length';
            break;
        case 'MEDIAN':
            code = 'median(' + list + ')';
            break;
        case 'MODE':
            code = 'mode(' + list + ')';
            break;
        case 'STD_DEV':
            code = 'stdDev(' + list + ')';
            break;
        case 'RANDOM':
            code = list + '[Math.floor(Math.random() * ' + list + '.length)]';
            break;
        default:
            throw Error('Unknown operator: ' + func);
    }
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_modulo'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'DIVIDEND', Blockly.Arduino.ORDER_MODULUS) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'DIVISOR', Blockly.Arduino.ORDER_MODULUS) || '0';
    var code = argument0 + ' % ' + argument1;
    return [code, Blockly.Arduino.ORDER_MODULUS];
};

Blockly.Arduino['math_constrain'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'LOW', Blockly.Arduino.ORDER_NONE) || '0';
    var argument2 = Blockly.Arduino.valueToCode(block, 'HIGH', Blockly.Arduino.ORDER_NONE) || '0';
    var code = 'constrain(' + argument0 + ', ' + argument1 + ', ' + argument2 + ')';
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_random_int'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_NONE) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'TO', Blockly.Arduino.ORDER_NONE) || '0';
    var code = 'random(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['math_random_float'] = function (block) {
    return ['random(0.0, 1.0)', Blockly.Arduino.ORDER_FUNCTION_CALL];
};

//END MATH

//TEXT
Blockly.Arduino.quote_ = function(string) {
    string = string.replace(/\\/g, '\\\\')
                   .replace(/\n/g, '\\\n')
                   .replace(/'/g, '\\\'');
    return '"' + string + '"';
};

Blockly.Arduino['text'] = function (block) {
    const code = Blockly.Arduino.quote_(block.getFieldValue('TEXT'));
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['text_join'] = function (block) {
    var code;
    if (block.itemCount_ === 0) {
        return ['\'\'', Blockly.Arduino.ORDER_ATOMIC];
    } else if (block.itemCount_ === 1) {
        var argument0 = Blockly.Arduino.valueToCode(block, 'ADD0', Blockly.Arduino.ORDER_NONE) || '\'\'';
        code = 'String(' + argument0 + ')';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else {
        var argument0 = Blockly.Arduino.valueToCode(block, 'ADD0', Blockly.Arduino.ORDER_NONE) || '\'\'';
        var argument1 = Blockly.Arduino.valueToCode(block, 'ADD1', Blockly.Arduino.ORDER_NONE) || '\'\'';
        code = 'String(' + argument0 + ') + String(' + argument1 + ')';
        for (var n = 2; n < block.itemCount_; n++) {
            argument1 = Blockly.Arduino.valueToCode(block, 'ADD' + n, Blockly.Arduino.ORDER_NONE) || '\'\'';
            code = code + ' + String(' + argument1 + ')';
        }
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    }
};

Blockly.Arduino['text_append'] = function (block) {
    var varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    var argument0 = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '\'\'';
    return varName + ' += ' + argument0 + ';\n';
};

Blockly.Arduino['text_length'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    return [argument0 + '.length()', Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_isEmpty'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    return [argument0 + '.isEmpty()', Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_indexOf'] = function (block) {
    var operator = block.getFieldValue('END') === 'FIRST' ? 'indexOf' : 'lastIndexOf';
    var argument0 = Blockly.Arduino.valueToCode(block, 'FIND', Blockly.Arduino.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    var code = argument1 + '.' + operator + '(' + argument0 + ')';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_charAt'] = function (block) {
    var where = block.getFieldValue('WHERE') || 'FROM_START';
    var textOrder = (where === 'RANDOM') ? Blockly.Arduino.ORDER_NONE : Blockly.Arduino.ORDER_UNARY_POSTFIX;
    var text = Blockly.Arduino.valueToCode(block, 'VALUE', textOrder) || '\'\'';
    var code;
    if (where === 'FIRST') {
        code = text + '.charAt(0)';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (where === 'LAST') {
        code = text + '.charAt(' + text + '.length() - 1)';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (where === 'FROM_START') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT');
        code = text + '.charAt(' + at + ')';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (where === 'FROM_END') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT', 1, true);
        code = text + '.charAt(' + text + '.length() - ' + at + ')';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (where === 'RANDOM') {
        var functionName = Blockly.Arduino.provideFunction_(
            'textRandomLetter',
            ['String ' + Blockly.Arduino.FUNCTION_NAME_PLACEHOLDER_ + '(String text) {',
                '  int x = random(text.length());',
                '  return text.charAt(x);',
                '}']);
        code = functionName + '(' + text + ')';
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    }
    throw Error('Unhandled option (text_charAt).');
};

Blockly.Arduino['text_getSubstring'] = function (block) {
    var text = Blockly.Arduino.valueToCode(block, 'STRING', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    var where1 = block.getFieldValue('WHERE1');
    var where2 = block.getFieldValue('WHERE2');
    var at1 = Blockly.Arduino.valueToCode(block, 'AT1', Blockly.Arduino.ORDER_NONE) || '1';
    var at2 = Blockly.Arduino.valueToCode(block, 'AT2', Blockly.Arduino.ORDER_NONE) || '1';
    var code;
    if (where1 === 'FROM_END') {
        at1 = text + '.length() - ' + at1;
    } else if (where1 === 'FIRST') {
        at1 = '0';
    }
    if (where2 === 'FROM_END') {
        at2 = text + '.length() - ' + at2 + ' + 1';
    } else if (where2 === 'LAST') {
        at2 = text + '.length()';
    }
    code = text + '.substring(' + at1 + ', ' + at2 + ')';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_changeCase'] = function (block) {
    var operator = block.getFieldValue('CASE');
    var argument0 = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    var code;
    if (operator === 'UPPERCASE') {
        code = argument0 + '.toUpperCase()';
    } else if (operator === 'LOWERCASE') {
        code = argument0 + '.toLowerCase()';
    } else if (operator === 'TITLECASE') {
        var functionName = Blockly.Arduino.provideFunction_(
            'textToTitleCase',
            ['String ' + Blockly.Arduino.FUNCTION_NAME_PLACEHOLDER_ + '(String str) {',
                '  return str.toLowerCase().replace(/\\b\\w/g, function (m) {return m.toUpperCase();});',
                '}']);
        code = functionName + '(' + argument0 + ')';
    }
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_trim'] = function (block) {
    var OPERATORS = {
        'LEFT': '.trimStart()',
        'RIGHT': '.trimEnd()',
        'BOTH': '.trim()'
    };
    var operator = OPERATORS[block.getFieldValue('MODE')];
    var argument0 = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    return [argument0 + operator, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['text_print'] = function(block) {
    var mode = block.getFieldValue('MODE');
    var argument0 = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';

    // Verificar se o value é um array e pegar o primeiro elemento
    if (Array.isArray(argument0)) {
        argument0 = argument0[0];
    }

    // Remover os parênteses externos e as aspas
    argument0 = cleanAndStoreText(argument0, 1, -1);

    if (mode === 'PRINTLN') {
        return 'Serial.println(' + argument0 + ');\n';
    } else {
        return 'Serial.print(' + argument0 + ');\n';
    }
};

Blockly.Arduino['text_prompt_ext'] = function (block) {
    var msg = Blockly.Arduino.quote_(block.getFieldValue('TEXT'));
    var code = 'Serial.println(' + msg + ');\n';
    return code;
};
//END TEXT

Blockly.Arduino['lists_create_with'] = function (block) {
    var code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
        code[n] = Blockly.Arduino.valueToCode(block, 'ADD' + n, Blockly.Arduino.ORDER_NONE) || 'null';
    }
    code = '[' + code.join(', ') + ']';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['lists_repeat'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'ITEM', Blockly.Arduino.ORDER_NONE) || 'null';
    var argument1 = Blockly.Arduino.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
    var code = 'Array(' + argument1 + ').fill(' + argument0 + ')';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['lists_length'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '[]';
    return [argument0 + '.length', Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['lists_isEmpty'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '[]';
    return ['!' + argument0 + '.length', Blockly.Arduino.ORDER_LOGICAL_NOT];
};

Blockly.Arduino['lists_indexOf'] = function (block) {
    var argument0 = Blockly.Arduino.valueToCode(block, 'FIND', Blockly.Arduino.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '[]';
    var code = argument1 + '.indexOf(' + argument0 + ')';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['lists_getIndex'] = function (block) {
    var mode = block.getFieldValue('MODE') || 'GET';
    var where = block.getFieldValue('WHERE') || 'FROM_START';
    var listOrder = (where === 'RANDOM') ? Blockly.Arduino.ORDER_NONE : Blockly.Arduino.ORDER_UNARY_POSTFIX;
    var list = Blockly.Arduino.valueToCode(block, 'VALUE', listOrder) || '[]';
    var code;
    if (where === 'FIRST') {
        code = list + '[0]';
    } else if (where === 'LAST') {
        code = list + '[' + list + '.length - 1]';
    } else if (where === 'FROM_START') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT');
        code = list + '[' + at + ']';
    } else if (where === 'FROM_END') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT', 1, true);
        code = list + '[' + list + '.length - ' + at + ']';
    } else if (where === 'RANDOM') {
        var functionName = Blockly.Arduino.provideFunction_(
            'listsGetRandomItem',
            ['function ' + Blockly.Arduino.FUNCTION_NAME_PLACEHOLDER_ + '(list, remove) {',
                '  var x = Math.floor(Math.random() * list.length);',
                '  if (remove) {',
                '    return list.splice(x, 1)[0];',
                '  } else {',
                '    return list[x];',
                '  }',
                '}']);
        code = functionName + '(' + list + ', ' + (mode !== 'GET') + ')';
    }
    if (mode === 'GET') {
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (mode === 'GET_REMOVE') {
        return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
    } else if (mode === 'REMOVE') {
        return code + ';\n';
    }
    throw Error('Unhandled combination (lists_getIndex).');
};

Blockly.Arduino['lists_setIndex'] = function (block) {
    var list = Blockly.Arduino.valueToCode(block, 'LIST', Blockly.Arduino.ORDER_ASSIGNMENT) || '[]';
    var mode = block.getFieldValue('MODE') || 'SET';
    var where = block.getFieldValue('WHERE') || 'FROM_START';
    var value = Blockly.Arduino.valueToCode(block, 'TO', Blockly.Arduino.ORDER_ASSIGNMENT) || 'null';
    var code;
    if (where === 'FIRST') {
        code = list + '[0]';
    } else if (where === 'LAST') {
        code = list + '[' + list + '.length - 1]';
    } else if (where === 'FROM_START') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT');
        code = list + '[' + at + ']';
    } else if (where === 'FROM_END') {
        var at = Blockly.Arduino.getAdjusted(block, 'AT', 1, true);
        code = list + '[' + list + '.length - ' + at + ']';
    } else if (where === 'RANDOM') {
        var functionName = Blockly.Arduino.provideFunction_(
            'listsGetRandomItem',
            ['function ' + Blockly.Arduino.FUNCTION_NAME_PLACEHOLDER_ + '(list) {',
                '  var x = Math.floor(Math.random() * list.length);',
                '  return x;',
                '}']);
        code = functionName + '(' + list + ')';
    }
    if (mode === 'SET') {
        return list + '[' + code + '] = ' + value + ';\n';
    } else if (mode === 'INSERT') {
        return list + '.splice(' + code + ', 0, ' + value + ');\n';
    }
    throw Error('Unhandled combination (lists_setIndex).');
};

Blockly.Arduino['lists_getSublist'] = function (block) {
    var list = Blockly.Arduino.valueToCode(block, 'LIST', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '[]';
    var where1 = block.getFieldValue('WHERE1');
    var where2 = block.getFieldValue('WHERE2');
    var at1 = Blockly.Arduino.valueToCode(block, 'AT1', Blockly.Arduino.ORDER_NONE) || '1';
    var at2 = Blockly.Arduino.valueToCode(block, 'AT2', Blockly.Arduino.ORDER_NONE) || '1';
    var code;
    if (where1 === 'FROM_END') {
        at1 = list + '.length - ' + at1;
    } else if (where1 === 'FIRST') {
        at1 = '0';
    }
    if (where2 === 'FROM_END') {
        at2 = list + '.length - ' + at2 + ' + 1';
    } else if (where2 === 'LAST') {
        at2 = list + '.length';
    }
    code = list + '.slice(' + at1 + ', ' + at2 + ')';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['lists_split'] = function (block) {
    var input = Blockly.Arduino.valueToCode(block, 'INPUT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
    var delimiter = Blockly.Arduino.valueToCode(block, 'DELIM', Blockly.Arduino.ORDER_NONE) || '\'\'';
    var mode = block.getFieldValue('MODE');
    if (mode === 'SPLIT') {
        var code = input + '.split(' + delimiter + ')';
    } else if (mode === 'JOIN') {
        var code = input + '.join(' + delimiter + ')';
    }
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['lists_sort'] = function (block) {
    var list = Blockly.Arduino.valueToCode(block, 'LIST', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '[]';
    var direction = block.getFieldValue('DIRECTION') === '1' ? '1' : '-1';
    var type = block.getFieldValue('TYPE');
    var getCompareFunctionName = Blockly.Arduino.provideFunction_(
        'listsGetSortCompare',
        ['function ' + Blockly.Arduino.FUNCTION_NAME_PLACEHOLDER_ + '(type, direction) {',
            '  var compare = function (a, b) {',
            '    if (a < b) return -1 * direction;',
            '    if (a > b) return 1 * direction;',
            '    return 0;',
            '  };',
            '  return compare;',
            '}']);
    var code = list + '.slice().sort(' + getCompareFunctionName + '("' + type + '", ' + direction + '))';
    return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
};

Blockly.Arduino['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};

Blockly.FieldVariable.prototype.getVariableList = function(opt_type) {
    var variableModelList = this.workspace.getVariablesOfType(opt_type || '');
    variableModelList.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    var variableNames = variableModelList.map(variable => [variable.name, variable.getId()]);
    return variableNames;
};

// Geradores de Variáveis
Blockly.Arduino['variables_declare_number'] = function(block) {
    var varName = block.getFieldValue('VAR_NAME');
    var type = block.getFieldValue('TYPE');
    var value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';

    if (typeof value[0] === 'string') {
        value = value[0].replace(/[()]/g, '');
    }

    var code = type + ' ' + varName + ' = ' + value + ';\n';
    Blockly.Arduino.definitions_['var_' + varName] = code;
    return code;
};

Blockly.Arduino['variables_declare_text'] = function(block) {
    var varName = block.getFieldValue('VAR_NAME');
    var type = block.getFieldValue('TYPE');
    var value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '""';

    if (Array.isArray(value)) {
      value = value[0]
    }

    // Remover os parênteses externos e as aspas
    value = cleanAndStoreText(value, 1, -1);

    if (type === 'char') {
        var arraySize = 15;
        if (value.includes(',')) {
            value = '{' + value + '}';
        } else if (value.includes('"')) {
            arraySize = Math.max(arraySize, value.length - 2 + 1);
        }
        var code = type + ' ' + varName + '[' + arraySize + '] = ' + value + ';\n';
    } else {
        var code = type + ' ' + varName + ' = ' + value + ';\n';
    }

    Blockly.Arduino.definitions_['var_' + varName] = code;
    return code;
};

Blockly.Arduino['variables_declare_boolean'] = function(block) {
    var varName = block.getFieldValue('VAR_NAME');
    var value = block.getFieldValue('TYPE');
    var code = 'bool ' + varName + ' = ' + value + ';\n';
    Blockly.Arduino.definitions_['var_' + varName] = code;
    return code;
};

//Get
// Gerador de código para obter variáveis do tipo número
Blockly.Arduino['variables_get_number'] = function(block) {
    var varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Names.NameType.VARIABLE);
    return [varName, Blockly.Arduino.ORDER_ATOMIC];
};

// Gerador de código para obter variáveis do tipo texto
Blockly.Arduino['variables_get_text'] = function(block) {
    var varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Names.NameType.VARIABLE);
    return [varName, Blockly.Arduino.ORDER_ATOMIC];
};


// Gerador de código para obter variáveis do tipo booleano
Blockly.Arduino['variables_get_boolean'] = function(block) {
    var varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Names.NameType.VARIABLE);
    return [varName, Blockly.Arduino.ORDER_ATOMIC];
};


// Geradores de Funções
Blockly.Arduino['procedures_defnoreturn'] = function(block) {
  var branch = Blockly.Arduino.statementToCode(block, 'STACK');
  branch = Blockly.Arduino.addLoopTrap(branch, block.id) || '';
  branch = Blockly.Arduino.prefixLines(branch, '  ');  // Add indentation
  
  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);
  const code = 'void ' + funcName + '() {\n' + branch + '\n}';

  // Adiciona o código dos blocos conectados
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
      code += Blockly.Arduino.blockToCode(nextBlock);
  }
  //Blockly.Arduino.definitions_[funcName] = code;
  return code;
};

Blockly.Arduino['procedures_defreturn'] = function(block) {
  var branch = Blockly.Arduino.statementToCode(block, 'STACK');
  branch = Blockly.Arduino.addLoopTrap(branch, block.id) || '';
  branch = Blockly.Arduino.prefixLines(branch, '  ');  // Add indentation
  const returnValue = Blockly.Arduino.valueToCode(block, 'RETURN', Blockly.Arduino.ORDER_NONE) || '';

  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);

  const returnType = returnValue ? 'int' : 'void';
  const code = returnType + ' ' + funcName + '() {\n' + branch + (returnValue ? '  return ' + returnValue + ';\n' : '') + '}\n';

  // Adiciona o código dos blocos conectados
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
      code += Blockly.Arduino.blockToCode(nextBlock);
  }

  return code;
};

Blockly.Arduino['procedures_callreturn'] = function(block) {
  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);
  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Arduino.valueToCode(block, 'ARG' + i, Blockly.Arduino.ORDER_NONE) || 'null';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
};

Blockly.Arduino['procedures_callnoreturn'] = function(block) {
  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Names.NameType.PROCEDURE);
  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Arduino.valueToCode(block, 'ARG' + i, Blockly.Arduino.ORDER_NONE) || 'null';
  }
  const code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Arduino['procedures_ifreturn'] = function(block) {
  const condition = Blockly.Arduino.valueToCode(block, 'CONDITION', Blockly.Arduino.ORDER_NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    const value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
//End functions

Blockly.Generator.prototype.valueToCode = function(block, name, outerOrder) {
  if (isNaN(outerOrder)) {
    throw Error('Expecting valid order from block: ' + block);
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return ['', Blockly.Generator.ORDER_ATOMIC];
  }

  var tuple = this.blockToCode(targetBlock);
  if (!Array.isArray(tuple)) {
    tuple = [tuple, Blockly.Arduino.ORDER_ATOMIC];
  }
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (isNaN(innerOrder)) {
    throw Error('Expecting valid order from value block: ' + targetBlock.type);
  }
  if (code && outerOrder <= innerOrder) {
    code = '(' + code + ')';
  }
  return [code, innerOrder];
};

Blockly.Generator.prototype.statementToCode = function(block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return ''; // Se não há bloco conectado, retorna string vazia
  }
  var code = this.blockToCode(targetBlock);
  if (Array.isArray(code)) {
    code = code[0]; // Usa o primeiro elemento do array se for um array
  }

  return code;
};

Blockly.Arduino.blockToCode = function(block) {
  if (!block) {
    return '';
  }

  if (block.isEnabled() && !block.hasDisabledReason()) {
    var func = this[block.type];
    if (typeof func !== 'function') {
      throw Error('Language "Arduino" does not know how to generate code for block type "' + block.type + '".');
    }
    var code = func.call(this, block);

    if (Array.isArray(code)) {
      return code[0] + this.scrub_(block, code[1]);
    } else {
      return this.scrub_(block, code);
    }
  } else {
    return this.scrub_(block, '');
  }
};

function cleanAndStoreText(text, startIndex, endIndex) {
    if (text.startsWith('(') && text.endsWith(')')) {
        let cleanedString = text.slice(startIndex, endIndex);
        let resultList = [cleanedString];
        return resultList[0];
    } else {
        return text;
    }
}

//Custom code
Blockly.Arduino['custom_code'] = function(block) {
  var code = block.getFieldValue('CUSTOM_CODE') + ';\n';
  return code;
};


