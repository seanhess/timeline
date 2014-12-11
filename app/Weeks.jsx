var React = require('react')
var component = require('omniscient')
var {assign} = require('lodash')
var Entries = require('./Entries')

module.exports = component(function({entries}) {

  var grouped = Entries.groupByWeek(entries.toArray())
  var groups = Object.keys(grouped)

  var rows = groups.map(function(week) {
    return <Week week={week} entries={grouped[week]}/>
  })

  return <div style={{background: 'red'}}>{rows}</div>
}).jsx

var Week = component(function({week, entries}) {
  var content = entries.map(function(entry) {
    return <Entry entry={entry}/>
  })

  return <div>
    <h3>Week: {week}</h3>
    <div>{content}</div>
  </div>
}).jsx

// if they have a picture, display it square
// otherwise, display the name
// overlay the comment
var Entry = component(function({entry}) {
  var imageUrl = entry.get('imageUrl')
  return <div className="entry" style={bgImage(imageUrl)}>
    <a className="entry-link" href={entry.get('url')} target="_blank">
      <div className="entry-bg"></div>
      <div className="entry-overlay">
        <div>{entry.get('comment')}</div>
      </div>
    </a>
  </div>

      //<div style={dateStyle}>{entry.get('date')}</div>
      //<div style={typeStyle}>{entry.get('entryType')}</div>
    //<div>{entry.get('name')}</div>
}).jsx


function bgImage(src) {
  return {
    backgroundImage: 'url(' + src + ')'
  }
}