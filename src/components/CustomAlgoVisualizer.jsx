import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Play, Pause, StepForward, StepBack, RotateCcw, Terminal, Code2, CircleAlert } from 'lucide-react';
import './CustomAlgoVisualizer.css';

const DEFAULT_JS_CODE = `// JavaScript runner\n// APIs: readInput(name, type), step(line, vars, note), print(...args)\n\nconst n = readInput("n", "int");\nconst arr = [];\n\nfor (let i = 0; i < n; i++) {\n  const value = readInput(\`arr[\${i}]\`, "number");\n  arr.push(value);\n  step(9, { i, value, arr: [...arr] }, "Input captured");\n}\n\nlet sum = 0;\nfor (let i = 0; i < arr.length; i++) {\n  sum += arr[i];\n  step(15, { i, current: arr[i], sum, n, arr: [...arr] }, "Accumulating sum");\n}\n\nconst average = sum / n;\nstep(19, { sum, n, average }, "Computed result");\nprint("Average =", average);`;

const DEFAULT_CPP_CODE = `// C++ mode (browser visualization subset)\n// APIs available: readInput(name, type), step(line, vars, note), print(...)\n\nint n = readInput("n", "int");\nvector<int> arr;\n\nfor (int i = 0; i < n; i++) {\n    int value = readInput(\`arr[\${i}]\`, "number");\n    arr.push_back(value);\n    step(9, { i, value, arr }, "Input captured");\n}\n\nint sum = 0;\nfor (int i = 0; i < arr.size(); i++) {\n    sum += arr[i];\n    step(15, { i, current: arr[i], sum, n, arr }, "Accumulating sum");\n}\n\ndouble average = (double)sum / n;\nstep(19, { sum, n, average }, "Computed result");\nprint("Average =", average);`;

const DEFAULT_JAVA_CODE = `// Java mode (browser visualization subset)\n// APIs available: readInput(name, type), step(line, vars, note), print(...)\n\nint n = readInput("n", "int");\nint[] arr = new int[n];\n\nfor (int i = 0; i < n; i++) {\n    arr[i] = readInput(\`arr[\${i}]\`, "number");\n    step(9, { i, value: arr[i], arr }, "Input captured");\n}\n\nint sum = 0;\nfor (int i = 0; i < arr.length; i++) {\n    sum += arr[i];\n    step(15, { i, current: arr[i], sum, n, arr }, "Accumulating sum");\n}\n\ndouble average = (double) sum / n;\nstep(19, { sum, n, average }, "Computed result");\nprint("Average =", average);`;

const LANGUAGE_META = {
  javascript: { label: 'JavaScript', badge: 'JS' },
  cpp: { label: 'C++', badge: 'C++' },
  java: { label: 'Java', badge: 'Java' },
};

function extractBalancedBodyFromMatch(code, matcher) {
  const match = matcher.exec(code);
  if (!match || match.index < 0) return code;

  const openBraceIndex = code.indexOf('{', match.index);
  if (openBraceIndex < 0) return code;

  let depth = 1;
  let cursor = openBraceIndex + 1;
  while (cursor < code.length && depth > 0) {
    const ch = code[cursor];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    cursor += 1;
  }

  if (depth !== 0) return code;

  const body = code.slice(openBraceIndex + 1, cursor - 1);
  const leadingLineCount = code.slice(0, openBraceIndex + 1).split('\n').length;

  // Preserve original line numbers so highlighted execution lines match the editor view.
  return `${'\n'.repeat(Math.max(0, leadingLineCount))}${body}`;
}

function extractBalancedBodyFromOpenBrace(code, openBraceIndex) {
  if (openBraceIndex < 0) return null;

  let depth = 1;
  let cursor = openBraceIndex + 1;
  while (cursor < code.length && depth > 0) {
    const ch = code[cursor];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    cursor += 1;
  }

  if (depth !== 0) return null;
  return {
    body: code.slice(openBraceIndex + 1, cursor - 1),
    endIndex: cursor,
  };
}

function normalizeJavaParamList(params) {
  if (!params || !params.trim()) return '';
  return params
    .split(',')
    .map((param) => param.trim())
    .filter(Boolean)
    .map((param) => {
      const cleaned = param.replace(/\bfinal\b/g, '').trim();
      const tokens = cleaned.split(/\s+/);
      if (tokens.length === 0) return '';
      return tokens[tokens.length - 1].replace(/\[\]/g, '').replace(/\.\.\./g, '').trim();
    })
    .filter(Boolean)
    .join(', ');
}

function extractJavaHelperFunctions(code) {
  const methodRegex = /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:synchronized\s+)?(?:[A-Za-z_][\w<>\[\],?]*)\s+([A-Za-z_][\w]*)\s*\(([^)]*)\)\s*(?:throws\s+[^{]+)?\s*\{/g;
  const functions = [];
  let match;

  while ((match = methodRegex.exec(code)) !== null) {
    const methodName = match[1];
    if (methodName === 'main') continue;

    const signatureSlice = code.slice(Math.max(0, match.index - 12), match.index);
    if (/\b(class|interface|enum)\b/.test(signatureSlice)) continue;

    const openBraceIndex = code.indexOf('{', match.index);
    const block = extractBalancedBodyFromOpenBrace(code, openBraceIndex);
    if (!block) continue;

    const params = normalizeJavaParamList(match[2]);
    functions.push(`function ${methodName}(${params}) {${block.body}}`);
    methodRegex.lastIndex = block.endIndex;
  }

  return functions.join('\n\n');
}

function transpileCppToJs(code) {
  let transformed = extractBalancedBodyFromMatch(code, /(?:int|void)\s+main\s*\([^)]*\)\s*\{/m);
  transformed = transformed.replace(/^\s*#include.*$/gm, '');
  transformed = transformed.replace(/^\s*using\s+namespace\s+std\s*;\s*$/gm, '');
  transformed = transformed.replace(/\bstd::/g, '');
  transformed = transformed.replace(/^\s*return\s+0\s*;\s*$/gm, '');
  transformed = transformed.replace(/\.push_back\(/g, '.push(');
  transformed = transformed.replace(/\.size\(\)/g, '.length');

  transformed = transformed.replace(/\b(?:int|long|float|double|bool|char|string)\s+([A-Za-z_][\w]*)\s*\[\s*\]\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');
  transformed = transformed.replace(/\b(?:int|long|float|double|bool|char|string)\s+([A-Za-z_][\w]*)\s*\[\s*(\d+)\s*\]\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$3];');
  transformed = transformed.replace(/\b(?:int|long|float|double|bool|char|string)\s+([A-Za-z_][\w]*)\s*\[\s*(\d+)\s*\]\s*;/g, 'let $1 = Array($2).fill(0);');

  transformed = transformed.replace(/\bvector\s*<[^>]+>\s+([A-Za-z_][\w]*)\s*\(\s*([^)]+)\s*\)\s*;/g, 'let $1 = Array($2).fill(0);');
  transformed = transformed.replace(/\bvector\s*<[^>]+>\s+([A-Za-z_][\w]*)\s*;/g, 'let $1 = [];');
  transformed = transformed.replace(/\b(?:int|long|float|double|bool|string|char)\s+([A-Za-z_][\w]*)\s*=/g, 'let $1 =');
  transformed = transformed.replace(/\b(?:int|long|float|double|bool|string|char)\s+([A-Za-z_][\w]*)\s*;/g, 'let $1;');
  transformed = transformed.replace(/\(double\)\s*([A-Za-z_][\w]*)\s*\/\s*([A-Za-z_][\w]*)/g, '(Number($1) / $2)');

  transformed = transformed.replace(/cout\s*<<\s*([^;]+);/g, (_, content) => {
    const pieces = content
      .split('<<')
      .map((p) => p.trim())
      .filter((p) => p && p !== 'endl');
    return `print(${pieces.join(', ')});`;
  });

  transformed = transformed.replace(/cin\s*>>\s*([^;]+);/g, (_, content) => {
    const targets = content.split('>>').map((item) => item.trim()).filter(Boolean);
    const assignments = targets.map((target) => {
      if (/^[A-Za-z_][\w]*\[[^\]]+\]$/.test(target)) {
        const baseName = target.split('[')[0];
        const inside = target.slice(target.indexOf('[') + 1, -1).trim();
        return `${target} = readInput(\`${baseName}[\${${inside}}]\`, "number");`;
      }
      return `${target} = readInput("${target}", "number");`;
    });
    return assignments.join(' ');
  });

  return transformed;
}

function transpileJavaToJs(code) {
  const helpers = extractJavaHelperFunctions(code);
  let transformed = extractBalancedBodyFromMatch(code, /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/m);
  if (helpers.trim()) {
    transformed = `${helpers}\n\n${transformed}`;
  }
  transformed = transformed.replace(/^\s*package\s+.*$/gm, '');
  transformed = transformed.replace(/^\s*import\s+.*$/gm, '');
  transformed = transformed.replace(/^\s*public\s+class\s+.*$/gm, '');
  transformed = transformed.replace(/^\s*public\s+static\s+void\s+main\s*\([^)]*\)\s*\{\s*$/gm, '');
  transformed = transformed.replace(/^\s*Scanner\s+\w+\s*=\s*new\s+Scanner\s*\([^)]*\)\s*;\s*$/gm, '');

  transformed = transformed.replace(/System\.out\.println\s*\(([^)]*)\)\s*;/g, 'print($1);');
  transformed = transformed.replace(/System\.out\.print\s*\(([^)]*)\)\s*;/g, 'print($1);');

  transformed = transformed.replace(/\bStack\s*<[^>]+>\s+([A-Za-z_][\w]*)\s*=\s*new\s+Stack\s*<[^>]*>\s*\(\s*\)\s*;/g, 'let $1 = [];');
  transformed = transformed.replace(/\bStack\s*<[^>]+>\s+([A-Za-z_][\w]*)\s*;/g, 'let $1 = [];');
  transformed = transformed.replace(/([A-Za-z_][\w]*)\.peek\(\)/g, '$1[$1.length - 1]');
  transformed = transformed.replace(/([A-Za-z_][\w]*)\.(?:empty|isEmpty)\(\)/g, '($1.length === 0)');

  transformed = transformed.replace(/\b(?:final\s+)?(?:ListNode|LinkedListNode|Node)\s+([A-Za-z_][\w]*)\s*=/g, 'let $1 =');
  transformed = transformed.replace(/\b(?:final\s+)?(?:ListNode|LinkedListNode|Node)\s+([A-Za-z_][\w]*)\s*;/g, 'let $1;');
  transformed = transformed.replace(/new\s+(?:ListNode|LinkedListNode|Node)\s*\(([^)]*)\)/g, '({ val: $1, next: null })');

  transformed = transformed.replace(/\b(?:int|long|float|double|boolean|String|char|Integer|Long|Float|Double|Boolean|Character)\s*\[\]\s+([A-Za-z_][\w]*)\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');

  transformed = transformed.replace(/([A-Za-z_][\w]*)\s*=\s*[A-Za-z_][\w]*\.nextInt\(\)\s*;/g, '$1 = readInput("$1", "int");');
  transformed = transformed.replace(/([A-Za-z_][\w]*)\s*=\s*[A-Za-z_][\w]*\.nextDouble\(\)\s*;/g, '$1 = readInput("$1", "number");');
  transformed = transformed.replace(/([A-Za-z_][\w]*)\s*=\s*[A-Za-z_][\w]*\.nextLine\(\)\s*;/g, '$1 = readInput("$1", "string");');

  transformed = transformed.replace(/([A-Za-z_][\w]*)\s*\[\s*([^\]]+)\s*\]\s*=\s*[A-Za-z_][\w]*\.nextInt\(\)\s*;/g, (_, arrName, indexExpr) => {
    return `${arrName}[${indexExpr}] = readInput(\`${arrName}[\${${indexExpr}}]\`, "int");`;
  });
  transformed = transformed.replace(/([A-Za-z_][\w]*)\s*\[\s*([^\]]+)\s*\]\s*=\s*[A-Za-z_][\w]*\.nextDouble\(\)\s*;/g, (_, arrName, indexExpr) => {
    return `${arrName}[${indexExpr}] = readInput(\`${arrName}[\${${indexExpr}}]\`, "number");`;
  });

  // Java enhanced-for: for (Integer elem : arr) { ... } -> for (const elem of arr) { ... }
  transformed = transformed.replace(/for\s*\(\s*(?:int|long|float|double|boolean|String|char|Integer|Long|Float|Double|Boolean|Character)\s+([A-Za-z_][\w]*)\s*:\s*([A-Za-z_][\w]*)\s*\)/g, 'for (const $1 of $2)');

  transformed = transformed.replace(/\b(?:int|long|float|double|boolean|String|char|Integer|Long|Float|Double|Boolean|Character)\s*\[\]\s+([A-Za-z_][\w]*)\s*=\s*new\s+\w+\s*\[\s*([^\]]+)\s*\]\s*;/g, 'let $1 = Array($2).fill(0);');
  transformed = transformed.replace(/\b(?:int|long|float|double|boolean|String|char|Integer|Long|Float|Double|Boolean|Character)\s+([A-Za-z_][\w]*)\s*=/g, 'let $1 =');
  transformed = transformed.replace(/\b(?:int|long|float|double|boolean|String|char|Integer|Long|Float|Double|Boolean|Character)\s+([A-Za-z_][\w]*)\s*;/g, 'let $1;');
  transformed = transformed.replace(/\b(?:final\s+)?[A-Z][A-Za-z0-9_]*\s+([A-Za-z_][\w]*)\s*=/g, 'let $1 =');
  transformed = transformed.replace(/\b(?:final\s+)?[A-Z][A-Za-z0-9_]*\s+([A-Za-z_][\w]*)\s*;/g, 'let $1;');
  transformed = transformed.replace(/\(double\)\s*([A-Za-z_][\w]*)\s*\/\s*([A-Za-z_][\w]*)/g, '(Number($1) / $2)');

  return transformed;
}

function compileToExecutableJs(code, language) {
  if (language === 'javascript') return code;
  if (language === 'cpp') return transpileCppToJs(code);
  if (language === 'java') return transpileJavaToJs(code);
  return code;
}

function parseArrayInputKeys(code) {
  const keys = new Set();
  const add = (name) => {
    if (/^[A-Za-z_][\w]*$/.test(name)) keys.add(name);
  };

  const jsTemplateRegex = /readInput\(\s*`([^`]+)`/g;
  let match;
  while ((match = jsTemplateRegex.exec(code)) !== null) {
    const template = match[1];
    const baseMatch = template.match(/^([A-Za-z_][\w]*)\[\$\{[^}]+\}\]$/);
    if (baseMatch) add(baseMatch[1]);
  }

  const scannerArrayRegex = /([A-Za-z_][\w]*)\s*\[\s*[^\]]+\s*\]\s*=\s*[A-Za-z_][\w]*\.(?:nextInt|nextDouble|nextLine)\(\)\s*;/g;
  while ((match = scannerArrayRegex.exec(code)) !== null) {
    add(match[1]);
  }

  const cinArrayRegex = /cin\s*>>\s*([A-Za-z_][\w]*)\s*\[\s*[^\]]+\s*\]\s*;/g;
  while ((match = cinArrayRegex.exec(code)) !== null) {
    add(match[1]);
  }

  return [...keys];
}

function buildArrayInputKeys(code, inputValues) {
  const arrayLength = Number.parseInt(inputValues.n, 10);
  if (!Number.isFinite(arrayLength) || arrayLength < 0) return [];

  const arrayNames = parseArrayInputKeys(code);
  const keys = [];
  for (const baseName of arrayNames) {
    for (let index = 0; index < arrayLength; index += 1) {
      keys.push(`${baseName}[${index}]`);
    }
  }
  return keys;
}

function parseStructureHints(code, language) {
  const stackVars = new Set();
  const queueVars = new Set();

  let match;
  const javaStackRegex = /\bStack\s*<[^>]+>\s+([A-Za-z_][\w]*)/g;
  while ((match = javaStackRegex.exec(code)) !== null) {
    stackVars.add(match[1]);
  }

  const cppStackRegex = /\bstack\s*<[^>]+>\s+([A-Za-z_][\w]*)/g;
  while ((match = cppStackRegex.exec(code)) !== null) {
    stackVars.add(match[1]);
  }

  const javaQueueRegex = /\b(?:Queue|Deque)\s*<[^>]+>\s+([A-Za-z_][\w]*)/g;
  while ((match = javaQueueRegex.exec(code)) !== null) {
    queueVars.add(match[1]);
  }

  if (language === 'javascript') {
    const nameHintRegex = /\b(?:const|let|var)\s+([A-Za-z_][\w]*)/g;
    while ((match = nameHintRegex.exec(code)) !== null) {
      const lower = match[1].toLowerCase();
      if (lower.includes('stack')) stackVars.add(match[1]);
      if (lower.includes('queue') || lower.includes('deque')) queueVars.add(match[1]);
    }
  }

  return {
    stack: [...stackVars],
    queue: [...queueVars],
  };
}

function applyStructureHintsToVars(vars, structureHints) {
  if (!isPlainObject(vars)) return vars;

  const stackSet = new Set(structureHints.stack || []);
  const queueSet = new Set(structureHints.queue || []);
  const next = { ...vars };

  for (const [name, value] of Object.entries(next)) {
    if (!Array.isArray(value)) continue;
    if (stackSet.has(name)) {
      next[name] = { __vizType: 'stack', items: value };
      continue;
    }
    if (queueSet.has(name)) {
      next[name] = { __vizType: 'queue', items: value };
    }
  }

  return next;
}

function inferTrackedVariableNames(code) {
  const names = new Set();
  const add = (name) => {
    if (/^[A-Za-z_][\w]*$/.test(name)) names.add(name);
  };

  const declarationBlocks = code.match(/\b(?:let|const|var)\s+[^;]+;/g) || [];
  for (const block of declarationBlocks) {
    const sanitized = block
      .replace(/\b(?:let|const|var)\s+/, '')
      .replace(/;\s*$/, '');
    const parts = sanitized.split(',');
    for (const part of parts) {
      const lhs = part.split('=')[0]?.trim();
      if (!lhs) continue;
      add(lhs.replace(/\[[^\]]*\]/g, '').trim());
    }
  }

  const forDeclRegex = /for\s*\(\s*(?:let|var|const)\s+([A-Za-z_][\w]*)/g;
  let match;
  while ((match = forDeclRegex.exec(code)) !== null) {
    add(match[1]);
  }

  const assignmentRegex = /\b([A-Za-z_][\w]*)\s*=\s*[^=]/g;
  while ((match = assignmentRegex.exec(code)) !== null) {
    add(match[1]);
  }

  const excluded = new Set(['readInput', 'step', 'print', 'Math', 'Number', 'Array', 'Object', 'JSON', 'console']);
  return [...names].filter((name) => !excluded.has(name));
}

function shouldInjectStepForLine(trimmedLine) {
  if (!trimmedLine) return false;
  if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) return false;
  if (trimmedLine === '{' || trimmedLine === '}') return false;
  if (trimmedLine.startsWith('case ') || trimmedLine.startsWith('default:')) return false;
  if (trimmedLine.endsWith(':') && !trimmedLine.includes('?')) return false;

  const startsControl = /^(if|for|while|switch|catch)\b/.test(trimmedLine) || trimmedLine.startsWith('else');
  if (startsControl && !trimmedLine.endsWith('{')) return false;
  return true;
}

function instrumentExecutableJs(code) {
  const lines = code.split('\n');
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const originalLine = lines[index];
    output.push(originalLine);

    const trimmed = originalLine.trim();
    if (!shouldInjectStepForLine(trimmed)) continue;

    const leading = (originalLine.match(/^\s*/) || [''])[0];
    const injectedIndent = trimmed.endsWith('{') ? `${leading}  ` : leading;
    output.push(`${injectedIndent}__autoStep(${index + 1});`);
  }

  return output.join('\n');
}

function isSameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function parseInputKeys(code) {
  const keys = [];
  const addKey = (key) => {
    if (key && !keys.includes(key)) keys.push(key);
  };

  const regex = /readInput\(\s*["'`]([^"'`]+)["'`]/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    addKey(match[1]);
  }

  const scannerAssignRegex = /([A-Za-z_][\w]*(?:\[[^\]]+\])?)\s*=\s*[A-Za-z_][\w]*\.next(?:Int|Double|Line)\(\)\s*;/g;
  while ((match = scannerAssignRegex.exec(code)) !== null) {
    addKey(match[1]);
  }

  const cinLineRegex = /cin\s*>>\s*([^;]+);/g;
  while ((match = cinLineRegex.exec(code)) !== null) {
    const targets = match[1].split('>>').map((item) => item.trim()).filter(Boolean);
    for (const target of targets) addKey(target);
  }
  return keys;
}

function parseByType(raw, typeHint) {
  if (typeHint === 'string') return raw;
  if (typeHint === 'int') {
    const intVal = Number.parseInt(raw, 10);
    if (Number.isNaN(intVal)) throw new Error(`Input must be an integer: ${raw}`);
    return intVal;
  }
  const numberVal = Number(raw);
  if (Number.isNaN(numberVal)) throw new Error(`Input must be a number: ${raw}`);
  return numberVal;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatScalar(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

function snapshotValue(value, seen = new WeakMap()) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return value;

  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;

  if (Array.isArray(value)) {
    return value.map((item) => snapshotValue(item, seen));
  }

  if (value instanceof Map) {
    return {
      __vizType: 'map',
      entries: Array.from(value.entries()).map(([k, v]) => [snapshotValue(k, seen), snapshotValue(v, seen)]),
    };
  }

  if (value instanceof Set) {
    return {
      __vizType: 'set',
      values: Array.from(value.values()).map((entry) => snapshotValue(entry, seen)),
    };
  }

  if (!isPlainObject(value)) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }

  if (seen.has(value)) return '[Circular]';
  seen.set(value, true);

  const output = {};
  for (const [k, v] of Object.entries(value)) {
    output[k] = snapshotValue(v, seen);
  }
  return output;
}

function looksLikeAdjacencyList(value) {
  if (!isPlainObject(value)) return false;
  const entries = Object.values(value);
  if (entries.length === 0) return false;
  return entries.every((v) => Array.isArray(v));
}

function looksLikeLinkedListNode(value) {
  return isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, 'val') && Object.prototype.hasOwnProperty.call(value, 'next');
}

function looksLikeTreeNode(value) {
  return isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, 'val') && (Object.prototype.hasOwnProperty.call(value, 'left') || Object.prototype.hasOwnProperty.call(value, 'right'));
}

function inferArrayRole(varName = '') {
  const lower = varName.toLowerCase();
  if (lower.includes('stack')) return 'stack';
  if (lower.includes('queue') || lower.includes('deque')) return 'queue';
  if (lower.includes('heap') || lower.includes('priority')) return 'heap';
  return 'array';
}

function isMatrix(value) {
  return Array.isArray(value) && value.length > 0 && value.every((row) => Array.isArray(row));
}

function renderArrayCells(value, role = 'array') {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="custom-muted">empty array</span>;
  }

  const displayValues = role === 'stack' ? [...value].reverse() : value;
  return (
    <div className={`custom-array-vis ${role === 'stack' ? 'stack' : ''}`}>
      {displayValues.map((item, index) => {
        const sourceIndex = role === 'stack' ? value.length - 1 - index : index;
        return (
          <div key={`${sourceIndex}-${String(item)}`} className="custom-array-cell">
            <span className="custom-array-index">{sourceIndex}</span>
            <span className="custom-array-item">{isPlainObject(item) || Array.isArray(item) ? '...' : formatScalar(item)}</span>
            {role === 'queue' && sourceIndex === 0 && <span className="custom-array-tag">front</span>}
            {role === 'queue' && sourceIndex === value.length - 1 && <span className="custom-array-tag">rear</span>}
            {role === 'stack' && sourceIndex === value.length - 1 && <span className="custom-array-tag">top</span>}
          </div>
        );
      })}
    </div>
  );
}

function LinkedListView({ head }) {
  const nodes = [];
  const seen = new Set();
  let cursor = head;
  let guard = 0;

  while (cursor && guard < 30) {
    if (!isPlainObject(cursor)) {
      nodes.push({ value: cursor, terminal: true });
      break;
    }
    if (seen.has(cursor)) {
      nodes.push({ value: '[Cycle]', terminal: true });
      break;
    }
    seen.add(cursor);
    nodes.push({ value: cursor.val });
    cursor = cursor.next;
    guard += 1;
  }

  return (
    <div className="custom-seq-vis">
      {nodes.map((node, idx) => (
        <React.Fragment key={`${idx}-${String(node.value)}`}>
          <span className="custom-ll-node">
            <span className="custom-ll-val">{formatScalar(node.value)}</span>
            <span className="custom-ll-next">{idx < nodes.length - 1 ? 'next' : 'null'}</span>
          </span>
          {idx < nodes.length - 1 && <span className="custom-seq-arrow">-&gt;</span>}
        </React.Fragment>
      ))}
      <span className="custom-seq-null">null</span>
    </div>
  );
}

function TreePreview({ root }) {
  if (!looksLikeTreeNode(root)) {
    return <code className="custom-var-value">{JSON.stringify(root)}</code>;
  }

  const levels = [];
  let queue = [root];
  let depth = 0;
  const maxDepth = 4;

  while (queue.length > 0 && depth < maxDepth) {
    const nextQueue = [];
    const level = [];

    for (const node of queue) {
      if (!node) {
        level.push('null');
        continue;
      }
      level.push(formatScalar(node.val));
      if (looksLikeTreeNode(node.left) || node.left === null) nextQueue.push(node.left);
      if (looksLikeTreeNode(node.right) || node.right === null) nextQueue.push(node.right);
    }

    levels.push(level);
    if (nextQueue.every((node) => node === null)) break;
    queue = nextQueue;
    depth += 1;
  }

  return (
    <div className="custom-tree-vis">
      {levels.map((level, levelIdx) => (
        <div key={`level-${levelIdx}`} className="custom-tree-level">
          {level.map((entry, entryIdx) => (
            <span key={`${levelIdx}-${entryIdx}`} className="custom-tree-node">{entry}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function StructuredValue({ value, varName = '', depth = 0 }) {
  if (isPlainObject(value) && value.__vizType === 'stack') {
    return renderArrayCells(Array.isArray(value.items) ? value.items : [], 'stack');
  }

  if (isPlainObject(value) && value.__vizType === 'queue') {
    return renderArrayCells(Array.isArray(value.items) ? value.items : [], 'queue');
  }

  if (Array.isArray(value)) {
    if (isMatrix(value)) {
      return (
        <div className="custom-matrix-vis">
          {value.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="custom-matrix-row">
              <span className="custom-matrix-label">row {rowIdx}</span>
              {renderArrayCells(row, 'array')}
            </div>
          ))}
        </div>
      );
    }

    return renderArrayCells(value, inferArrayRole(varName));
  }

  if (isPlainObject(value) && value.__vizType === 'map') {
    const entries = Array.isArray(value.entries) ? value.entries : [];
    return (
      <div className="custom-map-vis">
        {entries.length === 0 ? (
          <span className="custom-muted">empty map</span>
        ) : (
          entries.map(([k, v], idx) => (
            <div key={`entry-${idx}`} className="custom-map-row">
              <span className="custom-map-key">{formatScalar(k)}</span>
              <span className="custom-map-arrow">=&gt;</span>
              <div className="custom-map-value"><StructuredValue value={v} depth={depth + 1} /></div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (isPlainObject(value) && value.__vizType === 'set') {
    const values = Array.isArray(value.values) ? value.values : [];
    return (
      <div className="custom-set-vis">
        {values.length === 0 ? (
          <span className="custom-muted">empty set</span>
        ) : (
          values.map((entry, idx) => (
            <span key={`set-${idx}`} className="custom-set-pill">{formatScalar(entry)}</span>
          ))
        )}
      </div>
    );
  }

  if (looksLikeLinkedListNode(value)) {
    return <LinkedListView head={value} />;
  }

  if (looksLikeTreeNode(value)) {
    return <TreePreview root={value} />;
  }

  if (looksLikeAdjacencyList(value)) {
    return (
      <div className="custom-graph-vis">
        {Object.entries(value).map(([node, neighbors]) => (
          <div key={node} className="custom-graph-row">
            <span className="custom-map-key">{node}</span>
            <span className="custom-map-arrow">-&gt;</span>
            <div className="custom-map-value">{renderArrayCells(neighbors, 'array')}</div>
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(value)) {
    if (depth > 1) {
      return <code className="custom-var-value">{JSON.stringify(value)}</code>;
    }
    return (
      <div className="custom-obj-vis">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="custom-obj-row">
            <span className="custom-obj-key">{k}</span>
            <div className="custom-obj-value">
              <StructuredValue value={v} varName={k} depth={depth + 1} />
            </div>
          </div>
        ))}
        {Object.keys(value).length === 0 && <span className="custom-muted">empty object</span>}
      </div>
    );
  }

  return <code className="custom-var-value">{formatScalar(value)}</code>;
}

export default function CustomAlgoVisualizer() {
  const [language, setLanguage] = useState('javascript');
  const [codeByLanguage, setCodeByLanguage] = useState({
    javascript: DEFAULT_JS_CODE,
    cpp: DEFAULT_CPP_CODE,
    java: DEFAULT_JAVA_CODE,
  });
  const [inputValues, setInputValues] = useState({
    n: '5',
    'arr[0]': '3',
    'arr[1]': '1',
    'arr[2]': '2',
    'arr[3]': '3',
    'arr[4]': '4',
  });
  const [steps, setSteps] = useState([]);
  const [outputLines, setOutputLines] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(true);

  const playTimerRef = useRef(null);
  const activeLineRef = useRef(null);

  const activeCode = codeByLanguage[language] || '';
  const inputKeys = useMemo(() => parseInputKeys(activeCode), [activeCode]);
  const currentStep = steps[currentStepIndex] || null;
  const codeLines = useMemo(() => activeCode.split('\n'), [activeCode]);
  const arrayInputKeys = useMemo(() => buildArrayInputKeys(activeCode, inputValues), [activeCode, inputValues]);
  const requiredInputKeys = useMemo(() => [...new Set([...inputKeys, ...arrayInputKeys])], [inputKeys, arrayInputKeys]);
  const structureHints = useMemo(() => parseStructureHints(activeCode, language), [activeCode, language]);

  useEffect(() => {
    setInputValues((prev) => {
      const next = { ...prev };
      for (const key of requiredInputKeys) {
        if (!Object.prototype.hasOwnProperty.call(next, key)) {
          next[key] = '';
        }
      }
      return next;
    });
  }, [requiredInputKeys]);

  useEffect(() => {
    setIsPlaying(false);
    setSteps([]);
    setOutputLines([]);
    setCurrentStepIndex(0);
    setError('');
  }, [language]);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || steps.length <= 1) return;

    playTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 750);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, steps.length]);

  useEffect(() => {
    if (!activeLineRef.current || isEditorMode) return;
    activeLineRef.current.scrollIntoView({ block: 'nearest' });
  }, [currentStepIndex, isEditorMode, steps.length]);

  const setInputValue = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const runCode = () => {
    setError('');
    setIsPlaying(false);

    const missingKeys = requiredInputKeys.filter((key) => String(inputValues[key] ?? '').trim() === '');
    if (missingKeys.length > 0) {
      setSteps([]);
      setOutputLines([]);
      setCurrentStepIndex(0);
      setError(`Please enter values for: ${missingKeys.join(', ')} before running the visualization.`);
      return;
    }

    try {
      const localSteps = [];
      const localOutput = [];
      const inputSnapshot = {};
      let previousAutoVars = {};

      const readInput = (name, typeHint = 'number') => {
        const raw = inputValues[name];
        if (raw === undefined || raw === '') {
          throw new Error(`Missing input value for: ${name}`);
        }
        const parsedValue = parseByType(raw, typeHint);
        inputSnapshot[name] = parsedValue;
        return parsedValue;
      };

      const step = (line, vars = {}, note = '') => {
        const safeVars = applyStructureHintsToVars(snapshotValue(vars), structureHints);
        localSteps.push({
          line: typeof line === 'number' ? line : null,
          vars: safeVars,
          inputs: snapshotValue(inputSnapshot),
          note: note || 'Manual step',
          index: localSteps.length + 1,
        });
      };

      const autoStep = (line, vars) => {
        const safeVars = applyStructureHintsToVars(snapshotValue(vars || {}), structureHints);
        const initialized = [];
        const modified = [];

        for (const [name, value] of Object.entries(safeVars)) {
          if (value === undefined) continue;
          if (!Object.prototype.hasOwnProperty.call(previousAutoVars, name) || previousAutoVars[name] === undefined) {
            initialized.push(name);
            continue;
          }
          if (!isSameValue(previousAutoVars[name], value)) {
            modified.push(name);
          }
        }

        let note = 'Line executed';
        if (initialized.length > 0 || modified.length > 0) {
          const parts = [];
          if (initialized.length > 0) parts.push(`Initialized: ${initialized.join(', ')}`);
          if (modified.length > 0) parts.push(`Modified: ${modified.join(', ')}`);
          note = parts.join(' | ');
        }

        localSteps.push({
          line: typeof line === 'number' ? line : null,
          vars: safeVars,
          inputs: snapshotValue(inputSnapshot),
          note,
          index: localSteps.length + 1,
        });

        previousAutoVars = safeVars;
      };

      const print = (...parts) => {
        localOutput.push(parts.map((p) => String(p)).join(' '));
      };

      // Runs user code in a constrained scope with explicit helper APIs.
      const executableCode = compileToExecutableJs(activeCode, language);
      const trackedVarNames = inferTrackedVariableNames(executableCode);
      const trackedObjectEntries = trackedVarNames
        .map((name) => `"${name}": __safeRead(() => ${name})`)
        .join(',\n');

      const instrumentedCode = instrumentExecutableJs(executableCode);
      const runnerSource = `'use strict';\nconst __safeRead = (reader) => { try { return reader(); } catch { return undefined; } };\nconst __collectVars = () => ({\n${trackedObjectEntries}\n});\nconst __autoStep = (line) => autoStep(line, __collectVars());\n${instrumentedCode}`;
      const runner = new Function('readInput', 'step', 'print', 'autoStep', runnerSource);
      runner(readInput, step, print, autoStep);

      if (localSteps.length === 0) {
        localSteps.push({
          line: null,
          vars: {},
          note: 'No executable lines were traced. Add runnable statements to start dry run frames.',
          index: 1,
          inputs: { ...inputSnapshot },
        });
      }

      setSteps(localSteps);
      setOutputLines(localOutput);
      setCurrentStepIndex(0);
      setIsEditorMode(false);
    } catch (e) {
      setSteps([]);
      setOutputLines([]);
      setCurrentStepIndex(0);
      if (e instanceof Error) {
        setError(`${e.message} For Java/C++ mode, use supported subset syntax with readInput(...), step(...), and print(...).`);
      } else {
        setError('Failed to execute custom code. For Java/C++ mode, use supported subset syntax with readInput(...), step(...), and print(...).');
      }
    }
  };

  const goPrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const resetAll = () => {
    setIsPlaying(false);
    setSteps([]);
    setOutputLines([]);
    setCurrentStepIndex(0);
    setError('');
    setIsEditorMode(true);
  };

  return (
    <div className="custom-container" style={{ marginTop: '2rem' }}>
      <div className="vis-top-bar">
        <div className="vis-algo-badge" style={{ '--card-accent': '#f59e0b' }}>
          <span className="vis-algo-icon" style={{ color: '#f59e0b' }}><Code2 size={18} /></span>
          <span>Custom Algorithm Visualizer</span>
        </div>
        <div className="custom-lang-tabs">
          {Object.entries(LANGUAGE_META).map(([key, meta]) => (
            <button
              key={key}
              className={`custom-lang-tab ${language === key ? 'active' : ''}`}
              onClick={() => setLanguage(key)}
            >
              {meta.badge}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-workbench">
        <section className="custom-main-column">
          <div className="panel custom-editor-panel">
            <div className="custom-editor-head">
              <div>
                <p className="custom-kicker">Write or Paste Code</p>
                <h3>{LANGUAGE_META[language].label} with step tracking</h3>
              </div>
              <div className="custom-actions">
                <button className="icon-btn" onClick={() => setIsEditorMode((prev) => !prev)} title={isEditorMode ? 'Switch to execution view' : 'Switch to edit mode'}>
                  {isEditorMode ? 'Trace View' : 'Edit Code'}
                </button>
                <button className="icon-btn" onClick={resetAll} title="Reset run state">
                  <RotateCcw size={16} />
                </button>
                <button className="primary play-btn" onClick={runCode}>
                  <Play size={16} /> Run
                </button>
              </div>
            </div>

            {isEditorMode ? (
              <textarea
                className="custom-code-input"
                value={activeCode}
                onChange={(e) => {
                  const next = e.target.value;
                  setCodeByLanguage((prev) => ({ ...prev, [language]: next }));
                }}
                spellCheck={false}
              />
            ) : (
              <div className="custom-code-view editor-mode">
                {codeLines.map((lineText, idx) => {
                  const lineNo = idx + 1;
                  const isActive = currentStep?.line === lineNo-5;
                  return (
                    <div
                      key={lineNo}
                      className={`custom-line ${isActive ? 'active' : ''}`}
                      ref={isActive ? activeLineRef : null}
                    >
                      <span className="custom-line-no">{lineNo}</span>
                      <span className="custom-line-text">{lineText || ' '}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel custom-input-panel">
            <h4>User Inputs</h4>
            <p className="custom-input-note">Any readInput(...) found in {LANGUAGE_META[language].label} code is listed here automatically.</p>
            {language !== 'javascript' && (
              <p className="custom-input-note">Tip: common cin &gt;&gt; x and sc.nextInt() patterns are auto-mapped to input fields.</p>
            )}
            {parseArrayInputKeys(activeCode).length > 0 && (
              <p className="custom-input-note">Array values are required. Enter n first, then fill the indexed array inputs before running.</p>
            )}
            {inputKeys.length === 0 ? (
              <p className="custom-muted">No readInput calls found.</p>
            ) : (
              <div className="custom-input-grid">
                {inputKeys.map((key) => (
                  <label key={key} className="custom-input-item">
                    <span>{key}</span>
                    <input
                      type="text"
                      value={inputValues[key] ?? ''}
                      onChange={(e) => setInputValue(key, e.target.value)}
                      placeholder="Enter value"
                    />
                  </label>
                ))}
                {arrayInputKeys.map((key) => (
                  <label key={key} className="custom-input-item">
                    <span>{key}</span>
                    <input
                      type="text"
                      value={inputValues[key] ?? ''}
                      onChange={(e) => setInputValue(key, e.target.value)}
                      placeholder="Enter array value"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="panel custom-run-panel">
            <div className="custom-run-controls">
              <button onClick={goPrev} disabled={steps.length === 0 || currentStepIndex === 0} className="icon-btn">
                <StepBack size={16} />
              </button>
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                disabled={steps.length <= 1 || currentStepIndex >= steps.length - 1}
                className="icon-btn"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={goNext} disabled={steps.length === 0 || currentStepIndex >= steps.length - 1} className="icon-btn">
                <StepForward size={16} />
              </button>
              <span className="custom-step-counter">
                {steps.length === 0 ? 'No steps' : `Step ${currentStepIndex + 1} / ${steps.length}`}
              </span>
            </div>

            {error && (
              <div className="custom-error">
                <CircleAlert size={16} /> {error}
              </div>
            )}

            {outputLines.length > 0 && (
              <div className="custom-output">
                <div className="custom-output-title"><Terminal size={14} /> Output</div>
                <pre>{outputLines.join('\n')}</pre>
              </div>
            )}
          </div>
        </section>

        <aside className="panel custom-state-panel">
          <div className="custom-state-head">
            <p className="custom-kicker">Step Visualization</p>
            <h3>Runtime state (current frame)</h3>
          </div>

          <div className="custom-vars-panel">
            {currentStep ? (
              <>
                <div className="custom-runtime-meta">
                  <span>Line: {currentStep.line ?? 'n/a'}</span>
                  <span>Frame: {currentStepIndex + 1}</span>
                </div>
                <div className="custom-note">{currentStep.note || 'No note for this step.'}</div>
                {Object.keys(currentStep.vars || {}).length === 0 ? (
                  <p className="custom-muted">No variables captured for this step.</p>
                ) : (
                  <div className="custom-vars-grid">
                    {Object.entries(currentStep.vars).map(([name, value]) => (
                      <div key={name} className="custom-var-item">
                        <span className="custom-var-name">{name}</span>
                        <div className="custom-var-render"><StructuredValue value={value} varName={name} /></div>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(currentStep.inputs || {}).length > 0 && (
                  <div className="custom-input-snapshot">
                    <p className="custom-snapshot-title">Input Snapshot</p>
                    <div className="custom-vars-grid">
                      {Object.entries(currentStep.inputs).map(([name, value]) => (
                        <div key={`input-${name}`} className="custom-var-item">
                          <span className="custom-var-name">{name}</span>
                          <div className="custom-var-render"><StructuredValue value={value} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="custom-muted">Run code to view frame-by-frame variable states.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
