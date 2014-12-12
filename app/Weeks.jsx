var React = require('react')
var component = require('omniscient')
var {assign} = require('lodash')
var Entries = require('./Entries')
var moment = require("moment")

module.exports = component(function({entries}) {
  var grouped = Entries.groupByWeek(entries)
  var groups = Object.keys(grouped)

  var rows = groups.map(function(week) {
    return <Week week={week} entries={grouped[week]} key={week}/>
  })

  return <div className="weeks">{rows}</div>
}).jsx

var Week = component(function({week, entries}) {
  var content = entries.map(function(entry) {
    return <Entry entry={entry} key={entry.get('name')}/>
  })

  var weekDate = moment(week)

  return <div className="week">
    <div className="week-content">{content}</div>
    <div className="week-label">{weekDate.format('DD MMMM YYYY')}</div>
  </div>
}).jsx

// if they have a picture, display it square
// otherwise, display the name
// overlay the comment
var Entry = component(function({entry}) {
  var url = entry.get('url')

  //function onClick() {
    //Entries.edit(entry)
  //}

  var url = "/details/" + entry.get('name')

  return <div className="entry" style={bgImage(Entries.thumbUrl(entry))}>
    <a className="entry-link" href={url}>
      <div className="entry-bg"></div>
      <div className="entry-overlay">
        <div>{entry.get('comment')}</div>
      </div>
    </a>
  </div>
    //<h4>{entry.get('name')}</h4>
    //<div style={dateStyle}>{entry.get('date')}</div>
    //<div style={typeStyle}>{entry.get('entryType')}</div>
}).jsx


function bgImage(src) {
  return {
    backgroundImage: 'url("' + src + '")'
  }
}
