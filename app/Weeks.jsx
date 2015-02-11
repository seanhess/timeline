var React = require('react')
var component = require('omniscient')
var {assign} = require('lodash')
var Entries = require('./Entries')
var {MomentDropper} = require('./Editor')
var moment = require("moment")
var page = require('page')

module.exports = component(function({entries}) {
  var grouped = Entries.groupByWeek(entries)
  var groups = Object.keys(grouped)

  var rows = groups.map(function(week) {
    return <Week week={week} entries={grouped[week]} key={week}/>
  })

  return <div>
    <MomentDropper onFile={onFile}>
      <div className="weeks">{rows}</div>
    </MomentDropper>
  </div>
}).jsx

var Week = component(function({week, entries}) {
  var content = entries.map(function(entry) {
    return <Entry entry={entry} key={entry.get('name')}/>
  })

  var weekDate = moment(week)

  function clickWeek() {
    var moment = Entries.emptyMoment(weekDate)
    Entries.store(moment)
    page('/edit/'+moment.get('name'))
  }

  return <div className="week">
    <div className="week-content">{content}</div>
    <div className="week-label">
      <a onClick={clickWeek}>{weekDate.format('DD MMMM YYYY')}</a>
    </div>
  </div>
}).jsx

// if they have a picture, display it square
// otherwise, display the name
// overlay the comment
var Entry = component(function({entry}) {
  var url = entry.get('url')

  var url = "/details/" + entry.get('name')

  var infoStyle = {
    display: (entry.get('image')) ? "none" : "block"
  }

  return <div className="entry" style={bgImage(Entries.thumbUrl(entry))}>
    <a className="entry-link" href={url}>
      <div className="entry-bg">
        <div style={infoStyle}>{entry.get('comment')}</div>
      </div>
      <div className="entry-overlay">
        <div>{entry.get('comment')}</div>
      </div>
    </a>
  </div>
}).jsx


function bgImage(src) {
  return {
    backgroundImage: 'url("' + src + '")'
  }
}





var UPLOAD_URI = "/files"

function onFile(file) {
  console.log("DROP FILE", file)
  var xhr = new XMLHttpRequest()
  var fd = new FormData()
  xhr.open("POST", UPLOAD_URI, true);
  xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          window.location.reload()
        }
      }
  }
  fd.append('file', file)
  xhr.send(fd)
}

