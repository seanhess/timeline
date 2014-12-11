// {
//"entryType":"moment",
//"url":"",
//"date":"2014-12-04",
//"imageUrl":"http://i.imgur.com/iSDFfM0.jpg",
//"name":"",
//"comment":"I went skiing by myself for the first time at snowbird"
//},

var {groupBy} = require('lodash')
var moment = require('moment')
  
// group them by week, where week is "Dec 13", etc. Or, hmm... where week is another moment
exports.groupByWeek = function(entries) {
  var grouped = groupBy(entries, startOfWeek)
  return grouped
}

function week(entry) {
  return moment(entry.date)
}

function startOfWeek(entry) {
  var d = moment(entry.date)
  var start = d.set('date', d.date() - d.day())
  return formatDate(start)
}

function formatDate(dateMoment) {
  return dateMoment.format("YYYY-MM-DD") 
}

exports.week = week
