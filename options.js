let parseArguments = function(options, args) {
  let lookup = {};
  let result = {
    options: {},
    arguments: [],
  };

  for (let i in options) {
    let option = options[i];
    lookup[option.name] = options[i];
    if (option.shortName)
      lookup[option.shortName] = options[i];
    if (option.defaultValue !== undefined)
      result.options[option.name] = option.defaultValue;
  }

  let isValue = false, lastOption = null;
  for (let i = 1; i < args.length; i++) {
    let arg = args[i];
    if (lastOption) {
      if (lastOption.allowMultiple) {
        if (!result.options[lastOption.name])
          result.options[lastOption.name] = []
        result.options[lastOption.name].push(arg);
      } else
        result.options[lastOption.name] = arg;
      lastOption = null;
      continue;
    }

    let match;
    //log("looking at : '" + arg + "'");
    if ((match = /^--([\w-]+)(=(.*))?$/.exec(arg)) == null &&
        (match = /^-([\w-])(=(.*))?$/.exec(arg)) == null) {
      if (arg[0] == '-')
        throw new Error('Unknown option ' + arg);
      result.arguments.push(arg);
      continue;
    }

    let name = match[1];
    let value = match[3];
    //log("match: '" + name + "' value: '" + match[3] + "'");
    let option = lookup[name];
    if (!option)
      throw new Error('Unkown option ' + name);
    if (!option.requireArgument) {
      if (value != undefined)
        throw new Error('Invalid value for option ' + name + ' : ' + value);
      else
        result.options[option.name] = true;
    } else {
      if (value != undefined)
        result.options[option.name] = value;
      else
        lastOption = option;
    }
  }

  return result;
};

let printHelp = function(header, options) {
  print(header + ':');
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    let line = '\t--' + opt.name;

    if (opt.shortName)
      line += ', -' + opt.shortName;
    if (opt.requireArgument)
      line += '=VALUE';
    line += '\t' + opt.help
    print(line);
  }
};

// Test
const TEST = false;

if (TEST) {
  const options = [
    {
      name: 'name',
      shortName: 'n',
      requireArgument: true,
      defaultValue: 'noname',
    },
    {
      name: 'test',
      shortName: 't',
      requireArgument: false,
      defaultValue: false,
    },
  ];

  try {
    let ret = parseArguments(options, ARGV);
    for (let i in ret.options)
      log(i + ' : ' + ret.options[i]);
  } catch (e) {
    log('Error: ' + e.message);
  }
}
