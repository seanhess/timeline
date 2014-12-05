var React = require('react')
var component = require('omniscient')
var {assign} = require('lodash')

module.exports = component(function({entries}) {

  var rows = entries.toArray().map(function(entry) {
    return <Entry entry={entry}/>
  })

  return <div>{rows}</div>
}).jsx


var Entry = component(function({entry}) {
  return <div className="panel" style={entryStyle}>
    <h4>{entry.get('name')}</h4>
    <div>
      <a href={entry.get('url')} target="_blank">
        <img src={entry.get('imageUrl')}/>
      </a>
    </div>
    <div>{entry.get('comment')}</div>
    <div style={typeStyle}>{entry.get('entryType')}</div>
    <div style={dateStyle}>{entry.get('date')}</div>
  </div>
}).jsx

var entryStyle = assign({
  paddingBottom: 40,
  width: 300
})
var dateStyle = assign({})
var typeStyle = assign({textTransform: 'uppercase'})


