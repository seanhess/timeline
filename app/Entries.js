// {
//"entryType":"moment",
//"url":"",
//"date":"2014-12-04",
//"imageUrl":"http://i.imgur.com/iSDFfM0.jpg",
//"name":"",
//"comment":"I went skiing by myself for the first time at snowbird"
//},

var immstruct  = require('immstruct')
var Immutable = require('immutable')
var {groupBy, foldl, sortBy, head} = require('lodash')
var moment = require('moment')
var axios = require('axios')

var EDIT_ENTRIES = "/entries"
var UNKNOWN = "unknown"

var state = exports.state = immstruct({
  entries: [],
  editing: null, 
  details: null
})

exports.findByName = function(name) {
  return state.cursor('entries').find(function(e) {
    return e.get('name') == name
  })
}

exports.load = function() {
  axios.get('data/entries.json')
  .then((rs) => rs.data)
  .then(function(entries) {
    state.cursor('entries').update(() => Immutable.fromJS(entries))
  })
}

exports.edit = function(entry) {
  var value = (entry) ? entry.deref() : entry
  state.cursor('editing').update(() => value)
  state.cursor('details').update(() => null)
}

exports.details = function(entry) {
  var value = (entry) ? entry.deref() : entry
  state.cursor('editing').update(() => null)
  state.cursor('details').update(() => value)
}

exports.save = function(entry) {
  // update it in place.


  axios.put(EDIT_ENTRIES + "/" + entry.get('name'), entry.toJS())
  .then((rs) => rs.data)
  .then(function() {
    //window.location.reload()
    var entries = state.cursor('entries')
    entries.update(entryKeyPath(entries, entry.get('name')), () => entry.deref())
  })
}

exports.delete = function(entry) {
  axios.delete(EDIT_ENTRIES + "/" + entry.get('name'))
  .then((rs) => rs.data)
  .then(function() {
    var entries = state.cursor('entries')
    entries.update((es) => es.remove(entryKeyPath(entries, entry.get('name'))))
  })
}
  
// group them by week, where week is "Dec 13", etc. Or, hmm... where week is another moment
exports.groupByWeek = function(entries) {

  // how am I going to do this?
  // I'm going back through the entries to... as far as they go
  // I could sort them by date? or maybe make it so it doesn't matter

  // maybe it would be good to get the earliest one, so I can initialize the groups
  var es = entries.toArray()
  var invalidEntries = es.filter((e) => !date(e))
  var validEntries = es.filter((e) => date(e))

  var earliestToLatest = sortBy(validEntries, date)
  var first = head(earliestToLatest)
  var firstDate = (first) ? moment(date(first)) : moment()

  var weekDates = weeksBetween(firstDate, moment()).reverse()
  var startingWeeks = {}
  if (invalidEntries.length) {
    startingWeeks[UNKNOWN] = invalidEntries
  }

  var weeks = foldl(weekDates, addWeek, startingWeeks)


  return foldl(validEntries, addEntry, weeks)
}

exports.thumbUrl = function(entry) {
  return "data/entries/" + entry.get('name') + "-thumb.jpg"
}

exports.imageUrl = function(entry) {
  return "data/entries/" + entry.get('image')
}

function entryKeyPath(entries, name) {
  return entries.findIndex(function(e) {
    return e.get('name') == name
  })
}

function weekKey(entry) {
  var dt = date(entry)
  if (!dt) return UNKNOWN
  return formatDate(startOfWeek(dt))
}

function addEntry(weeks, entry) {
  var key = weekKey(entry)
  weeks[key].push(entry)
  return weeks
}

function weeksBetween(start, end) {
  // returns all the moments for the weeks between the two dates
  // assumes that it starts 
  start = startOfWeek(start)
  end = startOfWeek(end)
  var weeks = []

  // I need a range... how?
  while (start.unix() <= end.unix()) {
    weeks.push(start)
    start = moment(start).day(7)
  }

  return weeks
}

function addWeek(weeks, date) {
  weeks[formatDate(date)] = []
  return weeks
}

function week(entry) {
  var now = startOfWeek(entry.date)
}

// make it a moment or clone it
function startOfWeek(date) {
  var d = moment(date)
  return d.set('date', d.date() - d.day())
}

function formatDate(dateMoment) {
  return dateMoment.format("YYYY-MM-DD") 
}

function date(entry) {
  return entry.get('date')
}

exports.week = week
