module.exports = {
  "rules":{
    "filenames/match-regex": ["error", "^[a-z_]+$", true],
    "indent": ["error", 2, {"MemberExpression": 0}],
    "one-var": ["error", "always"],
    "operator-linebreak": ["error", "before"],
    "semi": ["error", "always"],
  },
  "extends": "standard",
  "plugins": [
      "filenames",
      "import",
      "node",
      "promise",
      "standard"
  ],
  "env": {
    "node": true,
    "mocha": true
  }
};
