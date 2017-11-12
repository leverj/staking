module.exports = (function () {
  const args = process.argv;
  const commands = {};
  commands.mapify = function (array, key) {
    array = Array.isArray(array) && array || [array];
    const results = {};
    for (let i = 0; i < array.length; i++) {
      results[array[i][key]] = array[i]
    }
    return results
  };

  commands.run = function (commands) {
    const cmd = args.shift();
    const script = args.shift();
    const command = args.shift() || 'usage';
    const asMap = args[0] === 'map' && args.shift();

    function usage() {
      console.log('Usage: \n', cmd, script, 'command', 'arguments', '\n',
        '    command is one of ', Object.keys(commands))
    }

    const fn = command !== 'usage' ? commands[command] : usage;
    const results = fn.apply(null, args);
    const processed = asMap && commands.mapify(results, 'address') || results;
    if (processed) console.log(JSON.stringify(processed, null, '  '))
  };

  return commands
})();

