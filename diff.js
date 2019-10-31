function isObject(entry) {
  return entry !== null && entry !== undefined && !Array.isArray(entry) && typeof entry == 'object'
}

function isList(entry) {
  return Array.isArray(entry)
}

function isPrimitive(entry) {
  return !isList(entry) && !isObject(entry)
}

function typeOf(entry) {
  if (isList(entry)) return "list"
  if (isObject(entry)) return "object"
  if (entry === null) return "null"
  if (entry === undefined) return "undefined"
  return typeof entry
}

function hasSameType(one, other) {
  if (one === null || other === null)
    return one === null && other === null
  if (one === undefined || other === undefined)
    return one === undefined && other === undefined
  if (Array.isArray(one) || Array.isArray(other))
    return Array.isArray(one) && Array.isArray(other)
  return typeof one == typeof other
}

function withRefs(one, other) {
  if (one.length == 0 && other.length == 0) {
    return false
  }
  if (one.length !== 0) {
    return isObject(one[0]) && Object.keys(one[0]).includes("ref")
  }
  return isObject(other[0]) && Object.keys(other[0]).includes("ref")
}

function getRepresentation(obj) {
  var possibilities = [ "title", "message", "id", "ref" ]
  for (let possibility of possibilities) {
    if (Object.keys(obj).includes(possibility)) {
      var representation = {}
      representation[possibility] = obj[possibility]
      return ".[#item:" + JSON.stringify(representation) + "]"
    }
  }
  return ".[#item]"
}

function differences(one, other, path="", diffs=[]) {

  if (!hasSameType(one, other)) {
    var typeDiff = {
      type: "TYPE_DIFF",
      path,
      left: typeOf(one),
      right: typeOf(other)
    }
    diffs = [ ...diffs, typeDiff ]
  }

  else if (isPrimitive(one)) {
    if (one !== other) {
      var valueDiff = {
        type: "VALUE_DIFF",
        path,
        left: one,
        right: other
      }
      diffs = [ ...diffs, valueDiff ]
    }
  }

  else if (isObject(one)) {
    var keysOfOne = Object.keys(one)
    var keysOfOther = Object.keys(other)
    for (let key of keysOfOne) {
      if (!keysOfOther.includes(key)) {
        var fullPath = path + "." + key
        var keyDiff = {
          type: "DELETED_KEY",
          path: fullPath,
          left: JSON.parse(JSON.stringify(one[key])),
          right: null
        }
        diffs = [ ...diffs, keyDiff ]
      }
      else {
        var pathWithNewKey = path + "." + key
        diffs = differences(one[key], other[key], pathWithNewKey, diffs)
      }
    }
    for (let key of keysOfOther) {
      if (!keysOfOne.includes(key)) {
        var fullPath = path + "." + key
        var keyDiff = {
          type: "ADDED_KEY",
          path: fullPath,
          left: null,
          right: JSON.parse(JSON.stringify(other[key]))
        }
        diffs = [ ...diffs, keyDiff ]
      }
    }
  }

  else if (isList(one)) {
    if (withRefs(one, other)) {
      for (let item of one) {
        let itemInOther = other.find(listItem => listItem.ref == item.ref)
        if (!itemInOther) {
          var pathWithNewRef = path + getRepresentation(item)
          var itemDiff = {
            type: "DELETED_ITEM",
            path: pathWithNewRef,
            left: JSON.parse(JSON.stringify(item)),
            right: null
          }
          diffs = [ ...diffs, itemDiff ]
        }
        else {
          var pathWithNewRef = path + getRepresentation(item)
          diffs = differences(item, itemInOther, pathWithNewRef, diffs)
        }
      }
      for (let item of other) {
        if (!one.some(listItem => listItem.ref == item.ref)) {
          var pathWithNewRef = path + getRepresentation(item)
          var itemDiff = {
            type: "ADDED_ITEM",
            path: pathWithNewRef,
            left: null,
            right: JSON.parse(JSON.stringify(item))
          }
          diffs = [ ...diffs, itemDiff ]
        }
      }
    }
    else {
      // Won't be needed
    }
  }

  return diffs
}

module.exports = differences
