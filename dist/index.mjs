#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import require$$0$2 from 'child_process';
import require$$0$1 from 'path';
import require$$0 from 'fs';
import { fileURLToPath } from 'node:url';
import 'node:util';
import g, { stdin, stdout } from 'node:process';
import f$1 from 'node:readline';
import { WriteStream } from 'node:tty';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var crossSpawn = {exports: {}};

var windows;
var hasRequiredWindows;

function requireWindows () {
	if (hasRequiredWindows) return windows;
	hasRequiredWindows = 1;
	windows = isexe;
	isexe.sync = sync;

	var fs = require$$0;

	function checkPathExt (path, options) {
	  var pathext = options.pathExt !== undefined ?
	    options.pathExt : process.env.PATHEXT;

	  if (!pathext) {
	    return true
	  }

	  pathext = pathext.split(';');
	  if (pathext.indexOf('') !== -1) {
	    return true
	  }
	  for (var i = 0; i < pathext.length; i++) {
	    var p = pathext[i].toLowerCase();
	    if (p && path.substr(-p.length).toLowerCase() === p) {
	      return true
	    }
	  }
	  return false
	}

	function checkStat (stat, path, options) {
	  if (!stat.isSymbolicLink() && !stat.isFile()) {
	    return false
	  }
	  return checkPathExt(path, options)
	}

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, path, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), path, options)
	}
	return windows;
}

var mode;
var hasRequiredMode;

function requireMode () {
	if (hasRequiredMode) return mode;
	hasRequiredMode = 1;
	mode = isexe;
	isexe.sync = sync;

	var fs = require$$0;

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), options)
	}

	function checkStat (stat, options) {
	  return stat.isFile() && checkMode(stat, options)
	}

	function checkMode (stat, options) {
	  var mod = stat.mode;
	  var uid = stat.uid;
	  var gid = stat.gid;

	  var myUid = options.uid !== undefined ?
	    options.uid : process.getuid && process.getuid();
	  var myGid = options.gid !== undefined ?
	    options.gid : process.getgid && process.getgid();

	  var u = parseInt('100', 8);
	  var g = parseInt('010', 8);
	  var o = parseInt('001', 8);
	  var ug = u | g;

	  var ret = (mod & o) ||
	    (mod & g) && gid === myGid ||
	    (mod & u) && uid === myUid ||
	    (mod & ug) && myUid === 0;

	  return ret
	}
	return mode;
}

var isexe_1;
var hasRequiredIsexe;

function requireIsexe () {
	if (hasRequiredIsexe) return isexe_1;
	hasRequiredIsexe = 1;
	var core;
	if (process.platform === 'win32' || commonjsGlobal.TESTING_WINDOWS) {
	  core = requireWindows();
	} else {
	  core = requireMode();
	}

	isexe_1 = isexe;
	isexe.sync = sync;

	function isexe (path, options, cb) {
	  if (typeof options === 'function') {
	    cb = options;
	    options = {};
	  }

	  if (!cb) {
	    if (typeof Promise !== 'function') {
	      throw new TypeError('callback not provided')
	    }

	    return new Promise(function (resolve, reject) {
	      isexe(path, options || {}, function (er, is) {
	        if (er) {
	          reject(er);
	        } else {
	          resolve(is);
	        }
	      });
	    })
	  }

	  core(path, options || {}, function (er, is) {
	    // ignore EACCES because that just means we aren't allowed to run it
	    if (er) {
	      if (er.code === 'EACCES' || options && options.ignoreErrors) {
	        er = null;
	        is = false;
	      }
	    }
	    cb(er, is);
	  });
	}

	function sync (path, options) {
	  // my kingdom for a filtered catch
	  try {
	    return core.sync(path, options || {})
	  } catch (er) {
	    if (options && options.ignoreErrors || er.code === 'EACCES') {
	      return false
	    } else {
	      throw er
	    }
	  }
	}
	return isexe_1;
}

var which_1;
var hasRequiredWhich;

function requireWhich () {
	if (hasRequiredWhich) return which_1;
	hasRequiredWhich = 1;
	const isWindows = process.platform === 'win32' ||
	    process.env.OSTYPE === 'cygwin' ||
	    process.env.OSTYPE === 'msys';

	const path = require$$0$1;
	const COLON = isWindows ? ';' : ':';
	const isexe = requireIsexe();

	const getNotFoundError = (cmd) =>
	  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

	const getPathInfo = (cmd, opt) => {
	  const colon = opt.colon || COLON;

	  // If it has a slash, then we don't bother searching the pathenv.
	  // just check the file itself, and that's it.
	  const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? ['']
	    : (
	      [
	        // windows always checks the cwd first
	        ...(isWindows ? [process.cwd()] : []),
	        ...(opt.path || process.env.PATH ||
	          /* istanbul ignore next: very unusual */ '').split(colon),
	      ]
	    );
	  const pathExtExe = isWindows
	    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
	    : '';
	  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

	  if (isWindows) {
	    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
	      pathExt.unshift('');
	  }

	  return {
	    pathEnv,
	    pathExt,
	    pathExtExe,
	  }
	};

	const which = (cmd, opt, cb) => {
	  if (typeof opt === 'function') {
	    cb = opt;
	    opt = {};
	  }
	  if (!opt)
	    opt = {};

	  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
	  const found = [];

	  const step = i => new Promise((resolve, reject) => {
	    if (i === pathEnv.length)
	      return opt.all && found.length ? resolve(found)
	        : reject(getNotFoundError(cmd))

	    const ppRaw = pathEnv[i];
	    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

	    const pCmd = path.join(pathPart, cmd);
	    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
	      : pCmd;

	    resolve(subStep(p, i, 0));
	  });

	  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
	    if (ii === pathExt.length)
	      return resolve(step(i + 1))
	    const ext = pathExt[ii];
	    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
	      if (!er && is) {
	        if (opt.all)
	          found.push(p + ext);
	        else
	          return resolve(p + ext)
	      }
	      return resolve(subStep(p, i, ii + 1))
	    });
	  });

	  return cb ? step(0).then(res => cb(null, res), cb) : step(0)
	};

	const whichSync = (cmd, opt) => {
	  opt = opt || {};

	  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
	  const found = [];

	  for (let i = 0; i < pathEnv.length; i ++) {
	    const ppRaw = pathEnv[i];
	    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

	    const pCmd = path.join(pathPart, cmd);
	    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
	      : pCmd;

	    for (let j = 0; j < pathExt.length; j ++) {
	      const cur = p + pathExt[j];
	      try {
	        const is = isexe.sync(cur, { pathExt: pathExtExe });
	        if (is) {
	          if (opt.all)
	            found.push(cur);
	          else
	            return cur
	        }
	      } catch (ex) {}
	    }
	  }

	  if (opt.all && found.length)
	    return found

	  if (opt.nothrow)
	    return null

	  throw getNotFoundError(cmd)
	};

	which_1 = which;
	which.sync = whichSync;
	return which_1;
}

var pathKey = {exports: {}};

var hasRequiredPathKey;

function requirePathKey () {
	if (hasRequiredPathKey) return pathKey.exports;
	hasRequiredPathKey = 1;

	const pathKey$1 = (options = {}) => {
		const environment = options.env || process.env;
		const platform = options.platform || process.platform;

		if (platform !== 'win32') {
			return 'PATH';
		}

		return Object.keys(environment).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
	};

	pathKey.exports = pathKey$1;
	// TODO: Remove this for the next major release
	pathKey.exports.default = pathKey$1;
	return pathKey.exports;
}

var resolveCommand_1;
var hasRequiredResolveCommand;

function requireResolveCommand () {
	if (hasRequiredResolveCommand) return resolveCommand_1;
	hasRequiredResolveCommand = 1;

	const path = require$$0$1;
	const which = requireWhich();
	const getPathKey = requirePathKey();

	function resolveCommandAttempt(parsed, withoutPathExt) {
	    const env = parsed.options.env || process.env;
	    const cwd = process.cwd();
	    const hasCustomCwd = parsed.options.cwd != null;
	    // Worker threads do not have process.chdir()
	    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;

	    // If a custom `cwd` was specified, we need to change the process cwd
	    // because `which` will do stat calls but does not support a custom cwd
	    if (shouldSwitchCwd) {
	        try {
	            process.chdir(parsed.options.cwd);
	        } catch (err) {
	            /* Empty */
	        }
	    }

	    let resolved;

	    try {
	        resolved = which.sync(parsed.command, {
	            path: env[getPathKey({ env })],
	            pathExt: withoutPathExt ? path.delimiter : undefined,
	        });
	    } catch (e) {
	        /* Empty */
	    } finally {
	        if (shouldSwitchCwd) {
	            process.chdir(cwd);
	        }
	    }

	    // If we successfully resolved, ensure that an absolute path is returned
	    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
	    if (resolved) {
	        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
	    }

	    return resolved;
	}

	function resolveCommand(parsed) {
	    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
	}

	resolveCommand_1 = resolveCommand;
	return resolveCommand_1;
}

var _escape = {};

var hasRequired_escape;

function require_escape () {
	if (hasRequired_escape) return _escape;
	hasRequired_escape = 1;

	// See http://www.robvanderwoude.com/escapechars.php
	const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

	function escapeCommand(arg) {
	    // Escape meta chars
	    arg = arg.replace(metaCharsRegExp, '^$1');

	    return arg;
	}

	function escapeArgument(arg, doubleEscapeMetaChars) {
	    // Convert to string
	    arg = `${arg}`;

	    // Algorithm below is based on https://qntm.org/cmd
	    // It's slightly altered to disable JS backtracking to avoid hanging on specially crafted input
	    // Please see https://github.com/moxystudio/node-cross-spawn/pull/160 for more information

	    // Sequence of backslashes followed by a double quote:
	    // double up all the backslashes and escape the double quote
	    arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');

	    // Sequence of backslashes followed by the end of the string
	    // (which will become a double quote later):
	    // double up all the backslashes
	    arg = arg.replace(/(?=(\\+?)?)\1$/, '$1$1');

	    // All other backslashes occur literally

	    // Quote the whole thing:
	    arg = `"${arg}"`;

	    // Escape meta chars
	    arg = arg.replace(metaCharsRegExp, '^$1');

	    // Double escape meta chars if necessary
	    if (doubleEscapeMetaChars) {
	        arg = arg.replace(metaCharsRegExp, '^$1');
	    }

	    return arg;
	}

	_escape.command = escapeCommand;
	_escape.argument = escapeArgument;
	return _escape;
}

var shebangRegex;
var hasRequiredShebangRegex;

function requireShebangRegex () {
	if (hasRequiredShebangRegex) return shebangRegex;
	hasRequiredShebangRegex = 1;
	shebangRegex = /^#!(.*)/;
	return shebangRegex;
}

var shebangCommand;
var hasRequiredShebangCommand;

function requireShebangCommand () {
	if (hasRequiredShebangCommand) return shebangCommand;
	hasRequiredShebangCommand = 1;
	const shebangRegex = requireShebangRegex();

	shebangCommand = (string = '') => {
		const match = string.match(shebangRegex);

		if (!match) {
			return null;
		}

		const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
		const binary = path.split('/').pop();

		if (binary === 'env') {
			return argument;
		}

		return argument ? `${binary} ${argument}` : binary;
	};
	return shebangCommand;
}

var readShebang_1;
var hasRequiredReadShebang;

function requireReadShebang () {
	if (hasRequiredReadShebang) return readShebang_1;
	hasRequiredReadShebang = 1;

	const fs = require$$0;
	const shebangCommand = requireShebangCommand();

	function readShebang(command) {
	    // Read the first 150 bytes from the file
	    const size = 150;
	    const buffer = Buffer.alloc(size);

	    let fd;

	    try {
	        fd = fs.openSync(command, 'r');
	        fs.readSync(fd, buffer, 0, size, 0);
	        fs.closeSync(fd);
	    } catch (e) { /* Empty */ }

	    // Attempt to extract shebang (null is returned if not a shebang)
	    return shebangCommand(buffer.toString());
	}

	readShebang_1 = readShebang;
	return readShebang_1;
}

var parse_1;
var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse_1;
	hasRequiredParse = 1;

	const path = require$$0$1;
	const resolveCommand = requireResolveCommand();
	const escape = require_escape();
	const readShebang = requireReadShebang();

	const isWin = process.platform === 'win32';
	const isExecutableRegExp = /\.(?:com|exe)$/i;
	const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

	function detectShebang(parsed) {
	    parsed.file = resolveCommand(parsed);

	    const shebang = parsed.file && readShebang(parsed.file);

	    if (shebang) {
	        parsed.args.unshift(parsed.file);
	        parsed.command = shebang;

	        return resolveCommand(parsed);
	    }

	    return parsed.file;
	}

	function parseNonShell(parsed) {
	    if (!isWin) {
	        return parsed;
	    }

	    // Detect & add support for shebangs
	    const commandFile = detectShebang(parsed);

	    // We don't need a shell if the command filename is an executable
	    const needsShell = !isExecutableRegExp.test(commandFile);

	    // If a shell is required, use cmd.exe and take care of escaping everything correctly
	    // Note that `forceShell` is an hidden option used only in tests
	    if (parsed.options.forceShell || needsShell) {
	        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
	        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
	        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
	        // we need to double escape them
	        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

	        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
	        // This is necessary otherwise it will always fail with ENOENT in those cases
	        parsed.command = path.normalize(parsed.command);

	        // Escape command & arguments
	        parsed.command = escape.command(parsed.command);
	        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

	        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

	        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
	        parsed.command = process.env.comspec || 'cmd.exe';
	        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
	    }

	    return parsed;
	}

	function parse(command, args, options) {
	    // Normalize arguments, similar to nodejs
	    if (args && !Array.isArray(args)) {
	        options = args;
	        args = null;
	    }

	    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
	    options = Object.assign({}, options); // Clone object to avoid changing the original

	    // Build our parsed object
	    const parsed = {
	        command,
	        args,
	        options,
	        file: undefined,
	        original: {
	            command,
	            args,
	        },
	    };

	    // Delegate further parsing to shell or non-shell
	    return options.shell ? parsed : parseNonShell(parsed);
	}

	parse_1 = parse;
	return parse_1;
}

var enoent;
var hasRequiredEnoent;

function requireEnoent () {
	if (hasRequiredEnoent) return enoent;
	hasRequiredEnoent = 1;

	const isWin = process.platform === 'win32';

	function notFoundError(original, syscall) {
	    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
	        code: 'ENOENT',
	        errno: 'ENOENT',
	        syscall: `${syscall} ${original.command}`,
	        path: original.command,
	        spawnargs: original.args,
	    });
	}

	function hookChildProcess(cp, parsed) {
	    if (!isWin) {
	        return;
	    }

	    const originalEmit = cp.emit;

	    cp.emit = function (name, arg1) {
	        // If emitting "exit" event and exit code is 1, we need to check if
	        // the command exists and emit an "error" instead
	        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
	        if (name === 'exit') {
	            const err = verifyENOENT(arg1, parsed);

	            if (err) {
	                return originalEmit.call(cp, 'error', err);
	            }
	        }

	        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
	    };
	}

	function verifyENOENT(status, parsed) {
	    if (isWin && status === 1 && !parsed.file) {
	        return notFoundError(parsed.original, 'spawn');
	    }

	    return null;
	}

	function verifyENOENTSync(status, parsed) {
	    if (isWin && status === 1 && !parsed.file) {
	        return notFoundError(parsed.original, 'spawnSync');
	    }

	    return null;
	}

	enoent = {
	    hookChildProcess,
	    verifyENOENT,
	    verifyENOENTSync,
	    notFoundError,
	};
	return enoent;
}

var hasRequiredCrossSpawn;

function requireCrossSpawn () {
	if (hasRequiredCrossSpawn) return crossSpawn.exports;
	hasRequiredCrossSpawn = 1;

	const cp = require$$0$2;
	const parse = requireParse();
	const enoent = requireEnoent();

	function spawn(command, args, options) {
	    // Parse the arguments
	    const parsed = parse(command, args, options);

	    // Spawn the child process
	    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

	    // Hook into child process "exit" event to emit an error if the command
	    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
	    enoent.hookChildProcess(spawned, parsed);

	    return spawned;
	}

	function spawnSync(command, args, options) {
	    // Parse the arguments
	    const parsed = parse(command, args, options);

	    // Spawn the child process
	    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

	    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
	    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

	    return result;
	}

	crossSpawn.exports = spawn;
	crossSpawn.exports.spawn = spawn;
	crossSpawn.exports.sync = spawnSync;

	crossSpawn.exports._parse = parse;
	crossSpawn.exports._enoent = enoent;
	return crossSpawn.exports;
}

var crossSpawnExports = requireCrossSpawn();
const spawn = /*@__PURE__*/getDefaultExportFromCjs(crossSpawnExports);

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function mri (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
	}

	return out;
}

var src;
var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;

	const ESC = '\x1B';
	const CSI = `${ESC}[`;
	const beep = '\u0007';

	const cursor = {
	  to(x, y) {
	    if (!y) return `${CSI}${x + 1}G`;
	    return `${CSI}${y + 1};${x + 1}H`;
	  },
	  move(x, y) {
	    let ret = '';

	    if (x < 0) ret += `${CSI}${-x}D`;
	    else if (x > 0) ret += `${CSI}${x}C`;

	    if (y < 0) ret += `${CSI}${-y}A`;
	    else if (y > 0) ret += `${CSI}${y}B`;

	    return ret;
	  },
	  up: (count = 1) => `${CSI}${count}A`,
	  down: (count = 1) => `${CSI}${count}B`,
	  forward: (count = 1) => `${CSI}${count}C`,
	  backward: (count = 1) => `${CSI}${count}D`,
	  nextLine: (count = 1) => `${CSI}E`.repeat(count),
	  prevLine: (count = 1) => `${CSI}F`.repeat(count),
	  left: `${CSI}G`,
	  hide: `${CSI}?25l`,
	  show: `${CSI}?25h`,
	  save: `${ESC}7`,
	  restore: `${ESC}8`
	};

	const scroll = {
	  up: (count = 1) => `${CSI}S`.repeat(count),
	  down: (count = 1) => `${CSI}T`.repeat(count)
	};

	const erase = {
	  screen: `${CSI}2J`,
	  up: (count = 1) => `${CSI}1J`.repeat(count),
	  down: (count = 1) => `${CSI}J`.repeat(count),
	  line: `${CSI}2K`,
	  lineEnd: `${CSI}K`,
	  lineStart: `${CSI}1K`,
	  lines(count) {
	    let clear = '';
	    for (let i = 0; i < count; i++)
	      clear += this.line + (i < count - 1 ? cursor.up() : '');
	    if (count)
	      clear += cursor.left;
	    return clear;
	  }
	};

	src = { cursor, scroll, erase, beep };
	return src;
}

var srcExports = requireSrc();

var picocolors = {exports: {}};

var hasRequiredPicocolors;

function requirePicocolors () {
	if (hasRequiredPicocolors) return picocolors.exports;
	hasRequiredPicocolors = 1;
	let p = process || {}, argv = p.argv || [], env = p.env || {};
	let isColorSupported =
		!(!!env.NO_COLOR || argv.includes("--no-color")) &&
		(!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || ((p.stdout || {}).isTTY && env.TERM !== "dumb") || !!env.CI);

	let formatter = (open, close, replace = open) =>
		input => {
			let string = "" + input, index = string.indexOf(close, open.length);
			return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close
		};

	let replaceClose = (string, close, replace, index) => {
		let result = "", cursor = 0;
		do {
			result += string.substring(cursor, index) + replace;
			cursor = index + close.length;
			index = string.indexOf(close, cursor);
		} while (~index)
		return result + string.substring(cursor)
	};

	let createColors = (enabled = isColorSupported) => {
		let f = enabled ? formatter : () => String;
		return {
			isColorSupported: enabled,
			reset: f("\x1b[0m", "\x1b[0m"),
			bold: f("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"),
			dim: f("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"),
			italic: f("\x1b[3m", "\x1b[23m"),
			underline: f("\x1b[4m", "\x1b[24m"),
			inverse: f("\x1b[7m", "\x1b[27m"),
			hidden: f("\x1b[8m", "\x1b[28m"),
			strikethrough: f("\x1b[9m", "\x1b[29m"),

			black: f("\x1b[30m", "\x1b[39m"),
			red: f("\x1b[31m", "\x1b[39m"),
			green: f("\x1b[32m", "\x1b[39m"),
			yellow: f("\x1b[33m", "\x1b[39m"),
			blue: f("\x1b[34m", "\x1b[39m"),
			magenta: f("\x1b[35m", "\x1b[39m"),
			cyan: f("\x1b[36m", "\x1b[39m"),
			white: f("\x1b[37m", "\x1b[39m"),
			gray: f("\x1b[90m", "\x1b[39m"),

			bgBlack: f("\x1b[40m", "\x1b[49m"),
			bgRed: f("\x1b[41m", "\x1b[49m"),
			bgGreen: f("\x1b[42m", "\x1b[49m"),
			bgYellow: f("\x1b[43m", "\x1b[49m"),
			bgBlue: f("\x1b[44m", "\x1b[49m"),
			bgMagenta: f("\x1b[45m", "\x1b[49m"),
			bgCyan: f("\x1b[46m", "\x1b[49m"),
			bgWhite: f("\x1b[47m", "\x1b[49m"),

			blackBright: f("\x1b[90m", "\x1b[39m"),
			redBright: f("\x1b[91m", "\x1b[39m"),
			greenBright: f("\x1b[92m", "\x1b[39m"),
			yellowBright: f("\x1b[93m", "\x1b[39m"),
			blueBright: f("\x1b[94m", "\x1b[39m"),
			magentaBright: f("\x1b[95m", "\x1b[39m"),
			cyanBright: f("\x1b[96m", "\x1b[39m"),
			whiteBright: f("\x1b[97m", "\x1b[39m"),

			bgBlackBright: f("\x1b[100m", "\x1b[49m"),
			bgRedBright: f("\x1b[101m", "\x1b[49m"),
			bgGreenBright: f("\x1b[102m", "\x1b[49m"),
			bgYellowBright: f("\x1b[103m", "\x1b[49m"),
			bgBlueBright: f("\x1b[104m", "\x1b[49m"),
			bgMagentaBright: f("\x1b[105m", "\x1b[49m"),
			bgCyanBright: f("\x1b[106m", "\x1b[49m"),
			bgWhiteBright: f("\x1b[107m", "\x1b[49m"),
		}
	};

	picocolors.exports = createColors();
	picocolors.exports.createColors = createColors;
	return picocolors.exports;
}

var picocolorsExports = /*@__PURE__*/ requirePicocolors();
const colors = /*@__PURE__*/getDefaultExportFromCjs(picocolorsExports);

function J({onlyFirst:t=false}={}){const F=["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))","(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");return new RegExp(F,t?void 0:"g")}const Q=J();function T(t){if(typeof t!="string")throw new TypeError(`Expected a \`string\`, got \`${typeof t}\``);return t.replace(Q,"")}function O(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var P$1={exports:{}};(function(t){var u={};t.exports=u,u.eastAsianWidth=function(e){var s=e.charCodeAt(0),i=e.length==2?e.charCodeAt(1):0,D=s;return 55296<=s&&s<=56319&&56320<=i&&i<=57343&&(s&=1023,i&=1023,D=s<<10|i,D+=65536),D==12288||65281<=D&&D<=65376||65504<=D&&D<=65510?"F":D==8361||65377<=D&&D<=65470||65474<=D&&D<=65479||65482<=D&&D<=65487||65490<=D&&D<=65495||65498<=D&&D<=65500||65512<=D&&D<=65518?"H":4352<=D&&D<=4447||4515<=D&&D<=4519||4602<=D&&D<=4607||9001<=D&&D<=9002||11904<=D&&D<=11929||11931<=D&&D<=12019||12032<=D&&D<=12245||12272<=D&&D<=12283||12289<=D&&D<=12350||12353<=D&&D<=12438||12441<=D&&D<=12543||12549<=D&&D<=12589||12593<=D&&D<=12686||12688<=D&&D<=12730||12736<=D&&D<=12771||12784<=D&&D<=12830||12832<=D&&D<=12871||12880<=D&&D<=13054||13056<=D&&D<=19903||19968<=D&&D<=42124||42128<=D&&D<=42182||43360<=D&&D<=43388||44032<=D&&D<=55203||55216<=D&&D<=55238||55243<=D&&D<=55291||63744<=D&&D<=64255||65040<=D&&D<=65049||65072<=D&&D<=65106||65108<=D&&D<=65126||65128<=D&&D<=65131||110592<=D&&D<=110593||127488<=D&&D<=127490||127504<=D&&D<=127546||127552<=D&&D<=127560||127568<=D&&D<=127569||131072<=D&&D<=194367||177984<=D&&D<=196605||196608<=D&&D<=262141?"W":32<=D&&D<=126||162<=D&&D<=163||165<=D&&D<=166||D==172||D==175||10214<=D&&D<=10221||10629<=D&&D<=10630?"Na":D==161||D==164||167<=D&&D<=168||D==170||173<=D&&D<=174||176<=D&&D<=180||182<=D&&D<=186||188<=D&&D<=191||D==198||D==208||215<=D&&D<=216||222<=D&&D<=225||D==230||232<=D&&D<=234||236<=D&&D<=237||D==240||242<=D&&D<=243||247<=D&&D<=250||D==252||D==254||D==257||D==273||D==275||D==283||294<=D&&D<=295||D==299||305<=D&&D<=307||D==312||319<=D&&D<=322||D==324||328<=D&&D<=331||D==333||338<=D&&D<=339||358<=D&&D<=359||D==363||D==462||D==464||D==466||D==468||D==470||D==472||D==474||D==476||D==593||D==609||D==708||D==711||713<=D&&D<=715||D==717||D==720||728<=D&&D<=731||D==733||D==735||768<=D&&D<=879||913<=D&&D<=929||931<=D&&D<=937||945<=D&&D<=961||963<=D&&D<=969||D==1025||1040<=D&&D<=1103||D==1105||D==8208||8211<=D&&D<=8214||8216<=D&&D<=8217||8220<=D&&D<=8221||8224<=D&&D<=8226||8228<=D&&D<=8231||D==8240||8242<=D&&D<=8243||D==8245||D==8251||D==8254||D==8308||D==8319||8321<=D&&D<=8324||D==8364||D==8451||D==8453||D==8457||D==8467||D==8470||8481<=D&&D<=8482||D==8486||D==8491||8531<=D&&D<=8532||8539<=D&&D<=8542||8544<=D&&D<=8555||8560<=D&&D<=8569||D==8585||8592<=D&&D<=8601||8632<=D&&D<=8633||D==8658||D==8660||D==8679||D==8704||8706<=D&&D<=8707||8711<=D&&D<=8712||D==8715||D==8719||D==8721||D==8725||D==8730||8733<=D&&D<=8736||D==8739||D==8741||8743<=D&&D<=8748||D==8750||8756<=D&&D<=8759||8764<=D&&D<=8765||D==8776||D==8780||D==8786||8800<=D&&D<=8801||8804<=D&&D<=8807||8810<=D&&D<=8811||8814<=D&&D<=8815||8834<=D&&D<=8835||8838<=D&&D<=8839||D==8853||D==8857||D==8869||D==8895||D==8978||9312<=D&&D<=9449||9451<=D&&D<=9547||9552<=D&&D<=9587||9600<=D&&D<=9615||9618<=D&&D<=9621||9632<=D&&D<=9633||9635<=D&&D<=9641||9650<=D&&D<=9651||9654<=D&&D<=9655||9660<=D&&D<=9661||9664<=D&&D<=9665||9670<=D&&D<=9672||D==9675||9678<=D&&D<=9681||9698<=D&&D<=9701||D==9711||9733<=D&&D<=9734||D==9737||9742<=D&&D<=9743||9748<=D&&D<=9749||D==9756||D==9758||D==9792||D==9794||9824<=D&&D<=9825||9827<=D&&D<=9829||9831<=D&&D<=9834||9836<=D&&D<=9837||D==9839||9886<=D&&D<=9887||9918<=D&&D<=9919||9924<=D&&D<=9933||9935<=D&&D<=9953||D==9955||9960<=D&&D<=9983||D==10045||D==10071||10102<=D&&D<=10111||11093<=D&&D<=11097||12872<=D&&D<=12879||57344<=D&&D<=63743||65024<=D&&D<=65039||D==65533||127232<=D&&D<=127242||127248<=D&&D<=127277||127280<=D&&D<=127337||127344<=D&&D<=127386||917760<=D&&D<=917999||983040<=D&&D<=1048573||1048576<=D&&D<=1114109?"A":"N"},u.characterLength=function(e){var s=this.eastAsianWidth(e);return s=="F"||s=="W"||s=="A"?2:1};function F(e){return e.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g)||[]}u.length=function(e){for(var s=F(e),i=0,D=0;D<s.length;D++)i=i+this.characterLength(s[D]);return i},u.slice=function(e,s,i){textLen=u.length(e),s=s||0,i=i||1,s<0&&(s=textLen+s),i<0&&(i=textLen+i);for(var D="",C=0,o=F(e),E=0;E<o.length;E++){var a=o[E],n=u.length(a);if(C>=s-(n==2?1:0))if(C+n<=i)D+=a;else break;C+=n;}return D};})(P$1);var X=P$1.exports;const DD=O(X);var uD=function(){return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g};const FD=O(uD);function A(t,u={}){if(typeof t!="string"||t.length===0||(u={ambiguousIsNarrow:true,...u},t=T(t),t.length===0))return 0;t=t.replace(FD(),"  ");const F=u.ambiguousIsNarrow?1:2;let e=0;for(const s of t){const i=s.codePointAt(0);if(i<=31||i>=127&&i<=159||i>=768&&i<=879)continue;switch(DD.eastAsianWidth(s)){case "F":case "W":e+=2;break;case "A":e+=F;break;default:e+=1;}}return e}const m=10,L$1=(t=0)=>u=>`\x1B[${u+t}m`,N=(t=0)=>u=>`\x1B[${38+t};5;${u}m`,I=(t=0)=>(u,F,e)=>`\x1B[${38+t};2;${u};${F};${e}m`,r={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(r.modifier);const tD=Object.keys(r.color),eD=Object.keys(r.bgColor);[...tD,...eD];function sD(){const t=new Map;for(const[u,F]of Object.entries(r)){for(const[e,s]of Object.entries(F))r[e]={open:`\x1B[${s[0]}m`,close:`\x1B[${s[1]}m`},F[e]=r[e],t.set(s[0],s[1]);Object.defineProperty(r,u,{value:F,enumerable:false});}return Object.defineProperty(r,"codes",{value:t,enumerable:false}),r.color.close="\x1B[39m",r.bgColor.close="\x1B[49m",r.color.ansi=L$1(),r.color.ansi256=N(),r.color.ansi16m=I(),r.bgColor.ansi=L$1(m),r.bgColor.ansi256=N(m),r.bgColor.ansi16m=I(m),Object.defineProperties(r,{rgbToAnsi256:{value:(u,F,e)=>u===F&&F===e?u<8?16:u>248?231:Math.round((u-8)/247*24)+232:16+36*Math.round(u/255*5)+6*Math.round(F/255*5)+Math.round(e/255*5),enumerable:false},hexToRgb:{value:u=>{const F=/[a-f\d]{6}|[a-f\d]{3}/i.exec(u.toString(16));if(!F)return [0,0,0];let[e]=F;e.length===3&&(e=[...e].map(i=>i+i).join(""));const s=Number.parseInt(e,16);return [s>>16&255,s>>8&255,s&255]},enumerable:false},hexToAnsi256:{value:u=>r.rgbToAnsi256(...r.hexToRgb(u)),enumerable:false},ansi256ToAnsi:{value:u=>{if(u<8)return 30+u;if(u<16)return 90+(u-8);let F,e,s;if(u>=232)F=((u-232)*10+8)/255,e=F,s=F;else {u-=16;const C=u%36;F=Math.floor(u/36)/5,e=Math.floor(C/6)/5,s=C%6/5;}const i=Math.max(F,e,s)*2;if(i===0)return 30;let D=30+(Math.round(s)<<2|Math.round(e)<<1|Math.round(F));return i===2&&(D+=60),D},enumerable:false},rgbToAnsi:{value:(u,F,e)=>r.ansi256ToAnsi(r.rgbToAnsi256(u,F,e)),enumerable:false},hexToAnsi:{value:u=>r.ansi256ToAnsi(r.hexToAnsi256(u)),enumerable:false}}),r}const iD=sD(),v=new Set(["\x1B","\x9B"]),CD=39,w$1="\x07",W$1="[",rD="]",R="m",y=`${rD}8;;`,V$1=t=>`${v.values().next().value}${W$1}${t}${R}`,z=t=>`${v.values().next().value}${y}${t}${w$1}`,ED=t=>t.split(" ").map(u=>A(u)),_=(t,u,F)=>{const e=[...u];let s=false,i=false,D=A(T(t[t.length-1]));for(const[C,o]of e.entries()){const E=A(o);if(D+E<=F?t[t.length-1]+=o:(t.push(o),D=0),v.has(o)&&(s=true,i=e.slice(C+1).join("").startsWith(y)),s){i?o===w$1&&(s=false,i=false):o===R&&(s=false);continue}D+=E,D===F&&C<e.length-1&&(t.push(""),D=0);}!D&&t[t.length-1].length>0&&t.length>1&&(t[t.length-2]+=t.pop());},nD=t=>{const u=t.split(" ");let F=u.length;for(;F>0&&!(A(u[F-1])>0);)F--;return F===u.length?t:u.slice(0,F).join(" ")+u.slice(F).join("")},oD=(t,u,F={})=>{if(F.trim!==false&&t.trim()==="")return "";let e="",s,i;const D=ED(t);let C=[""];for(const[E,a]of t.split(" ").entries()){F.trim!==false&&(C[C.length-1]=C[C.length-1].trimStart());let n=A(C[C.length-1]);if(E!==0&&(n>=u&&(F.wordWrap===false||F.trim===false)&&(C.push(""),n=0),(n>0||F.trim===false)&&(C[C.length-1]+=" ",n++)),F.hard&&D[E]>u){const B=u-n,p=1+Math.floor((D[E]-B-1)/u);Math.floor((D[E]-1)/u)<p&&C.push(""),_(C,a,u);continue}if(n+D[E]>u&&n>0&&D[E]>0){if(F.wordWrap===false&&n<u){_(C,a,u);continue}C.push("");}if(n+D[E]>u&&F.wordWrap===false){_(C,a,u);continue}C[C.length-1]+=a;}F.trim!==false&&(C=C.map(E=>nD(E)));const o=[...C.join(`
`)];for(const[E,a]of o.entries()){if(e+=a,v.has(a)){const{groups:B}=new RegExp(`(?:\\${W$1}(?<code>\\d+)m|\\${y}(?<uri>.*)${w$1})`).exec(o.slice(E).join(""))||{groups:{}};if(B.code!==void 0){const p=Number.parseFloat(B.code);s=p===CD?void 0:p;}else B.uri!==void 0&&(i=B.uri.length===0?void 0:B.uri);}const n=iD.codes.get(Number(s));o[E+1]===`
`?(i&&(e+=z("")),s&&n&&(e+=V$1(n))):a===`
`&&(s&&n&&(e+=V$1(s)),i&&(e+=z(i)));}return e};function G(t,u,F){return String(t).normalize().replace(/\r\n/g,`
`).split(`
`).map(e=>oD(e,u,F)).join(`
`)}const aD=["up","down","left","right","space","enter","cancel"],c={actions:new Set(aD),aliases:new Map([["k","up"],["j","down"],["h","left"],["l","right"],["","cancel"],["escape","cancel"]])};function k$1(t,u){if(typeof t=="string")return c.aliases.get(t)===u;for(const F of t)if(F!==void 0&&k$1(F,u))return  true;return  false}function lD(t,u){if(t===u)return;const F=t.split(`
`),e=u.split(`
`),s=[];for(let i=0;i<Math.max(F.length,e.length);i++)F[i]!==e[i]&&s.push(i);return s}globalThis.process.platform.startsWith("win");const S=Symbol("clack:cancel");function BD(t){return t===S}function d$1(t,u){const F=t;F.isTTY&&F.setRawMode(u);}var AD=Object.defineProperty,pD=(t,u,F)=>u in t?AD(t,u,{enumerable:true,configurable:true,writable:true,value:F}):t[u]=F,h=(t,u,F)=>(pD(t,typeof u!="symbol"?u+"":u,F),F);class x{constructor(u,F=true){h(this,"input"),h(this,"output"),h(this,"_abortSignal"),h(this,"rl"),h(this,"opts"),h(this,"_render"),h(this,"_track",false),h(this,"_prevFrame",""),h(this,"_subscribers",new Map),h(this,"_cursor",0),h(this,"state","initial"),h(this,"error",""),h(this,"value");const{input:e=stdin,output:s=stdout,render:i,signal:D,...C}=u;this.opts=C,this.onKeypress=this.onKeypress.bind(this),this.close=this.close.bind(this),this.render=this.render.bind(this),this._render=i.bind(this),this._track=F,this._abortSignal=D,this.input=e,this.output=s;}unsubscribe(){this._subscribers.clear();}setSubscriber(u,F){const e=this._subscribers.get(u)??[];e.push(F),this._subscribers.set(u,e);}on(u,F){this.setSubscriber(u,{cb:F});}once(u,F){this.setSubscriber(u,{cb:F,once:true});}emit(u,...F){const e=this._subscribers.get(u)??[],s=[];for(const i of e)i.cb(...F),i.once&&s.push(()=>e.splice(e.indexOf(i),1));for(const i of s)i();}prompt(){return new Promise((u,F)=>{if(this._abortSignal){if(this._abortSignal.aborted)return this.state="cancel",this.close(),u(S);this._abortSignal.addEventListener("abort",()=>{this.state="cancel",this.close();},{once:true});}const e=new WriteStream(0);e._write=(s,i,D)=>{this._track&&(this.value=this.rl?.line.replace(/\t/g,""),this._cursor=this.rl?.cursor??0,this.emit("value",this.value)),D();},this.input.pipe(e),this.rl=f$1.createInterface({input:this.input,output:e,tabSize:2,prompt:"",escapeCodeTimeout:50}),f$1.emitKeypressEvents(this.input,this.rl),this.rl.prompt(),this.opts.initialValue!==void 0&&this._track&&this.rl.write(this.opts.initialValue),this.input.on("keypress",this.onKeypress),d$1(this.input,true),this.output.on("resize",this.render),this.render(),this.once("submit",()=>{this.output.write(srcExports.cursor.show),this.output.off("resize",this.render),d$1(this.input,false),u(this.value);}),this.once("cancel",()=>{this.output.write(srcExports.cursor.show),this.output.off("resize",this.render),d$1(this.input,false),u(S);});})}onKeypress(u,F){if(this.state==="error"&&(this.state="active"),F?.name&&(!this._track&&c.aliases.has(F.name)&&this.emit("cursor",c.aliases.get(F.name)),c.actions.has(F.name)&&this.emit("cursor",F.name)),u&&(u.toLowerCase()==="y"||u.toLowerCase()==="n")&&this.emit("confirm",u.toLowerCase()==="y"),u==="	"&&this.opts.placeholder&&(this.value||(this.rl?.write(this.opts.placeholder),this.emit("value",this.opts.placeholder))),u&&this.emit("key",u.toLowerCase()),F?.name==="return"){if(this.opts.validate){const e=this.opts.validate(this.value);e&&(this.error=e instanceof Error?e.message:e,this.state="error",this.rl?.write(this.value));}this.state!=="error"&&(this.state="submit");}k$1([u,F?.name,F?.sequence],"cancel")&&(this.state="cancel"),(this.state==="submit"||this.state==="cancel")&&this.emit("finalize"),this.render(),(this.state==="submit"||this.state==="cancel")&&this.close();}close(){this.input.unpipe(),this.input.removeListener("keypress",this.onKeypress),this.output.write(`
`),d$1(this.input,false),this.rl?.close(),this.rl=void 0,this.emit(`${this.state}`,this.value),this.unsubscribe();}restoreCursor(){const u=G(this._prevFrame,process.stdout.columns,{hard:true}).split(`
`).length-1;this.output.write(srcExports.cursor.move(-999,u*-1));}render(){const u=G(this._render(this)??"",process.stdout.columns,{hard:true});if(u!==this._prevFrame){if(this.state==="initial")this.output.write(srcExports.cursor.hide);else {const F=lD(this._prevFrame,u);if(this.restoreCursor(),F&&F?.length===1){const e=F[0];this.output.write(srcExports.cursor.move(0,e)),this.output.write(srcExports.erase.lines(1));const s=u.split(`
`);this.output.write(s[e]),this._prevFrame=u,this.output.write(srcExports.cursor.move(0,s.length-e-1));return}if(F&&F?.length>1){const e=F[0];this.output.write(srcExports.cursor.move(0,e)),this.output.write(srcExports.erase.down());const s=u.split(`
`).slice(e);this.output.write(s.join(`
`)),this._prevFrame=u;return}this.output.write(srcExports.erase.down());}this.output.write(u),this.state==="initial"&&(this.state="active"),this._prevFrame=u;}}}var SD=Object.defineProperty,$D=(t,u,F)=>u in t?SD(t,u,{enumerable:true,configurable:true,writable:true,value:F}):t[u]=F,q$1=(t,u,F)=>($D(t,typeof u!="symbol"?u+"":u,F),F);class jD extends x{constructor(u){super(u,false),q$1(this,"options"),q$1(this,"cursor",0),this.options=u.options,this.cursor=this.options.findIndex(({value:F})=>F===u.initialValue),this.cursor===-1&&(this.cursor=0),this.changeValue(),this.on("cursor",F=>{switch(F){case "left":case "up":this.cursor=this.cursor===0?this.options.length-1:this.cursor-1;break;case "down":case "right":this.cursor=this.cursor===this.options.length-1?0:this.cursor+1;break}this.changeValue();});}get _value(){return this.options[this.cursor]}changeValue(){this.value=this._value.value;}}class PD extends x{get valueWithCursor(){if(this.state==="submit")return this.value;if(this.cursor>=this.value.length)return `${this.value}\u2588`;const u=this.value.slice(0,this.cursor),[F,...e]=this.value.slice(this.cursor);return `${u}${colors.inverse(F)}${e.join("")}`}get cursor(){return this._cursor}constructor(u){super(u),this.on("finalize",()=>{this.value||(this.value=u.defaultValue);});}}

function ce(){return g.platform!=="win32"?g.env.TERM!=="linux":!!g.env.CI||!!g.env.WT_SESSION||!!g.env.TERMINUS_SUBLIME||g.env.ConEmuTask==="{cmd::Cmder}"||g.env.TERM_PROGRAM==="Terminus-Sublime"||g.env.TERM_PROGRAM==="vscode"||g.env.TERM==="xterm-256color"||g.env.TERM==="alacritty"||g.env.TERMINAL_EMULATOR==="JetBrains-JediTerm"}const V=ce(),u=(t,n)=>V?t:n,le=u("\u25C6","*"),L=u("\u25A0","x"),W=u("\u25B2","x"),C=u("\u25C7","o"),o=u("\u2502","|"),d=u("\u2514","\u2014"),k=u("\u25CF",">"),P=u("\u25CB"," "),q=u("\u25CF","\u2022"),D=u("\u25C6","*"),U=u("\u25B2","!"),K=u("\u25A0","x"),w=t=>{switch(t){case "initial":case "active":return colors.cyan(le);case "cancel":return colors.red(L);case "error":return colors.yellow(W);case "submit":return colors.green(C)}},B=t=>{const{cursor:n,options:s,style:r}=t,i=t.maxItems??Number.POSITIVE_INFINITY,a=Math.max(process.stdout.rows-4,0),c=Math.min(a,Math.max(i,5));let l=0;n>=l+c-3?l=Math.max(Math.min(n-c+3,s.length-c),0):n<l+2&&(l=Math.max(n-2,0));const $=c<s.length&&l>0,p=c<s.length&&l+c<s.length;return s.slice(l,l+c).map((M,v,x)=>{const j=v===0&&$,E=v===x.length-1&&p;return j||E?colors.dim("..."):r(M,v+l===n)})},he=t=>new PD({validate:t.validate,placeholder:t.placeholder,defaultValue:t.defaultValue,initialValue:t.initialValue,render(){const n=`${colors.gray(o)}
${w(this.state)}  ${t.message}
`,s=t.placeholder?colors.inverse(t.placeholder[0])+colors.dim(t.placeholder.slice(1)):colors.inverse(colors.hidden("_")),r=this.value?this.valueWithCursor:s;switch(this.state){case "error":return `${n.trim()}
${colors.yellow(o)}  ${r}
${colors.yellow(d)}  ${colors.yellow(this.error)}
`;case "submit":return `${n}${colors.gray(o)}  ${colors.dim(this.value||t.placeholder)}`;case "cancel":return `${n}${colors.gray(o)}  ${colors.strikethrough(colors.dim(this.value??""))}${this.value?.trim()?`
${colors.gray(o)}`:""}`;default:return `${n}${colors.cyan(o)}  ${r}
${colors.cyan(d)}
`}}}).prompt(),ve=t=>{const n=(s,r)=>{const i=s.label??String(s.value);switch(r){case "selected":return `${colors.dim(i)}`;case "active":return `${colors.green(k)} ${i} ${s.hint?colors.dim(`(${s.hint})`):""}`;case "cancelled":return `${colors.strikethrough(colors.dim(i))}`;default:return `${colors.dim(P)} ${colors.dim(i)}`}};return new jD({options:t.options,initialValue:t.initialValue,render(){const s=`${colors.gray(o)}
${w(this.state)}  ${t.message}
`;switch(this.state){case "submit":return `${s}${colors.gray(o)}  ${n(this.options[this.cursor],"selected")}`;case "cancel":return `${s}${colors.gray(o)}  ${n(this.options[this.cursor],"cancelled")}
${colors.gray(o)}`;default:return `${s}${colors.cyan(o)}  ${B({cursor:this.cursor,options:this.options,maxItems:t.maxItems,style:(r,i)=>n(r,i?"active":"inactive")}).join(`
${colors.cyan(o)}  `)}
${colors.cyan(d)}
`}}}).prompt()},xe=(t="")=>{process.stdout.write(`${colors.gray(d)}  ${colors.red(t)}

`);},Se=(t="")=>{process.stdout.write(`${colors.gray(o)}
${colors.gray(d)}  ${t}

`);},f={message:(t="",{symbol:n=colors.gray(o)}={})=>{const s=[`${colors.gray(o)}`];if(t){const[r,...i]=t.split(`
`);s.push(`${n}  ${r}`,...i.map(a=>`${colors.gray(o)}  ${a}`));}process.stdout.write(`${s.join(`
`)}
`);},info:t=>{f.message(t,{symbol:colors.blue(q)});},success:t=>{f.message(t,{symbol:colors.green(D)});},step:t=>{f.message(t,{symbol:colors.green(C)});},warn:t=>{f.message(t,{symbol:colors.yellow(U)});},warning:t=>{f.warn(t);},error:t=>{f.message(t,{symbol:colors.red(K)});}};`${colors.gray(o)}  `;

const {
  blue: blue$1,
  blueBright: blueBright$1,
  cyan: cyan$1,
  green: green$1,
  greenBright: greenBright$1,
  magenta: magenta$1,
  red: red$1,
  redBright: redBright$1,
  reset: reset$1,
  yellow: yellow$1
} = colors;
const SETUP_OPTIONS = [
  {
    name: "empty-3d",
    display: "Empty 3D Scene",
    color: yellow$1
  },
  {
    name: "fps",
    display: "First Person",
    color: green$1
  }
];

const {
  blue,
  blueBright,
  cyan,
  green,
  greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow
} = colors;
const argv = mri(process.argv.slice(2), {
  alias: { h: "help", t: "template" },
  boolean: ["help", "overwrite"],
  string: ["template"]
});
const cwd = process.cwd();
const helpMessage = `Usage: create-arcade [OPTION]... [DIRECTORY]

Create a new BabylonJS Arcade project in JavaScript or TypeScript.

With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow("empty-3d     empty-3d")}
${green("fps      fps")}
${cyan("")}
${cyan("")}
${magenta("")}
${redBright("")}
${red("")}
${blue("")}
${blueBright("")}`;
const TEMPLATES = SETUP_OPTIONS.reduce((a, b) => a.concat(b), []);
const renameFiles = {
  _gitignore: ".gitignore"
};
const defaultTargetDir = "babylonjs-arcade";
async function init() {
  const argTargetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : void 0;
  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;
  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const cancel = () => xe("Operation cancelled");
  let targetDir = argTargetDir;
  if (!targetDir) {
    const projectName = await he({
      message: "Project name:",
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir
    });
    if (BD(projectName)) return cancel();
    targetDir = formatTargetDir(projectName);
  }
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite ? "yes" : await ve({
      message: (targetDir === "." ? "Current directory" : `Target directory "${targetDir}"`) + ` is not empty. Please choose how to proceed:`,
      options: [
        {
          label: "Cancel operation",
          value: "no"
        },
        {
          label: "Remove existing files and continue",
          value: "yes"
        },
        {
          label: "Ignore files and continue",
          value: "ignore"
        }
      ]
    });
    if (BD(overwrite)) return cancel();
    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      case "no":
        cancel();
        return;
    }
  }
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    const packageNameResult = await he({
      message: "Package name:",
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return "Invalid package.json name";
        }
      }
    });
    if (BD(packageNameResult)) return cancel();
    packageName = packageNameResult;
  }
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !TEMPLATES.includes(argTemplate)) {
    template = void 0;
    hasInvalidArgTemplate = true;
  }
  if (!template) {
    const framework = await ve({
      message: hasInvalidArgTemplate ? `"${argTemplate}" isn't a valid template. Please choose from below: ` : "Select a framework:",
      options: SETUP_OPTIONS.map((framework2) => {
        const frameworkColor = framework2.color;
        return {
          label: frameworkColor(framework2.display || framework2.name),
          value: framework2
        };
      })
    });
    if (BD(framework)) return cancel();
    template = framework.name;
  }
  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const { customCommand } = SETUP_OPTIONS.find((v) => v.name === template) ?? {};
  if (customCommand) {
    const fullCustomCommand = getFullCustomCommand(customCommand, pkgInfo);
    const [command, ...args] = fullCustomCommand.split(" ");
    const replacedArgs = args.map(
      (arg) => arg.replace("TARGET_DIR", () => targetDir)
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit"
    });
    process.exit(status ?? 0);
  }
  f.step(`Scaffolding project in ${root}...`);
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../",
    `src/templates/${template}`
  );
  console.log(import.meta.url, templateDir);
  const write = (file, content) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  pkg.name = packageName;
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");
  let doneMessage = "";
  const cdProjectName = path.relative(cwd, root);
  doneMessage += `Done. Now run:
`;
  if (root !== cwd) {
    doneMessage += `
  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`;
  }
  switch (pkgManager) {
    case "yarn":
      doneMessage += "\n  yarn";
      doneMessage += "\n  yarn dev";
      break;
    default:
      doneMessage += `
  ${pkgManager} install`;
      doneMessage += `
  ${pkgManager} run dev`;
      break;
  }
  Se(doneMessage);
}
function formatTargetDir(targetDir) {
  return targetDir.trim().replace(/\/+$/g, "");
}
function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}
function isValidPackageName(projectName) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}
function toValidPackageName(projectName) {
  return projectName.trim().toLowerCase().replace(/\s+/g, "-").replace(/^[._]/, "").replace(/[^a-z\d\-~]+/g, "-");
}
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}
function isEmpty(path2) {
  const files = fs.readdirSync(path2);
  return files.length === 0 || files.length === 1 && files[0] === ".git";
}
function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}
function pkgFromUserAgent(userAgent) {
  if (!userAgent) return void 0;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1]
  };
}
function getFullCustomCommand(customCommand, pkgInfo) {
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");
  return customCommand.replace(/^npm create /, () => {
    if (pkgManager === "bun") {
      return "bun x create-";
    }
    return `${pkgManager} create `;
  }).replace("@latest", () => isYarn1 ? "" : "@latest").replace(/^npm exec/, () => {
    if (pkgManager === "pnpm") {
      return "pnpm dlx";
    }
    if (pkgManager === "yarn" && !isYarn1) {
      return "yarn dlx";
    }
    if (pkgManager === "bun") {
      return "bun x";
    }
    return "npm exec";
  });
}
init().catch((e) => {
  console.error(e);
});
