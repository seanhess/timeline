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
var shortid = require('shortid')

var EDIT_ENTRIES = "/entries"
var UNKNOWN = "unknown"

var state = exports.state = immstruct({
  entries: [],
  editing: null, 
  details: null,
  canEdit: false,
})

exports.findById = function(id) {
  return state.cursor('entries').find(function(e) {
    return e.get('id') == id
  })
}

exports.load = function() {
  axios.get('data/entries.json')
  .then((rs) => rs.data)
  .then(function(entries) {
    state.cursor('entries').update(() => Immutable.fromJS(entries))
  })
}

// see if we're connected to a real server, if so, set canEdit to true
exports.checkCanEdit = function() {
  axios.get('/status')
  .then(function() {
    state.cursor('canEdit').update(() => true)
  })
}

exports.edit = function(entry) {
  var value = (entry && entry.deref) ? entry.deref() : entry
  state.cursor('editing').update(() => value)
  state.cursor('details').update(() => null)
}

exports.details = function(entry) {
  var value = (entry && entry.deref) ? entry.deref() : entry
  state.cursor('editing').update(() => null)
  state.cursor('details').update(() => value)
}

exports.save = function(entry) {
  // update it in place.
  axios.put(EDIT_ENTRIES + "/" + entry.get('id'), entry.toJS())
  .then((rs) => rs.data)
  .then(exports.store)
}

exports.store = function(entry) {
  var entries = state.cursor('entries')
  entries.update(entryKeyPath(entries, entry.get('id')), () => entry)
}

exports.delete = function(entry) {
  axios.delete(EDIT_ENTRIES + "/" + entry.get('id'))
  .then((rs) => rs.data)
  .then(function() {
    var entries = state.cursor('entries')
    entries.update((es) => es.remove(entryKeyPath(entries, entry.get('id'))))
  })
}

exports.emptyMoment = function(date) {
  return Immutable.Map({
    entryType:"Moment",
    url:"",
    date: formatDate(date),
    image:"",
    id: shortid.generate(),
    name: "",
    comment:""
  })
}
  
// group them by week, where week is "Dec 13", etc. Or, hmm... where week is another moment
exports.groupByWeek = function(entries) {

  var es = entries.toArray()
  var invalidEntries = es.filter((e) => !date(e))
  var validEntries = es.filter((e) => date(e))

  var earliestToLatest = sortBy(validEntries, date)
  var first = head(earliestToLatest)
  var firstDate = (first) ? moment(date(first)) : moment()
  //console.log("FIRST DATE", firstDate.toString())

  var weekDates = weeksBetween(firstDate, moment()).reverse()
  var startingWeeks = {}
  if (invalidEntries.length) {
    startingWeeks[UNKNOWN] = invalidEntries
  }

  var weeks = foldl(weekDates, addWeek, startingWeeks)


  return foldl(validEntries, addEntry, weeks)
}

exports.thumbUrl = function(entry) {
  return "data/entries/" + entry.get('id') + "-thumb.jpg"
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
    start = moment(start).day(8)
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
  var day = d.day()
  if (day === 0) {
    d = d.day(-6)
    return d
  }
  else {
    return d.day(1)
  }
  //var newDate = d.set('date', d.date() - d.day())
  //console.log("New Date", newDate.toString())
  // set day of the week to monday. 
  // if it is a sunday, set it to last monday
  return newDate
}

function formatDate(dateMoment) {
  return dateMoment.format("YYYY-MM-DD") 
}

function date(entry) {
  return entry.get('date')
}

exports.week = week
