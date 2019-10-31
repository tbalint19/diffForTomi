function data() {
  const originalJson = require('./original.json')
  return JSON.parse(JSON.stringify(originalJson))
}

function expectDiff(result, { type, left, right, path }) {
  const diffs = result.filter(diff =>
    diff.type == type && diff.path == path && diff.left == left && diff.right == right)
  expect(diffs.length).toBe(1)
}

function expectNoDiffs(result) {
  expect(Array.isArray(result)).toBe(true)
  expect(result.length).toBe(0);
}

module.exports = {
  data,
  expectNoDiffs,
  expectDiff
}
