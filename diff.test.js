const differences = require('./diff.js');
const {
  data,
  expectNoDiffs,
  expectDiff
} = require('./testUtils.js')

test('type diff for string and number', () => {
  // given
  let original = "1"
  let updated = 1

  // when
  const result = differences(original, updated)

  // then
  expectDiff(result, {
    type: "TYPE_DIFF",
    path: "",
    left: "string",
    right: "number"
  })
})

test('empty list for no change', () => {
  // given
  let original = data()
  let updated = data()

  // when
  const result = differences(original, updated)

  // then
  expectNoDiffs(result)
})

test('type change top level', () => {
  // given
  let original = data()
  let updated = data()
  original['version'] = 1
  updated['version'] = "1"

  // when
  const result = differences(original, updated)

  // then
  expectDiff(result, {
    type: "TYPE_DIFF",
    path: ".version",
    left: "number",
    right: "string"
  })
})

test('value change top level', () => {
  // given
  let original = data()
  let updated = data()
  original['version'] = 1
  updated['version'] = 2

  // when
  const result = differences(original, updated)

  // then
  expectDiff(result, {
    type: "VALUE_DIFF",
    path: ".version",
    left: 1,
    right: 2
  })
})

test('type change in deep', () => {
  // given
  let original = data()
  let updated = data()
  original['localizations']['test_localization'] = "alma"
  updated['localizations']['test_localization'] = 1

  // when
  const result = differences(original, updated)

  // then
  expectDiff(result, {
    type: "TYPE_DIFF",
    path: ".localizations.test_localization",
    left: "string",
    right: "number"
  })
})
